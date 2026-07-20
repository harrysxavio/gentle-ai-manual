---
title: Tokens y contexto
description: Qué son los tokens, ventana de contexto, compactación, system prompt, temperatura, razonamiento, latencia, costo, context pollution, model drift y deprecación.
level: 1
estimatedTime: 30 min
tags:
  - tokens
  - contexto
  - ventana-de-contexto
  - compactación
  - razonamiento
  - temperatura
  - latencia
  - costo
prerequisites:
  - Modelos, proveedores y agentes (03-01)
verifiedVersion: "gentle-ai 2.x, Engram 1.x, OpenCode 1.x"
learningOutcomes:
  - Explicar qué es un token y cómo se relaciona con el costo y la latencia
  - Comprender la ventana de contexto y por qué se compacta
  - Diferenciar temperatura, razonamiento y system prompt
  - Identificar context pollution, model drift y deprecación
  - Conectar estos conceptos con Engram, SDD y skills en Gentle
---

# Tokens y contexto

## Qué aprenderás

Cada vez que el modelo procesa algo, descompone el texto en **tokens**. Un token no es una letra ni necesariamente una palabra: es la unidad mínima que el modelo entiende. El modelo no lee caracteres, lee tokens.

La cantidad de tokens que podés mandar en una solicitud está limitada por la **ventana de contexto**. Y todo lo que entre ahí tiene consecuencias: cuesta más, tarda más, y puede degradar la calidad de la respuesta.

Este capítulo explica cómo funciona ese mecanismo y por qué el ecosistema Gentle está diseñado para administrar el contexto de forma eficiente.

## Por qué importa

Cada decisión de diseño en Gentle — desde Engram hasta SDD, desde skills bajo demanda hasta compactación — responde a una restricción fundamental: el contexto es limitado y caro.

Si no entendés tokens, no vas a entender por qué:

- Las skills no se cargan todas siempre
- SDD planifica antes de implementar (reduce idas y vueltas en contexto)
- Engram persiste información fuera del contexto conversacional
- A veces el agente "se olvida" de algo que le dijiste hace 10 mensajes
- Un modelo barato puede ser mejor para ciertas tareas que uno caro

## Visión simple

Un modelo de IA no procesa texto como lo harías vos: no lee letras ni palabras completas. Lee **tokens**. Un token es un fragmento de texto de longitud variable: aproximadamente 3/4 de palabra en inglés. En español, cada token representa menos texto porque hay más variedad de caracteres.

El modelo tiene una **ventana de atención** limitada. Como vos cuando tenés 50 pestañas abiertas en el navegador: después de un punto, el rendimiento baja. El modelo también se "distrae" si le metés demasiada información.

## Analogía

Imaginá que estás armando un rompecabezas sobre una mesa.

- **Tokens** son las piezas. Necesitás más o menos piezas según lo compleja que sea la imagen.
- **Ventana de contexto** es el tamaño de la mesa. No podés poner más piezas de las que entran en la mesa.
- **Compactación** es guardar las piezas que ya armaste en una caja para liberar espacio en la mesa.
- **System prompt** son las instrucciones escritas en un pizarrón al lado de la mesa: "armá primero el borde", "usá las piezas claras para el cielo".
- **Temperature** es qué tan dispuesto estás a probar una pieza que "no parece encajar del todo" en vez de solo usar las obvias.
- **Reasoning effort** es cuánto tiempo te tomás para pensar dónde va cada pieza antes de mover la mano.
- **Context pollution** es tener piezas rotas o de otro rompecabezas mezcladas en la mesa.
- **Model drift** es que el pizarrón de instrucciones cambie de un día para otro sin aviso.

## Cómo funciona realmente

### Token

Un **token** es la unidad de procesamiento de un modelo de lenguaje. Cuando enviás texto al modelo, el primer paso es **tokenizar**: convertir el texto en una secuencia de tokens.

Cada modelo tiene su propio **tokenizador** (el programa que convierte texto a tokens). No todos tokenizan igual.

Ejemplos de tokenización en español:

```
Texto: "Hola, ¿cómo estás?"
Tokens: ["Hola", ",", " ¿", "cómo", " est", "ás", "?"]
→ 7 tokens (en inglés serían ~5)

Texto: "gentle-ai manual"
Tokens: ["gent", "le", "-", "ai", " manual"]
→ 5 tokens

Texto: "Hola, soy un desarrollador aprendiendo IA con el manual de Gentle-AI. ¿Me ayudás a entender los tokens?"
Tokens estimados: ~18-22 tokens
```

El español es más caro en tokens que el inglés porque tiene más acentos, más conjugaciones, más variedad de caracteres.

| Idioma | Tokens por palabra (aprox) | Ratio vs inglés |
|--------|---------------------------|-----------------|
| Inglés | 0.75 | 1x |
| Español | 1.5 - 2.5 | 2x - 3x más caro |
| Alemán | 1.5 - 3.0 | 2x - 4x más caro |
| Chino | 1.0 - 2.0 por carácter | Muy variable |

Esto significa que una misma instrucción en español cuesta hasta 3 veces más que en inglés. El ecosistema Gentle está en español y tiene esto en cuenta: optimiza el contexto para minimizar tokens innecesarios.

### Context window (ventana de contexto)

La **context window** (ventana de contexto) es la cantidad máxima de tokens que el modelo puede procesar en una sola solicitud. Incluye:

1. **System prompt**: instrucciones del agente
2. **Historial de la conversación**: mensajes anteriores
3. **Contexto del proyecto**: archivos, skills cargados
4. **Input actual**: el mensaje del usuario

Si la solicitud supera la ventana de contexto, el modelo la rechaza o la trunca. No hay opción de "seguir después".

| Modelo | Ventana de contexto | ¿Cuánto texto es? |
|--------|---------------------|-------------------|
| claude-opus-4.8 | 200K tokens | ~150 mil palabras en inglés, ~75 mil en español |
| gpt-5.6-sol | 256K tokens | ~192 mil palabras en inglés, ~96 mil en español |
| gemini-3.5-flash | 1M tokens | ~750 mil palabras en inglés |
| claude-haiku-4.8 | 200K tokens | ~150 mil palabras en inglés |

1M tokens parece mucho. Pero si cargás un proyecto completo, la documentación, las skills, el historial de la conversación y las instrucciones del agente, se llena rápido.

### Compaction (compactación)

La **compaction** (compactación) es el proceso de resumir el historial de la conversación cuando se acerca al límite de la ventana de contexto. En vez de mantener todos los mensajes anteriores, el agente genera un resumen y reemplaza el historial por ese resumen.

OpenCode y Codex implementan compactación automática. Cuando el historial supera un umbral (ej: 80% de la ventana), el agente:

1. Toma los mensajes anteriores
2. Pide al modelo que genere un resumen de lo relevante
3. Reemplaza los mensajes anteriores por el resumen
4. Continúa la conversación con el resumen como contexto

Lo que se pierde en compactación:
- Detalles específicos que el resumen no captura
- Decisiones que no se consideraron "relevantes"
- Matices del razonamiento del agente

Lo que gana:
- La conversación no se corta
- El modelo sigue teniendo contexto útil
- No se pierde la sesión

Engram existe precisamente para mitigar lo que la compactación se lleva. Si una decisión es importante, el agente la guarda en Engram (`mem_save`) antes de que la compactación la borre.

### System prompt

El **system prompt** (instrucción del sistema) es el conjunto de instrucciones base que definen el comportamiento del agente. Se envía al principio de cada conversación y permanece fijo durante toda la sesión.

En Gentle, el system prompt incluye:

- **Persona**: "Sos un arquitecto senior con 15+ años de experiencia..."
- **Reglas**: "Nunca agregues Co-Authored-By", "No uses emojis a menos que te lo pidan"
- **Protocolo de skills**: "Cuando la tarea coincida con un skill, cargalo"
- **Protocolo de memoria**: "Guardá decisiones importantes en Engram"
- **Formato de respuesta**: estructura, tono, extensión

El system prompt es inmutable durante la sesión. Si querés cambiar el comportamiento, tenés que iniciar una nueva sesión con otro system prompt.

