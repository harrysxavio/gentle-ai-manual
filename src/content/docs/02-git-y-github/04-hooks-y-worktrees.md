---
title: Hooks y Worktrees
description: Git hooks como scripts automáticos, pre-commit, commit-msg, cómo GGA los instala, worktrees para trabajar en múltiples ramas simultáneas, y su uso en el ecosistema Gentle.
level: 2
estimatedTime: 30 min
tags:
  - git
  - hooks
  - pre-commit
  - worktrees
  - gga
  - commit-msg
prerequisites:
  - Remoto y PR (02-03)
verifiedVersion: "Git 2.40+, GGA 1.x"
learningOutcomes:
  - Explicar qué es un hook de Git y los tipos principales
  - Describir cómo GGA instala hooks en .git/hooks/
  - Crear un hook personalizado
  - Explicar qué es un worktree y cómo se diferencia de git clone
  - Describir cómo gentle-ai usa worktrees para CodeGraph
  - Explicar cómo Engram detecta worktrees como proyecto
---

# Hooks y Worktrees

## Qué aprenderás

Hasta ahora viste Git desde afuera: commits, ramas, remotos. Pero Git tiene mecanismos internos para que otras herramientas se enganchen a su flujo. Los **hooks** son scripts que Git ejecuta automáticamente en momentos específicos. Los **worktrees** te permiten tener múltiples ramas checkout al mismo tiempo sin clonar el repositorio.

En este capítulo vas a aprender cómo GGA instala hooks para proteger calidad, cómo gentle-ai review los usa indirectamente, cómo los worktrees permiten trabajar en paralelo, y cómo Engram y CodeGraph se apoyan en worktrees.

## Por qué importa

Los hooks son el mecanismo que el ecosistema Gentle usa para integrarse con Git sin modificar Git. GGA no parchea Git: escribe scripts en `.git/hooks/` y Git los ejecuta automáticamente.

Los worktrees son una feature avanzada que gentle-ai usa internamente para aislar contextos sin duplicar el repositorio completo. Si no entendés estas herramientas, no vas a entender cómo GGA protege tus commits ni cómo gentle-ai maneja múltiples contextos.

## Visión simple

Un **hook** es un script que Git ejecuta cuando pasa algo. Por ejemplo: "antes de crear un commit, ejecutá este script". Si el script falla (devuelve `exit 1`), Git cancela la operación.

Un **worktree** es un checkout de una rama en una carpeta separada, compartiendo el mismo `.git/`. Podés tener `main` en `C:\proyecto` y `feature/login` en `C:\proyecto-login`, los dos usando el mismo `.git/`. Es como tener dos ventanas del mismo proyecto en diferentes ramas.

## Analogía

**Hook**: imaginá que cuando cerrás la puerta de tu casa, un asistente revisa que tengas las llaves, la billetera y el teléfono. Si falta algo, te impide salir. Eso es un hook pre-commit: revisa condiciones antes de dejar pasar el commit.

**Hook commit-msg**: antes de guardar una nota en tu diario, otro asistente revisa que tenga un título con formato específico. Si no cumple, no la guarda.

**Worktree**: tenés dos escritorios. En uno tenés la versión estable (main). En otro tenés el experimento (feature). Los dos comparten la misma biblioteca (`.git/`), pero los papeles sobre cada escritorio son distintos. No necesitás clonar todo de nuevo.

## Cómo funciona realmente

### Hook: script que Git ejecuta automáticamente

Un **hook** es un script ejecutable en `.git/hooks/` con un nombre específico. Git lo ejecuta en el momento correspondiente del flujo.

Cada repositorio tiene una carpeta `.git/hooks/` con ejemplos (archivos `.sample`). Para activar un hook, creás un archivo sin `.sample` con el nombre exacto.

Hay hooks de **lado cliente** (tu máquina) y **lado servidor** (GitHub, servidor propio).

### pre-commit

Se ejecuta después de `git commit` pero antes de que el commit se cree. Es el hook más usado para:

- Correr el linter
- Correr tests unitarios
- Verificar que no haya secretos (API keys) en el código

Si el script devuelve `exit 0`, el commit continúa. Si devuelve `exit 1`, Git cancela:

