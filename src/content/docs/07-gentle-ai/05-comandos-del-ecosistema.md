---
title: Comandos del ecosistema
description: Qué comandos existen en el ecosistema Gentle, en qué superficie se usan (CLI, TUI, slash command, fase interna) y cuándo usar cada uno.
level: 2
estimatedTime: 25 min
tags:
  - gentle-ai
  - cli
  - tui
  - comandos
  - ecosistema
prerequisites:
  - "CLI y TUI de Gentle-AI (07-02)"
  - "Componentes y agentes (07-03)"
verifiedVersion: "Gentle-AI 2.2.0"
learningOutcomes:
  - Distinguir entre CLI, TUI, slash command y fase interna
  - Identificar los comandos CLI disponibles y su mutabilidad
  - Reconocer los slash commands del host y las fases internas de SDD
  - Explicar qué superficie usar según la tarea
  - Localizar comandos retirados y sus reemplazos
---

# Comandos del ecosistema

## Qué aprenderás

El ecosistema Gentle no tiene una sola interfaz. Los comandos se distribuyen en cuatro superficies distintas, cada una con un propósito, un contexto de uso y un nivel de riesgo diferente.

En este capítulo vas a entender:
- Las cuatro superficies de comando: CLI, TUI, slash command, fase interna
- Todos los comandos CLI actuales, organizados por categoría
- Los slash commands disponibles en el host (OpenCode, Claude Code)
- Las fases internas de SDD y por qué no son comandos de usuario
- Comandos retirados (legacy) y sus reemplazos
- Cómo está organizado el catálogo de comandos

## Por qué importa

Cada vez que querés hacer algo en el ecosistema —instalar, sincronizar, revisar código, iniciar un cambio SDD— tenés que elegir una superficie. Usar la incorrecta genera confusión: ejecutar un comando CLI cuando deberías usar un slash command, o invocar una fase interna como si fuera un comando de terminal.

Saber qué superficie usar para cada tarea te ahorra tiempo, evita errores y te da un mapa mental claro de las capacidades del ecosistema. Además, hay comandos que cambiaron entre versiones: conocer los reemplazos evita usar comandos retirados que ya no funcionan.

## Explicación simple

El ecosistema Gentle tiene cuatro formas de invocar acciones, como si fueran cuatro "interfaces" distintas:

1. **CLI** (`gentle-ai <comando>`): comandos que ejecutás en la terminal. Sirven para instalar, actualizar, diagnosticar, revisar código. Son la interfaz principal del binario `gentle-ai`.

2. **TUI** (`gentle-ai` sin argumentos): interfaz visual en la terminal para explorar componentes, seleccionar qué instalar, crear perfiles SDD, pinar backups. Usa Bubbletea.

3. **Slash command** (`/comando`): comandos que escribís en el chat del asistente (OpenCode, Claude Code). Sirven para iniciar cambios SDD, configurar modelos, o invocar al orquestador. No pasan por el binario `gentle-ai`.

4. **Fase interna**: pasos que ejecuta el orquestador automáticamente como parte del flujo SDD (explore, propose, design, apply, verify, archive). No son invocables por el usuario.

La diferencia clave: CLI y TUI los ejecuta `gentle-ai` desde la terminal. Los slash commands los interpreta el asistente. Las fases internas las orquesta el sistema solo.

## Analogía

Imaginá un taller mecánico:

- El **CLI** es el panel de diagnóstico que un técnico usa con comandos precisos: "medir presión", "leer códigos de error", "ajustar válvulas". Cada comando hace una cosa y termina.

- La **TUI** es la pantalla táctil en el taller que muestra todos los componentes del auto, su estado, y permite seleccionar qué revisar con solo tocar.

- Los **slash commands** son las instrucciones que le das al mecánico jefe: "arrancá el motor", "hacé una prueba de ruta". Él se encarga de delegar el trabajo a los especialistas.

- Las **fases internas** son los pasos que cada especialista sigue sin que nadie se los diga: "desmontar la rueda → revisar la pastilla → medir el disco → informar". No se los decís vos, el mecánico jefe los coordina.

Vos usás CLI, TUI o slash commands según lo que necesites. El sistema se encarga del resto.

## Cómo funciona realmente

### Las cuatro superficies de comando

