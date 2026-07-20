---
title: Configurar Codex
description: "Cómo configurar Codex CLI: archivos TOML, perfiles, razonamiento y capacidades multiagente."
level: 2
estimatedTime: 30 min
tags:
  - codex
  - configuración
  - toml
  - perfiles
  - multiagente
  - razonamiento
prerequisites:
  - ¿Qué es Gentle-AI? (07-01)
  - Skills — Conocimiento especializado (10-01)
verifiedVersion: "Codex 0.144.0"
learningOutcomes:
  - Localizar y editar el archivo config.toml de Codex
  - Crear perfiles de configuración con modelos específicos
  - Configurar el nivel de razonamiento por perfil
  - Diferenciar la arquitectura de Codex de la de OpenCode
  - Integrar Gentle-AI y Engram con Codex
---

# Configurar Codex

## Qué aprenderás

Codex CLI es el agente de comandos de OpenAI. A diferencia de OpenCode, no usa un archivo JSON con agentes. Usa un sistema de **perfiles** (profiles) en un archivo TOML.

En este capítulo vas a entender:

- Qué es `config.toml` y dónde vive
- Cómo funciona el sistema de perfiles
- Cómo se asigna un modelo a cada perfil
- Cómo se controla el esfuerzo de razonamiento
- Cómo se activa el modo multiagente experimental
- Cómo se integran skills, Engram y Gentle-AI
- Cuándo conviene usar Codex en lugar de OpenCode

## Por qué importa

Codex es la alternativa a OpenCode dentro del ecosistema. No tiene subagentes nativos ni un sistema de roles tan granular, pero tiene un modelo de **perfiles** que permite cambiar toda la configuración de un agente con un solo selector.

Si trabajás con Codex, no vas a encontrar `agents` ni `permissions` como en OpenCode. Encontrarás perfiles TOML con secciones. Entender esa diferencia te permite elegir la herramienta correcta para cada tarea y no frustrarte buscando algo que no existe.

Además, Gentle-AI se integra con Codex de forma distinta que con OpenCode. Saber cómo funciona esa integración evita configuraciones rotas y skills que no se cargan.

## Explicación simple

Codex se configura con un archivo TOML llamado `config.toml`. Ese archivo contiene **perfiles**. Cada perfil es una configuración completa: define qué modelo usar, cuánto razonamiento aplicar, qué skills cargar, y si el modo multiagente está activo.

Cuando ejecutás Codex, elegís un perfil con la bandera `--profile`:

```bash
codex --profile powerful
```

Si no especificás un perfil, Codex usa el perfil por defecto (`[default]`).

## Analogía

Imaginá que Codex es un auto de carreras con varios **modos de conducción**. Un modo es "Económico" (modelo barato, sin razonamiento extra, para tareas simples). Otro es "Potente" (modelo frontier, razonamiento alto, para diseño crítico). Otro es "Multiagente" (activa copilotos adicionales).

Cada modo de conducción es un **perfil**. Cambiás de perfil según el tipo de ruta (tarea) que vas a enfrentar. No necesitás reconfigurar el auto entero cada vez — solo girás la perilla al perfil correcto.

## Cómo funciona realmente

### El archivo `config.toml`

Codex busca su configuración en `~/.codex/config.toml` (Linux/macOS) o en la ruta equivalente en Windows.

TOML es un formato de configuración similar a INI pero con tipado. Usa corchetes `[seccion]` para agrupar valores y clave = valor para cada entrada:

```toml
# Esto es un comentario en TOML
[default]
model = "openai/gpt-5.6-terra"
reasoningEffort = "medium"
```

### Sistema de perfiles

Cada perfil es una sección entre corchetes. El perfil `[default]` es obligatorio y define los valores que heredan los demás perfiles:

```toml
[default]
model = "openai/gpt-5.6-terra"
reasoningEffort = "medium"

[profile.economic]
model = "openai/gpt-5.6-luna"
reasoningEffort = "low"

[profile.powerful]
model = "openai/gpt-5.6-sol"
reasoningEffort = "high"

[profile.mult-agent]
model = "openai/gpt-5.6-terra"
reasoningEffort = "medium"
multiAgent = true
```

