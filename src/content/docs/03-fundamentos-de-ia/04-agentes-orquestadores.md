---
title: Agentes y orquestadores
description: Agente como sistema, orquestador, subagentes, patrones de agente, SDD como flujo de orquestación, skills, memoria, OpenCode vs Codex.
level: 1
estimatedTime: 35 min
tags:
  - agentes
  - orquestador
  - subagentes
  - sdd
  - opencode
  - codex
  - patrones
prerequisites:
  - MCP y tool calling (03-03)
verifiedVersion: "gentle-ai 2.x, OpenCode 1.x, SDD 1.x"
learningOutcomes:
  - Explicar qué es un agente como sistema (modelo + instrucciones + tools + contexto)
  - Describir cómo un orquestador distribuye trabajo a subagentes
  - Identificar patrones de agente (sequential, parallel, routing, evaluator-optimizer, swarm)
  - Comprender SDD como flujo de orquestación
  - Diferenciar OpenCode (multiagente nativo) de Codex (solo-agente con orquestación experimental)
---

# Agentes y orquestadores

## Qué aprenderás

Hasta ahora viste los componentes individuales: modelos, tokens, tools, MCP. Pero en el ecosistema Gentle, estos componentes no funcionan aislados. Funcionan como un **sistema de agentes** donde un **orquestador** coordina **subagentes especializados** que ejecutan tareas específicas.

Este capítulo muestra cómo se arma ese sistema, qué patrones de orquestación existen, cómo SDD define el flujo, y cómo OpenCode y Codex implementan multiagente de formas distintas.

## Por qué importa

Un agente solo puede con una herramienta de lectura y otra de escritura puede editar archivos. Pero un sistema de agentes bien orquestado puede:

- Explorar un problema (explore)
- Diseñar una solución (design)
- Implementar el código (apply)
- Verificar que funciona (verify)
- Archivar lo aprendido (archive)

Cada paso lo hace un subagente especializado que recibe solo el contexto que necesita. El resultado final es mucho mejor que un solo agente tratando de hacerlo todo en una sesión gigante.

Sin entender orquestación, no vas a poder diagnosticar por qué un flujo SDD falla, ni diseñar tus propios flujos multiagente.

## Visión simple

Un **orquestador** es como un director de orquesta: no toca ningún instrumento. Sabe cuándo debe entrar cada músico, con qué intensidad, y cómo coordinarlos para que suene la sinfonía completa.

Cada **subagente** es un músico especializado: el violinista (diseño) no toca el trombón (implementación). Pero juntos, coordinados por el director, producen música que ninguno podría lograr solo.

## Analogía

Imaginá la construcción de una casa.

- **Orquestador**: el arquitecto/gerente de proyecto. No pone ladrillos ni pinta paredes. Decide qué se hace, en qué orden, y quién lo hace.
- **Subagentes**: los contratistas especializados. El electricista (sdd-design) diseña el circuito. El albañil (sdd-apply) levanta las paredes. El inspector (sdd-verify) revisa que todo cumpla código.
- **Patrón sequential**: primero los cimientos, luego las paredes, luego el techo. Cada fase espera a la anterior.
- **Patrón parallel**: los electricistas y los plomeros trabajan al mismo tiempo en distintas partes de la casa.
- **Patrón routing**: si la casa es de madera, llamás al carpintero. Si es de ladrillo, llamás al albañil. El arquitecto decide según el material.
- **Patrón evaluator-optimizer**: el inspector revisa la pared, encuentra fisuras, el albañil las repara, el inspector vuelve a revisar.
- **Patrón swarm**: diez albañiles pintan la casa. Cada uno toma una pared sin coordinación central, y la casa se pinta completa.

## Cómo funciona realmente

### El agente como sistema

En el capítulo 01 definimos:

```
AGENTE = MODELO + INSTRUCCIONES + HERRAMIENTAS + CONTEXTO
```

Pero un agente no es solo esa suma estática. Es un **sistema** que ejecuta un ciclo continuo:

```
1. RECIBIR input (mensaje del usuario o de otro agente)
2. ANALIZAR con el modelo (aplica instrucciones + contexto)
3. DECIDIR: ¿responder con texto o ejecutar una tool?
   a) Si tool → ejecutar → volver al paso 2 con el resultado
   b) Si texto → devolver respuesta
4. FIN del ciclo (o próximo input)
```

