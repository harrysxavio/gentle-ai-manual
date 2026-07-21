---
title: Modelos, proveedores y agentes
description: Diferencia entre producto, modelo, proveedor, cliente, agente, orquestador, subagente, tool, function calling, MCP, skill y memoria.
level: 1
estimatedTime: 35 min
tags:
  - ia
  - modelos
  - proveedores
  - agentes
  - orquestador
  - subagente
  - mcp
  - tool-calling
  - skill
  - memoria
prerequisites:
  - Bases de datos (01-05)
  - Terminal (01-02)
verifiedVersion: "gentle-ai 2.x, Engram 1.x, OpenCode 1.x"
learningOutcomes:
  - Diferenciar producto, modelo, proveedor, cliente y agente
  - Explicar qué es un orquestador y cómo usa subagentes
  - Comprender tool calling, MCP y skills en el ecosistema Gentle
  - Identificar el rol de la memoria persistente (Engram)
---

# Modelos, proveedores y agentes

## Qué aprenderás

Cuando usás ChatGPT, decís "ChatGPT me dijo tal cosa". Pero lo que realmente respondió es un **modelo** (como GPT-5.6-sol) operado por un **proveedor** (OpenAI), al que accedés desde un **cliente** (el navegador o la app). Y cuando usás OpenCode, ya no hablás con un modelo directamente: hablás con un **agente** que combina ese modelo con instrucciones, herramientas y memoria.

Este capítulo define cada pieza y muestra cómo se conectan en el ecosistema Gentle.

## Por qué importa

El error más común de principiantes es confundir conceptos que suenan parecido pero son cosas distintas. Decir "ChatGPT es un modelo" es como decir "WhatsApp es un protocolo de internet". ChatGPT es un **producto** que **usa** un modelo.

En Gentle, esta distinción es clave: configurás un proveedor, elegís un modelo, y el agente (openCode o gentle-orchestrator) lo usa para ejecutar herramientas, cargar skills y acceder a memoria. Si no entendés la diferencia, no vas a poder diagnosticar por qué un agente se comporta distinto, ni configurar tu propio flujo.

## Visión simple

Una **app de mensajería** (producto) usa un **protocolo** (modelo) operado por una **empresa telefónica** (proveedor), instalado en tu **celular** (cliente). El resultado es un mensaje que viaja.

En IA:

- **Producto**: ChatGPT, Claude, OpenCode — apps que USAN modelos
- **Modelo**: el cerebro entrenado (gpt-5.6-sol, claude-opus-4.8)
- **Proveedor**: la empresa que entrena y sirve el modelo (OpenAI, Anthropic)
- **Cliente**: la app que se conecta al modelo por API (cualquier chat, OpenCode, Codex)
- **Agente**: modelo + instrucciones + herramientas + contexto + capacidad de actuar

## Analogía

Imaginá un restaurante.

- **Producto** es el restaurante (ChatGPT, Claude, OpenCode). Vos entrás, ves el menú, pedís.
- **Modelo** es el chef. Tiene años de entrenamiento, sabe cocinar. Pero solo cocina lo que le pedís.
- **Proveedor** es la cadena que contrató al chef (OpenAI, Anthropic, Google). Lo entrenó, lo paga.
- **Cliente** es el mozo que le lleva el pedido al chef y trae la respuesta. Sin el mozo, no hay comunicación.
- **Agente** es el chef con su propia cocina: tiene sus cuchillos (tools), su libreta de recetas (instrucciones), su despensa (contexto), y puede decidir qué preparar y cómo. No solo cocina lo que le pedís: planifica el menú, pide ingredientes, coordina con otros chefs.

En este capítulo, el chef solo no es un agente. El chef + sus herramientas + sus instrucciones + su contexto = agente.

## Cómo funciona realmente

### Producto

Un **producto** de IA es una aplicación que un usuario final usa directamente. Tiene interfaz (chat, botón, TUI), tiene una base de usuarios, y normalmente cuesta dinero o tiene un plan gratuito.

| Producto | Qué hace | Modelo(s) que usa |
|----------|----------|-------------------|
| ChatGPT | Chat general, código, análisis | gpt-5.6-sol, gpt-4.4-turbo |
| Claude | Chat general, análisis profundo | claude-opus-4.8, claude-sonnet-4.8 |
| Google AI Studio | Chat, prototipado, prueba de modelos | gemini-3.5-flash, gemini-3.5-pro |
| OpenCode | Agente nativo de código en terminal | El que configures |
| Codex | Editor con IA integrada | El que configures |

