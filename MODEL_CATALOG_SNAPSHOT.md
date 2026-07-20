# Catálogo de Modelos — Snapshot

> **Fecha**: 2026-07-20
> **Fuente**: `opencode models` ejecutado el 2026-07-20
> **OpenCode**: 1.17.20
> **Codex CLI**: 0.144.0
> **gentle-ai**: 2.1.10

---

## Proveedores y modelos principales

### OpenAI (directo)

| Model ID | Clase | Razonamiento | Tool Calling | Ventana | Notas |
|----------|-------|-------------|--------------|---------|-------|
| `openai/gpt-5.6-sol` | Frontier | Sí (high) | Sí | Grande | Modelo más capaz para arquitectura y decisiones |
| `openai/gpt-5.6-terra` | Equilibrado | Sí (medium) | Sí | Grande | Balance capacidad/costo para implementación |
| `openai/gpt-5.6-luna` | Económico | Sí (low) | Sí | Medio | Tareas mecánicas, formateo, archivo |
| `openai/gpt-5.5` | Frontier (anterior) | Sí | Sí | Grande | Generación anterior |
| `openai/gpt-5.4` | Potente | Sí | Sí | Grande | |
| `openai/gpt-5.4-mini` | Económico | Limitado | Sí | Medio | |
| `openai/gpt-5.3-codex-spark` | Especializado código | - | Sí | - | Optimizado para Codex |

Variantes `-fast`: menor latencia, mismo modelo base, posiblemente menor calidad en razonamiento profundo.

### Google (vía OpenRouter)

| Model ID | Clase | Razonamiento | Tool Calling | Ventana | Notas |
|----------|-------|-------------|--------------|---------|-------|
| `openrouter/google/gemini-3.5-flash` | Equilibrado | Sí | Sí | Grande | Modelo rápido y capaz |
| `openrouter/google/gemini-3.1-pro-preview` | Potente | Sí | Sí | Grande | Preview, puede cambiar |
| `openrouter/google/gemini-3.1-flash-lite` | Económico | Limitado | Sí | Medio | Tareas ligeras |
| `openrouter/google/gemini-3.1-flash-lite-preview` | Económico | Limitado | Sí | Medio | Preview |
| `openrouter/google/gemini-3-flash-preview` | Equilibrado | Sí | Sí | Grande | Preview |

### Anthropic (vía OpenRouter)

| Model ID | Clase | Razonamiento | Tool Calling | Ventana | Notas |
|----------|-------|-------------|--------------|---------|-------|
| `openrouter/anthropic/claude-opus-4.8` | Frontier | Sí (xhigh) | Sí | 200K | Máxima capacidad Anthropic |
| `openrouter/anthropic/claude-sonnet-5` | Potente | Sí (high) | Sí | 200K | Balance capacidad/velocidad |
| `openrouter/anthropic/claude-haiku-4.5` | Económico | Limitado | Sí | 200K | Rápido y económico |
| `openrouter/anthropic/claude-fable-5` | Creativo | Sí | Sí | 200K | Escritura creativa |

### OpenCode Go

| Model ID | Clase | Razonamiento | Tool Calling | Ventana | Notas |
|----------|-------|-------------|--------------|---------|-------|
| `opencode-go/deepseek-v4-pro` | Potente | Sí | Sí | 128K | Balance capacidad/costo |
| `opencode-go/deepseek-v4-flash` | Económico | Limitado | Sí | 128K | Rápido |
| `opencode-go/kimi-k3` | Potente | Sí | Sí | 128K | Fuerte en código |
| `opencode-go/kimi-k2.7-code` | Especializado código | Sí | Sí | 128K | Optimizado para código |
| `opencode-go/glm-5.2` | Potente | Sí | Sí | 128K | Modelo chino competitivo |
| `opencode-go/glm-5.1` | Equilibrado | Sí | Sí | 128K | |
| `opencode-go/grok-4.5` | Potente | Sí | Sí | 128K | xAI |
| `opencode-go/qwen3.7-max` | Potente | Sí | Sí | 128K | |
| `opencode-go/qwen3.7-plus` | Equilibrado | Sí | Sí | 128K | |
| `opencode-go/qwen3.6-plus` | Equilibrado | Sí | Sí | 128K | |
| `opencode-go/minimax-m3` | Potente | Sí | Sí | 128K | |
| `opencode-go/minimax-m2.7` | Equilibrado | Sí | Sí | 128K | |
| `opencode-go/mimo-v2.5-pro` | Potente | Sí | Sí | 128K | |
| `opencode-go/mimo-v2.5` | Equilibrado | Sí | Sí | 128K | |