No confundir system prompt con **user prompt** (el mensaje que el usuario envía en cada interacción). El system prompt es la constitución; el user prompt es cada ley que se debate.

### Temperature

La **temperature** (temperatura) controla qué tan aleatoria es la respuesta del modelo. Es un valor entre 0 y 1 (o entre 0 y 2 según el proveedor).

| Temperatura | Efecto | Cuándo usarla |
|-------------|--------|---------------|
| 0.0 - 0.2 | Respuestas deterministas, predecibles, siempre la misma salida para la misma entrada | Código, hechos, reglas |
| 0.3 - 0.7 | Balance entre precisión y creatividad | Conversación general, explicaciones |
| 0.8 - 1.0 | Respuestas creativas, variadas, "sorprendentes" | Lluvia de ideas, escritura creativa |

A temperatura 0, el modelo siempre elige el token más probable. A temperatura 1, el modelo a veces elige tokens menos probables, generando respuestas más variadas.

Para tareas técnicas (código, documentación, análisis), la temperatura recomendada es baja (0.0 - 0.3). No querés que el modelo "se ponga creativo" con el código de producción.

En el ecosistema Gentle, la temperatura se configura por agente. Un agente de verificación (sdd-verify) usa temperatura baja. Un agente de diseño visual puede usar temperatura más alta.

### Reasoning effort (esfuerzo de razonamiento)

El **reasoning effort** (esfuerzo de razonamiento) es cuánto tiempo y recursos computacionales el modelo dedica a "pensar" antes de responder. No todos los modelos lo soportan.

| Nivel | Qué hace el modelo | Cuándo usarlo |
|-------|--------------------|---------------|
| `none` | Responde inmediatamente sin reflexión adicional | Preguntas simples, comandos directos |
| `low` | Razonamiento mínimo | Tareas de rutina sin complejidad |
| `medium` | Razonamiento moderado | Explicaciones, análisis de código |
| `high` | Razonamiento profundo | Debugging complejo, arquitectura, planeamiento |
| `xhigh` | Razonamiento exhaustivo | Problemas matemáticos, pruebas lógicas, investigación |

Más razonamiento = más tokens de output (el modelo "piensa" generando tokens internos que no ves) + más latencia + más costo.

En Gentle, los subagentes de diseño y especificación usan reasoning effort alto. Los subagentes de implementación y verificación usan medio. El orquestador usa bajo para decidir rápido a quién llamar.

### Latencia

La **latencia** es el tiempo que tarda el modelo en responder desde que enviás la solicitud. Se mide en segundos.

Factores que afectan la latencia:

| Factor | Efecto |
|--------|--------|
| Tamaño del modelo | Modelos chicos (flash, haiku) = más rápidos. Grandes (opus, sol) = más lentos |
| Cantidad de tokens de input | Más tokens = más tiempo de procesamiento inicial |
| Cantidad de tokens de output | Respuestas largas = más latencia |
| Reasoning effort | Más razonamiento = mucha más latencia |
| Tool calling | Cada ciclo tool → runtime → modelo suma latencia |
| Proveedor | La infraestructura del proveedor afecta la velocidad |

Regla general: para tareas simples, usá modelos chicos (gemini-3.5-flash, claude-haiku). Reservá los modelos grandes para tareas que realmente necesitan razonamiento profundo.

El ecosistema Gentle te permite configurar modelos distintos por agente. El orquestador puede usar un modelo rápido para decidir, y luego llamar a un subagente con un modelo más lento pero más capaz.

### Costo

El **costo** es el precio que pagás por usar el modelo. Se calcula por tokens, y hay dos precios distintos:

| Tipo | Qué incluye | Precio típico (por 1M tokens) |
|------|------------|-------------------------------|
| **Input** | Todo lo que enviás al modelo (prompt, contexto, historial) | $3 - $15 (modelos chicos), $15 - $50 (grandes) |
| **Output** | Todo lo que el modelo genera (respuesta, código, razonamiento interno) | $15 - $75 (modelos chicos), $75 - $200 (grandes) |

El output siempre es más caro que el input. Y el razonamiento interno (cuando el modelo "piensa") genera tokens de output que no ves pero pagás.

