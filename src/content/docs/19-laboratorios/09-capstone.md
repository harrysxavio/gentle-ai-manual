---
title: Capstone completo
description: "Laboratorio de maestría final: construí, revisá y entregá un cambio completo desde la especificación hasta el receipt, integrando todos los conceptos del manual."
level: 3
estimatedTime: 120 min
tags:
  - laboratorio-maestría
  - capstone
  - integración
  - SDD
  - RDD
  - revisión
  - trazabilidad
prerequisites:
  - Todos los módulos del manual
  - Gentle-AI 2.2.0+
  - SDD, Native Review, RDD
  - Laboratorios 2-7 completados
---

# Capstone completo

## Contexto

El aprendizaje real ocurre cuando integrás todo lo que sabés en un solo proyecto. Cada laboratorio anterior ejercitó una capacidad aislada: SDD, revisión, modelos, enrutamiento, GGA, Engram. Pero en un proyecto real no hay ejercicios aislados — hay un requerimiento que tenés que llevar desde la idea hasta la entrega con evidencia verificable, usando todos los skills que desarrollaste de forma integrada.

Este capstone te pide hacer exactamente eso: tomar un requerimiento de producto y completar el ciclo completo — especificación, diseño, implementación multi-agente con modelos asignados, revisión nativa con lentes múltiples, receipt validado, claims verificadas y lecciones documentadas en Engram. No hay pasos numerados. No hay una solución única. Hay un escenario, restricciones y un conjunto de artefactos que producir. El resto lo decidís vos.

Este es el laboratorio 8 de 8. Asume que completaste los laboratorios 2 al 7 y que tenés el ecosistema Gentle-AI 2.2.0+ funcional.

## Objetivo observable

Completar un ciclo de desarrollo completo desde la especificación hasta la entrega con evidencia, integrando:

- SDD (init, explore, propose, spec, design, tasks, apply, verify, archive)
- Asignación de modelos por agente y por tarea (económico, equilibrado, potente según contexto)
- Native Bounded Review con 2 o más lentes (Risk, Readability, Reliability, Resilience)
- Receipt de revisión válido
- Claims verificadas referenciadas con IDs del `verified-claims.yml`
- Lecciones documentadas en Engram (mem_save + mem_session_summary)
- Commits convencionales con GGA como hook pre-commit
- Plan de rollback granular

Al terminar demostrás que podés liderar un cambio de principio a fin sin supervisión externa.

## Escenario

Sos el arquitecto técnico de un proyecto CLI en Node.js. El producto tiene 500 usuarios activos. El equipo recibió este requerimiento del product manager:

> Necesitamos un comando `health-check` que verifique conectividad MCP, estado de Git, y versión de Node, y devuelva un reporte JSON machine-readable. Debe ejecutarse en <2s. Si algo falla, debe indicar QUÉ falló y POR QUÉ, no solo 'error'.

El proyecto actual es un CLI monolítico sin tests automatizados, sin SDD inicializado, y sin Engram configurado. El equipo usa Git con conventional commits pero no tiene GGA instalado. La configuración de modelos está en `opencode.json` con un solo perfil.

Tu tarea es:

1. Inicializar SDD y Engram en el proyecto.
2. Ejecutar SDD explore → propose → spec → design → tasks.
3. Asignar modelos distintos a cada tarea según su naturaleza (económico para tareas repetitivas, potente para diseño y verificación).
4. Implementar el comando `health-check` con tres verificaciones: conectividad MCP, estado de Git, y versión de Node.
5. Escribir tests unitarios, de integración y offline.
6. Instalar GGA como hook y verificar que cada commit pasa la revisión.
7. Ejecutar Native Bounded Review con al menos 2 lentes.
8. Validar el receipt de revisión.
9. Referenciar claims del `verified-claims.yml` que verifican que los comandos usados existen.
10. Guardar lecciones en Engram con `mem_save` y cerrar la sesión con `mem_session_summary`.
11. Documentar el plan de rollback.

## Restricciones

