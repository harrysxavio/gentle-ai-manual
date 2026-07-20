---
title: Las 10 fases de SDD
description: "Spec-Driven Development en detalle: qué produce cada fase, cómo fluyen los artefactos y cómo el orquestador decide qué sigue."
level: 2
estimatedTime: 30 min
tags:
  - sdd
  - fases
  - artefactos
  - flujo
  - orquestador
  - subagentes
prerequisites:
  - "¿Qué es SDD? (08-01)"
verifiedVersion: "Gentle-AI 2.1.10"
learningOutcomes:
  - "Explicar qué produce cada una de las 10 fases de SDD"
  - "Describir cómo fluyen los artefactos entre fases"
  - "Entender cómo el orquestador decide qué fase ejecutar"
  - "Saber cómo reiniciar una fase fallida"
---

# Las 10 fases de SDD

## ¿Qué aprenderás?

SDD divide el desarrollo en **fases atómicas**. Cada fase tiene un propósito, un subagente especializado, y produce un artefacto que la siguiente fase consume como entrada.

En este capítulo vas a entender:
- Cada una de las 10 fases en detalle: qué hace, qué produce, cómo se invoca
- El grafo de dependencias entre fases y por qué el orden importa
- Cómo el orquestador decide qué fase ejecutar a continuación
- Qué pasa cuando una fase falla y cómo reiniciarla
- La diferencia entre meta-commands y slash commands

## Por qué importa

El problema más común cuando la gente empieza con SDD es no entender **qué produce cada fase** ni **cómo fluyen los artefactos**. Terminan ejecutando fases fuera de orden o saltándose pasos críticos.

Cuando entendés el flujo completo:
- Sabés qué esperar de cada paso
- Podés identificar **dónde ocurrió el error** cuando algo falla
- Sabés **qué fase reiniciar** después de una corrección
- Podés comunicarte con el orquestador con precisión

## Analogía: construir una casa

SDD tiene 10 fases, pero no todas se ejecutan siempre. El flujo típico es:

```
Init → Explore → Propose → Spec → Design → Tasks → Apply → Verify → Archive
```

Pensalo como construir una casa: no empezás a poner ladrillos sin un plano, y no hacés el plano sin saber qué terreno tenés.

| Fase SDD | Equivalente en construcción |
|----------|----------------------------|
| Init | Inspeccionar el terreno |
| Explore | Estudiar el terreno, ver napas, tipo de suelo |
| Propose | Decidir qué casa construir y por qué |
| Spec | Escribir los planos de la casa |
| Design | Calcular estructuras, materiales, cañerías |
| Tasks | Hacer la lista de tareas: "comprar ladrillos", "cavar cimientos" |
| Apply | Construir |
| Verify | Revisar que todo esté según plano |
| Archive | Entregar la casa con los planos actualizados |

Hay una fase extra, **Onboard**, que no es parte del flujo normal sino un tutorial guiado.

## El flujo completo explicado

### Fase 0: Init (`sdd-init`)

**¿Qué hace?** Inicializa el contexto SDD para el proyecto. Detecta el stack tecnológico, el gestor de paquetes, el framework de testing, y configura dónde se persistirán los artefactos (OpenSpec en disco o Engram en memoria).

**¿Qué produce?** `openspec/config.yaml` con el contexto del proyecto, o un artefacto en Engram con `topic_key: sdd-init/{proyecto}`. También registra las capacidades de testing disponibles.

**¿Qué comando lo activa?** `/sdd-init` (slash command). También se ejecuta automáticamente la primera vez que usás `/sdd-new`.

**Lo que hace el orquestador:** Detecta el proyecto, identifica el stack, pregunta al usuario el modo de persistencia, y arranca el contexto.

**Lo que hace el subagente:** Escanea el proyecto en busca de `package.json`, `go.mod`, `Cargo.toml`, `Gemfile`, `pyproject.toml`, etc. Corre `codegraph status` si está disponible. Detecta el framework de testing (Vitest, Jest, RSpec, Go test, pytest, etc.).

**Lo que ve el usuario:** "SDD initialized for proyecto. Stack: Next.js + Vitest. Persistence: engram."

