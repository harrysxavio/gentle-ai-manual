---
title: Construcción de productos
description: "El ciclo completo: desde la idea hasta el deploy, integrando todo el ecosistema Gentle."
level: 3
estimatedTime: 90 min
tags:
  - producto
  - integración
  - fullstack
  - deploy
  - sdd
  - ciclo-completo
prerequisites:
  - "Módulos 06–14"
verifiedVersion: "Gentle-AI 2.1.10"
learningOutcomes:
  - "Ejecutar el ciclo completo SDD desde la idea hasta el deploy"
  - "Construir una aplicación fullstack usando Gentle-AI y SDD"
  - "Integrar testing en cada fase del ciclo"
  - "Configurar gates de revisión (GGA, Native Review, Judgment Day)"
  - "Implementar un pipeline de CI/CD con verificación de costos"
  - "Aplicar el deploy checklist antes de producción"
  - "Identificar anti-patrones en el ciclo de desarrollo con IA"
---

# Construcción de productos

## Qué aprenderás

Hasta ahora has visto los componentes del ecosistema Gentle por separado: SDD para el flujo de desarrollo, Engram para la memoria, GGA para la revisión, permisos para la seguridad. Pero un producto real no se construye con piezas aisladas — se construye **integrando todo el ecosistema** en un ciclo cohesivo.

Este capítulo te guía a través del ciclo completo de construcción de un producto, desde la idea inicial hasta el deploy en producción, usando cada herramienta del ecosistema Gentle en el momento adecuado.

Construiremos juntos un ejemplo concreto: una **aplicación web de gestión de tareas** (task manager) fullstack, con frontend en **Astro + React**, backend en **Go**, base de datos **SQLite** en desarrollo y **Postgres** en producción, con **tests en cada fase**, **revisión automática** y **CI/CD**.

En este capítulo vas a entender:
- El ciclo completo: idea → SDD explore → propose → spec → design → tasks → apply → verify → archive → deploy
- Cómo elegir tecnologías para cada capa
- Cómo integrar la base de datos y migraciones
- Cómo hacer testing en cada fase (Strict TDD)
- Cómo configurar los gates de revisión (GGA, Native Review, Judgment Day)
- Cómo armar un pipeline de CI/CD
- Cómo trackear costos a través del proyecto
- Lecciones aprendidas y anti-patrones
- El deploy checklist

## Por qué importa

El salto de "sé usar las herramientas" a "construyo productos con ellas" es el más importante en la adopción de cualquier ecosistema. No se trata de saber ejecutar `/sdd-apply` o configurar permisos — se trata de **orquestar todo el ciclo** para que las herramientas trabajen juntas y no una detrás de otra.

Cuando entendés el ciclo completo:
- Dejás de preguntarte "¿qué herramienta uso ahora?" y simplemente fluís
- Anticipás problemas antes de que ocurran (sabés que Verify te va a pedir tests, así que los escribís en Apply)
- Podés estimar tiempos con más precisión
- Comunicás el progreso a tu equipo con claridad

## Visión simple

El ciclo completo de construcción de un producto con el ecosistema Gentle tiene tres grandes momentos:

1. **Planificación** (SDD: Init → Explore → Propose → Spec → Design → Tasks): definís qué construir, cómo, y desglosás el trabajo en tareas atómicas. Usás Engram para recordar decisiones anteriores y Skills para guiar cada fase.

2. **Implementación** (SDD: Apply → Verify → Archive): escribís código con Strict TDD, revisás que cumpla la spec, y cerrás el cambio. GGA revisa cada commit. Judgment Day revisa el PR completo.

3. **Deploy** (CI/CD → Release): los cambios pasan por CI con tests y gates de seguridad, se deployan a staging, se verifican, y pasan a producción.

Cada momento alimenta al siguiente. La memoria de lo que aprendiste en el ciclo anterior (Engram) mejora el ciclo siguiente.

## Analogía

Construir un producto con el ecosistema Gentle es como **dirigir una orquesta**:

- **SDD** es la partitura. Define qué se toca, en qué orden, y quién entra en cada momento.
- **Engram** es la memoria del director. Recuerda cómo sonó cada ensayo, qué funcionó y qué no.
- **GGA** es el afinador. Revisa que cada instrumento esté en tono antes de que empiece el ensayo (cada commit).
- **Judgment Day** es el ensayo general antes del concierto. Dos músicos (revisores) escuchan la pieza completa y dan su veredicto.
- **CI/CD** es la producción del concierto. Todo tiene que sonar perfecto porque el público (los usuarios) está escuchando.
- **Permisos y costos** son el reglamento del teatro: quién puede estar en el escenario, cuánto cuesta cada músico.

El director (vos) no toca todos los instrumentos. Coordina, decide cuándo entra cada sección, y se asegura de que todos sigan la partitura.

## Cómo funciona realmente

### El ciclo completo paso a paso

Vamos a construir una aplicación de gestión de tareas (task manager) con las siguientes características:

- Frontend: **Astro + React** (shell en Astro, islas interactivas en React)
- Backend: **Go** con `net/http` + `gorilla/mux`
- Base de datos: **SQLite** en desarrollo, **Postgres** en producción
- Testing: **Vitest** (frontend), **Go test** (backend)
- CI/CD: **GitHub Actions**

El proyecto se llama `taskbridge`.

#### Fase 0: Init

```bash
/sdd-init
```

El orquestador detecta que el proyecto no tiene SDD inicializado. Escanea el directorio, encuentra `package.json`, `go.mod`, y configura la persistencia en Engram.

**Qué produce:**
- Contexto de proyecto en Engram con `topic_key: sdd-init/taskbridge`
- Detección de stack: Astro + Go + SQLite
- Detección de testing: Vitest + Go test

**Qué verificamos:** `sdd-status` muestra el proyecto correctamente inicializado.

#### Fase 1: Explore

```bash
/sdd-explore "aplicación web de tareas con Astro + Go"
```

El subagente explora el codebase (vacío en este caso), pero investiga:
- Estructura típica de proyectos Astro + Go
- Librerías recomendadas: `gorilla/mux` para rutas, `sqlx` para base de datos
- Alternativas consideradas: Next.js (más heavy), Svelte (menos ecosistema), Node.js en backend (preferimos Go por rendimiento)
- Riesgos identificados: Astro + Go requiere configurar CORS manualmente, las migraciones de SQLite a Postgres pueden tener diferencias de SQL

**Qué produce:** Reporte de exploración con análisis de alternativas y riesgos.

#### Fase 2: Propose

Se ejecuta automáticamente después de Explore. El orquestador presenta la propuesta:

**Alcance:** MVP de task manager con CRUD de tareas, estados (pendiente/en progreso/completada), filtros por estado, persistencia en base de datos.

**NO incluye:** autenticación de usuarios, colaboración en tiempo real, notificaciones.

**Enfoque:** API REST en Go con SQLite, frontend Astro + React, tests en ambas capas.

**Criterios de éxito:** las 5 operaciones CRUD funcionan, los tests pasan, la app se deploya en producción.

El usuario aprueba la propuesta.

#### Fase 3: Spec

```bash
/sdd-spec
```

**Requisitos funcionales:**
- `GET /api/tasks` — lista todas las tareas (con filtro opcional `?status=`)
- `POST /api/tasks` — crea una tarea (body: `{title, description}`)
- `PUT /api/tasks/{id}` — actualiza título, descripción o estado
- `DELETE /api/tasks/{id}` — elimina una tarea
- `PATCH /api/tasks/{id}/status` — cambia el estado (pendiente → en_progreso → completada)
- Frontend: tabla con tareas, formulario de creación, botones de acción, filtro por estado

**Requisitos no funcionales:**
- La API responde en menos de 200ms (latencia local)
- El frontend es responsive (mobile/desktop)
- Cobertura de tests > 80%

**Casos borde:**
- Crear tarea con título vacío → 400 Bad Request
- Actualizar tarea inexistente → 404
- Filtrar con estado inválido → 400
- Body mal formado → 400

#### Fase 4: Design