- Sin dependencias externas nuevas (solo stdlib Node.js + gentle-ai SDK si existe).
- Sin proveedores pagos.
- Sin comandos retirados.
- El reporte JSON debe incluir timestamp ISO 8601, versiones (herramienta, checker individual), status individual y global.
- La revisión debe generar receipt válido con `gentle-ai review validate`.
- Los tests deben correr en CI sin conexión a internet.
- No se puede deployar sin receipt.
- Cada commit debe seguir conventional commits y pasar GGA.
- El plan de rollback debe permitir revertir el cambio completo con un solo comando.

## Información disponible

- Todos los módulos del manual (01-14, 18, 19).
- `verified-claims.yml` — archivo de claims verificadas en la raíz del proyecto Gentle-AI.
- `gentle-command-catalog.yml` — catálogo de comandos disponibles.
- Documentación de Node.js: `process.versions`, `http.get`, `child_process.execFileSync`.
- Comandos del catálogo: `gentle-ai sdd init`, `gentle-ai review start`, `gentle-ai review validate`, `gentle-ai doctor`.
- Gentle-AI v2.2.0 source (commit `719b0f6`).
- Módulo 14 (Modelos y enrutamiento): asignación de modelos por agente.
- Módulo 11 (Calidad y revisión): GGA, Native Review, Receipt, Judgment Day.
- Módulo 10 (Trazabilidad y RDD): claims, evidencia, trazabilidad.
- Módulo 12 (OpenCode): configuración de agentes y skills.

## Preguntas de decisión

Cada pregunta tiene implicaciones arquitectónicas, de seguridad y de testabilidad. Respondelas en tu `capstone-evidencia.md` con la justificación.

- **¿Usás `child_process.exec` o `execFileSync`?** `exec` invoca un shell, lo que expone a inyección de comandos si concatenás argumentos. `execFileSync` ejecuta el binario directamente sin shell. ¿Cuál elegís para verificar la versión de Node y el estado de Git? ¿Qué implicaciones tiene para Windows vs Unix?
- **¿La verificación MCP es mockeable?** MCP se conecta via stdio o TCP. Si tu checker abre una conexión real, ¿cómo escribís tests sin un servidor MCP corriendo? ¿Usás dependency injection, un wrapper mockeable, o un flag de entorno?
- **¿El reporte sigue un schema conocido?** ¿Definís un schema JSON formal (con `$schema`) desde el principio, o lo dejás implícito? Un schema conocido permite validación automática y evolución controlada. ¿Vale la pena el overhead inicial?
- **¿Cuándo ejecutás native review?** La revisión debe ocurrir después de apply y antes de archive. ¿Por qué? ¿Qué pasa si revisás antes de tener implementación o después de archivar?
- **¿Qué claims verifican que los comandos existen?** Revisá `verified-claims.yml`. ¿Hay claims que cubran `gentle-ai sdd init`, `gentle-ai review start`, `gentle-ai doctor`? Si no existen, ¿las creás como parte del lab o referenciás las existentes?

## Artefacto esperado

Crear `capstone-evidencia.md` en la raíz del proyecto con las siguientes secciones:

1. **Spec firmado** — fragmento del spec de SDD mostrando escenarios cubiertos.
2. **Plan de tareas** — tabla con ID de tarea, descripción, modelo asignado y justificación.
3. **Decisión de modelo por tarea** — explicación de por qué cada tarea recibió ese modelo (económico para init/test, potente para design/verify/review).
4. **Evidencia de implementación** — fragmentos clave del código del health-check con énfasis en las decisiones de seguridad (execFileSync), testabilidad (mock de MCP) y estructura del reporte JSON.
5. **Receipt de native review** — salida de `gentle-ai review validate`.
6. **Claims referenciadas con IDs** — tabla con ID de claim, comando verificado, y estado.
7. **Lecciones aprendidas** — mínimo 3 lecciones con contexto de por qué importan.

## Criterios de aceptación

- [ ] Spec completo con escenarios normales, error y edge cases.
- [ ] Tasks descompuestas con modelos asignados y justificación.
- [ ] Implementación funcional del health-check con 3 verificaciones.
- [ ] Tests (al menos 1 por escenario, mínimo 6 tests en total).
- [ ] Native review con 2+ lentes y receipt válido.
- [ ] Claims referenciadas con IDs del `verified-claims.yml`.
- [ ] Lecciones capturadas en Engram (verificable con `mem_context` o `mem_search`).
- [ ] Plan de rollback documentado.
- [ ] Commits convencionales que pasaron GGA.

