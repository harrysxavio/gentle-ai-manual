---
title: Remoto y Pull Request
description: Repositorios remotos, push, pull, fetch, Pull Requests como mecanismo de revisión, code review integrado con gentle-ai, releases y tags.
level: 1
estimatedTime: 35 min
tags:
  - git
  - github
  - pull-request
  - remoto
  - push
  - pull
  - fetch
  - tag
  - release
prerequisites:
  - Commits y ramas (02-02)
verifiedVersion: "Git 2.40+, GitHub API 2022-11-28"
learningOutcomes:
  - Diferenciar push, pull y fetch
  - Configurar un repositorio remoto
  - Explicar qué es un Pull Request y cómo se integra con gentle-ai review
  - Crear tags y entender releases
  - Explicar cómo Native Review usa commit SHAs como raíz de identidad
---

# Remoto y Pull Request

## Qué aprenderás

Hasta ahora trabajaste con Git local: commits, ramas, merges. En este capítulo vas a aprender cómo conectar tu repositorio local con repositorios remotos (GitHub), cómo sincronizar cambios, qué es un Pull Request y cómo se usa para revisar código, y cómo funciona el sistema de releases y tags.

También vas a ver cómo **gentle-ai review** se integra con PRs y cómo **Native Review** usa los commit SHAs como raíz de identidad para garantizar trazabilidad.

## Por qué importa

Compartir código no es solo copiar archivos. Necesitás un mecanismo que garantice que los cambios lleguen completos, sin pisar el trabajo de otros, y con un registro de quién aprobó qué. Los Pull Requests son ese mecanismo.

En el ecosistema Gentle, cada revisión se apoya en la infraestructura de Git: gentle-ai review analiza PRs completos, Native Review congela la revisión en un commit SHA específico, y GGA se integra con GitHub Actions para hooks del lado remoto.

## Visión simple

Un **repositorio remoto** es una copia de tu `.git/` que está en otro lado (GitHub). Lo referenciás por URL, no como carpeta.

Cuando querés compartir tu trabajo, **pusheás** tus commits al remoto. Cuando querés traer el trabajo de otros, **pulleás** o **fetcheás** desde el remoto.

Un **Pull Request** (PR) es una solicitud para que los cambios de una rama se incorporen a otra. Alguien revisa los cambios antes de mergearlos. Es el punto de control de calidad del equipo.

## Analogía

Imaginá que escribís un libro con un equipo. Tu compu es tu escritorio personal (local). GitHub es la biblioteca central (remoto).

Cuando terminás un capítulo, llevás una copia a la biblioteca: **push**. Cuando un compañero termina el suyo, vas a la biblioteca y lo copiás: **pull** (trae y aplica) o **fetch** (solo trae, no aplica).

Antes de que tu capítulo se agregue al libro oficial, el editor lo revisa. Le mandás una solicitud: "revisá mi capítulo". Eso es un **Pull Request**. El editor comenta, pedís cambios, y cuando está todo bien, mergea.

Un **tag** es una etiqueta que le ponés al libro cuando sale una versión publicable (v1.0, v2.0).

## Cómo funciona realmente

### Remote (origin, upstream)

**Remote**: alias que apunta a la URL de un repositorio remoto. Cuando clonás, Git crea automáticamente uno llamado `origin`.

```powershell
git remote -v
# origin  https://github.com/usuario/proyecto.git (fetch)
# origin  https://github.com/usuario/proyecto.git (push)
```

**origin**: nombre por defecto del remote principal (tu fork o tu repo).

**upstream**: convención para el repositorio original cuando trabajás sobre un fork:

```powershell
git remote add upstream https://github.com/original/proyecto.git
```

Así tenés tu fork (`origin`) y el repo original (`upstream`):

```
upstream (original) → fetch/pull → origin (tu fork) → push → local (tu compu)
```

### Push, Pull, Fetch

| Comando | Trae cambios | Aplica a tu working tree | Cuándo usarlo |
|---------|-------------|-------------------------|--------------|
| `fetch` | Sí | No | Ver qué hay nuevo sin mezclar |
| `pull` | Sí | Sí (merge automático) | Integrar ya los cambios |
| `push` | Envía los tuyos | N/A | Compartir tu trabajo |

```powershell
git push origin main                      # subir commits locales al remoto
git fetch origin                          # traer commits remotos sin aplicar
git pull origin main                      # fetch + merge automático
```

Si alguien más pusheó antes que vos, Git rechaza tu push. Tenés que hacer pull primero.

### Pull Request (PR) como mecanismo de revisión

Un **Pull Request** no es un comando de Git. Es una funcionalidad de GitHub que combina:

1. Una rama con cambios (source)
2. Una rama destino (target, generalmente `main`)
3. Una conversación: comentarios, aprobaciones, cambios solicitados
4. Un estado: abierto, cerrado, mergeado

Flujo típico:

```powershell
git checkout -b feature/login         # crear rama
git add .; git commit -m "feat: login"  # commits
git push origin feature/login         # subir rama al remoto
# En GitHub: abrir PR de feature/login → main
# Alguien revisa, aprobás cambios
# Mergeás el PR a main
```

**PR vs branch**: no son lo mismo. Una branch es un puntero de Git. Un PR es un artefacto de GitHub. Una branch vive también sin internet; un PR solo existe en el servidor. Podés tener una branch sin PR, pero no un PR sin una branch.

GitHub permite tres tipos de revisión en un PR:
- **Comment**: comentario general
- **Approve**: aprobás, el PR puede mergearse
- **Request changes**: pedís cambios, bloquea el merge hasta resolverlos

### Code review en PR (gentle-ai review)