```bash
/sdd-design
```

**Arquitectura:**

```
┌────────────────────────────────────────────────┐
│                   Frontend                      │
│  Astro + React (islas interactivas)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ TaskList │ │ TaskForm │ │ StatusFilter     │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└────────────────────┬─────────────────────────────┘
                     │ HTTP (JSON)
┌────────────────────▼─────────────────────────────┐
│                   Backend (Go)                    │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ Router   │ │ Handler      │ │ Repository   │ │
│  │ (mux)    │→│ (controller) │→│ (SQL/queries)│ │
│  └──────────┘ └──────────────┘ └──────┬───────┘ │
└───────────────────────────────────────┼─────────┘
                                        │
                              ┌─────────▼─────────┐
                              │  SQLite / Postgres  │
                              └───────────────────┘
```

**Estructura de directorios:**

```
taskbridge/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskList.astro
│   │   │   ├── TaskForm.tsx
│   │   │   └── StatusFilter.tsx
│   │   └── pages/
│   │       └── index.astro
│   └── package.json
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── handler/
│   │   │   └── task.go
│   │   ├── model/
│   │   │   └── task.go
│   │   └── repository/
│   │       └── sqlite.go
│   ├── migrations/
│   │   └── 001_create_tasks.sql
│   └── go.mod
├── docker-compose.yml
├── .github/workflows/ci.yml
└── openspec/
```

**Decisiones arquitectónicas:**
1. **Backend en Go con `net/http`**: evitamos frameworks pesados. El ecosistema Gentle prefiere stdlib cuando es suficiente.
2. **Repository pattern**: separamos la lógica de negocio de la base de datos. Cambiar de SQLite a Postgres solo requiere un nuevo repository.
3. **Islas React en Astro**: el shell es HTML estático, solo los componentes interactivos (TaskForm, StatusFilter) son React. Mejor rendimiento que una SPA pura.
4. **SQLite en dev, Postgres en prod**: usamos `sqlx` que soporta ambos dialects con sintaxis compatible.

#### Fase 5: Tasks

```bash
/sdd-tasks
```

El orquestador divide el cambio en 10 tareas, desde la estructura del backend hasta CI/CD. Tres ejemplos representativos:

```yaml
tasks:
  - id: "01-crear-backend-structure"
    description: "Estructura de directorios, go.mod, servidor HTTP básico"
    files: ["backend/go.mod", "backend/cmd/server/main.go"]
    depends_on: []
    verification: "go build ./... compila sin errores"
  - id: "03-repository-sqlite"
    description: "Repository con SQLite (CRUD básico)"
    files: ["backend/internal/repository/sqlite.go"]
    depends_on: ["02-modelo-de-datos"]
    verification: "go test ./internal/repository/ pasa"
  - id: "10-docker-y-ci"
    description: "Docker Compose, migraciones, CI/CD"
    files: ["docker-compose.yml", ".github/workflows/ci.yml"]
    depends_on: ["09-conectar-frontend-backend"]
    verification: "GitHub Actions pasa todos los jobs"
```

#### Fase 6: Apply

```bash
/sdd-apply taskbridge
```

Modo manual recomendado. El orquestador ejecuta cada tarea una por una.

**Strict TDD Mode activado.** Para cada tarea de código: RED (test que falla) → GREEN (implementación mínima) → REFACTOR (mejora sin romper test).

**GGA pre-commit:** antes de cada commit, GGA ejecuta:
1. `go vet ./...` y `npm run lint`
2. Escaneo de secretos en el diff
3. Revisión de Native Review (opcional)

Si algo falla, el commit se bloquea y el subagente corrige antes de reintentar.

#### Fase 7: Verify

```bash
/sdd-verify taskbridge
```

El subagente ejecuta:

1. **Tests del backend**: `go test ./... -cover`
2. **Tests del frontend**: `npm run test -- --coverage`
3. **Build**: `go build ./...` + `npm run build`
4. **Verificación de spec**: cada requisito se compara contra la implementación

**Reporte de verificación:**