El producto **no es el modelo**. ChatGPT puede cambiar el modelo que usa sin que el producto deje de llamarse ChatGPT.

### Modelo

Un **modelo** es un sistema entrenado con miles de millones de ejemplos de texto. No "piensa" ni "entiende" como un humano. Toma una secuencia de tokens de entrada y predice la secuencia de tokens de salida más probable.

El nombre del modelo suele incluir su versión:

| Proveedor | Modelo | Versión numérica | Qué significa |
|-----------|--------|------------------|---------------|
| OpenAI | gpt-5.6-sol | 5.6 | Generación 5, versión 6, variante "sol" |
| Anthropic | claude-opus-4.8 | 4.8 | Serie Opus, generación 4, versión 8 |
| Google | gemini-3.5-flash | 3.5 | Generación 3, variante 5, "flash" (rápido) |

Cada modelo tiene capacidades distintas. Un modelo chico (gemini-3.5-flash) responde rápido pero razona menos. Un modelo grande (claude-opus-4.8) razona en profundidad pero es más lento y caro.

### Proveedor

Un **proveedor** de IA es la empresa que entrena, aloja y sirve el modelo a través de una API (Interfaz de Programación de Aplicaciones). Le enviás texto por internet y recibís texto de vuelta.

| Proveedor | Modelos principales | Cómo se accede |
|-----------|-------------------|----------------|
| OpenAI | gpt-5.6-sol, gpt-4.4-turbo, o3-mini | api.openai.com |
| Anthropic | claude-opus-4.8, claude-sonnet-4.8 | api.anthropic.com |
| Google | gemini-3.5-flash, gemini-3.5-pro | ai.google.dev |
| OpenRouter | Todos los anteriores + más | openrouter.ai (unifica proveedores) |
| OpenCode Go | Modelos locales (llama.cpp, ollama) | localhost |

Hay dos tipos de proveedores:

- **Proveedor directo** (OpenAI, Anthropic, Google): entrenan sus propios modelos y los sirven ellos mismos.
- **Agregador** (OpenRouter): no entrena modelos, solo te da acceso a modelos de otros proveedores desde una misma API.

En el ecosistema Gentle, configurás el proveedor en `OPENCODE_LLM_PROVIDER` y el modelo en la configuración del agente.

### Cliente

Un **cliente** es cualquier programa que se conecta a la API de un proveedor. El cliente envía la solicitud (prompt), recibe la respuesta y la muestra o la procesa.

Ejemplos de clientes:
- OpenCode (el agente de terminal) es un cliente cuando llama a la API de Anthropic
- Codex es un cliente cuando llama a la API de OpenAI
- Cualquier script con `fetch()` que llame a `api.openai.com` es un cliente
- ChatGPT web es un cliente de OpenAI

Un mismo modelo puede ser usado por muchos clientes. Vos podés preguntarle al mismo claude-opus-4.8 desde OpenCode, desde la web de Claude, y desde OpenRouter. El modelo es el mismo, el cliente cambia.

### Agente

Un **agente** es un modelo al que le agregás tres cosas:

1. **Instrucciones** (system prompt): le decís cómo comportarse, qué reglas seguir, qué evitar
2. **Herramientas** (tools): le das capacidades de acción (leer archivos, ejecutar comandos, buscar en internet)
3. **Contexto**: le pasás el historial de la conversación, archivos relevantes, variables del entorno

La fórmula es simple:

```
AGENTE = MODELO + INSTRUCCIONES + HERRAMIENTAS + CONTEXTO
```

Sin herramientas, un modelo es un asistente de chat. Responde, pero no puede hacer nada.
Con herramientas, el modelo puede pedir "ejecuto `grep` para buscar en los archivos" en vez de solo imaginar qué hay.

Gentle-AI implementa agentes así:
- Leé el system prompt (con tu persona y reglas)
- Tené acceso a tools como `read`, `grep`, `bash`, `edit`, `write`
- Tené acceso a memoria persistente (Engram)
- Ejecutá tools, recibí resultados, y decidí el próximo paso