**gentle-ai review** se integra con PRs mediante webhooks de GitHub:

1. Escucha eventos (nuevo PR, nuevos commits en un PR)
2. Analiza el diff del PR automáticamente
3. Publica comentarios como revisor automático
4. Puede aprobar o solicitar cambios según reglas configurables

```
GitHub (nuevo PR) → webhook → gentle-ai review → analiza diff
                                                     ↓
                                        publica comentarios en el PR
```

Además, los hooks de **GGA** (pre-commit, commit-msg) garantizan que el código que llega al PR ya pasó controles básicos. gentle-ai review ve código pre-filtrado.

### Cómo Git protege la trazabilidad (Native Review)

Git garantiza inmutabilidad: una vez creado, un commit no se puede modificar sin cambiar su SHA. **Native Review** usa esta propiedad:

1. Toma el SHA del commit actual como raíz de identidad
2. Toda la revisión se vincula a ese SHA
3. Si el código cambia después, la revisión sigue apuntando al SHA original

```
Commit SHA: a1b2c3d4 → Native Review registra a1b2c3d4 → candidato creado
                                                              ↓
                                            comentarios, aprobaciones vinculados a a1b2c3d4
```

Esto garantiza que el revisor ve exactamente el código que se revisó y que el historial de revisión es auditable.

### Releases y tags

Un **tag** es una etiqueta fija que apunta a un commit (a diferencia de una rama, no se mueve).

```powershell
git tag v1.0.0                           # lightweight
git tag -a v1.0.0 -m "Release v1.0.0"    # annotated (con metadata)
git push origin v1.0.0                   # subir tag al remoto
```

Una **Release** en GitHub es un tag que además tiene notas de release y archivos adjuntos (binarios).

```
Tag: v2.0.0 → GitHub Release: Gentle AI v2.0.0
   ├── Notas: "Nuevo motor de revisión"
   ├── gentle-ai-win-x64.exe
   └── gentle-ai-linux-x64.tar.gz
```

Las releases siguen **semver** (versionado semántico): `vMAJOR.MINOR.PATCH`. Los conventional commits alimentan la generación automática: `fix:` incrementa PATCH, `feat:` incrementa MINOR, `BREAKING CHANGE` incrementa MAJOR.

### Comandos principales

```powershell
git remote -v                                   # ver remotos
git remote add origin <url>                     # agregar remote
git push origin main                            # subir main
git push origin feature/login                   # subir rama
git pull origin main                            # traer y mergear
git fetch origin                                # solo traer
git tag -a v1.0.0 -m "v1.0.0"                  # tag annotated
git push origin v1.0.0                          # subir tag
git push --tags origin                          # subir todos los tags
```

## Errores frecuentes

1. **Push rejected**: otro desarrollador pusheó commits que no tenés. Hacé `git pull --rebase origin main` y volvé a pushear.

2. **Hacer push a main directo**: en proyectos colaborativos, main debería protegerse. Solo merge por PR con revisión aprobada.

3. **Olvidar pushear tags**: los tags no suben con `git push`. Usá `git push --tags` o `git push origin <tag>`.

4. **PR demasiado grande**: 50 archivos es difícil de revisar. Partí la feature en PRs más chicos.

5. **Confundir `origin/feature` con `feature` local**: `origin/feature` no se actualiza hasta que hagas fetch. Si otro desarrollador pusheó, necesitás fetch para verlo.

## Resumen

| Concepto | ¿Qué es? | Comando |
|----------|---------|---------|
| Remote | Alias URL de un repositorio remoto | `git remote add` |
| origin | Remote por defecto | `git push origin` |
| Push | Enviar commits locales al remoto | `git push` |
| Fetch | Traer commits sin aplicar | `git fetch` |
| Pull | Traer y aplicar commits | `git pull` |
| PR | Solicitud de revisión en GitHub | GitHub UI / `gh pr create` |
| Code review | Proceso de revisión de código | Comentarios en PR |
| Tag | Etiqueta fija en un commit | `git tag` |
| Release | Tag + notas + archivos en GitHub | GitHub UI |

## Preguntas

1. ¿Cuál es la diferencia entre `git fetch` y `git pull`?
2. ¿Un Pull Request es lo mismo que una branch? Explicá las diferencias.
3. ¿Cómo se integra gentle-ai review con los Pull Requests?
4. ¿Por qué Native Review usa el commit SHA como raíz de identidad?
5. ¿Cuál es la diferencia entre un tag y una branch?

## Ejercicio

1. Creá un repositorio en GitHub (vacío, sin README).
2. Agregá el remote: `git remote add origin https://github.com/tuusuario/mi-proyecto.git`.
3. Pusheá main: `git push -u origin main`.
4. Creá una rama, modifica `hola.txt`, comiteá y pusheá:
   ```powershell
   git checkout -b feature/ejercicio-remoto
   git add hola.txt; git commit -m "feat: ejercicio remoto"
   git push -u origin feature/ejercicio-remoto
   ```
5. En GitHub, abrí un PR de `feature/ejercicio-remoto` → `main`.
6. Revisá el diff y mergeá el PR desde GitHub.
7. Volvé a main local y hacé pull:
   ```powershell
   git switch main; git pull origin main
   ```
8. Creá y subí un tag: `git tag -a v0.1.0 -m "Primer tag"; git push origin v0.1.0`.

## Fuentes verificadas

- Git 2.40+ (documentación oficial: git-scm.com)
- GitHub Docs: docs.github.com
- GitHub API v2022-11-28
- Ecosistema: gentle-ai 2.x, Native Review 1.x
- Fecha: 2026-07-20
- Estado: 🟢 Verificado (conocimiento fundamental, no depende de versión específica)