Este ciclo se repite tantas veces como sea necesario. En una sesión de 20 intercambios, el agente ejecuta este ciclo 20+ veces (porque cada tool call agrega un ciclo interno).

### El agente no es el modelo

Es tentador decir "el agente piensa" o "el agente decide". Pero quien realmente genera las decisiones es el **modelo**. El agente es el **sistema que contiene al modelo**.

Cuando el orquestador "decide" llamar a un subagente:
- El orquestador (sistema) envía un prompt al modelo (el que tiene configurado)
- El modelo genera una respuesta: "llamo al subagente sdd-design"
- El orquestador ejecuta esa decisión: cambia el system prompt, pasa el contexto, invoca al subagente

La decisión la toma el modelo. La ejecución la hace el runtime. El agente es ambos funcionando juntos.

### Orquestador: el agente que controla agentes

El **orquestador** es un agente cuyo propósito es dirigir a otros agentes. No implementa, no diseña, no verifica. **Decide** qué subagente llamar, con qué contexto, y en qué orden.

En el ecosistema Gentle, `gentle-orchestrator` es el orquestador. Su system prompt incluye instrucciones como:

```
Sos un orquestador. Tu trabajo es coordinar subagentes especializados.
No implementes código ni diseñes soluciones. Decidí qué subagente
corresponde según la fase actual del flujo SDD.
```

El orquestador tiene acceso a:
- **Lista de subagentes disponibles**: qué subagentes existen, qué hace cada uno
- **Estado del flujo**: en qué fase está, qué fases están completadas
- **Contexto compartido**: información que debe pasar de un subagente al siguiente
- **Dependencias entre fases**: qué fases requieren que otras estén completas

### Subagentes especializados

Cada subagente en SDD recibe contexto acotado y tiene un propósito específico:

| Subagente | System prompt | Tools típicas | Input | Output |
|-----------|---------------|--------------|-------|--------|
| **sdd-init** | "Inicializá el contexto SDD para este proyecto" | read, glob, bash | Directorio del proyecto | Contexto SDD inicializado |
| **sdd-explore** | "Explorá los requerimientos de este cambio" | read, grep, websearch | Problema, proyecto actual | Preguntas, riesgos, alcance |
| **sdd-propose** | "Proponé un enfoque para resolver el problema" | read, write | Requerimientos explorados | Propuesta de cambio (archivo) |
| **sdd-spec** | "Escribí especificaciones detalladas" | read, write | Propuesta | Specs con escenarios |
| **sdd-design** | "Diseñá la solución técnica" | read, write, lsp | Specs | Diseño con archivos y módulos |
| **sdd-tasks** | "Dividí el diseño en tareas implementables" | read, write | Diseño | Lista de tareas con archivos |
| **sdd-apply** | "Implementá cada tarea según el diseño" | read, write, edit, bash | Tareas + contexto | Código implementado |
| **sdd-verify** | "Verificá que la implementación cumpla las specs" | read, grep, bash | Tareas + código | Reporte de verificación |
| **sdd-archive** | "Archival el cambio y actualizá el contexto global" | read, write, mem_save | Cambio verificado | Contexto actualizado |

Lo crucial: cada subagente **no sabe** de los otros subagentes. El subagente `sdd-design` no sabe que existe `sdd-apply`. Solo recibe su input, ejecuta su tarea, y devuelve su output. El orquestador es el único que tiene la vista completa del flujo.

### Patrones de agente

El libro oficial "Building Effective Agents" (Anthropic, 2024) define varios patrones de orquestación. El ecosistema Gentle implementa varios de ellos.

#### Sequential (secuencial)

Cada subagente se ejecuta después del anterior. La salida de uno es la entrada del siguiente.

```
[sdd-init] → [sdd-explore] → [sdd-propose] → [sdd-spec] → [sdd-design] → [sdd-tasks] → [sdd-apply] → [sdd-verify] → [sdd-archive]
```

Es el patrón principal de SDD. Cada fase depende de la anterior. No podés hacer `sdd-apply` sin haber hecho `sdd-design`.

**Cuándo usarlo**: flujos con dependencias claras entre fases.

**Ventaja**: simple, fácil de diagnosticar (si falla, sabés exactamente en qué fase).