### Orquestador

Un **orquestador** es un agente especializado que distribuye trabajo a otros agentes (subagentes). No hace el trabajo directamente: decide quién lo hace, cuándo y en qué orden.

En el ecosistema Gentle, `gentle-orchestrator` es el orquestador principal. Cuando arranca un flujo SDD, el orquestador decide:

1. "Esto necesita un plan" → llama al subagente `sdd-propose`
2. "El plan está aprobado, ahora diseño técnico" → llama al subagente `sdd-design`
3. "Diseño listo, ahora implementación" → llama al subagente `sdd-apply`

El orquestador no escribe código ni diseña. Toma decisiones de ruteo.

### Subagente

Un **subagente** es un agente con una misión acotada. Recibe contexto específico del orquestador, ejecuta su tarea y devuelve el resultado.

Cada subagente tiene:
- Un system prompt especializado
- Un conjunto de tools específicas
- Una entrada (input) y una salida (output) bien definidas

Subagentes en SDD:

| Subagente | Misión | Entrada | Salida |
|-----------|--------|---------|--------|
| sdd-init | Inicializar contexto SDD | Directorio del proyecto | Contexto SDD |
| sdd-explore | Explorar requerimientos | Problema, proyecto | Preguntas, riesgos |
| sdd-propose | Proponer solución | Requerimientos explorados | Propuesta de cambio |
| sdd-spec | Escribir especificaciones | Propuesta | Specs con escenarios |
| sdd-design | Diseñar solución técnica | Specs | Diseño con archivos |
| sdd-tasks | Dividir en tareas | Diseño | Lista de tareas |
| sdd-apply | Implementar tareas | Tareas + contexto | Código implementado |
| sdd-verify | Verificar implementación | Tareas + código | Reporte de verificación |
| sdd-archive | Archivar cambio completado | Cambio verificado | Contexto actualizado |

Los subagentes no son procesos separados. Son la misma instancia de OpenCode/Codex pero con instrucciones y contexto diferentes. El orquestador los "llama" cambiando el system prompt y pasando el contexto relevante.

### Tool (herramienta)

Una **tool** (herramienta) es una capacidad invocable que el agente puede usar. No es texto que el modelo genera: es una función real que el runtime ejecuta.

El modelo **no ejecuta** la tool. El modelo devuelve un JSON diciendo "quiero ejecutar la tool `read` con estos argumentos". El runtime ejecuta la función real y devuelve el resultado al modelo.

Tools típicas en el ecosistema Gentle:

| Tool | Qué hace | ¿Qué runtime ejecuta? |
|------|----------|-----------------------|
| `read` | Lee un archivo | OpenCode/Codex |
| `write` | Escribe un archivo | OpenCode/Codex |
| `edit` | Edita parte de un archivo | OpenCode/Codex |
| `bash` | Ejecuta un comando en la terminal | OpenCode/Codex |
| `grep` | Busca texto en archivos | OpenCode/Codex |
| `glob` | Encuentra archivos por patrón | OpenCode/Codex |
| `websearch` | Busca en internet | OpenCode/Codex |
| `mem_save` | Guarda información persistente | Engram MCP |
| `mem_search` | Busca en memoria persistente | Engram MCP |

### Function calling

**Function calling** (llamada a función) es el mecanismo por el cual el modelo solicita ejecutar una tool.

Cuando le enviás un mensaje al modelo, también le enviás la **definición** de las tools disponibles. Cada definición incluye:

- **Nombre**: `read`
- **Descripción**: "Lee el contenido de un archivo. Pasá la ruta absoluta."
- **Parámetros**: qué datos necesita (ej: `filePath: string`)

El modelo analiza el mensaje y decide:
1. "Esto lo puedo responder solo con texto" → devuelve texto normal
2. "Necesito leer un archivo para responder" → devuelve un JSON con `{ tool: "read", arguments: { filePath: "src/main.go" } }`

El flujo completo:

```
Usuario: "¿Qué dice main.go?"
  → Runtime envía mensaje + definición de tools al modelo
    → Modelo analiza y devuelve JSON: { tool: "read", args: { filePath: "src/main.go" }}
      → Runtime ejecuta read("src/main.go") y obtiene el contenido
        → Runtime envía el resultado al modelo
          → Modelo analiza el contenido y responde al usuario
```