**¿Puede fallar?** Sí, si el proyecto no tiene un stack detectable o si el usuario cancela. La solución es revisar que el proyecto tenga los archivos de configuración esperados y reintentar.

### Fase 1: Explore (`sdd-explore`)

**¿Qué hace?** Investiga una idea antes de comprometerse con ella. Lee el codebase, busca patrones existentes, compara enfoques alternativos, identifica riesgos tempranos.

**¿Qué produce?** Reporte de exploración estructurado que incluye:
- Resumen del tema explorado
- Código relevante encontrado (archivos, funciones, patrones)
- Alternativas consideradas con pros y contras
- Riesgos identificados
- Recomendación inicial

**¿Qué comando lo activa?** `/sdd-explore <tema>` o como parte de `/sdd-new <cambio>`.

**Lo que hace el orquestador:** Si se invoca con `/sdd-new`, ejecuta Explore y Propose de forma encadenada. Si se invoca solo, pasa el tema al subagente y espera el reporte.

**Lo que hace el subagente:** Lee archivos del proyecto relacionados con el tema, busca en el codebase usando CodeGraph o grep, identifica componentes existentes que podrían reutilizarse, evalúa 2 o 3 aproximaciones distintas.

**Razonamiento recomendado:** Medio. No necesita máxima profundidad porque es exploratorio.

**¿Cuándo detenerse?** Cuando el reporte tiene suficiente información para tomar una decisión informada. Si el tema es demasiado amplio, el orquestador puede pedir al usuario que lo refine.

### Fase 2: Propose (`sdd-propose`)

**¿Qué hace?** Define el alcance, objetivo y enfoque del cambio de forma precisa. Es el equivalente a un PRD (Product Requirements Document) técnico pero condensado.

**¿Qué produce?** Propuesta de cambio con:
- **Alcance**: qué entra y qué NO entra en este cambio
- **Objetivo**: el problema que resuelve
- **Enfoque**: la solución elegida con justificación
- **Criterios de éxito**: cómo se mide que el cambio funciona
- **Riesgos**: qué podría salir mal
- **Plan de rollback**: cómo volver atrás si algo falla

**¿Qué comando lo activa?** Automáticamente tras Explore en `/sdd-new`, o manualmente con `/sdd-propose`.

**Lo que hace el orquestador:** Toma el reporte de Explore, lo pasa al subagente de Propose, y presenta la propuesta al usuario para aprobación.

**Lo que hace el subagente:** Sintetiza el reporte de Explore en una propuesta estructurada. Evalúa si el enfoque elegido es el correcto. Identifica riesgos que Explore pudo haber pasado por alto.

**Razonamiento recomendado:** Alto. Esta fase define el rumbo de todo el cambio.

**¿Qué pasa si el usuario rechaza la propuesta?** El orquestador vuelve a Explore para investigar alternativas. No se avanza a Spec hasta que haya una propuesta aprobada.

### Fase 3: Spec (`sdd-spec`)

**¿Qué hace?** Escribe requisitos detallados con escenarios Given/When/Then y casos borde. Es la fase que responde "¿qué tiene que hacer el sistema?".

**¿Qué produce?** Especificación delta con:
- Requisitos funcionales: comportamiento esperado en lenguaje natural y ejemplos concretos
- Requisitos no funcionales: performance, seguridad, accesibilidad, compatibilidad
- Criterios de aceptación: condiciones explícitas que Verify usará para validar
- Casos borde: valores límite, estados vacíos, errores de red, concurrencia
- Dependencias con otros componentes o cambios activos

**¿Qué comando lo activa?** Automáticamente tras Propose, o con `/sdd-spec`.

**Lo que hace el subagente:** Analiza la propuesta aprobada, desglosa cada aspecto en requisitos, identifica casos borde que el usuario no mencionó, y redacta criterios de aceptación verificables.

**Razonamiento recomendado:** Medio-Alto. Los requisitos deben ser precisos pero no necesitan el máximo nivel de profundidad.

**Relación con Design:** Spec y Design son independientes entre sí. Pueden ejecutarse en paralelo si el orquestador lo soporta. Ambas deben estar listas antes de Tasks.

### Fase 4: Design (`sdd-design`)

**¿Qué hace?** Define la arquitectura técnica: componentes, interfaces, flujos de datos, decisiones arquitectónicas, y plan de migración si aplica.