**Desventaja**: lento (cada fase espera a la anterior, no hay paralelismo).

#### Parallel (paralelo)

Varios subagentes ejecutan al mismo tiempo. El orquestador espera a que todos terminen y combina los resultados.

```
         ┌─ [subagente A: frontend]
[input] ─┼─ [subagente B: backend]
         └─ [subagente C: database]
                ↓
         [orquestador combina resultados]
```

**Cuándo usarlo**: tareas independientes (ej: implementar frontend y backend por separado).

**Ventaja**: rapidez (varios subagentes trabajando simultáneamente).

**Desventaja**: complejidad de coordinación (el orquestador debe combinar resultados que pueden entrar en conflicto).

#### Routing (ruteo)

El orquestador analiza el input y decide qué subagente (o ruta) ejecutar. No todos los inputs pasan por todos los subagentes.

```
[input] → [orquestador clasifica]
             │
      ┌──────┼──────────┐
      v      v          v
  [ruta A] [ruta B] [ruta C]
```

**Cuándo usarlo**: cuando el tipo de tarea determina el flujo. Por ejemplo, si el cambio es de UI, va por la ruta frontend. Si es de base de datos, va por la ruta datos.

**Ventaja**: eficiente (no ejecutás subagentes innecesarios).

**Desventaja**: el clasificador (orquestador) puede equivocarse de ruta.

#### Evaluator-Optimizer (evaluador-optimizador)

Un subagente genera output, otro lo evalúa, y si no pasa la evaluación, el primero lo mejora. Es un ciclo de retroalimentación.

```
[generador] → [evaluador]
    ↑              │
    └── (si no aprueba) ─┘
         ↓ (si aprueba)
       [listo]
```

**Cuándo usarlo**: tareas que requieren calidad iterativa (código, diseño, escritura).

**Ventaja**: calidad alta mediante iteración.

**Desventaja**: puede ciclar indefinidamente si no hay un límite de iteraciones.

El patrón Judgment Day en Gentle es un evaluator-optimizer: dos subagentes (jd-judge-a, jd-judge-b) revisan el trabajo de forma independiente, y si encuentran problemas, el implementador lo corrige.

#### Swarm (enjambre)

Múltiples instancias del mismo tipo de agente trabajan en paralelo sin coordinación central. Cada una toma una parte del problema.

```
[input] → [divide el problema]
    ↓
[agente 1] [agente 2] [agente 3] ... [agente N]
    ↓
[combina resultados]
```

**Cuándo usarlo**: tareas que se pueden dividir en partes independientes (ej: revisar 100 archivos, cada agente revisa 10).

**Ventaja**: escala horizontalmente (más agentes = más rápido).

**Desventaja**: no hay coordinación entre agentes; pueden duplicar trabajo o generar resultados inconsistentes.

### SDD como flujo de orquestación

SDD (Software Design Document) no es solo un documento: es un **flujo de orquestación** completo que implementa el patrón sequential con elementos de evaluator-optimizer.

El flujo completo es:

```
Fase 0:  sdd-init     → Inicializa contexto y testing capabilities
Fase 1:  sdd-explore  → Explora requerimientos y riesgos
Fase 2:  sdd-propose  → Propone enfoque y alcance
Fase 3:  sdd-spec     → Escribe specs con escenarios
Fase 4:  sdd-design   → Diseña solución técnica
Fase 5:  sdd-tasks    → Divide en tareas implementables
Fase 6:  sdd-apply    → Implementa cada tarea
Fase 7:  sdd-verify   → Verifica contra specs
Fase 8:  sdd-archive  → Archiva y actualiza contexto
```

Cada fase tiene:

1. **Precondiciones**: qué debe estar listo antes de empezar
2. **Subagente asignado**: quién ejecuta la fase
3. **Input esperado**: qué recibe el subagente
4. **Output esperado**: qué produce el subagente
5. **Criterios de éxito**: cómo saber si la fase se completó correctamente
6. **Postcondiciones**: qué queda disponible después de la fase

El orquestador verifica las precondiciones antes de llamar a un subagente. Si la precondición falla (ej: "no hay diseño" cuando se necesita para tasks), el orquestador no llama al subagente y devuelve un error.

### Cómo el orquestador decide qué subagente llamar