Cada ciclo de "modelo pide tool → runtime ejecuta → runtime devuelve resultado" se llama un **turno** de tool calling.

### MCP (Model Context Protocol)

**MCP** (Model Context Protocol) es un estándar abierto para que agentes se conecten a herramientas. Es como USB para periféricos: en vez de que cada fabricante haga su conector propio, todos usan el mismo.

Sin MCP, cada herramienta necesitaría su propia integración. El agente tendría que saber cómo llamar a Engram, cómo llamar a una base de datos, cómo llamar a una API externa.

Con MCP, todas las herramientas se conectan igual: un servidor MCP expone sus capacidades, y el agente las descubre automáticamente. No hay que configurar cada una por separado.

MCP se compone de:

| Componente | Rol |
|------------|-----|
| **Host** | El agente (OpenCode, Codex) que necesita herramientas |
| **Client** | La conexión que el host establece con el servidor |
| **Server** | El programa que expone herramientas (Engram MCP, GitHub MCP, etc.) |

En el capítulo 03 de este módulo profundizamos en MCP. Por ahora, alcanza con saber que MCP es el "enchufe universal" que permite que los agentes de Gentle usen herramientas sin configuración manual.

### Skill

Un **skill** (habilidad) es un archivo `SKILL.md` con instrucciones especializadas que se carga en el contexto del agente según la tarea.

Cuando el agente detecta que la tarea coincide con la descripción de un skill, carga ese archivo completo. El system prompt del agente se expande temporalmente con el contenido del skill.

Ejemplo: si el usuario pide "creá una PR", el agente detecta que existe el skill `branch-pr`, carga su `SKILL.md`, y ahora el agente sabe exactamente cómo crear PRs en este proyecto.

Skills disponibles en el ecosistema:

| Skill | Se activa cuando |
|-------|------------------|
| branch-pr | El usuario pide crear una PR |
| sdd-apply | El orquestador lanza implementación |
| judgment-day | El usuario pide revisión dual |
| frontend-design | El usuario pide diseño de UI |
| canvas-design | El usuario pide un poster o mood board |

Los skills son conocimiento bajo demanda. No cargás todas las instrucciones todo el tiempo — solo las que necesitás para la tarea actual. Esto ahorra tokens de contexto (lo cubrimos en el capítulo 02).

### Memoria (Engram)

La **memoria** en Gentle es información persistente que sobrevive entre sesiones. No está en el historial de chat ni en el archivo de contexto: está en una base de datos SQLite que Engram administra.

Sin memoria, cada sesión empieza en blanco. Si en la sesión anterior definiste una convención de nombres para el proyecto, el agente no lo sabe en la sesión nueva.

Con Engram memory:
1. El agente puede guardar (`mem_save`) decisiones, descubrimientos, configuraciones
2. El agente puede buscar (`mem_search`) información de sesiones anteriores
3. El agente recibe contexto automático al inicio de cada sesión (`mem_context`)

La memoria se organiza en observaciones:
- **Título**: verbo + qué ("Fixed N+1 query in UserList")
- **Tipo**: bugfix, decision, architecture, discovery, pattern, config, preference
- **Contenido**: qué, por qué, dónde, qué se aprendió
- **Scope**: project (visible a todo el proyecto) o personal (solo para el agente que la guardó)

Engram es un servidor MCP. El agente tiene las tools `mem_save` y `mem_search` como cualquier otra tool, pero en vez de ejecutarse en la terminal, se ejecutan en la base de datos SQLite de Engram.

## Tabla comparativa: Producto vs Modelo vs Proveedor vs Cliente vs Agente

