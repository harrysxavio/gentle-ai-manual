---
title: ¿Qué es Git?
description: Control de versiones, repositorios locales y remotos, la arquitectura de tres árboles, y cómo Git impulsa el ecosistema Gentle.
level: 1
estimatedTime: 30 min
tags:
  - git
  - control-de-versiones
  - repositorio
  - github
  - staging
  - head
prerequisites:
  - Programación (01-03)
verifiedVersion: "Git 2.40+"
learningOutcomes:
  - Explicar qué problema resuelve el control de versiones
  - Diferenciar Git de GitHub
  - Describir la arquitectura de tres árboles de Git
  - Explicar cómo SDD, Native Review, GGA y Engram usan Git
  - Usar git status, git diff y git log para inspeccionar el repositorio
---

# ¿Qué es Git?

## Qué aprenderás

Cuando trabajás en código, los archivos cambian. Una función que hoy funciona puede romperse mañana porque tocaste otra cosa. Sin un sistema que registre esos cambios, estás manejando a ciegas.

Git es la herramienta que resuelve eso. En este capítulo vas a entender qué es el control de versiones, cómo funciona la arquitectura de tres árboles de Git, qué diferencia hay entre Git y GitHub, y cómo cada pieza del ecosistema Gentle usa Git por debajo.

## Por qué importa

Cada herramienta del ecosistema Gentle se apoya en Git:

- **Engram** ejecuta `git rev-parse --show-toplevel` para detectar en qué proyecto estás parado
- **SDD** (Specification-Driven Development) usa commits de Git como identidad de las especificaciones
- **Native Review** congela candidatos de revisión usando el hash SHA del commit como raíz de identidad
- **GGA** (Gentle Git Assistant) instala hooks en `.git/hooks/` para proteger la calidad del código antes de cada commit

Si no entendés cómo funciona Git, estas integraciones son magia. Si lo entendés, sabés exactamente qué componente hace qué y por qué.

## Visión simple

**Git** es un sistema que guarda instantáneas de tu proyecto a lo largo del tiempo. Cada vez que le decís "guardá este estado", Git registra el contenido exacto de cada archivo en ese momento. Después podés comparar estados, volver a uno anterior, o crear líneas alternativas de trabajo.

No guarda archivos enteros cada vez (eso ocuparía mucho espacio). Pero se comporta como si lo hiciera: cuando pedís un commit, Git te devuelve el proyecto entero como era en ese instante.

## Analogía

Imaginá que estás escribiendo un libro. Trabajás sin un sistema de versiones: tenés carpetas `libro-final`, `libro-final-v2`, `libro-final-v2-corregido`, y texto comentado con "esto lo saqué pero capaz lo vuelvo".

Git es como tener un editor de libros que:
- Guarda una "foto" del manuscrito cada vez que le decís
- Te deja escribir etiquetas en cada foto (mensaje de commit)
- Te muestra exactamente qué cambió entre una foto y la siguiente
- Te permite crear copias alternativas del libro sin perder la original (ramas)
- Todo esto sin internet, en tu propia computadora

La diferencia con Google Docs es que acá el historial vive en tu máquina y sos vos quien lo controla.

## Cómo funciona realmente

### El problema que resuelve el control de versiones

Sin control de versiones, el desarrollo era un caos:

- Nombres de archivo como `index-final-ok.js`, `index-definitivo.js`, `index-ahora-si.js`
- Código comentado que nunca se borraba porque "no vaya a ser que lo necesite después"
- Dos personas tocando el mismo archivo: el último en guardar pisaba el trabajo del otro
- Sin forma de saber quién cambió qué ni cuándo

**Control de versiones**: sistema que registra los cambios en uno o más archivos para que después puedas recuperar versiones específicas.

| Generación | Modelo | Ejemplo |
|-----------|--------|---------|
| Local | Copia los archivos a un directorio aparte | RCS |
| Centralizado | Un servidor guarda todo, los clientes suben cambios | Subversion (SVN), CVS |
| Distribuido | Cada copia tiene el historial completo | Git, Mercurial |

Git es de la tercera generación. Es **distribuido**: cuando clonás un repositorio, no te bajás solo la última versión, te bajás el historial entero. Podés trabajar sin conexión, hacer commits, crear ramas, y después sincronizar cuando volvés a internet.

### Git vs GitHub

**Git**: programa de control de versiones que corre en tu computadora. Lo ejecutás desde la terminal.

**GitHub**: plataforma web que aloja repositorios de Git en sus servidores. Agrega una interfaz visual, Pull Requests, Issues, Actions, y herramientas de colaboración.