El orquestador no tiene un `switch` hardcodeado con todos los casos. Usa el modelo para decidir. Pero lo hace con un contexto muy controlado:

1. El orquestador tiene en su system prompt la lista de subagentes disponibles y sus descripciones
2. El orquestador conoce el estado actual del flujo (fase actual, fases completadas)
3. El orquestador sabe qué subagente corresponde a la fase actual
4. El orquestador llama al subagente y le pasa el contexto acumulado

La "decisión" del orquestador se limita a:
- ¿Están las precondiciones de la fase actual?
- Si sí → llamar al subagente correspondiente
- Si no → devolver error con qué falta

No es que el orquestador "decida creativamente" qué subagente usar. El flujo es determinista: fase actual → subagente correspondiente. La creatividad está en CÓMO el subagente ejecuta su tarea, no en qué subagente se llama.

### Cómo las skills modifican el comportamiento del agente

Las skills no son agentes separados. Son instrucciones adicionales que se inyectan en el contexto del agente (orquestador o subagente).

Cuando un subagente se activa y existe un skill para su tarea:

1. El orquestador (o el runtime) detecta que el skill coincide con la tarea
2. Carga el contenido del `SKILL.md`
3. Inyecta el contenido en el system prompt del subagente
4. El subagente ahora tiene las instrucciones especializadas además de su system prompt base

Ejemplo: el subagente `sdd-apply` tiene un system prompt genérico de implementación. Pero si cargás el skill `ponytail`, el subagente también recibe instrucciones de mantener el código mínimo, evitar sobreingeniería, y preferir la stdlib.

El subagente no es distinto. Su system prompt es más grande. Sus instrucciones son más específicas. El comportamiento cambia porque el contexto cambia.

### Cómo Engram memory afecta el contexto del agente

Engram no solo guarda información. También afecta el contexto del agente de dos maneras:

**Contexto automático al iniciar sesión**: cuando el agente arranca, llama a `mem_context` para recibir un resumen de sesiones anteriores relevantes. Ese resumen se inyecta en el contexto. El agente "sabe" lo que pasó antes sin tener que leer el historial completo.

**Búsqueda bajo demanda**: cuando el agente necesita información específica, llama a `mem_search`. El resultado se inyecta en el contexto temporalmente. Si la búsqueda encuentra algo relevante, el agente lo usa. Si no, sigue como si nada.

Engram memory y skills tienen una diferencia fundamental:

| Mecanismo | Cuándo se carga | Quién decide | Persistencia |
|-----------|-----------------|--------------|-------------|
| Skills | Cuando la tarea coincide con la descripción | El runtime (match automático) | Duración de la tarea |
| Engram context | Al inicio de sesión + bajo demanda | El agente (explícitamente con mem_context/mem_search) | Una llamada (context) o permanente (mem_save) |

### OpenCode (multiagente nativo) vs Codex (solo-agente)

OpenCode y Codex son dos implementaciones del ecosistema Gentle con arquitecturas de agente distintas.

| Aspecto | OpenCode | Codex |
|---------|----------|-------|
| **Arquitectura** | Multiagente nativo | Solo-agente (multiagente experimental) |
| **Orquestador** | gentle-orchestrator incorporado | No tiene orquestador dedicado (usa el mismo agente) |
| **Subagentes** | Primera clase: sdd-init, sdd-apply, etc. | Simulados: el agente cambia de rol según la tarea |
| **SDD flow** | Nativo: el orquestador managea el flujo | Manual: el usuario ejecuta cada fase |
| **Parallelismo** | Soporta subagentes paralelos | No (un agente, una tarea a la vez) |
| **MCP** | Completo: host + client + servers | Soporte básico de MCP tools |
| **Engram** | Integración completa | Integración parcial |
| **Skills** | Carga automática por coincidencia | Carga manual o por configuración |
| **Casos de uso** | Flujos complejos, SDD completo, equipos | Edición individual, tareas acotadas |

En OpenCode, el orquestador es un componente explícito. Podés verlo funcionar cuando ejecutás un flujo SDD: el orquestador decide qué subagente llamar, pasa el contexto, y coordina las fases.

En Codex, no hay orquestador. Codex es un agente que hace de todo: implementa, diseña, verifica. Si querés un flujo multiagente en Codex, tenés que simularlo manualmente (ejecutar cada fase por separado).