**¿Qué produce?** Diseño técnico con:
- Diagrama de componentes y sus relaciones
- Interfaces y contratos (tipos, funciones, props de componentes, endpoints de API)
- ADRs (Architecture Decision Records) para decisiones importantes
- Flujos: diagramas de secuencia para los caminos feliz y de error
- Plan de migración si el cambio requiere modificar código existente
- Estrategia de testing: qué y cómo se va a testear

**¿Qué comando lo activa?** Automáticamente tras Propose, o con `/sdd-design`.

**Lo que hace el subagente:** Analiza la spec, diseñó la solución técnica, identifica componentes reutilizables vs. nuevos, evalúa el impacto en el diseño existente, y documenta cada decisión arquitectónica con su justificación.

**Razonamiento recomendado:** Alto — es la fase más crítica del ciclo. Un diseño pobre genera código pobre aunque la spec sea excelente.

**¿Qué pasa si no hay consenso en el diseño?** El orquestador puede pedir al usuario que revise el diseño y apruebe o solicite cambios. No se avanza a Tasks sin un diseño revisado.

### Fase 5: Tasks (`sdd-tasks`)

**¿Qué hace?** Desglosa el diseño y la spec en tareas atómicas y verificables. Cada tarea debe ser pequeña (idealmente <50 líneas de cambio), independiente en lo posible, y tener un criterio de verificación claro.

**¿Qué produce?** Lista de tareas en formato estructurado:

```yaml
tasks:
  - id: "01-crear-componente-search-bar"
    description: "Crear el componente SearchBar con props de búsqueda"
    files: ["components/SearchBar.tsx"]
    depends_on: []
    verification: "El componente renderiza un input con placeholder"
  - id: "02-implementar-hook-use-search"
    description: "Implementar hook useSearch con debounce de 300ms"
    files: ["hooks/useSearch.ts"]
    depends_on: ["01-crear-componente-search-bar"]
    verification: "El hook devuelve resultados después de 300ms sin escribir"
```

**¿Qué comando lo activa?** Automáticamente tras Spec y Design, o con `/sdd-tasks`.

**Lo que hace el subagente:** Toma la spec y el diseño, identifica los archivos a crear o modificar, define las dependencias entre tareas, y asigna un criterio de verificación a cada una.

**Razonamiento recomendado:** Medio. Es más mecánico que creativo.

**Ponytail Code Gate:** Antes de finalizar las tareas, se aplica el Ponytail gate para preguntar: ¿esto necesita existir? ¿Podemos usar stdlib? ¿Hay una dependencia ya instalada que lo haga? Esto elimina tareas innecesarias antes de Apply.

### Fase 6: Apply (`sdd-apply`)

**¿Qué hace?** Implementa las tareas en código real. Es la fase más larga y donde realmente se escribe código.

**¿Qué produce?** Código implementado, tests escritos, documentación actualizada. Las tareas se marcan como `[x]` a medida que se completan.

**¿Qué comando lo activa?** `/sdd-apply [cambio]` o automáticamente con `/sdd-continue`.

**Modos de Apply:**
- **Manual (recomendado):** el orquestador muestra cada tarea y aplica una por una con confirmación del usuario. Podés revisar el diff entre tareas.
- **Auto:** ejecuta todas las tareas en orden sin preguntar. Riesgoso: si una tarea temprana produce un error, se arrastra a las siguientes.

**Strict TDD Mode:** si el proyecto tiene testing detectado, Apply sigue el ciclo RED → GREEN → REFACTOR por cada tarea:
1. **RED**: escribe el test que falla (demuestra que el requisito no está implementado)
2. **GREEN**: implementa el mínimo código necesario para que el test pase
3. **REFACTOR**: mejora el código sin romper el test

**Lo que hace el subagente:** Implementa cada tarea respetando el diseño, escribe tests, y marca la tarea como completada solo cuando pasa su verificación.

**Razonamiento recomendado:** Medio-Alto. La implementación requiere atención al detalle.

### Fase 7: Verify (`sdd-verify`)

**¿Qué hace?** Valida que la implementación cumple la spec al 100%. Ejecuta la suite de tests, revisa cobertura, verifica cada requisito de la spec contra la implementación.