| | Git | GitHub |
|--|-----|--------|
| Qué es | Herramienta de terminal | Plataforma web |
| Dónde corre | En tu computadora | Servidores de Microsoft |
| Necesita internet | No | Sí |
| Costo | Gratis (open source) | Gratis con repos públicos |
| Ejemplo | `git commit -m "mensaje"` | Abrir un Pull Request |

Podés tener Git sin GitHub. Pero no podés tener GitHub sin Git. GitHub es un servicio que vive encima de Git.

### Repositorio local vs remoto

**Repositorio**: la carpeta oculta `.git/` donde Git guarda todo el historial, las ramas, las configuraciones y los objetos del proyecto.

```
Directorio de trabajo        .git (repositorio)
┌─────────────────────┐     ┌──────────────────────┐
│ index.ts            │     │ objects/             │
│ package.json        │     │ refs/heads/          │
│ src/                │     │ HEAD                 │
│ node_modules/       │     │ config               │
└─────────────────────┘     └──────────────────────┘
```

**Repositorio local**: el `.git/` que está en tu máquina. Cuando hacés `git init` en una carpeta, Git crea `.git/` ahí adentro.

**Repositorio remoto**: un `.git/` que está en otro lado (GitHub, GitLab, un servidor tuyo). No lo ves como carpeta, lo referenciás por URL.

El flujo típico:

```powershell
# Clonás un repositorio remoto a tu máquina (crea .git/ local)
git clone https://github.com/usuario/proyecto.git
# Trabajás, hacés commits...
git add .
git commit -m "feat: agrega validación"
# Subís tus commits al remoto
git push origin main
```

### La arquitectura de tres árboles

Git maneja tres áreas de memoria. Este es el concepto más importante para entender Git.

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Working Tree    │     │ Staging Area │     │  Repositorio    │
│  (directorio     │ →   │ (índice /    │ →   │  (.git/)        │
│   de trabajo)    │     │  preparación)│     │  commits        │
│                  │     │              │     │                 │
│  Archivos que    │     │ Archivos     │     │ Instantáneas    │
│  editás          │     │ listos para  │     │ guardadas       │
│                  │     │ commit       │     │                 │
└─────────────────┘     └──────────────┘     └─────────────────┘
      git add                  git commit
```

1. **Working Tree** (directorio de trabajo): los archivos que ves y editás. Es la carpeta del proyecto. Cuando modificás código en VS Code, cambiás el working tree.

2. **Staging Area** (índice, también llamado "stage"): una zona de preparación. Acá seleccionás qué cambios vas a incluir en el próximo commit. No es el commit todavía, es la antesala. Te permite separar cambios relacionados: si tocaste dos bugs distintos en los mismos archivos, podés agregar uno al stage, commitearlo, y después agregar el otro.

3. **Repositorio** (`.git/`): donde Git guarda los commits. Cada commit es una instantánea completa del proyecto.

El flujo diario:

```powershell
# 1. Working tree: modificás archivos
echo "console.log('hola')" > index.ts

# 2. Staging: marcás lo que querés commitear
git add index.ts

# 3. Repositorio: guardás el snapshot
git commit -m "feat: agrega log inicial"
```

Cada comando mueve datos entre estas tres áreas.

### HEAD

**HEAD**: puntero que indica en qué commit estás parado ahora. Cuando hacés un commit nuevo, HEAD se mueve al commit que creaste.

```
main:  A → B → C ← HEAD
                  ↑
                estoy acá