## Decisiones arquitectónicas

Documentá al menos 3 decisiones en formato ADR ligero (contexto, opciones, decisión, consecuencia).

### ADR-001: Elección de execFileSync sobre exec

**Contexto**: El health-check necesita ejecutar `node --version` y `git status --porcelain`. El manual de Node.js advierte que `child_process.exec` invoca un shell (`/bin/sh` o `cmd.exe`), lo que permite inyección de comandos si se concatenan argumentos. El proyecto tiene 500 usuarios activos y el comando se ejecutará en entornos compartidos.

**Opciones**:
1. `exec` — invoca shell, permite pipes y globbing, pero es inseguro con entradas dinámicas.
2. `execFileSync` — ejecuta el binario directamente sin shell. Más seguro, ligeramente más rápido (no pasa por el shell), pero no soporta pipes nativamente.
3. `spawnSync` — similar a execFileSync pero con streaming de stdout/stderr.

**Decisión**: `execFileSync` para las verificaciones de Node y Git. No necesitamos pipes ni procesamiento de shell. Los argumentos son fijos (flags conocidos), no hay entrada de usuario.

**Consecuencia**: Las verificaciones son seguras contra inyección. Perdemos la capacidad de pipes, pero la ganancia en seguridad justifica la pérdida. En Windows, `execFileSync` ejecuta `.exe`, `.cmd`, `.bat` automáticamente.

### ADR-002: Checker de MCP con inyecciín de dependencias

**Contexto**: Verificar conectividad MCP requiere abrir una conexión stdio a un servidor MCP. En tests, no podemos asumir que haya un servidor MCP real disponible. Necesitamos poder mockear la verificación sin modificar el entorno global.

**Opciones**:
1. Conexión real siempre — simple pero no testeable offline.
2. Variable de entorno `MOCK_MCP=true` — switch global, pero acopla el código de producción a los tests.
3. Inyección de dependencias — el checker recibe una función de verificación por constructor o parámetro.

**Decisión**: Inyección de dependencias. El `McpChecker` recibe un `checkFn` opcional en el constructor. Por defecto usa la implementación real que ejecuta `node mcp-server.js --ping` vía execFileSync. En tests, se pasa `async () => ({ status: 'ok', detail: 'mock' })`.

**Consecuencia**: El código de producción no tiene referencias a mocks. Los tests pueden correr sin conexión a internet ni servidores MCP. La desventaja es un leve aumento en la superficie de API del checker, pero es un patrón estándar en Node.js.

### ADR-003: Schema JSON explícito desde el diseño

**Contexto**: El reporte del health-check es machine-readable y debe evolucionar con el tiempo (nuevos checkers, cambios de formato). Sin un schema, los consumidores del JSON tienen que inferir la estructura del código.

**Opciones**:
1. Schema implícito — el formato está definido solo por el código que lo genera.
2. Schema JSON con `$schema` — archivo `.schema.json` publicado junto al tool.
3. Schema interno documentado pero sin validación automática.

**Decisión**: Schema JSON explícito con `$schema` y validación en tests. El schema se define como `health-report.schema.json` y los tests usan `ajv` (o validación manual) para verificar que el reporte cumple el schema.

**Consecuencia**: Los consumidores pueden validar el reporte automáticamente. El schema sirve como contrato entre generador y consumidor. La desventaja es mantener el schema sincronizado con el código.

### ADR-004: Colores en la salida del CLI estándar

**Contexto**: El PM pide reporte JSON, pero el CLI se ejecuta en terminal. ¿Mostramos output formateado en terminal además del JSON? ¿Usamos colores?

**Opciones**:
1. Solo JSON — puro, machine-readable, sin feedback humano.
2. JSON + salida formateada a stderr — JSON a stdout, feedback humano a stderr.
3. Bandera `--pretty` para output formateado.

