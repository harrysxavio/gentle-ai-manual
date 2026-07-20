---
title: MCP y tool calling
description: Tool calling, function calling, MCP (Model Context Protocol), host/client/server, las 4 primitives, transport stdio vs HTTP, ejemplos concretos con Engram y skills.
level: 1
estimatedTime: 30 min
tags:
  - mcp
  - tool-calling
  - function-calling
  - protocolo
  - herramientas
  - engram
  - skills
prerequisites:
  - Tokens y contexto (03-02)
verifiedVersion: "gentle-ai 2.x, Engram 1.x, MCP 2025-03-26"
learningOutcomes:
  - Explicar cómo funciona tool calling y la diferencia con generar texto
  - Comprender la arquitectura MCP (host, client, server)
  - Identificar las 4 primitives de MCP y sus usos
  - Analizar ejemplos concretos de MCP en el ecosistema Gentle
---

# MCP y tool calling

## Qué aprenderás

Hasta ahora viste que un **agente** combina un modelo con instrucciones y herramientas. Pero falta lo más importante: ¿cómo se conecta el modelo a las herramientas? ¿Cómo hace el modelo para "ejecutar" un comando o "leer" un archivo si el modelo solo genera texto?

La respuesta tiene dos partes:

1. **Tool calling**: el mecanismo por el que el modelo solicita ejecutar una función
2. **MCP (Model Context Protocol)**: el estándar que unifica cómo los agentes descubren y usan herramientas

Este capítulo explica ambos en detalle y muestra cómo se implementan en el ecosistema Gentle.

## Por qué importa

Sin tool calling, un modelo de IA solo puede generar texto. No puede leer archivos, ejecutar comandos, buscar en internet ni guardar información.

Sin MCP, cada herramienta necesitaría su propia integración personalizada. Engram MCP, GitHub MCP, el servidor de archivos local — todos con conectores distintos. MCP estandariza eso: una vez que un agente entiende MCP, puede usar cualquier herramienta que hable MCP.

En Gentle, todo lo que el agente hace fuera de generar texto pasa por tool calling y MCP. Si querés entender cómo funciona realmente el agente, tenés que entender estos dos mecanismos.

## Visión simple

**Tool calling** es cuando el modelo, en vez de responder con texto, responde con "ejecutá esta función con estos argumentos". El runtime ejecuta la función y le pasa el resultado al modelo, que entonces puede responder con texto.

**MCP** es un estándar que permite a cualquier agente conectarse a cualquier herramienta sin configuración manual. Es como el USB de las herramientas de IA: enchufás y funciona.

## Analogía

Imaginá que estás en una oficina y tenés un asistente (el agente).

**Sin tools**: el asistente solo puede hablar. Le pedís "buscá el archivo contrato.pdf" y te dice "me encantaría pero no puedo acceder a los archivos".

**Con tool calling**: el asistente tiene un teléfono (tool calling). Cuando le pedís algo que requiere acción, levanta el teléfono y llama a la persona correcta. "Hola, secretaría: por favor busquen el archivo contrato.pdf". Le pasan el resultado, y te responde.

**Con MCP**: en vez de tener un teléfono distinto para cada departamento, la oficina tiene un conmutador universal. El asistente solo necesita saber usar el conmutador, y el conmutador sabe a qué departamento conectar cada llamada. Si mañana agregás un nuevo departamento (una nueva herramienta), solo lo conectás al conmutador. El asistente no necesita cambiar nada.

## Cómo funciona realmente

### Tool calling paso a paso

Tool calling (también llamado **function calling**) es el mecanismo por el cual el modelo puede solicitar la ejecución de una función en lugar de generar texto.

El flujo completo es:

```
1. El runtime envía al modelo: mensaje del usuario + definiciones de tools disponibles
2. El modelo analiza y decide:
   a) Puedo responder solo con texto → devuelve texto
   b) Necesito ejecutar una tool → devuelve JSON con tool name + arguments
3. El runtime recibe el JSON, valida los argumentos, ejecuta la función
4. El runtime envía el resultado de la función al modelo
5. El modelo analiza el resultado y genera su respuesta final
6. El runtime devuelve la respuesta al usuario
```

Cada tool se define con un esquema JSON (JSON Schema). Por ejemplo, la tool `read` se define así:

```json
{
  "name": "read",
  "description": "Lee el contenido de un archivo. Usá path absoluto.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "filePath": {
        "type": "string",
        "description": "Ruta absoluta al archivo"
      },
      "offset": {
        "type": "number",
        "description": "Línea desde la que empezar (1-indexed)"
      },
      "limit": {
        "type": "number",
        "description": "Máximo de líneas a leer"
      }
    },
    "required": ["filePath"]
  }
}
```