```bash
#!/bin/bash
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linter falló"
    exit 1
fi
exit 0
```

GGA instala un pre-commit que detecta el lenguaje del proyecto y corre el linter correspondiente (ESLint para JS/TS, golangci-lint para Go, ruff para Python, clippy para Rust).

### commit-msg

Se ejecuta después de escribir el mensaje pero antes de crear el commit. Recibe como argumento la ruta al archivo temporal del mensaje.

GGA lo usa para validar que el mensaje siga conventional commits. Si el formato no coincide, `exit 1` cancela el commit.

```bash
#!/bin/bash
COMMIT_MSG=$(cat "$1")
if ! echo "$COMMIT_MSG" | grep -qE "^(feat|fix|docs|refactor|test|chore)"; then
    echo "❌ El mensaje no sigue conventional commits"
    exit 1
fi
```

### prepare-commit-msg

Se ejecuta después de pre-commit pero antes de que se abra el editor del mensaje. Su propósito es modificar el mensaje por defecto. Ejemplo: agregar el número del branch al mensaje.

En el ecosistema Gentle, no se usa directamente, pero GGA lo reserva para uso futuro.

### Cómo GGA instala hooks

Cuando ejecutás `gga init` en un repositorio:

1. GGA verifica que `.git/hooks/` exista
2. Lee los hooks actuales
3. Escribe sus propios hooks en `.git/hooks/`
4. Establece permisos de ejecución

```
gga init → escribe .git/hooks/pre-commit
        → escribe .git/hooks/commit-msg
        → chmod +x .git/hooks/*
        → listo: Git ejecuta los hooks automáticamente
```

Los hooks de GGA no son scripts estáticos: son wrappers que delegan en el binario `gga`:

```bash
#!/bin/bash
gga hook pre-commit
if [ $? -ne 0 ]; then exit 1; fi
```

Así, si GGA se actualiza, los hooks se benefician de la nueva lógica sin reinstalar.

### Cómo gentle-ai review usa git hooks indirectamente

gentle-ai review no instala hooks directamente. Se integra con Pull Requests mediante webhooks. Pero la relación es indirecta: los hooks de GGA garantizan que el código que llega al PR ya pasó linter y formato de mensaje.

Flujo completo:

```
1. git commit → GGA pre-commit (lint) → GGA commit-msg (formato mensaje)
2. git push → GitHub detecta push → webhook a gentle-ai review
3. gentle-ai review analiza el diff del PR
4. Native Review congela candidato en el SHA del commit
```

Los hooks locales atajan problemas temprano. gentle-ai review ve código que ya pasó calidad básica.

### Worktrees

Un **worktree** es un checkout adicional de un repositorio que comparte el mismo `.git/`.

Sin worktrees, para trabajar en dos ramas necesitás stashear o clonar de nuevo. Con worktrees:

```powershell
git worktree add C:\proyecto-login feature/login
```

```
Un solo .git/ (compartido)
    ├── C:\proyecto\           → checkout de main
    ├── C:\proyecto-login\     → checkout de feature/login
```

Ventajas:
- Un solo `.git/` (eficiente en espacio)
- Checkouts independientes: cada worktree tiene su working tree, staging area y HEAD
- No necesitás stash ni commits temporales

Desventajas:
- La misma rama no puede estar checkout en dos worktrees
- Borrar requiere `git worktree remove`
- Los hooks se ejecutan por separado en cada worktree

### CodeGraph-aware worktree placement

CodeGraph es el motor de análisis del ecosistema Gentle. Cuando necesita analizar una rama distinta sin interrumpir el trabajo, usa worktrees:

1. Crea un worktree de la rama destino en un directorio temporario
2. CodeGraph indexa el worktree (no el principal)
3. Responde consultas sobre esa rama
4. Elimina el worktree al terminar

Regla de ubicación: los worktrees que necesitan CodeGraph deben crearse como siblings del repositorio principal, nunca en `/tmp`:

```
C:\Users\tuuser\proyecto\                    → repo principal
C:\Users\tuuser\proyecto-worktrees\          → worktrees
  ├── sdd-login\
  └── review-pr-42\
```