| Concepto | ¿Qué es? | Ejemplo en Gentle | Lo confunden con |
|----------|----------|-------------------|------------------|
| **Producto** | Aplicación que el usuario final usa | OpenCode, ChatGPT, Codex | El modelo que usa |
| **Modelo** | Sistema entrenado que procesa texto | claude-opus-4.8, gpt-5.6-sol | El producto o el proveedor |
| **Proveedor** | Empresa que entrena y sirve modelos | OpenAI, Anthropic, Google | El modelo que vende |
| **Cliente** | App que se conecta a la API del modelo | OpenCode (cuando llama a Anthropic) | El producto o el modelo |
| **Agente** | Modelo + instrucciones + tools + contexto | gentle-orchestrator, gentle-ai | Solo el modelo |
| **Orquestador** | Agente que distribuye trabajo | gentle-orchestrator | Un agente común |
| **Subagente** | Agente con misión acotada | sdd-apply, jd-judge-a | Un proceso separado |
| **Tool** | Capacidad invocable | read, write, bash, grep | Function calling (es el mecanismo, no la tool) |
| **MCP** | Protocolo de conexión agente-herramientas | Engram MCP, GitHub MCP | Una tool en sí mismo |
| **Skill** | Instrucciones especializadas bajo demanda | branch-pr/SKILL.md | Una tool (es conocimiento, no una función) |
| **Memoria** | Información persistente entre sesiones | Engram (SQLite) | El contexto de la conversación |

## Errores frecuentes

1. **Decir "ChatGPT me dijo" cuando en realidad respondió un modelo**: ChatGPT (producto) usó un modelo específico (gpt-5.6-sol). Si OpenAI cambia el modelo, la respuesta puede ser distinta aunque sigas usando ChatGPT.
2. **Confundir proveedor con modelo**: Un proveedor ofrece múltiples modelos. Anthropic ofrece claude-opus-4.8, claude-sonnet-4.8 y claude-haiku-4.8. No son lo mismo. Configurás el modelo, no solo el proveedor.
3. **Pensar que el agente es el modelo**: Sin herramientas, sin instrucciones, el modelo no puede hacer nada. El agente es el modelo POTENCIADO.
4. **Creer que el orquestador "hace" el trabajo**: El orquestador distribuye. Los subagentes ejecutan. Si el resultado es malo, puede ser culpa del subagente o del orquestador por asignar mal la tarea.
5. **Usar tools sin entender function calling**: Si el modelo no puede pedir tools, no es un agente. Es un chat glorificado.

## Resumen

| Concepto | Definición |
|----------|------------|
| Producto | Aplicación que el usuario usa directamente |
| Modelo | Cerebro entrenado que procesa texto |
| Proveedor | Empresa que entrena y sirve modelos |
| Cliente | App que se conecta a la API del modelo |
| Agente | Modelo + instrucciones + tools + contexto |
| Orquestador | Agente que distribuye trabajo a subagentes |
| Subagente | Agente con misión acotada y definida |
| Tool | Función invocable que el runtime ejecuta |
| Function calling | Mecanismo por el que el modelo pide ejecutar una tool |
| MCP | Protocolo estándar para conectar agentes con herramientas |
| Skill | Instrucciones especializadas cargadas bajo demanda |
| Memoria | Información persistente que sobrevive entre sesiones |

## Preguntas

1. Si le preguntás algo a ChatGPT y te responde mal, ¿es culpa de ChatGPT (producto), del modelo, o del proveedor?
2. ¿Cuál es la diferencia entre un modelo solo y un agente? ¿Qué necesita el modelo para ser agente?
3. El orquestador no escribe código ni diseña. ¿Qué hace entonces?
4. ¿Por qué los skills se cargan bajo demanda y no todo el tiempo?
5. ¿Qué problema resuelve Engram que el contexto de la conversación no puede resolver?

## Ejercicio

1. Abrí OpenCode y ejecutá un comando simple. Observá cómo el agente usa tools para investigar antes de responder.
2. Revisá tu configuración de `OPENCODE_LLM_PROVIDER`. ¿Qué proveedor tenés configurado? ¿Qué modelo usás?
3. Buscá en el proyecto un archivo `SKILL.md`. Leélo. ¿Qué instrucciones especializadas contiene? ¿Cuándo se cargaría?
4. Identificá en la interfaz de OpenCode cuándo el agente está llamando a una tool vs cuándo está generando texto directamente.

## Fuentes verificadas

- Documentación de OpenCode: opencode.ai
- Documentación de MCP: modelcontextprotocol.io
- Engram: engram proyeto OpenCode (engram 1.x)
- Ecosistema Gentle: gentle-ai 2.x
- Fecha: 2026-07-20
- Estado: 🟢 Verificado (conocimiento fundamental estable)

---

> **Siguiente capítulo**: [Tokens y contexto](../02-tokens-contexto/) — entendé cómo los modelos procesan texto, qué son los tokens, y por qué el contexto es el recurso más valioso.