Cuando el modelo decide usar esta tool, devuelve algo como:

```json
{
  "tool": "read",
  "arguments": {
    "filePath": "C:/proyecto/src/main.go",
    "offset": 1,
    "limit": 50
  }
}
```

El runtime recibe esto, ejecuta `read("C:/proyecto/src/main.go", 1, 50)`, obtiene el contenido, y se lo envía de vuelta al modelo como un mensaje de "resultado de tool":

```
Tool "read" ejecutada. Resultado:
package main

import "fmt"

func main() {
    fmt.Println("Hola, Gentle!")
}
```

Ahora el modelo tiene el contenido del archivo y puede responder la pregunta del usuario.

### Tool calling vs texto plano

Es clave entender que el modelo **no ejecuta directamente** ninguna herramienta. El modelo:

1. Recibe las definiciones de tools como parte del prompt (convertidas a tokens)
2. Durante la generación de la respuesta, puede generar un "tool call" en vez de texto
3. El runtime intercepta ese tool call, ejecuta la función real, y devuelve el resultado

El modelo nunca toca el sistema de archivos, la red, ni la terminal. Todo pasa por el runtime.

### MCP: Model Context Protocol

**MCP** (Model Context Protocol) es un estándar abierto (similar a LSP para lenguajes de programación) que define cómo los agentes descubren y usan herramientas, recursos y plantillas.

Antes de MCP, cada herramienta necesitaba su propia integración. Querías que el agente pudiera acceder a una base de datos? Tenías que escribir código para exponerla como tool. Querías acceso a GitHub? Otra integración.

Con MCP, el agente habla un solo protocolo. Las herramientas implementan un servidor MCP, y el agente (host MCP) se conecta a ellas.

### Arquitectura MCP

MCP tiene tres componentes:

```
┌──────────────────────────────────┐
│            HOST (agente)          │
│  OpenCode / Codex / gentle-ai    │
│          ┌──────────────┐         │
│          │   Client     │         │
│          └──────┬───────┘         │
└─────────────────┼─────────────────┘
                  │ Protocolo MCP
    ┌─────────────┼─────────────┐
    │             │             │
┌───┴───┐   ┌────┴────┐   ┌───┴────┐
│Server │   │ Server  │   │ Server │
│Engram │   │ GitHub  │   │ Files  │
└───────┘   └─────────┘   └────────┘
```

| Componente | Rol | Ejemplo |
|------------|-----|---------|
| **Host** | El programa que necesita capacidades del modelo | OpenCode, Codex, gentle-ai |
| **Client** | Conexión del host a un servidor específico (1 por server) | engram client, github client |
| **Server** | Programa que expone herramientas, recursos o plantillas | engram-mcp, gh-mcp, server de archivos |

El host inicia un client por cada servidor MCP configurado. Cada client mantiene una conexión persistente con su server.

### Las 4 primitives de MCP

MCP define cuatro tipos de capacidades que un servidor puede exponer:

| Primitiva | ¿Qué es? | Ejemplo |
|-----------|----------|---------|
| **Tools** | Funciones invocables (acciones) | `mem_save`, `mem_search`, `create_issue` |
| **Resources** | Datos expuestos como archivos (lectura) | Contenido de una nota, schema de BD |
| **Prompts** | Plantillas de mensaje reutilizables | "Resumí este archivo", "Creá una PR" |
| **Sampling** | El servidor pide al modelo generar texto | (menos común, usado para servidores que necesitan inferencia) |

**Tools** son las más importantes para el ecosistema Gentle. Son las que permiten al agente ejecutar acciones.

**Resources** permiten que el agente lea datos estructurados. Por ejemplo, un servidor MCP de base de datos podría exponer cada tabla como un resource.

**Prompts** son plantillas que el agente puede cargar. Por ejemplo, "resumí este PR" podría ser un prompt predefinido que el servidor MCP de GitHub ofrece.

**Sampling** permite que un servidor MCP le pida al host que genere texto con el modelo. Es útil para servidores que necesitan razonamiento del modelo para completar su función.

### Transport: stdio vs HTTP

MCP soporta dos mecanismos de transporte (cómo viajan los mensajes entre host y server):