| Superficie | Cómo se invoca | Quién lo ejecuta | Mutabilidad | Ejemplos |
|-----------|---------------|------------------|-------------|----------|
| **CLI** | `gentle-ai <comando>` | Binario gentle-ai | Mixto (lectura o escritura según comando) | `install`, `doctor`, `sync`, `review start` |
| **TUI** | `gentle-ai` (sin args) | Binario gentle-ai (Bubbletea) | Escritura (instala, configura) | Seleccionar componentes, crear perfiles |
| **Slash command** | `/comando` en el chat | Asistente (OpenCode, Claude Code) | Escritura | `/sdd-new`, `/sdd-ff`, `/model-config` |
| **Fase interna** | Orquestada por SDD | Subagentes del orquestador | Según la fase | `sdd-explore`, `sdd-design`, `sdd-verify` |

### Comandos CLI: mantenimiento

Estos comandos gestionan la instalación y configuración del ecosistema:

| Comando | ¿Modifica? | ¿Requiere red? | Descripción |
|---------|-----------|----------------|-------------|
| `gentle-ai install` | ✅ Sí | ✅ Sí | Instala y configura componentes sobre tu agente |
| `gentle-ai uninstall` | ✅ Sí | ❌ No | Remueve componentes instalados |
| `gentle-ai sync` | ✅ Sí | ❌ No | Sincroniza configs y skills a la versión actual |
| `gentle-ai update` | ❌ No | ✅ Sí | Verifica actualizaciones disponibles (no las aplica) |
| `gentle-ai upgrade` | ✅ Sí | ✅ Sí | Aplica actualizaciones a herramientas gestionadas |
| `gentle-ai restore` | ✅ Sí | ❌ No | Restaura backup desde auto-snapshots |
| `gentle-ai doctor` | ❌ No | ❌ No | Diagnóstico de salud del ecosistema |
| `gentle-ai version` | ❌ No | ❌ No | Muestra la versión instalada |
| `gentle-ai help` | ❌ No | ❌ No | Muestra ayuda general o de un comando |

### Comandos CLI: revisión (review)

El sistema de revisión nativa tiene su propia familia de subcomandos:

| Comando | ¿Modifica? | Descripción |
|---------|-----------|-------------|
| `gentle-ai review start` | Crea receipt(s) | Inicia revisión sobre un candidato congelado |
| `gentle-ai review finalize` | Crea receipt(s) | Consume resultados y emite receipt terminal |
| `gentle-ai review validate` | ❌ No | Revalida un receipt en un gate específico |
| `gentle-ai review status` | ❌ No | Inventario del estado de la autoridad de revisión |
| `gentle-ai review mode status` | ❌ No | Reporta la fuente y modo de revisión efectivo |
| `gentle-ai review mode disable` | ✅ Sí | Desactiva review-driven development |
| `gentle-ai review mode enable` | ✅ Sí | Reactiva review mode |
| `gentle-ai review capabilities` | ❌ No | Reporta capacidades del proveedor |
| `gentle-ai review capture-result` | ✅ Sí | Admite un resultado de revisor por lens |
| `gentle-ai review bind-sdd` | ✅ Sí | Vincula un receipt aprobado a un cambio SDD |
| `gentle-ai review repair` | ✅ Sí | Repara alias históricos con autorización |
| `gentle-ai review retry-final-verification` | Crea receipt(s) | Reintento one-shot de verificación final fallida |
| `gentle-ai review schema` | ❌ No | Emite schema con ejemplo de un contrato |
| `gentle-ai review reopen-results` | ✅ Sí | Reabre resultados en cuarentena |

### Comandos CLI: ecosistema

| Comando | ¿Modifica? | Descripción |
|---------|-----------|-------------|
| `gentle-ai skill-registry refresh` | ✅ Sí | Escanea skills instalados y refresca el registry |
| `gentle-ai skill-registry list` | ❌ No | Lista skills registrados |
| `gentle-ai codegraph` | Mixto | Herramientas de exploración del grafo de código |

### Comandos CLI: SDD

| Comando | ¿Modifica? | Descripción |
|---------|-----------|-------------|
| `gentle-ai sdd-status` | ❌ No | Estado de un cambio SDD |
| `gentle-ai sdd-continue` | ❌ No (rutea) | Rutea la continuación de un cambio SDD |

### Slash commands del host

Estos comandos se escriben en el chat del asistente (OpenCode o Claude Code), no en la terminal:

| Slash command | ¿Qué hace? | Host |
|--------------|-----------|------|
| `/sdd-init` | Inicializa contexto SDD en el proyecto | OpenCode, Claude Code |
| `/sdd-new` | Inicia una nueva propuesta de cambio SDD | OpenCode, Claude Code |
| `/sdd-ff` | Fast-forward un cambio SDD a través de fases | OpenCode |
| `/sdd-continue` | Continúa un cambio SDD desde la fase actual | OpenCode |
| `/model-config` | Abre el dashboard de asignación de modelos | OpenCode |