Ejemplo de costo de una sesión típica con claude-opus-4.8:

| Concepto | Tokens | Costo |
|----------|--------|-------|
| System prompt (2K tokens) | 2K input | ~$0.03 |
| Contexto del proyecto (15K) | 15K input | ~$0.23 |
| Skills cargados (10K) | 10K input | ~$0.15 |
| 10 intercambios de 2K c/u | 20K input + 20K output | ~$1.20 |
| Razonamiento interno del modelo | ~10K output (no visible) | ~$0.75 |
| **Total por sesión** | | **~$2.36** |

Si hacés 20 sesiones por día, son ~$47/día. Por eso SDD existe: planificar antes de implementar reduce las idas y vueltas, y por lo tanto los tokens.

### Context pollution

**Context pollution** (contaminación de contexto) es incluir información irrelevante en el contexto del modelo. Como llenar la mesa del rompecabezas con piezas que no corresponden: el modelo tiene menos capacidad de atención para lo importante.

Fuentes comunes de context pollution:

1. **Archivos enteros innecesarios**: cargar todo el proyecto cuando solo necesitás una función
2. **Historial extenso sin limpiar**: mantener mensajes irrelevantes que ya no aportan
3. **Skills que no aplican**: cargar skills para tareas que no los necesitan
4. **Depuración excesiva**: mensajes de error repetidos, logs sin filtrar
5. **Información duplicada**: el mismo dato en system prompt, skills y contexto del proyecto

El ecosistema Gentle combate la context pollution con:

- **Skills bajo demanda**: solo se carga el skill que coincide con la tarea
- **Context packs**: selección precisa de archivos relevantes
- **Compactación**: resumen automático del historial
- **Engram**: la información importante vive fuera del contexto

### Model drift

**Model drift** (deriva del modelo) es el fenómeno por el cual el mismo modelo se comporta de manera distinta con el tiempo. No es que el modelo "aprenda" de tus conversaciones (no lo hace), sino que el proveedor puede:

1. **Actualizar el modelo** sin cambiar el nombre: mejora el rendimiento o cambia ligeramente el comportamiento
2. **Ajustar parámetros internos**: temperatura por defecto, filtros de seguridad, preferencias de formato
3. **Cambiar el tokenizador**: el mismo texto produce tokens distintos
4. **Modificar el system prompt interno**: algunos proveedores añaden instrucciones ocultas

El model drift es frustrante porque no hay versión fija. "gpt-5.6-sol" hoy no es exactamente "gpt-5.6-sol" de hace 3 meses.

Cómo mitigarlo en Gentle:

- Los tests SDD verifican el comportamiento real, no asumen consistencia del modelo
- Engram guarda decisiones en el momento, no confía en que el modelo las recuerde
- Los skills definen instrucciones precisas para reducir la ambigüedad
- Los subagentes tienen misiones acotadas: menos espacio para la deriva

### Deprecación

**Deprecación** es cuando un modelo deja de estar disponible. El proveedor lo retira porque lanzó uno nuevo o porque ya no quiere mantenerlo.

Una vez que un modelo se depreca:

- No podés crear nuevas conversaciones con él
- Las conversaciones existentes pueden migrarse automáticamente a otro modelo
- Si tenés configurado ese modelo en tu agente, la próxima llamada falla

Ejemplo histórico: OpenAI deprecó `gpt-3.5-turbo` en 2026 y migró todo a `gpt-4.4-turbo`. Las configuraciones que apuntaban al viejo modelo dejaron de funcionar.

En Gentle, la configuración del modelo se centraliza. Cuando un modelo se depreca, cambiás un valor en la configuración y todos los agentes usan el nuevo. No tenés que buscar en cada archivo.

## Engram, SDD y skills: por qué existen

Estos tres componentes de Gentle existen específicamente para administrar las limitaciones de tokens y contexto.

**Engram** persiste información FUERA del contexto conversacional. En vez de mantener todo en el historial (que se compacta y pierde), Engram guarda decisiones y descubrimientos en SQLite. El agente busca en Engram cuando necesita contexto de sesiones anteriores.