```
✓ CRUD completo: GET, POST, PUT, DELETE funcionan
✓ Validación: título vacío da 400, tarea inexistente da 404
✓ Tests backend: 12 tests, 100% pass, 85% cobertura
✓ Tests frontend: 8 tests, 100% pass, 82% cobertura
⚠  CORS hardcodeado a localhost — debe ser variable de entorno
Estado: ✅ VERIFIED — sin issues críticos
```

#### Fase 8: Archive

```bash
/sdd-archive taskbridge
```

El orquestador:
1. Marca el cambio como `archived` en Engram
2. Guarda el reporte final con `topic_key: sdd-archive/taskbridge`
3. Actualiza el delta de especificaciones

#### Fase 9: Deploy

```bash
git push
```

El pipeline de CI/CD en GitHub Actions:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && go test ./... -cover
      - run: cd frontend && npm ci && npm run test -- --coverage
      - run: gga review --diff
      - run: opencode models --json
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: ./scripts/deploy.sh
```

### Testing en cada fase

El testing no es solo para la fase Verify. Está integrado en **cada fase del ciclo**:

| Fase | ¿Qué se testea? | ¿Cómo? |
|------|----------------|--------|
| **Explore** | Hipótesis | Proof of concept rápido (spike) |
| **Propose** | Viabilidad | Prototipo desechable si es necesario |
| **Spec** | Claridad de requisitos | El equipo revisa los escenarios GWT |
| **Design** | Arquitectura | Revisión del diseño por pares |
| **Tasks** | Desglose | Cada tarea tiene un criterio de verificación |
| **Apply** | Código | Strict TDD: RED → GREEN → REFACTOR |
| **Verify** | Integración | Tests de integración + cobertura |
| **Archive** | Artefactos | Los tests de regresión se ejecutan |
| **Deploy** | Producción | Smoke tests post-deploy |

### Review gates

Cada gate de revisión captura errores en un momento distinto:

1. **GGA (pre-commit)**: captura secretos, lint, errores de compilación. Rápido, barato, se ejecuta en cada commit.

2. **Native Review (GGA opcional)**: el asistente revisa el diff antes del commit. Más profundo que GGA, captura problemas de lógica y estilo.

3. **Judgment Day (PR review)**: dos revisores (pueden ser humanos o IA) revisan el PR completo de forma independiente. Cada uno emite un veredicto. Si hay diferencias, se discuten y se resuelven.

4. **Verify (SDD)**: verifica que la implementación cumple la spec al 100%. Es el gate más estricto porque es automatizado y objetivo.

La regla general: **cuanto más temprano se capture el error, más barato de corregir**. GGA captura problemas en segundos. Judgment Day puede llevar horas. Deploy con error puede llevar días.

### Cost tracking

OpenCode y Codex registran el uso de cada modelo. Podés consultar los modelos disponibles con `opencode models`. Apply suele ser la fase más cara por sus iteraciones con modelos potentes; con `hard_cap` de $5/día se evitan sorpresas.

### Anti-patrones y lecciones aprendidas

1. **"Specs eternal"**: refinar la spec semanas sin escribir código. La spec es una guía viva, no un contrato legal. Solución: limitá Spec y Design a 2-3 sesiones; si no hay claridad, ejecutá Explore otra vez.

2. **"El orquestador lo hace todo"**: delegar sin revisar decisiones. El orquestador sugiere, vos aprobás. Solución: revisá cada artefacto antes de aprobarlo.

3. **"Modo auto en producción"**: errores silenciosos en tareas tempranas se arrastran. Solución: modo manual con revisión de diff entre tareas.

4. **"Saltar Verify"**: tests pasan ≠ spec cumplida. Solución: ejecutá `/sdd-verify` antes de cada `/sdd-archive`.

5. **"Un solo modelo para todo"**: Haiku alcanza para Explore/Tasks/Archive; Sonnet para Design/Apply. Solución: configurá modelo por fase:

```json
{
  "models": {
    "sdd-explore": "claude-haiku-4.5",
    "sdd-apply": "claude-sonnet-5",
    "sdd-verify": "claude-haiku-4.5",
    "sdd-archive": "claude-haiku-4.5"
  }
}
```

### Deploy checklist

| Área | Items a verificar |
|------|------------------|
| **Seguridad** | Sin secretos en código, CORS por variable de entorno, validación de input en API, queries parametrizadas, `gentle-ai doctor` sin warnings |
| **Testing** | `go test ./...` y `npm run test` pasan con cobertura > 80%, build compila, `sdd-verify` sin issues críticos |
| **Infraestructura** | Migraciones probadas (up/down), Docker Compose funcional, env vars configuradas en prod, backup configurado, health check endpoint |
| **Costos** | Hard cap de presupuesto mensual, modelos por fase configurados, alertas activadas, historial sin anomalías |
| **CI/CD** | Pipeline pasa en main, gate de presupuesto incluido, GGA en pre-commit, Judgment Day ejecutado en el PR final |

## Errores frecuentes

1. **No ejecutar Explore en proyectos existentes**: asumir que conocés el codebase sin explorarlo. El subagente puede encontrar patrones y riesgos que se te pasaron por alto.

2. **Diseñar en exceso**: el diseño debe ser suficiente para guiar la implementación, no un documento de 50 páginas. Si el diseño es demasiado detallado, estás implementando dos veces.

3. **Tests frágiles**: tests que dependen del orden de ejecución, de la hora del sistema, o de datos externos. Usá setup/teardown en cada test para que sean independientes.

4. **Ignorar los warnings de Verify**: un warning no bloquea Archive, pero puede ser un problema en producción. Revisá cada warning antes de archivar.

5. **Deploy manual sin checklist**: hacer deploy un viernes a las 18:00 sin verificar la checklist. El deploy checklist existe por una razón: usalo siempre.

## Resumen

| Momento | Fases SDD | ¿Qué produce? | Gate de calidad |
|---------|-----------|--------------|-----------------|
| **Planificación** | Init → Explore → Propose → Spec → Design → Tasks | Propuesta, spec, diseño, tareas | Aprobación del usuario |
| **Implementación** | Apply → Verify → Archive | Código + tests + artefactos | GGA + Verify + Judgment Day |
| **Deploy** | CI/CD → Producción | App en producción | CI pipeline + Deploy checklist |

## Preguntas

1. ¿Cuál es la diferencia entre el testing en Apply y el testing en Verify?
2. ¿Por qué se recomienda modo manual en Apply en lugar de modo auto?
3. ¿Qué anti-patrón describe a alguien que pasa semanas refinando la spec sin escribir código?
4. ¿Qué gate de revisión es el más rápido y cuál es el más profundo?
5. ¿Por qué Apply es la fase más cara en costos de modelo?
6. ¿Qué verificaciones de seguridad debe incluir el deploy checklist?
7. ¿Cómo se configura un modelo distinto para cada fase SDD?
8. ¿Qué hacer si un warning de Verify parece riesgoso pero no bloquea Archive?

## Ejercicio

1. Inicializá SDD en un proyecto nuevo con `sdd-init`.
2. Ejecutá `sdd-explore` para investigar el stack de tu proyecto actual.
3. Configurá modelos por fase en tu `opencode.json` (Haiku para Explore, Sonnet para Apply).
4. Ejecutá `gentle-ai doctor` y verificá que todas las comprobaciones de seguridad pasen.
5. Revisá los modelos disponibles con `opencode models` y calculá el costo estimado por fase.
6. Implementá un endpoint `/health` en tu proyecto actual con Strict TDD (RED → GREEN → REFACTOR).

## Fuentes verificadas

- Repositorio: gentle-ai, commit `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d`
- Repositorio: engram, commit `763a6ba432713725d6ce82a2416eec6cbd9ec94e`
- Archivos: `internal/assets/skills/sdd-*/SKILL.md`, `internal/assets/skills/_shared/`
- Documentación: Astro (astro.build), Go net/http (pkg.go.dev/net/http), SQLite (sqlite.org)
- Versiones verificadas: Gentle-AI 2.1.10, Engram 1.19.0
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