Los slash commands NO son comandos de `gentle-ai`. No los ejecutás en la terminal. Los escribís en el chat del asistente y el host los interpreta.

### Fases internas de SDD

Estas NO son comandos de usuario. Son fases que el orquestador ejecuta automáticamente:

| Fase interna | Mutabilidad | Propósito |
|-------------|-------------|-----------|
| `sdd-explore` | Solo lectura | Explora ideas y requisitos |
| `sdd-propose` | Escritura | Crea propuesta de cambio |
| `sdd-spec` | Escritura | Escribe especificaciones detalladas |
| `sdd-design` | Escritura | Define arquitectura técnica |
| `sdd-tasks` | Escritura | Desglosa en tareas de implementación |
| `sdd-apply` | Escritura | Implementa el código |
| `sdd-verify` | Solo lectura | Verifica contra especificaciones |
| `sdd-archive` | Escritura | Archiva el cambio completado |
| `sdd-onboard` | Escritura | Guía al usuario en el flujo SDD |

Ninguna de estas fases se invoca directamente. El orquestador las ejecuta cuando corresponde según el estado del cambio SDD.

### Comandos retirados (legacy)

Algunos comandos de la versión v1.x fueron reemplazados en v2.x. Siguen presentes en el binario como compatibilidad solo lectura:

| Comando legacy | Reemplazo | Estado |
|---------------|-----------|--------|
| `gentle-ai review-start` | `gentle-ai review start` | Retirado, solo lectura |
| `gentle-ai review-resume` | `gentle-ai review status` | Retirado, solo lectura |
| `gentle-ai review-step` | Comandos `review` negociados | Retirado, solo lectura |
| `gentle-ai review-validate` | `gentle-ai review validate` | Retirado, solo lectura |
| `gentle-ai review finalize --result` | `--result-artifact`, `--captured-results` | Retirado en v2.2.0 |

El flag `--result` en `review finalize` fue retirado sin ventana de deprecación. Los archivos legacy siguen siendo compatibles a nivel de bytes pero no son un mecanismo de handoff durable entre agentes.

## Errores frecuentes

1. **Usar un slash command como CLI**: `/sdd-new` no es un comando de `gentle-ai`. Si lo ejecutás en la terminal, falla. Escribilo en el chat del asistente.
2. **Invocar una fase interna directamente**: `sdd-design` no es un comando. El orquestador la ejecuta cuando corresponde. No la invocás vos.
3. **Usar `--result` en `review finalize`**: fue retirado en v2.2.0. Usá `--result-artifact` o `--captured-results`.
4. **Confundir `gentle-ai review start` con `gentle-ai review-start`**: el segundo es legacy y solo lectura. Usá el primero.
5. **Esperar que `gentle-ai sdd-continue` CLI ejecute una fase**: este comando solo rutea la continuación. La fase la ejecuta el orquestador en el asistente.

## Resumen

| Superficie | Cómo se usa | Ejemplos |
|-----------|------------|----------|
| **CLI** | `gentle-ai <comando>` en terminal | `install`, `doctor`, `sync`, `review start` |
| **TUI** | `gentle-ai` sin argumentos | Seleccionar componentes, pinar backups |
| **Slash command** | `/comando` en el chat | `/sdd-new`, `/model-config` |
| **Fase interna** | Automática (orquestador) | `sdd-explore`, `sdd-design`, `sdd-verify` |
| **Comando legacy** | Presente pero solo lectura | `review-start`, `review-resume` |

## Preguntas

1. ¿Cuál es la diferencia entre un slash command y un comando CLI?
2. ¿Qué superficie usarías para iniciar un nuevo cambio SDD?
3. ¿Por qué las fases internas de SDD no son comandos de usuario?
4. ¿Qué comandos CLI son de solo lectura (no modifican archivos)?
5. ¿Cuál es el reemplazo de `gentle-ai review finalize --result` en v2.2.0?
6. Si querés diagnosticar la salud del ecosistema, ¿qué comando usás?

## Fuentes verificadas

- Repositorio: gentle-ai, commit `ee83e83d56f0d149c52f93fd13b3296858f5147f`
- Archivos: README.md, `docs/architecture/organic-rdd.md`, `docs/review-integration.md`, `docs/trigger-rules.md`
- Versión verificada: Gentle-AI 2.2.0
- Fuente: `data/evidence/gentle-command-catalog.yml`
- Fecha: 2026-07-28
- Estado: 🟢 Verificado
