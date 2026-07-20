---
title: Commits y Ramas
description: El commit como snapshot, el hash SHA, mensajes con conventional commits, ramas como líneas independientes de desarrollo, merge, y conflictos.
level: 1
estimatedTime: 35 min
tags:
  - git
  - commits
  - ramas
  - merge
  - conflictos
  - sha
  - conventional-commits
prerequisites:
  - ¿Qué es Git? (02-01)
verifiedVersion: "Git 2.40+"
learningOutcomes:
  - Explicar qué es un commit y cómo se compone
  - Escribir mensajes de commit con conventional commits
  - Crear y cambiar entre ramas
  - Diferenciar merge fast-forward de merge 3-way
  - Resolver un conflicto de merge
  - Explicar cómo SDD y GGA usan commits y ramas
---

# Commits y Ramas

## Qué aprenderás

En el capítulo anterior viste la arquitectura de tres árboles e hiciste tu primer commit. Ahora vas a profundizar: qué contiene realmente un commit, cómo se identifican, cómo escribir mensajes que sirvan, y cómo las ramas te permiten trabajar en múltiples líneas de desarrollo al mismo tiempo.

## Por qué importa

Los commits son la unidad atómica del historial de Git. **SDD** asigna identidad a especificaciones por commit. **Native Review** congela candidatos apuntando a un SHA específico. **GGA** valida el mensaje del commit antes de permitir que se cree. Sin entender commits y ramas, no entendés cómo se estructura el trabajo ni cómo colaborar.

## Visión simple

Un **commit** es una foto de tu proyecto en un momento específico. Cada foto tiene un número de serie único (el **hash SHA**), una fecha, un autor, y un mensaje que explica qué cambió.

Una **rama** (o **branch**) es un marcador que apunta al último commit de una línea de desarrollo. Cuando hacés un commit nuevo, el marcador avanza solo.

## Analogía

Imaginá que estás escribiendo un libro en papel. Cada vez que terminás un capítulo, fotocopiás el manuscrito completo, le ponés un número de identificación único, la fecha, tu nombre, y una nota breve sobre lo que cambiaste. Guardás la fotocopia en un cajón. Eso es un **commit**.

El **SHA** es el número de serie único de cada fotocopia.

Una **rama** es un post-it que pegás en la última fotocopia. "main" es un post-it. Si querés experimentar un final alternativo, ponés otro post-it ("final-experimental") y empezás a escribir desde ahí. Los dos caminos existen en paralelo.

**Merge** es juntar los dos manuscritos. Si tocaste el mismo párrafo en los dos lados, hay **conflicto**.

## Cómo funciona realmente

### El commit

Un **commit** es un objeto en `.git/objects/` que contiene:

1. Un **snapshot** del proyecto: referencia al contenido de todos los archivos en ese momento
2. El **hash SHA** del commit padre (el anterior, o varios si es un merge)
3. **Autor** y **committer**: nombre + email + timestamp
4. El **mensaje**: texto que explica qué cambia

Git no copia archivos enteros en cada commit. Cada archivo se guarda como un **blob** identificado por su contenido. Si el contenido no cambió entre commits, Git reusa el mismo blob. Es muy eficiente con espacio.

```
commit a1b2c3d4e5f6789012345678abcdef1234567890
Author: Tu Nombre <tu@email.com>
Date:   Mon Jul 20 10:00:00 2026 -0300

    feat: agrega validación de email
```

### Hash SHA

**SHA** (Secure Hash Algorithm): identificador único de cada commit. Git lo calcula aplicando un algoritmo criptográfico al contenido del commit. Si el contenido cambia, el SHA cambia. Esto garantiza integridad: nadie puede modificar un commit sin que Git lo detecte.

El SHA completo son 40 caracteres hexadecimales:
`a1b2c3d4e5f6789012345678abcdef1234567890`

No necesitás escribir el SHA completo. Git acepta los primeros caracteres si son únicos:

```powershell
git show a1b2c3d4
```

Cada objeto en Git (commit, árbol, blob, tag) tiene su propio SHA. Los commits se encadenan apuntando al SHA del padre, formando un **grafo acíclico dirigido** (DAG) inmutable.

### Mensaje de commit y conventional commits

**Conventional Commits**: formato estandarizado para mensajes de commit. Define un conjunto de **tipos** que describen la intención del cambio.

```
<tipo>(<scope opcional>): <descripción>
```

| Tipo | Cuándo usarlo |
|------|--------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `refactor` | Cambio sin nueva feature ni fix |
| `test` | Tests |
| `chore` | Mantenimiento (build, config, dependencias) |

Ejemplos:
```
feat: agrega validación de email en formulario de registro
fix(cart): corrige error al calcular precio con descuento
refactor: extrae validación de email a helper separado
chore: actualiza dependencias a Node.js 22
```

Los conventional commits permiten generar CHANGELOG automático y determinar versión semántica: `feat` sube minor, `fix` sube patch, `BREAKING CHANGE` sube major. GGA instala un hook `commit-msg` que valida este formato y rechaza el commit si no coincide.

### Rama (branch)

Una **rama** es un puntero móvil que apunta a un commit. Cuando hacés un commit nuevo, la rama avanza automáticamente.

```
main:  A → B → C → D ← (main apunta acá)
```

Git crea una rama por defecto: **main** (antes **master**). Para crear y moverte:

```powershell
git branch feature/login      # crear rama (no te movés)
git checkout feature/login    # moverte (estilo clásico)
git switch feature/login      # moverte (estilo moderno)
git switch -c feature/login   # crear y moverte en uno
```

Cuando creás una rama desde main y hacés commits, el historial se bifurca:

```
main:  A → B → C
                \
feature/login:   D → E → F
```

Convención de nombres: `feature/autenticacion`, `fix/error-en-precio`, `docs/actualizar-readme`. Las ramas temporarias se crean desde main, se trabaja en ellas, y cuando están listas se fusionan de vuelta a main y se eliminan.

### Merge

**Merge**: operación que une dos líneas de desarrollo. Hay dos tipos:

**Fast-forward merge**: cuando la rama destino no tuvo commits nuevos desde que creaste la rama. Git solo avanza el puntero. No crea commit extra.

```
Antes:  A → B → C (main)
                \
                 D → E (feature/login)

Después: A → B → C → D → E (main)
```

**3-way merge**: cuando la rama destino (main) avanzó mientras vos trabajabas. Git tiene tres puntos: el ancestro común (base), la rama destino, y la rama fuente. Git combina los cambios y crea un **merge commit** con dos padres.

```
Antes:  A → B → C → D → F (main)
                \
                 D → E → G (feature/login)

Después: A → B → C → D → F → H (merge commit)
                \           /
                 D → E → G
```

```powershell
git checkout main
git merge feature/login
```

### Conflicto

Un **conflicto** ocurre cuando dos ramas modificaron la misma línea del mismo archivo de forma diferente. Git no puede decidir automáticamente.

Cuando hay conflicto, Git detiene el merge y marca los archivos conflictivos:

```
<<<<<<< HEAD
console.log("versión de main");
=======
console.log("versión de feature");
>>>>>>> feature/login
```

- `<<<<<<< HEAD`: lo que está en la rama actual
- `=======`: separador
- `>>>>>>> feature/login`: lo que viene de la otra rama

Para resolver:
1. Abrí el archivo, elegí qué versión queda (o combiná)
2. Borrá los marcadores `<<<<<<<`, `=======`, `>>>>>>>`
3. `git add archivo.ts` → marca como resuelto
4. `git merge --continue` → termina el merge

### Cómo el orquestador gentle-ai usa ramas para SDD

SDD usa ramas como mecanismo de aislamiento:

1. El orquestador crea una rama `sdd/<feature-name>` desde `main`
2. Trabaja sobre specs y código en esa rama
3. Cuando la feature está completa, abre un Pull Request
4. Native Review revisa los commits en la rama
5. Una vez aprobado, se mergea a `main`

```
main:    A
             \
sdd/login:    B → C → D
              ↑     ↑
            specs  código + specs actualizados
```

Cada commit tiene tipo `sdd`: `sdd(login): define spec de autenticación OAuth2`.

### Cómo GGA protege commits con pre-commit hooks

GGA instala dos hooks:

**pre-commit**: corre el linter antes de crear el commit. Si hay errores, `exit 1` cancela el commit.

**commit-msg**: valida que el mensaje siga conventional commits. Si no, cancela.

```
git commit → pre-commit (lint) → commit-msg (validar mensaje) → commit creado
                 │                      │
                 ↓                      ↓
              si falla →              si falla →
              commit cancelado        commit cancelado
```

### Comandos principales

```powershell
git commit -m "feat: agrega validación"        # crear commit
git branch feature/login                        # crear rama
git switch -c feature/login                     # crear y moverse
git switch main                                 # cambiar a main
git merge feature/login                         # fusionar rama
git log --oneline --graph                       # historial visual
git diff main..feature                          # diferencias entre ramas
```

## Errores frecuentes

1. **Commitear en main por error**: creá una rama desde ese commit: `git branch feature/lo-que-sea` y mové main atrás con `git reset --hard HEAD~1`.

2. **Mensaje sin conventional commit**: GGA lo rechaza. Aprendé el patrón `tipo: descripción`. No es opcional si usás GGA.

3. **Resolver conflictos sin entender**: no uses `--ours` o `--theirs` automáticamente. La mayoría de las veces necesitás una combinación de ambas versiones.

4. **Ramas sin limpiar**: después de mergear, borralas: `git branch -d feature/login`. Las ramas muertas acumulan ruido.

## Resumen

| Concepto | ¿Qué es? | Comando |
|----------|---------|---------|
| Commit | Instantánea del proyecto | `git commit` |
| SHA | Identificador único del commit | Lo muestra `git log` |
| Conventional Commit | Formato de mensaje | `tipo: descripción` |
| Rama | Puntero móvil a un commit | `git branch`, `git switch` |
| main | Rama principal | `git switch main` |
| Fast-forward | Merge lineal sin commit extra | `git merge` (sin divergencia) |
| 3-way merge | Merge con commit de unión | `git merge` (con divergencia) |
| Conflicto | Misma línea modificada en dos ramas | Resolver manualmente |

## Preguntas

1. ¿Qué tres componentes principales tiene un commit?
2. ¿Por qué Git usa SHA para identificar commits?
3. ¿Cuándo ocurre un merge fast-forward y cuándo un 3-way?
4. ¿Qué hace Git cuando hay un conflicto? ¿Cómo se ve en el archivo?
5. ¿Cómo usa SDD las ramas en el ecosistema Gentle?

## Ejercicio

1. En tu repositorio del capítulo anterior, creá una rama:
   ```powershell
   git checkout -b feature/ejercicio
   ```
2. Modificá `hola.txt` y agregale otra línea.
3. Hacé commit: `git commit -m "feat: agrega segunda línea"`.
4. Volvé a main: `git switch main`. Abrí `hola.txt` — la segunda línea no está.
5. Volvé a `feature/ejercicio` — la línea está. Cada rama tiene su versión.
6. Mergeá: `git switch main; git merge feature/ejercicio`.
7. Verificá el historial: `git log --oneline`.
8. Borrá la rama: `git branch -d feature/ejercicio`.

## Fuentes verificadas

- Git 2.40+ (documentación oficial: git-scm.com)
- Conventional Commits: conventionalcommits.org
- Ecosistema: gentle-ai 2.x, GGA 1.x
- Fecha: 2026-07-20
- Estado: 🟢 Verificado (conocimiento fundamental, no depende de versión específica)