**Decisión**: Opción 2. JSON siempre a stdout (para piping `health-check > report.json`). Mensajes de progreso y resumen a stderr. Sin dependencias de colores (stdlib: `process.stderr.write`). Esto mantiene el contrato machine-readable sin sacrificar experiencia en terminal.

**Consecuencia**: Los consumidores pueden pipear stdout sin contaminación. stderr muestra el progreso. Sin dependencias externas.

## Plan de pruebas

### Unit tests

Cada checker debe tener su propia suite:

| Checker | Test | Condición |
|---------|------|-----------|
| NodeChecker | Versión válida | `process.versions.node` existe |
| NodeChecker | Versión malformada | Mock de `execFileSync` devuelve string vacío |
| GitChecker | Repositorio limpio | `git status --porcelain` vacío |
| GitChecker | Repositorio sucio | `git status --porcelain` con cambios |
| GitChecker | No es un repo | `git status` falla con exit code 128 |
| McpChecker | Conexión exitosa | Mock devuelve `{ status: 'ok' }` |
| McpChecker | Conexión fallida | Mock devuelve `{ status: 'error', detail: 'ECONNREFUSED' }` |
| ReportBuilder | Schema válido | Output JSON cumple el schema |
| ReportBuilder | Timestamp ISO 8601 | `timestamp` se puede parsear con `new Date()` |

### Integration test

Un test que ejecute el CLI completo en un repositorio Git temporal (creado con `fs.mkdtempSync` + `git init`) y verifique que:

- El JSON de salida tiene todos los campos requeridos.
- `status.global` es `ok` cuando todo funciona.
- El timestamp es ISO 8601 válido.
- La salida a stderr contiene mensajes de progreso.

### Test offline

Un test que corre `npm test` con `MOCK_MCP=true` y sin conexión a internet. No debe intentar conexiones reales. Verificar que pasa sin errores de red ni timeouts.

### Test de errores simulados

Simular cada fallo individual:

1. `MOCK_NODE_ERROR=true` — simula que node --version falla.
2. `MOCK_GIT_NOT_A_REPO=true` — simula que no hay repositorio Git.
3. `MOCK_MCP_TIMEOUT=true` — simula timeout de MCP.

Cada test debe verificar que:
- El campo `status` individual es `error`.
- El campo `detail` explica QUÉ falló y POR QUÉ.
- El campo `status.global` es `degraded`.
- El tiempo de ejecución total es < 2s.

## Plan de rollback

El cambio completo debe poder revertirse con un solo comando. La estrategia usa commits granulares y tags pre-release.

### Commits propuestos

```
feat(health-check): add core engine with Node, Git and MCP checkers
feat(health-check): add CLI wrapper and JSON report builder
test(health-check): add unit, integration and offline tests
chore: install GGA and configure git hooks
```

Cada commit es independiente y reversible.

### Rollback completo

```bash
# Revertir el cambio completo
git revert HEAD~4..HEAD --no-edit
git push origin main

# Alternativa: revertir solo los commits del feature
# (preserva commits existentes no relacionados, como el seed del laboratorio)
git revert HEAD~4..HEAD --no-edit
git push origin main
```

### Rollback por commit

Usá `git log --oneline -4` para obtener los SHAs de los 4 commits del feature. Luego revertí en orden inverso (newest first) para evitar conflictos:

```bash
# Obtener los SHAs reales
git log --oneline -4

# Revertir en orden inverso usando SHAs fijos
# (después de revertir HEAD, los rangos como HEAD~1 cambian)
git revert <sha-tests> --no-edit
git revert <sha-wrapper> --no-edit
git revert <sha-core> --no-edit
```

### Post-rollback verification

```bash
# Verificar que el comando ya no existe
health-check --help  # debe fallar con "command not found"

# Verificar que el proyecto compila
node -e "require('./src/index.js')"

# Verificar que los tests no referencian el health-check
npm test  # debe pasar sin referencias al health-check
```

### Tag pre-release

```bash
git tag -a v1.0.0-rc.1 -m "Pre-release: health-check feature"
git push origin v1.0.0-rc.1
```

La tag permite volver al estado pre-cambio instantáneamente y sirve como punto de control para la revisión.

## Entregables