```

HEAD casi siempre apunta al último commit de la rama actual. Git lo usa como referencia para calcular diferencias, crear el próximo commit, y saber dónde estás parado.

### Diff

**diff**: la diferencia entre dos estados. Git puede mostrarte qué cambió entre:

- El working tree y el staging area: `git diff`
- El staging area y el último commit: `git diff --staged`
- Dos commits cualquiera: `git diff <hash1> <hash2>`

```diff
git diff
- console.log('viejo')
+ console.log('nuevo')
```
Las líneas con `-` son las que se borraron. Las de `+` son las que se agregaron.

### ¿Qué hace Git por el ecosistema Gentle?

Cada herramienta se integra con Git de una forma específica:

**SDD** (Specification-Driven Development)
SDD usa el commit como unidad de identidad. Cuando un spec cambia, se registra en un commit. El sistema correlaciona commits de specs con commits de código porque comparten el mismo grafo de Git. Esto permite rastrear qué decisión de diseño corresponde a qué línea de código.

**Native Review**
Native Review toma el hash SHA de un commit como raíz de identidad de un candidato de revisión. Cuando decís "revisá este código", Native Review anota el SHA en ese momento. Si el código cambia después, la revisión queda vinculada al SHA original, no al código nuevo. Esto garantiza que la revisión sea sobre lo que realmente se revisó.

**GGA** (Gentle Git Assistant)
GGA escribe scripts en `.git/hooks/` que Git ejecuta automáticamente. El pre-commit hook corre el linter. Si el código no pasa, `exit 1` cancela el commit. GGA también instala el hook `commit-msg` para validar que el mensaje siga conventional commits.

**Engram**
Cuando Engram se inicializa, ejecuta `git rev-parse --show-toplevel` para detectar el proyecto. Si el comando devuelve una ruta, Engram usa el nombre del directorio raíz como nombre del proyecto. Si falla (no hay repositorio), Engram usa el nombre de la carpeta actual pero marca que no hay integración Git.

```
Herramienta        Componente Git       Función
─────────────────────────────────────────────────────────
SDD                Git commit           Identidad de specs
Native Review      SHA del commit       Raíz de identidad del candidato
GGA                Hooks (pre-commit)   Validación automática antes del commit
Engram             git rev-parse        Detección del proyecto actual
```

## Errores frecuentes

1. **"fatal: not a git repository"**: el directorio actual no tiene `.git/`. Estás afuera del repositorio. Movete a la carpeta correcta o ejecutá `git init` si querés iniciar uno nuevo.

2. **Confundir Git con GitHub**: no es lo mismo. Git es el programa, GitHub es un servicio web. Podés usar Git sin GitHub (con GitLab, Bitbucket, o tu propio servidor).

3. **`git add .` sin revisar**: agregar todo sin antes ver qué cambiaste es una receta para commiteos errores ajenos. Siempre revisá con `git status` y `git diff` antes de hacer add.

4. **HEAD detached**: pasa cuando hacés checkout a un commit específico y no a una rama. No es peligroso, pero si creás commits en ese estado y después cambiás de rama, esos commits pueden quedar huérfanos.

5. **Mensajes de commit vacíos o genéricos**: "cambios", "arreglo", "actualización". No sirven. Cuando tengas que encontrar un cambio viejo no vas a saber por dónde buscar.

## Resumen

| Concepto | ¿Qué es? | Comando relacionado |
|----------|---------|-------------------|
| Control de versiones | Sistema que registra cambios en archivos | `git` |
| Git | Control de versiones distribuido | `git init`, `git clone` |
| GitHub | Plataforma web que aloja repositorios Git | `git push`, `git pull` |
| Repositorio local | Carpeta `.git/` en tu compu | `git init` |
| Repositorio remoto | `.git/` en un servidor | `git clone`, `git remote` |
| Working Tree | Archivos que editás en el explorador | `git status` |
| Staging Area | Zona de preparación antes del commit | `git add` |
| Commit | Instantánea del proyecto en el tiempo | `git commit` |
| HEAD | Puntero al commit actual | `git log` lo muestra |
| Diff | Diferencia entre dos estados | `git diff` |

## Preguntas

1. ¿Cuál es la diferencia fundamental entre Git y GitHub?
2. ¿Qué significa que Git sea "distribuido" y por qué importa?
3. Nombrá las tres áreas de la arquitectura de Git y explicá qué pasa en cada una.
4. ¿Qué es HEAD y cómo cambia cuando hacés un commit?
5. ¿Cómo usa Engram Git para detectar el proyecto actual?
6. ¿Por qué Native Review necesita el hash SHA de un commit?

## Ejercicio

1. Verificá que Git esté instalado: `git --version`.
2. Creá un directorio nuevo, entrá, y ejecutá `git init`.
3. Creá un archivo `hola.txt` con cualquier texto.
4. Ejecutá `git status` y observá que lo marca como "untracked".
5. Ejecutá `git add hola.txt` y después `git status` de nuevo. Ahora está en staging.
6. Ejecutá `git commit -m "feat: primer archivo"`.
7. Ejecutá `git log` y observá el hash SHA del commit.
8. Modificá `hola.txt`, ejecutá `git diff` y observá las líneas con `+` y `-`.
9. Ejecutá `git status` otra vez. Fijate que el archivo aparece como "modified" en el working tree, no en staging.

## Fuentes verificadas

- Git 2.40+ (documentación oficial: git-scm.com)
- GitHub Docs: docs.github.com
- Ecosistema: gentle-ai 2.x, engram 1.x, GGA 1.x
- Fecha: 2026-07-20
- Estado: 🟢 Verificado (conocimiento fundamental, no depende de versión específica)