### Modelos gratuitos (OpenCode)

| Model ID | Clase | Notas |
|----------|-------|-------|
| `opencode/deepseek-v4-flash-free` | Económico | Gratuito |
| `opencode/hy3-free` | Económico | Gratuito (Tencent) |
| `opencode/mimo-v2.5-free` | Económico | Gratuito |
| `opencode/nemotron-3-ultra-free` | Económico | Gratuito (NVIDIA) |
| `opencode/north-mini-code-free` | Económico | Gratuito |
| `opencode/big-pickle` | Económico | Gratuito |

---

## Taxonomía de razonamiento normalizada

| Nivel canónico | Uso típico | OpenAI | Google | Anthropic | OpenCode Go |
|---------------|-----------|--------|--------|-----------|-------------|
| `minimal` | Formato, clasificación, búsqueda | gpt-5.6-luna (low) | gemini-3.1-flash-lite | claude-haiku-4.5 | deepseek-v4-flash |
| `low` | Tareas claras, resúmenes | gpt-5.6-luna | gemini-3.1-flash-lite | claude-haiku-4.5 | deepseek-v4-flash |
| `medium` | Código estándar, planificación | gpt-5.6-terra | gemini-3.5-flash | claude-sonnet-5 | deepseek-v4-pro / kimi-k2.7-code |
| `high` | Arquitectura, debugging, revisión | gpt-5.6-sol | gemini-3.1-pro | claude-sonnet-5 / claude-opus-4.8 | kimi-k3 / glm-5.2 |
| `xhigh` | Seguridad, decisiones críticas | gpt-5.6-sol | gemini-3.1-pro (high) | claude-opus-4.8 | qwen3.7-max / glm-5.2 |

---

## Notas sobre el catálogo

1. **Fecha de snapshot**: 2026-07-20. Los modelos pueden cambiar en cualquier momento.
2. **Estados**: `stable`, `preview`, `beta`, `deprecated`. Verificar antes de usar en producción.
3. **Proveedores vía OpenRouter**: los modelos de Google y Anthropic listados arriba están disponibles a través de OpenRouter. La disponibilidad directa puede variar.
4. **Tool calling**: asumido como "Sí" para modelos modernos. Verificar antes de asignar a un agente que requiera herramientas.
5. **Ventana de contexto**: valores aproximados. Consultar documentación del proveedor para valores exactos.
6. **Precios**: no incluidos en este snapshot. Varían por proveedor y plan. Consultar `opencode models` o la documentación del proveedor.

---

## Modelos NO disponibles actualmente

Los siguientes modelos mencionados en documentación anterior no aparecen en el catálogo actual:

- `GPT-5.6 Sol Pro` (variante) — aparece como `openai/gpt-5.6-sol` y `openrouter/openai/gpt-5.6-sol-pro`
- `Gemini 3.1 Pro` (estable) — solo disponible como `preview`
- `Claude Opus 4.8` — disponible como `openrouter/anthropic/claude-opus-4.8`

Esto se documenta en `appendices/MIGRATIONS-AND-LEGACY.md`.

---

## Clases de modelo mapeadas

| Clase | Descripción | Ejemplos |
|-------|------------|----------|
| **Frontier** | Máxima capacidad, mayor costo | gpt-5.6-sol, claude-opus-4.8 |
| **Potente** | Alta capacidad, costo medio-alto | gpt-5.5, claude-sonnet-5, kimi-k3, glm-5.2 |
| **Equilibrado** | Buen balance capacidad/costo | gpt-5.6-terra, gemini-3.5-flash, deepseek-v4-pro |
| **Económico** | Bajo costo, tareas simples | gpt-5.6-luna, claude-haiku-4.5, deepseek-v4-flash |
| **Alta velocidad** | Optimizado para latencia | variantes `-fast` |
| **Especializado código** | Optimizado para programación | kimi-k2.7-code, gpt-5.3-codex-spark |