| # | Artefacto | Formato | Ubicación |
|---|-----------|---------|-----------|
| 1 | Spec SDD | `.sdd/changes/change_001/spec.md` | Proyecto |
| 2 | Diseño SDD | `.sdd/changes/change_001/design.md` | Proyecto |
| 3 | Plan de tareas | `.sdd/changes/change_001/tasks.md` | Proyecto |
| 4 | Implementación | `src/health-check/` | Proyecto |
| 5 | Tests | `test/health-check/` | Proyecto |
| 6 | Receipt de revisión | `.sdd/changes/change_001/receipt.md` | Proyecto |
| 7 | Claims evidence | `capstone-evidencia.md` (sección claims) | Raíz del proyecto |
| 8 | Lecciones en Engram | Verificable con `mem_context` | Engram |

## Rúbrica

| Nivel | Criterio |
|-------|----------|
| **Inicial** | Spec + tasks documentados pero sin implementación completa. No hay tests. Sin revisión. Sin claims. |
| **Competente** | Implementación funcional + tests unitarios. Sin native review. Commits sin GGA. Sin claims referenciadas. |
| **Avanzado** | Implementación + tests + native review con receipt válido. Claims referenciadas. Commits con GGA. Sin plan de rollback. |
| **Experto** | Ciclo completo: spec → tasks con modelos → implementación → tests offline → native review 2+ lentes → receipt validado → claims con IDs → lecciones en Engram → plan de rollback documentado → recomendación de evolución. |

## Autoevaluación

Respondé estas 6 preguntas después de completar el capstone. Si respondés "no" a más de una, revisá los entregables antes de darlo por terminado.

1. **¿El spec cubre todos los escenarios?** — ¿Cubriste los casos normales (todo ok), de error (MCP caído, Git no disponible, Node versión inválida), y edge cases (Git no es repositorio, timeout)? Si no, volvé a spec.
2. **¿Cada tarea tiene modelo asignado?** — Revisá el plan de tareas. Si todas las tareas tienen el mismo modelo, no estás aprovechando el enrutamiento. Una tarea de init puede usar un modelo económico; una de design o verify necesita uno potente.
3. **¿Los tests pasan sin red?** — Ejecutá `npm test` con el adaptador de red desactivado. Si un test falla porque intenta conectar a un servidor, no es un test offline. La verificación MCP debe ser mockeable.
4. **¿La revisión usó 2+ lentes?** — Si usaste solo un lente (ej. solo Readability), no es una revisión nativa completa. Necesitás al menos 2. La combinación Risk + Resilience es recomendable para un health-check.
5. **¿El receipt es válido?** — Ejecutá `gentle-ai review validate`. Si falla, no tenés un receipt válido. Revisá los hallazgos y corregilos antes de continuar.
6. **¿Las lecciones están en Engram?** — Ejecutá `mem_context` o `mem_search "health-check capstone"`. Si no aparecen tus lecciones, no están guardadas. Usá `mem_save` antes de cerrar la sesión y `mem_session_summary` al final.

## Checklist de finalización

- [ ] Spec escrito y aprobado (SDD spec escenarios completos)
- [ ] Tasks descompuestas con modelos (al menos 3 modelos distintos)
- [ ] Implementación funcional (3 checkers + reporte JSON)
- [ ] Tests pasan (unit, integration, offline, errores simulados)
- [ ] Native review ejecutado (2+ lentes)
- [ ] Receipt validado (`gentle-ai review validate`)
- [ ] Claims referenciadas (IDs del `verified-claims.yml`)
- [ ] Lecciones guardadas en Engram (`mem_save` + `mem_session_summary`)
- [ ] Rollback plan documentado (revert + tag + verificación)
- [ ] Commits convencionales pasaron GGA (verificar con `git log`)

## Errores frecuentes