La diferencia fundamental:

```
OpenCode: [orquestador] → [subagente A] → [subagente B] → [subagente C]
           (el orquestador coordina agentes separados)

Codex:    [agente] hace A → [mismo agente] hace B → [mismo agente] hace C
           (el mismo agente cambia de contexto, no hay separación real)
```

En la práctica, OpenCode es mejor para flujos largos y complejos (SDD completo). Codex es mejor para tareas rápidas donde no necesitás orquestación.

## Errores frecuentes

1. **Pensar que el orquestador "implementa"**: el orquestador no escribe código. Si el código es malo, no es culpa del orquestador sino del subagente sdd-apply (o del contexto que recibió).
2. **Confundir skills con subagentes**: los skills son instrucciones que modifican el comportamiento de un agente. Los subagentes son agentes completos con su propio system prompt y tools. No son lo mismo.
3. **Creer que los subagentes son procesos separados**: los subagentes no son procesos independientes. Son la misma instancia del runtime con system prompt y contexto diferentes.
4. **Usar parallel sin considerar conflictos**: si dos subagentes paralelos modifican el mismo archivo, el resultado es impredecible. El orquestador debe asegurarse de que las tareas paralelas sean realmente independientes.
5. **Esperar que el orquestador sea "inteligente"**: el orquestador sigue reglas. Si el flujo requiere pasar por sdd-design antes de sdd-apply, el orquestador no va a "decidir" saltarse sdd-design aunque sea obvio que falta.

## Resumen

| Concepto | Definición |
|----------|------------|
| Agente como sistema | Modelo + instrucciones + tools + contexto ejecutando un ciclo continuo |
| Orquestador | Agente que coordina subagentes sin hacer el trabajo directo |
| Subagente | Agente con misión acotada, system prompt y contexto específicos |
| Sequential | Patrón: cada fase espera a la anterior (SDD) |
| Parallel | Patrón: múltiples subagentes ejecutan simultáneamente |
| Routing | Patrón: el orquestador clasifica y elige la ruta |
| Evaluator-Optimizer | Patrón: generación + evaluación + iteración |
| Swarm | Patrón: múltiples instancias del mismo agente en paralelo |
| SDD flow | Secuencia orquestada de 9 fases (init → explore → ... → archive) |
| OpenCode arquitectura | Multiagente nativo con orquestador y subagentes |
| Codex arquitectura | Solo-agente que cambia de contexto (multiagente experimental) |

## Preguntas

1. ¿Cuál es la diferencia entre un orquestador y un subagente?
2. ¿Por qué SDD usa el patrón sequential y no parallel?
3. En el patrón evaluator-optimizer, ¿qué pasa si el evaluador nunca aprueba el output?
4. ¿Cómo afecta un skill al comportamiento de un subagente?
5. ¿Cuál es la diferencia fundamental entre OpenCode y Codex en términos de orquestación?

## Ejercicio

1. Abrí OpenCode y ejecutá un flujo SDD completo (init → explore → propose → spec → design → tasks → apply → verify → archive). Identificá en los logs cuándo el orquestador pasa de un subagente a otro.
2. Sin ejecutar código, diseñá un flujo sequential para una tarea simple (ej: "agregar un endpoint GET a una API"). ¿Qué subagentes necesitarías? ¿Qué contexto pasaría de uno a otro?
3. Revisá la configuración de subagentes en tu proyecto. Buscá dónde se define qué subagentes están disponibles (`.opencode/` o configuración global).
4. Identificá en tu última sesión con OpenCode/Codex si usaste un solo agente o si hubo orquestación. ¿Cómo lo sabés?

## Fuentes verificadas

- "Building Effective Agents" — Anthropic, 2024 (patrones de agente)
- SDD Documentation: gentle-ai 2.x, SDD 1.x
- OpenCode Architecture: opencode.ai (multiagente nativo)
- Codex Architecture: documentación de Codex (solo-agente)
- Engram: engram proyecto OpenCode (engram 1.x)
- Fecha: 2026-07-20
- Estado: 🟢 Verificado (diseño arquitectónico estable, patrones de referencia)

---

> **Siguiente módulo**: El siguiente módulo profundiza en SDD (Software Design Document), el flujo de orquestación completo del ecosistema Gentle.