**¿Qué produce?** Reporte de verificación con hallazgos clasificados:
- **CRITICAL**: bloquea Archive. Algo no funciona o no cumple la spec.
- **WARNING**: riesgo potencial. No bloquea pero debería revisarse.
- **SUGGESTION**: mejora opcional. Código que podría ser más limpio o eficiente.

**¿Qué comando lo activa?** `/sdd-verify [cambio]`.

**Lo que hace el orquestador:** Ejecuta Verify, presenta el reporte al usuario, y decide si el cambio puede avanzar a Archive o debe volver a Apply/Design.

**Lo que hace el subagente:** Ejecuta los tests del proyecto, compara cada requisito de la spec contra la implementación punto por punto, verifica cobertura de código, y clasifica cada hallazgo.

**Razonamiento recomendado:** Alto. Una verificación superficial es peligrosa.

**¿Qué pasa si hay hallazgos CRITICAL?** El orquestador NO permite avanzar a Archive. El usuario debe elegir entre:
- Volver a Apply para corregir el código
- Volver a Design si el problema es arquitectónico
- Volver a Spec si el requisito estaba mal definido

### Fase 8: Archive (`sdd-archive`)

**¿Qué hace?** Cierra el cambio de forma permanente y persiste el estado final de todos los artefactos.

**¿Qué produce?** Reporte de archivo con:
- Resumen del cambio: qué se hizo y por qué
- Artefactos generados en cada fase (con referencias)
- Estado final de cada requisito de la spec (passed / failed / skipped)
- Delta de especificaciones: qué cambió en las specs principales del proyecto
- Enlace al commit o PR si aplica

**¿Qué comando lo activa?** `/sdd-archive [cambio]`.

**Lo que hace el orquestador:** Verifica que Verify haya pasado sin CRITICAL, luego ejecuta Archive. Si OpenSpec está activo, mueve la carpeta del cambio a `openspec/changes/archive/`. Si usa Engram, guarda un reporte de cierre con `topic_key: sdd-archive/{cambio}`.

**Lo que hace el subagente:** Verifica el estado de Verify, mueve archivos (OpenSpec) o guarda el reporte (Engram), fusiona las specs delta en las specs principales del proyecto.

**Razonamiento recomendado:** Bajo. Es una tarea mecánica y bien definida.

**Post-Archive:** El cambio queda en estado `archived` y no debería modificarse. Si se necesita cambiar algo, se crea un nuevo cambio.

### Fase extra: Onboard (`sdd-onboard`)

**¿Qué hace?** Guía al usuario a través de un ciclo SDD completo en su propio código base. Es un tutorial interactivo que ejecuta cada fase explicando qué está pasando.

**¿Qué comando lo activa?** `/sdd-onboard`.

**Lo que hace el orquestador:** Arranca el modo tutorial. Camina al usuario por Init → Explore → Propose → Spec → Design → Tasks → Apply → Verify → Archive, explicando cada paso.

**Lo que hace el subagente:** Actúa como tutor: muestra ejemplos, explica conceptos, y responde preguntas del usuario durante el recorrido.

**No produce artefactos permanentes.** Es un recorrido educativo, no un cambio real. Al finalizar, puede ofrecer eliminar los artefactos de prueba.

## El grafo de dependencias

Las fases no siempre se ejecutan en línea recta. El grafo de dependencias es un DAG (Directed Acyclic Graph):

```
Init → Explore → Propose ──→ Spec ──→ Tasks → Apply → Verify → Archive
                             ↑
                         Design ──────┘
```

- **Spec y Design son independientes** entre sí. Pueden ejecutarse en paralelo.
- **Tasks depende de ambas**: necesita la spec y el diseño completos.
- **Apply depende de Tasks**: necesita la lista de tareas.
- **Verify depende de Apply**: necesita el código implementado.
- **Archive depende de Verify**: necesita la verificación aprobada.

El orquestador mantiene este grafo y lo consulta para determinar la siguiente fase.

## Cómo rutea el orquestador

El orquestador (`gentle-orchestrator`) tiene una función que, dado el estado actual del cambio, determina el próximo paso:

```
estado_actual = leer_artefactos(cambio, persistencia)
siguiente_fase = determinar_siguiente(estado_actual, grafo_dependencias)
```