- **Empezar a codificar sin spec.** El spec es el contrato con el PM. Sin spec no sabés qué estás construyendo. El primer paso es `/sdd-init` (slash command del host) seguido de `explore` y `spec`. Si ya escribiste código, parás y volvés al spec.
- **No asignar modelos por tarea.** Usar el mismo modelo para todo es más fácil pero derrocha recursos. Las tareas repetitivas (init, archive) rinden con modelos económicos. Las tareas de diseño y verificación necesitan modelos potentes.
- **Revisar después de archive.** El orden correcto es apply → review → archive. Si revisás después de archivar, los hallazgos no pueden modificar el cambio porque ya está cerrado.
- **No probar sin internet.** Los tests offline son el único modo de garantizar que el CI no va a fallar por dependencias externas. Si el test de MCP intenta una conexión real, va a fallar en un entorno cerrado.
- **Ignorar el receipt.** El receipt no es un trámite. Es la evidencia de que la revisión ocurrió y produjo hallazgos. Sin receipt válido, el cambio no está completo.
- **No referenciar claims.** Las claims son el puente entre la documentación y la implementación. Si no referenciás claims, no hay trazabilidad de que los comandos que usás existen realmente.
- **No guardar lecciones.** Si no guardás las lecciones en Engram, la próxima vez que enfrentes un problema similar vas a arrancar de cero. `mem_save` es parte de la entrega.

## Extensión avanzada

Si completaste el capstone y querés ir más allá:

1. **Dockerizar el health-check.** Creá un `Dockerfile` multi-stage que compile el proyecto y ejecute el health-check en un contenedor mínimo (distroless o alpine). Verificá que el health-check funciona dentro del contenedor.

2. **Métricas de performance.** Agregá medición de tiempo por verificación individual y reportalo en el JSON como `checker.<name>.duration_ms`. Agregá un flag `--bench` que ejecute el health-check 10 veces y muestre P50, P95 y P99 de cada checker.

3. **Publicar como paquete npm.** Configurá `package.json` con `bin` para exponer el health-check como comando global. Publicá en npm registry (o en un registry privado) con `npm publish`.

4. **Health-endpoint HTTP.** Además del CLI, agregá un endpoint HTTP `GET /health` que ejecute los mismos checkers y devuelva el mismo JSON. Usá el módulo `http` de Node.js (sin frameworks externos). Incluí el flag `--http` para iniciar el servidor HTTP.

5. **Modo watch.** Agregá `--watch` que ejecute el health-check cada N segundos (configurable) y solo reporte cambios de estado. Ideal para dashboards.

6. **Gráfico ASCII.** Agregá `--graph` que muestre el estado de cada checker con barras ASCII:
   ```
   Node  ████████░░ 80%
   Git   ██████████ 100%
   MCP   ██░░░░░░░░ 20%
   ```

## Solución

La solución completa está separada del enunciado para permitir la autoevaluación. Consultá el archivo `soluciones/09-capstone-solucion.md` solo después de haber intentado el ejercicio completo.

### Resumen del flujo

1. **SDD Init:** `/sdd-init` — inicializa el contexto SDD del proyecto en el host.

2. **SDD Explore → Propose:** Exploración del requerimiento y propuesta de enfoque. Definición del alcance del health-check y los componentes involucrados.

3. **SDD Spec:** Especificación detallada con escenarios. Cada checker tiene una spec separada con inputs, outputs, errores y tiempos esperados.

4. **SDD Design:** Diseño arquitectónico con decisiones documentadas (ADR-001 a ADR-004). Diagrama de flujo del health-check.

5. **SDD Tasks:** Descomposición en 4 tareas:

| ID | Tarea | Modelo | Justificación |
|----|-------|--------|--------------|
| T-001 | Core engine (NodeChecker, GitChecker, McpChecker) | deepseek-v4-pro | Lógica de negocio crítica, necesita precisión |
| T-002 | CLI wrapper + ReportBuilder | deepseek-v4-flash | Tarea mecánica de wiring, económico es suficiente |
| T-003 | Tests (unit, integration, offline) | deepseek-v4-flash | Tareas repetitivas de cobertura, no requiere modelo potente |
| T-004 | Native Review + Receipt | kimi-k3 | Revisión crítica, necesita el modelo más capaz |

6. **SDD Apply:** Implementación de cada tarea usando los modelos asignados. Commits convencionales con GGA.

7. **Native Review:** Ejecutar `gentle-ai review start` con lentes `Risk` y `Resilience`. Documentar hallazgos y corregir. `gentle-ai review validate`.