Cada worktree necesita su propio índice CodeGraph. No se comparte ni copia.

### Cómo Engram usa worktrees para project detection

Engram ejecuta `git rev-parse --show-toplevel` para detectar el proyecto. En un worktree, esto devuelve la raíz del worktree, no la del repositorio principal.

Engram maneja esto:
1. Ejecuta `git rev-parse --show-toplevel`
2. Si la ruta contiene `-worktrees\`, extrae el nombre del proyecto base
3. Usa la rama como contexto adicional
4. Asocia la memoria al proyecto base, no al worktree temporal

Esto permite memoria consistente: trabajes desde un worktree o desde el repo principal, Engram sabe que es el mismo proyecto.

### Comandos principales

```powershell
# Hooks — no tienen comandos, son archivos
# .git/hooks/pre-commit, .git/hooks/commit-msg

# Worktrees
git worktree list                          # listar worktrees activos
git worktree add C:\ruta feature/login     # crear worktree
git worktree remove C:\ruta                # eliminar worktree
git worktree prune                         # limpiar referencias huérfanas

# GGA
gga init                                   # instalar hooks
gga hook pre-commit                        # ejecutar hook manualmente
```

## Errores frecuentes

1. **Hook ignorado**: el archivo debe llamarse exactamente `pre-commit` (sin extensión) y tener permisos de ejecución.

2. **Worktree con misma rama**: Git no permite tener la misma rama checkout en dos worktrees simultáneamente.

3. **Olvidar limpiar worktrees**: ejecutá `git worktree prune` para limpiar referencias a worktrees eliminados manualmente.

4. **Hooks que no funcionan en Windows**: si usás PowerShell puro, los hooks Bash pueden fallar. GGA maneja esto detectando el shell.

5. **Worktree en `/tmp`**: si CodeGraph necesita analizarlo, el índice no sobrevive a reinicios. Usá un directorio persistente.

## Resumen

| Concepto | ¿Qué es? | Archivo / Comando |
|----------|---------|-------------------|
| Hook | Script que Git ejecuta automáticamente | `.git/hooks/<hook-name>` |
| pre-commit | Hook antes del commit (linter) | `.git/hooks/pre-commit` |
| commit-msg | Hook que valida el mensaje | `.git/hooks/commit-msg` |
| prepare-commit-msg | Hook que modifica el mensaje default | `.git/hooks/prepare-commit-msg` |
| GGA init | Instala hooks en el repositorio | `gga init` |
| Worktree | Checkout adicional que comparte `.git/` | `git worktree add` |
| CodeGraph worktree | Worktree para indexar otra rama | `<repo>-worktrees/<name>` |

## Preguntas

1. ¿Qué es un hook de Git y cómo se activa?
2. ¿Cuál es la diferencia entre pre-commit y commit-msg?
3. ¿Cómo instala GGA sus hooks? ¿Por qué usa wrappers que llaman a `gga`?
4. ¿Qué ventaja tiene un worktree sobre un `git clone` adicional?
5. ¿Por qué gentle-ai no pone worktrees en `/tmp` cuando necesita CodeGraph?

## Ejercicio

1. Explorá los hooks de ejemplo: `Get-ChildItem .git/hooks/`.
2. Creá un hook pre-commit simple:
   ```powershell
   Set-Content .git/hooks/pre-commit 'echo "Hook ejecutado"'
   ```
3. Hacé un commit para probar: `git commit --allow-empty -m "test: probar hook"`.
4. Creá un worktree: `git worktree add ../proyecto-worktree main`.
5. Movete al worktree: `Set-Location ../proyecto-worktree; git status`.
6. Volvé al repo principal, listá worktrees: `git worktree list`.
7. Eliminá el worktree: `git worktree remove ../proyecto-worktree`.

## Fuentes verificadas

- Git 2.40+ (documentación oficial: git-scm.com, docs/customizing-git/git-hooks y docs/git-worktree)
- GGA 1.x (documentación del ecosistema Gentle)
- Engram 1.x (integración con Git)
- Fecha: 2026-07-20
- Estado: 🟢 Verificado (conocimiento fundamental, no depende de versión específica)