Los perfiles heredan del `[default]` automáticamente. Si un perfil no especifica un valor, usa el del `[default]`.

| Elemento | ¿Qué hace? | ¿Se hereda? |
|----------|-----------|-------------|
| `model` | Modelo de IA a usar | Sí |
| `reasoningEffort` | Nivel de razonamiento | Sí |
| `skills` | Lista de skills habilitados | Sí |
| `multiAgent` | Activa el modo multiagente | Sí |
| `mcpServers` | Servidores MCP | Sí |
| `systemPrompt` | Prompt de sistema adicional | No (cada perfil define el suyo) |

### Asignación de modelos

A diferencia de OpenCode, donde cada agente tiene su propio modelo, en Codex el **perfil completo** usa un solo modelo. No podés tener un modelo para explorar y otro para implementar dentro de la misma sesión. Cambiás de perfil cuando necesitás cambiar de modelo.

Los formatos de modelo soportados son:

| Formato | Ejemplo | Notas |
|---------|---------|-------|
| `openai/gpt-5.6-sol` | OpenAI directo | Razonamiento configurable |
| `openai/gpt-5.6-terra` | OpenAI directo | Razonamiento configurable |
| `openai/gpt-5.6-luna` | OpenAI directo | Razonamiento configurable |
| `openrouter/anthropic/claude-sonnet-5` | OpenRouter | Razonamiento variable según proveedor |
| `opencode-go/deepseek-v4-pro` | OpenCode Go | Modelos externos vía bridge |

### Razonamiento por perfil

El esfuerzo de razonamiento se define con `reasoningEffort`. Codex acepta los mismos niveles que OpenAI:

| Valor | Efecto | Cuándo usarlo |
|-------|--------|---------------|
| `low` | Respuestas rápidas, menos tokens de pensamiento | Archive, init, formateo |
| `medium` | Balance entre velocidad y profundidad | Implementación, planificación |
| `high` | Razonamiento profundo, más lento | Diseño, revisión crítica |

No todos los modelos expuestos en Codex soportan razonamiento configurable. Si el modelo no lo soporta, el valor se ignora.

### Modo multiagente experimental

Codex 0.144.0 introduce un modo multiagente experimental (`multiAgent = true`). Cuando está activo, Codex puede delegar sub-tareas a agentes auxiliares dentro de la misma sesión.

El modo multiagente en Codex es más limitado que en OpenCode. No hay roles predefinidos como `sdd-design` o `sdd-verify`. En su lugar, Codex crea agentes temporales según la tarea:

```toml
[profile.mult-agent]
model = "openai/gpt-5.6-terra"
reasoningEffort = "medium"
multiAgent = true
maxSubAgents = 3
```

| Parámetro | ¿Qué hace? | Default |
|-----------|-----------|---------|
| `multiAgent` | Activa o desactiva el modo multiagente | `false` |
| `maxSubAgents` | Máximo de agentes auxiliares simultáneos | `3` |

### Skills en Codex

Codex carga skills desde `~/.codex/skills/`. Cada skill es un archivo o directorio con instrucciones. A diferencia de OpenCode, Codex no tiene un sistema de descubrimiento de skills con triggers automáticos. Los skills se habilitan por perfil:

```toml
[default]
skills = ["sdd", "engram", "judgment-day"]

[profile.economic]
skills = ["sdd"]  # Solo SDD, skills pesados desactivados
```

### Integración con Engram

Codex se integra con Engram (memoria persistente) a través de MCP. La configuración del servidor MCP de Engram se define en el perfil:

```toml
[default]
mcpServers = {
  engram = { command = "engram-mcp", args = ["--port", "54321"] }
}
```

### Integración con Gentle-AI

Gentle-AI soporta Codex como agente destino. Al ejecutar `gentle-ai install` con Codex detectado:

1. Gentle-AI escribe perfiles en `~/.codex/config.toml`
2. Instala skills en `~/.codex/skills/`
3. Configura el servidor MCP de Engram
4. Establece el perfil por defecto con los componentes instalados

Después de la instalación:

```bash
# Sincronizar skills con Codex
gentle-ai sync

# Verificar que Codex está correctamente configurado
gentle-ai doctor

# Usar Codex con un perfil específico
codex --profile powerful
```