8. **SDD Archive:** `gentle-ai sdd archive` — cierra el cambio y genera el changelog.

9. **Claims reference:** Mapeo de claims del `verified-claims.yml`:

| Claim ID | Comando / Flujo | Estado |
|----------|-----------------|--------|
| `review-starts-after-candidate` | `gentle-ai review start` | ✅ Verificado |
| `review-gates-validated-only` | `gentle-ai review validate` (gates validan receipt, no inician review) | ✅ Verificado |
| `sdd-meta-commands-orchestrator` | Meta-comandos SDD (`/sdd-new`, `/sdd-ff`, `/sdd-continue`) manejados por el orchestrator | ✅ Verificado |
| `sdd-internal-phases` | Fases SDD como `sdd-apply`, `sdd-archive` son fases internas del orchestrator, NO comandos CLI directos | ✅ Verificado |
| `concept-stable-vs-observed` | La teoría separa concepto estable de implementación observada referenciando versiones y commits | ✅ Verificado |
| `review-receipt-content-bound` | El receipt está vinculado al contenido exacto del candidato, no es un reporte narrativo | ✅ Verificado |

10. **Lecciones en Engram:** Llamar `mem_save` con:
    - Título: "Capstone completado: health-check CLI con ciclo SDD completo"
    - Tipo: `architecture`
    - Contenido: decisiones clave (execFileSync, DI en checker, schema explícito), errores evitados (revisar antes de archive, tests offline), y recomendaciones de evolución.

11. **mem_session_summary:** Al cerrar el laboratorio, ejecutar `mem_session_summary` con el resumen completo del capstone.

### Comandos clave

```bash
# SDD Init — host-level slash command
# /sdd-init inicializa el contexto SDD del proyecto (no es comando CLI)
# Ver catálogo: slash-sdd-init, claim sdd-internal-phases

# Planeamiento con meta-comandos del orchestrator
# /sdd-new "Health-check CLI"   — explora y propone en un solo paso
# /sdd-ff "Health-check CLI"    — fast-forward: propuesta → spec → design → tasks
# /sdd-continue                  — avanza a la siguiente fase lista

# Implementación (cada batch, vía orchestrator)
# El orchestrador delega sdd-apply como sub-agent en cada batch
# Ver: claim sdd-internal-phases

# Revisión (native bounded review — CLI directo)
gentle-ai review start
gentle-ai review validate

# SDD Archive (fase interna del orchestrator)
# El orchestrador ejecuta sdd-archive como sub-agent al cerrar el cambio
# Ver: claim sdd-internal-phases, limitation-sdd-archive-result

# Engram — comandos del ecosistema, no de Gentle-AI CLI
mem_save ...
mem_session_summary
```

## Fuentes

- **Módulos 01-14, 18, 19** del manual — conceptos completos del ecosistema Gentle-AI.
- **`verified-claims.yml`** — claims verificadas del proyecto Gentle-AI (ubicación: raíz del proyecto o `~/.config/gentle-ai/`).
- **`gentle-command-catalog.yml`** — catálogo de comandos disponibles.
- **Node.js documentation:** `child_process.execFileSync` (<https://nodejs.org/api/child_process.html#child_processexecfilesynccommand-args-options>), `process.versions` (<https://nodejs.org/api/process.html#processversions>).
- **Gentle-AI v2.2.0** — commit `719b0f6`. Archivos fuente en `internal/sdd/`, `internal/review/`, `bin/`.
- **ISO 8601:** Formato de timestamp de fecha y hora. (<https://en.wikipedia.org/wiki/ISO_8601>).
- **JSON Schema:** Especificación de schema para validación automática. (<https://json-schema.org/>).
- **Concepto de _injection de dependencias_** — Patrón de diseño para testabilidad. Explicado en Martin Fowler's "Inversion of Control Containers and the Dependency Injection pattern".
- **Conventional Commits:** Estándar de mensajes de commit. (<https://www.conventionalcommits.org/>).
- **Laboratorios 2-7 del manual** — prerrequisitos completados que ejercitan cada capacidad por separado.
- **Fecha de verificación:** 2026-07-29.