| Transporte | Cómo funciona | Cuándo usarlo |
|------------|---------------|---------------|
| **stdio** | El host ejecuta el server como un subproceso. La comunicación va por stdin/stdout (tuberías). | Servidores locales: Engram, archivos, scripts. Rápido, sin red. |
| **HTTP** | El server corre como un servicio HTTP. El host se conecta por TCP/IP (localhost o remoto). | Servidores remotos: GitHub, APIs externas, bases de datos en la nube. |

En el ecosistema Gentle, Engram MCP usa **stdio** porque es local. El host (OpenCode) ejecuta Engram como un proceso hijo, y la comunicación viaja por tuberías del sistema operativo. No hay puertos que configurar ni redes que atravesar.

GitHub MCP puede usar **HTTP** porque el servidor necesita conectarse a la API de GitHub (remota).

### Ejemplo concreto: Engram MCP

Engram expone sus capacidades a través de un servidor MCP. Cuando OpenCode inicia una sesión:

1. OpenCode (host) lee la configuración de MCP
2. OpenCode inicia el servidor Engram MCP como subproceso (transport: stdio)
3. Engram MCP anuncia sus tools: `mem_save`, `mem_search`, `mem_context`, etc.
4. OpenCode (client) registra estas tools como disponibles para el modelo
5. Cuando el modelo decide usar `mem_save`, OpenCode ejecuta la tool a través del client MCP
6. El resultado vuelve al modelo

La definición de la tool `mem_save` en Engram MCP:

```json
{
  "name": "mem_save",
  "description": "Guarda información en memoria persistente.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "type": { "type": "string", "enum": ["bugfix", "decision", "discovery"] },
      "content": { "type": "string" }
    },
    "required": ["title", "type", "content"]
  }
}
```

Cuando el agente dice "voy a guardar esta decisión en Engram", el flujo es:

```
Modelo: genera tool call → { tool: "mem_save", args: { title: "Usamos PostgreSQL", type: "decision", content: "...", scope: "project" } }
  → OpenCode: recibe el tool call
    → Client MCP: envía la solicitud a Engram MCP (por stdio)
      → Engram: ejecuta la operación SQLite
        → Engram: devuelve éxito + ID de la observación
    → Client MCP: pasa el resultado a OpenCode
  → OpenCode: envía el resultado al modelo
Modelo: genera "Listo, guardé la decisión con ID #123"
```

Cada step es visible. No hay magia. Engram no "sabe" que es un agente — Engram solo responde a mensajes MCP.

### Ejemplo concreto: Skills vía MCP

Las skills también se cargan a través de MCP. No es que el modelo tenga todas las skills en su contexto permanentemente.

El flujo de carga de un skill:

1. El usuario pide "creá una PR para este cambio"
2. El agente analiza la solicitud y detecta que existe el skill `branch-pr`
3. OpenCode usa una tool MCP (o su propio mecanismo de descubrimiento) para localizar el archivo `SKILL.md` del skill
4. OpenCode lee el contenido del `SKILL.md`
5. OpenCode **inyecta el contenido en el contexto del agente** (lo agrega al system prompt o al historial)
6. El modelo ahora tiene las instrucciones especializadas del skill
7. El agente ejecuta el flujo definido en el skill

No es que el modelo "tiene instalado" el skill. El skill es texto que se agrega al contexto. Si el skill pesa 2000 tokens, el contexto disponible se reduce en 2000 tokens.

### Ventajas de MCP

1. **Estandarización**: cualquier servidor MCP funciona con cualquier host MCP. Engram MCP funciona con OpenCode, pero también podría funcionar con cualquier otro agente que implemente MCP.

2. **Descubrimiento automático**: el host no necesita saber de antemano qué tools tiene cada servidor. El servidor las anuncia al conectarse. Si mañana Engram agrega una tool `mem_export`, el agente la descubre automáticamente.

3. **Aislamiento**: el servidor MCP corre en su propio proceso. Si Engram MCP se cuelga, no mata al agente. Si el agente se cuelga, Engram sigue funcionando.

4. **Seguridad**: el host controla qué servidores MCP inicia y con qué permisos. Un servidor MCP de sistema de archivos puede limitarse a un directorio específico.

5. **Extensibilidad**: querés que el agente acceda a tu base de datos? Escribís un servidor MCP que exponga queries como tools. No modificás el agente.

## Herramientas y MCP en el ecosistema Gentle

| Tool | ¿Qué hace? | ¿Es MCP? | Transporte |
|------|------------|----------|------------|
| read | Lee archivos | Nativa del host (OpenCode) | No aplica |
| write | Escribe archivos | Nativa del host | No aplica |
| bash | Ejecuta comandos | Nativa del host | No aplica |
| grep | Busca texto | Nativa del host | No aplica |
| mem_save | Guarda en memoria persistente | MCP (Engram) | stdio |
| mem_search | Busca en memoria | MCP (Engram) | stdio |
| create_issue | Crea issue en GitHub | MCP (GitHub) | HTTP |
| websearch | Busca en internet | Nativa del host o MCP | HTTP |