### Diferencias clave con OpenCode

| Aspecto | OpenCode | Codex |
|---------|----------|-------|
| Formato de configuración | JSON | TOML |
| Unidad de organización | Agentes (roles) | Perfiles (configuraciones completas) |
| Subagentes | 15 agentes predefinidos y configurables | Experimental, máximo 3 auxiliares |
| Modelo por rol | Sí, cada agente tiene su modelo | No, el perfil completo usa un modelo |
| Permisos granulares | Sí, por agente con glob patterns | No, permisos globales |
| Skills discovery | Automático con triggers | Manual por perfil |
| Comandos slash | `/sdd-new`, `/sdd-continue`, etc. | No tiene sistema de comandos |

### Cuándo usar Codex vs OpenCode

| Usá Codex cuando... | Usá OpenCode cuando... |
|---------------------|----------------------|
| Querés simplicidad: un modelo, un perfil | Necesitás agentes especializados por fase |
| Trabajás con proyectos pequeños o prototipos | Trabajás con proyectos grandes que requieren SDD completo |
| Preferís TOML sobre JSON | Necesitás permisos granulares |
| El modo multiagente experimental es suficiente | Necesitás 13 subagentes bien definidos |
| Usás principalmente modelos OpenAI | Usás múltiples proveedores (OpenAI, Anthropic, Google) |

### Ejemplo: configuración completa

```toml
[default]
model = "openai/gpt-5.6-terra"
reasoningEffort = "medium"
skills = ["sdd", "engram", "judgment-day"]

mcpServers = {
  engram = { command = "engram-mcp", args = ["--port", "54321"] }
}

[profile.economic]
model = "openai/gpt-5.6-luna"
reasoningEffort = "low"
skills = ["sdd"]

[profile.powerful]
model = "openai/gpt-5.6-sol"
reasoningEffort = "high"

[profile.mult-agent]
model = "openai/gpt-5.6-terra"
reasoningEffort = "medium"
multiAgent = true
maxSubAgents = 3

[profile.claude]
model = "openrouter/anthropic/claude-sonnet-5"
reasoningEffort = "high"
skills = ["sdd", "engram"]

[profile.code]
model = "opencode-go/deepseek-v4-pro"
reasoningEffort = "medium"
```

## Errores frecuentes

1. **Perfil sin modelo definido**: Codex usa el modelo del perfil `[default]`, pero si `[default]` tampoco tiene modelo, Codex falla al iniciar. Siempre definí un modelo en `[default]`.

2. **SyntaxError en TOML**: TOML es sensible a comillas y tipos. Usá comillas dobles para strings, no comillas simples ni "backticks": `model = "openai/gpt-5.6-terra"` (correcto), `model = 'openai/gpt-5.6-terra'` (error).

3. **Skills que no se cargan**: Codex no tiene discovery automático. Si un skill no aparece, verificá que esté listado en la clave `skills` del perfil activo y que exista en `~/.codex/skills/`.

4. **Modo multiagente inactivo**: definís `multiAgent = true` pero Codex no delega. Verificá que el modelo soporte tool calling y que `maxSubAgents` sea mayor a 0.

5. **Confundir perfiles con agentes de OpenCode**: en Codex no hay `sdd-apply` ni `sdd-design`. Todo corre bajo el mismo perfil. Si necesitás roles distintos, usá OpenCode.

## Preguntas

1. ¿Cuál es la diferencia fundamental entre los perfiles de Codex y los agentes de OpenCode?
2. ¿Cómo se heredan los valores entre perfiles en Codex?
3. ¿Qué hace `multiAgent = true` en Codex y en qué se diferencia de los subagentes de OpenCode?
4. ¿Por qué en Codex no podés tener un modelo distinto para diseñar y para implementar en la misma sesión?
5. ¿Cuándo convendría usar Codex en lugar de OpenCode para un proyecto con SDD?

## Fuentes verificadas

- Repositorio: Codex CLI 0.144.0, documentación oficial
- Archivo de referencia: `~/.codex/config.toml` (instalación con Gentle-AI)
- Integración: gentle-ai 2.1.10, comando `gentle-ai install` con Codex detectado
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