La función `determinar_siguiente`:
1. Lee los artefactos existentes: qué fases están completas para este cambio
2. Consulta el grafo de dependencias: qué necesita cada fase como prerrequisito
3. Encuentra la primera fase cuyas dependencias están satisfechas pero no se ha ejecutado
4. Devuelve esa fase como recomendación al usuario

Si el usuario ejecuta `/sdd-continue`, el orquestador ejecuta automáticamente la fase recomendada sin preguntar.

**Ejemplo de ruteo:**
- El usuario ejecutó Explore y Propose, pero no Spec ni Design.
- El orquestador consulta el DAG: Spec necesita Propose ✓, Design necesita Propose ✓.
- Elige Spec (o Design, si soporta paralelo) como siguiente fase.

## ¿Qué pasa cuando una fase falla?

Las fases pueden fallar por varias razones:

| Causa | Ejemplo |
|-------|---------|
| Error del subagente | No puede parsear un archivo, hay sintaxis inválida |
| Problema de lógica | La spec es contradictoria, el diseño no es viable |
| Usuario cancela | Ctrl+C, "esto no era lo que quería" |
| Contexto agotado | Token limit alcanzado durante una fase larga |
| Dependencia faltante | Falta un prerrequisito no detectado antes |

Cuando una fase falla, el orquestador:
1. **Marca la fase como `failed`** en el estado del cambio
2. **Reporta el error al usuario** con detalles: qué subagente falló, en qué paso, cuál fue el error
3. **NO continúa** a la siguiente fase automáticamente
4. **Espera** que el usuario resuelva el problema y decida el próximo paso

## Cómo reiniciar una fase específica

Después de corregir el problema que causó el fallo, tenés varias opciones:

**Desde el chat con el asistente:**
```
/sdd-ff <cambio>          # Fast-forward: replanifica todo desde cero
/sdd-continue <cambio>    # Continúa desde la última fase (exitosa o fallida)
/sdd-<fase> <cambio>      # Ejecuta una fase específica directamente
                           # Ej: /sdd-spec mi-cambio
```

**Desde CLI:**
```
gentle-ai sdd-status <cambio>      # Ver el estado actual del cambio
gentle-ai sdd-continue <cambio>    # Forzar continuación
```

**Flujo típico de recuperación:**
1. El usuario detecta el error en el reporte de fallo
2. Corrige el artefacto manualmente o pide al asistente que lo haga
3. Ejecuta `/sdd-<fase>` para re-ejecutar solo esa fase
4. Si la fase vuelve a fallar, el orquestador repite el ciclo
5. Si pasa, el estado se actualiza a `completed` y avanza

**Regla de oro:** nunca ejecutes `/sdd-ff` como primera opción. Intentá reiniciar la fase específica primero. Fast-forward es el último recurso cuando el estado está tan corrupto que no vale la pena recuperarlo.

## Meta-commands vs Slash commands

SDD tiene dos tipos de comandos, y es importante entender la diferencia.

### Meta-commands (los maneja el orquestador)

Deciden **qué hacer**, **en qué orden**, y **coordinan subagentes**. No ejecutan trabajo directo.

| Meta-command | ¿Qué hace? |
|-------------|----------|
| `/sdd-new <cambio>` | Inicia un cambio nuevo: ejecuta Explore + Propose automáticamente |
| `/sdd-ff <nombre>` | Fast-forward: planning completo automático (init → tasks) |
| `/sdd-continue [cambio]` | Continúa con la siguiente fase disponible según el DAG |

### Slash commands (los maneja el subagente)

Ejecutan el **trabajo concreto** de una fase específica.

| Slash command | ¿Qué hace? |
|--------------|----------|
| `/sdd-init` | Inicializa SDD en el proyecto |
| `/sdd-explore <tema>` | Explora una idea en el codebase |
| `/sdd-propose` | Crea la propuesta de cambio |
| `/sdd-spec` | Escribe la especificación detallada |
| `/sdd-design` | Diseña la arquitectura técnica |
| `/sdd-tasks` | Genera la lista de tareas |
| `/sdd-apply` | Implementa las tareas una por una |
| `/sdd-verify` | Verifica que la implementación cumple la spec |
| `/sdd-archive` | Archiva el cambio y cierra el ciclo |
| `/sdd-onboard` | Inicia el tutorial interactivo |
| `/sdd-status [cambio]` | Muestra el estado actual del cambio y qué fase sigue |