Las tools nativas del host (read, write, bash, grep) son específicas de OpenCode/Codex. No siguen MCP porque son parte del runtime mismo. Pero desde la perspectiva del modelo, son indistinguibles: el modelo solo ve definiciones de tools y decide cuándo usarlas.

## Errores frecuentes

1. **Pensar que el modelo ejecuta las tools**: el modelo nunca ejecuta nada. Solicita. El runtime ejecuta. Si la tool falla, el modelo ni se entera hasta que el runtime le devuelve el error.
2. **Confundir tool calling con MCP**: tool calling es el mecanismo (modelo pide, runtime ejecuta). MCP es el protocolo (estándar para conectar agentes a herramientas). MCP usa tool calling internamente, pero no son lo mismo.
3. **Creer que MCP skills se "instalan" en el modelo**: las skills no se instalan. Se cargan como texto en el contexto. Ocupan tokens, y si el contexto se compacta, pueden perderse.
4. **Ignorar el costo de los tool calls**: cada ciclo de tool calling (modelo → runtime → modelo) consume tokens de input y output. Si un flujo requiere 10 tool calls, el costo se multiplica.
5. **Configurar MCP servers HTTP sin seguridad**: un servidor MCP HTTP expuesto a internet sin autenticación permite que cualquiera ejecute herramientas. Los servidores MCP stdio son más seguros porque solo el host local puede comunicarse con ellos.

## Resumen

| Concepto | Definición |
|----------|------------|
| Tool calling | Mecanismo por el que el modelo solicita ejecutar una función (devuelve JSON con tool name + arguments) |
| Tool | Función invocable que el runtime ejecuta (read, write, bash) |
| Tool definition | Schema JSON que describe nombre, parámetros y descripción de una tool |
| MCP (Model Context Protocol) | Estándar abierto para conectar agentes con herramientas |
| Host | Agente que necesita herramientas (OpenCode, Codex) |
| Client | Conexión del host a un servidor MCP específico |
| Server | Programa que expone tools, resources, prompts o sampling |
| Tools (primitiva MCP) | Acciones invocables (mem_save, create_issue) |
| Resources (primitiva MCP) | Datos expuestos para lectura (archivos, schemas) |
| Prompts (primitiva MCP) | Plantillas de mensaje reutilizables |
| Sampling (primitiva MCP) | Servidor pide al modelo generar texto |
| Transport stdio | Comunicación por tuberías (local, rápido, seguro) |
| Transport HTTP | Comunicación por red (remoto, configurable) |

## Preguntas

1. ¿Cuál es la diferencia entre tool calling y ejecutar directamente una función?
2. ¿Qué problema específico resuelve MCP que antes no se podía resolver?
3. Si un servidor MCP agrega una tool nueva, ¿qué tiene que hacer el host para usarla?
4. ¿Por qué Engram MCP usa stdio y no HTTP?
5. ¿Qué pasa si un tool call devuelve un error? ¿El modelo lo sabe automáticamente?

## Ejercicio

1. Abrí OpenCode en modo verbose (si existe esa opción) y observá los tool calls que el agente hace. Identificá el JSON que el modelo devuelve para cada tool.
2. Revisá la configuración de MCP en tu proyecto. Buscá `mcpServers` en `.opencode/opencode.json` o en la configuración global. ¿Qué servidores MCP están configurados?
3. Si tenés Engram corriendo, abrí el proceso (o revisá los logs) y observá cómo el host se conecta por stdio.
4. Simulá un tool call manual: pensá una pregunta que requiera leer un archivo. Sin ejecutarla, escribí el JSON que el modelo debería devolver para la tool `read`.

## Fuentes verificadas

- MCP Specification: modelcontextprotocol.io (2025-03-26)
- Documentación OpenCode: opencode.ai (tools nativas, MCP config)
- Engram: engram proyecto OpenCode (engram 1.x, server MCP)
- Ecosistema Gentle: gentle-ai 2.x
- Fecha: 2026-07-20
- Estado: 🟢 Verificado (MCP es estándar abierto estable)

---

> **Siguiente capítulo**: [Agentes y orquestadores](04-agentes-orquestadores.md) — entendé cómo los agentes se organizan en sistemas multiagente con orquestación SDD.