**SDD** (Software Design Document) reduce el uso de tokens porque planifica antes de implementar. En vez de "escribí el código completo de la feature" (que requiere mantener todo el contexto del proyecto), SDD primero explora, luego especifica, luego diseña, y recién después implementa. Cada fase tiene contexto acotado.

**Skills** se cargan por contexto porque no todo el conocimiento es necesario todo el tiempo. Si cargáramos todos los SKILL.md disponibles, el system prompt tendría decenas de miles de tokens. En vez de eso, el agente detecta la tarea y carga solo el skill relevante.

## Errores frecuentes

1. **Pensar que un token es una palabra**: en español, una palabra puede ser 2 o 3 tokens. Las palabras con acentos, guiones o caracteres especiales tokenizan peor.
2. **Ignorar la ventana de contexto**: si el modelo "se olvida" de algo, no es que sea malo — es que el contexto se llenó y se compactó. La información puede haberse perdido en la compactación.
3. **Poner temperatura alta para código**: temperatura > 0.3 en código produce bugs. El código necesita ser determinista.
4. **Subestimar el costo del output**: el output cuesta 3x a 5x más que el input. Si el modelo genera respuestas largas innecesariamente, el costo se dispara.
5. **Confiar en que el modelo no cambia**: el model drift es real. Si un test pasaba ayer y hoy no, puede que el modelo haya cambiado, no tu código.
6. **Usar el modelo más grande para todo**: para "pasá esto a mayúsculas" no necesitás claude-opus-4.8. Usá un modelo chico.

## Resumen

| Concepto | Definición |
|----------|------------|
| Token | Unidad mínima que procesa el modelo (~3/4 palabra en inglés, más cara en español) |
| Context window | Máximo de tokens en una solicitud (200K-1M según modelo) |
| Compaction | Resumen del historial cuando se acerca al límite de contexto |
| System prompt | Instrucciones base del agente (inmutables durante la sesión) |
| Temperature | Control de creatividad/aleatoriedad (0 = preciso, 1 = creativo) |
| Reasoning effort | Cuánto "piensa" el modelo antes de responder |
| Latencia | Tiempo de respuesta (modelos chicos = rápidos, grandes = lentos) |
| Costo | Precio por token (input más barato, output más caro) |
| Context pollution | Meter información irrelevante que degrada la atención del modelo |
| Model drift | El mismo modelo se comporta distinto con el tiempo |
| Deprecación | Modelo que deja de estar disponible |

## Preguntas

1. Si un texto en español tiene 100 palabras, ¿aproximadamente cuántos tokens son? ¿Y en inglés?
2. ¿Qué pasa si una solicitud supera la ventana de contexto del modelo?
3. ¿Por qué SDD existe? ¿Qué problema de tokens resuelve?
4. ¿Cuál es la diferencia entre temperature y reasoning effort? ¿Se pueden usar juntos?
5. Si un test automatizado falla de un día para otro sin cambios en el código, ¿qué pudo haber pasado?

## Ejercicio

1. Abrí OpenCode y ejecutá un comando. Observá cuántos intercambios (turns) necesita el agente para completar la tarea. Cada turno consume tokens.
2. Revisá la configuración de tu agente. ¿Qué temperatura tiene configurada? ¿Qué reasoning effort?
3. Buscá en Engram observaciones guardadas. ¿Cuántas hay? ¿Cuántos tokens de contexto ahorra tener esa información persistida en vez de repetirla?
4. Si tu sesión actual se compactara, ¿qué información importante perderías? Andá a Engram y guardala con `mem_save`.

## Fuentes verificadas

- Documentación de tokens: OpenAI, Anthropic, Google (documentación oficial de tokenizadores)
- Ventanas de contexto: especificaciones oficiales de cada modelo
- Engram: engram proyecto OpenCode (engram 1.x)
- Ecosistema Gentle: gentle-ai 2.x, SDD 1.x
- Fecha: 2026-07-20
- Estado: 🟢 Verificado (conceptos estables, precios y versiones pueden variar)

---

> **Siguiente capítulo**: [MCP y tool calling](03-mcp-y-tool-calling.md) — entendé cómo los agentes se conectan a herramientas y cómo MCP estandariza esa conexión.