**La diferencia clave:** los meta-commands **deciden el ruteo**; los slash commands **ejecutan trabajo**. Si sabés exactamente qué fase querés ejecutar, usá el slash command directamente. Si querés que el orquestador decida por vos, usá `/sdd-continue`.

## Errores frecuentes

1. **Saltar fases**: ejecutar `sdd-apply` sin spec ni design. El orquestador intenta bloquearlo, pero si usás el slash command directamente, podés saltarte fases. No lo hagas.

2. **Cambio demasiado grande**: SDD funciona mejor con cambios de menos de 400 líneas. Para cambios grandes, usá PRs encadenados (chained-pr).

3. **No verificar**: aplicar sin verificar es como construir sin inspección. Usá siempre `/sdd-verify` antes de `/sdd-archive`.

4. **Modo auto sin supervisión**: el modo auto ejecuta todo de corrido. Si una fase temprana produce un error silencioso, se arrastra a las siguientes y es más difícil de detectar.

5. **Archivar sin verificar**: si archivás un cambio sin verificar, los artefactos quedan inconsistentes y no hay vuelta atrás fácil.

6. **Reiniciar con ff cuando alcanza con una fase**: `/sdd-ff` tira todo el planning. Si solo falló Spec, ejecutá `/sdd-spec`, no `/sdd-ff`.

## Tabla resumen

| Fase | Comando | Produce | Riesgo si se salta |
|------|---------|---------|-------------------|
| Init | `/sdd-init` | Contexto de proyecto | SDD no arranca |
| Explore | `/sdd-explore` | Reporte de exploración | Implementás sin entender el contexto |
| Propose | `/sdd-propose` | Propuesta de cambio | No sabés qué estás construyendo ni por qué |
| Spec | `/sdd-spec` | Especificación delta | Implementás sin requisitos claros |
| Design | `/sdd-design` | Diseño técnico | Implementás sin arquitectura |
| Tasks | `/sdd-tasks` | Lista de tareas | No sabés qué falta hacer |
| Apply | `/sdd-apply` | Código implementado | No hay código |
| Verify | `/sdd-verify` | Reporte de verificación | No sabés si funciona correctamente |
| Archive | `/sdd-archive` | Cambio archivado | Los artefactos quedan sueltos e inconsistentes |

## Preguntas frecuentes

1. **¿Cuál es la diferencia entre un meta-command y un slash command?**
   Los meta-commands (`/sdd-new`, `/sdd-continue`, `/sdd-ff`) deciden el ruteo entre fases. Los slash commands (`/sdd-spec`, `/sdd-apply`, etc.) ejecutan el trabajo de una fase específica.

2. **¿Qué fases pueden ejecutarse en paralelo?**
   Spec y Design. Tasks depende de ambas, así que las dos deben estar completas antes de avanzar.

3. **¿Qué ocurre si `sdd-verify` encuentra un hallazgo CRITICAL?**
   El orquestador bloquea Archive. Podés volver a Apply (corregir código), a Design (cambiar arquitectura), o a Spec (redefinir requisitos).

4. **¿Cómo reinicio una fase que falló?**
   Corregí el problema y ejecutá `/sdd-<fase> <cambio>` (ej: `/sdd-spec mi-cambio`). Usá `/sdd-ff` solo como último recurso.

5. **¿Por qué no debería saltarme la fase de especificación?**
   Sin spec no hay criterios de aceptación claros, y Verify no puede validar objetivamente. Terminás con código que "funciona" pero nadie sabe exactamente qué se suponía que debía hacer.

## Fuentes verificadas

- Repositorio: gentle-ai, commit `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d`
- Archivos: `internal/assets/skills/sdd-*/SKILL.md`
- Archivos: `internal/assets/skills/_shared/sdd-phase-common.md`, `internal/assets/skills/_shared/sdd-status-contract.md`
- Versión verificada: gentle-ai 2.1.10
- Fecha: 2026-07-20
- Estado: ✓ Verificado
