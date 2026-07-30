---
title: Asignar roles y modelos con fallback
description: "Laboratorio de maestría: configurá agentes OpenCode con modelos, reasoningEffort, y cadenas de fallback para distintas tareas."
level: 3
estimatedTime: 50 min
tags:
  - laboratorio-maestría
  - modelos
  - enrutamiento
  - fallback
  - opencode
prerequisites:
  - opencode.json configurado
  - Acceso a 3+ modelos
  - Familiaridad con agentes OpenCode
---

## Contexto

Tu equipo tiene un presupuesto limitado de API de modelos. Cada agente en OpenCode puede usar un modelo diferente, pero la configuración es compleja. Necesitás diseñar una estrategia de asignación que balancee costo, velocidad y calidad, con fallback automático cuando un modelo falla o es muy lento.

Sin una estrategia clara, los equipos tienden a usar el modelo más caro para todo, agotando el presupuesto antes de llegar a las tareas críticas. O peor: usan el modelo barato para todo y obtienen código de baja calidad que requiere revisiones costosas.

## Objetivo observable

Configurar un sistema multi-modelo en `opencode.json` donde 3 agentes usen modelos diferentes con cadenas de fallback, midiendo y documentando el comportamiento de escalamiento ante fallos simulados.

## Escenario

Tenés 3 modelos disponibles: uno barato y rápido (deepseek-v4-flash, costo bajo), uno equilibrado (deepseek-v4-pro, costo medio), y uno potente (kimi-k3, costo alto). Necesitás asignarlos estratégicamente a tres perfiles de agente:

1. **Exploración inicial y documentación** — tareas de lectura, investigación, generación de archivos Markdown. No requieren alta precisión. Prioridad: velocidad y bajo costo.
2. **Implementación de código** — tareas de escritura de código, refactors, aplicación de cambios. Requieren equilibrio entre velocidad y calidad. Prioridad: precisión moderada con tiempo de respuesta aceptable.
3. **Revisión y verificación** — code review, validación de especificaciones, verificación de calidad. Requieren la mejor comprensión disponible. Prioridad: calidad máxima, el costo es secundario.

El sistema debe escalar automáticamente al siguiente modelo disponible si el asignado falla por timeout, error de herramienta, o límite de tokens.

## Restricciones

- Sin API keys de pago directo. Solo modelos disponibles vía OpenCode (opencode-go/).
- El modelo barato (deepseek-v4-flash) tiene límite de 8K tokens de salida.
- El modelo potente (kimi-k3) solo debe usarse para tareas críticas.
- Cada agente debe tener un modelo PRIMARY y al menos 2 FALLBACKS documentados.
- La política de escalamiento debe estar documentada antes de probarla.
- Debe simularse al menos un fallo y documentarse el comportamiento observado.

## Información disponible

- Módulo 12 del manual: Configurar OpenCode (`12-opencode/01-configurar-opencode.md`).
- Módulo 14 del manual: Modelos y enrutamiento (`14-modelos-y-enrutamiento/01-modelos-y-enrutamiento.md`).
- Schema de `opencode.json` y ejemplos en el manual.
- Catálogo de comandos en `data/evidence/gentle-command-catalog.yml` (comando `opencode models`).
- Documentación de `model`, `reasoningEffort`, `fallbacks` en la configuración de agentes OpenCode.
- Laboratorio 18 (Model routing) como referencia de cadenas de fallback básicas.

## Preguntas de decisión

- ¿Cuántos fallbacks antes de rendirse? ¿2, 3, ninguno?
- ¿Medís el fallback por timeout, por calidad de respuesta, o por fallo de herramienta?
- ¿El `reasoningEffort` debe ser fijo en toda la cadena o debe variar según el modelo?
- ¿Qué pasa si todos los fallbacks fallan? ¿El agente se detiene o reintenta con el modelo primario?
- ¿Los perfiles económicos y potentes deben ser archivos separados o el mismo `opencode.json` con distintas secciones de agentes?
- ¿Cuándo conviene que el fallback sea un modelo más barato (escalamiento inverso) en lugar de uno más caro?

## Artefacto esperado

Archivo `configuracion-modelos.md` que contenga:

1. **Tabla de asignación agente → modelo → fallbacks** con reasoningEffort de cada eslabón.
2. **Configuración JSON de ejemplo** para los 3 agentes en `opencode.json`.
3. **Política de escalamiento documentada**: criterios, umbrales, comportamiento ante fallo total.
4. **Evidencia de escalamiento**: logs o capturas que muestren que el sistema escala correctamente ante un fallo simulado.

## Criterios de aceptación

- 3 agentes configurados con modelos distintos entre sí.
- Cada agente tiene al menos 2 modelos en su cadena de fallback.
- El archivo `opencode.json` presentado es JSON válido.
- La política de escalamiento está documentada en el artefacto.
- Se simuló al menos un fallo y se documentó el comportamiento observado (logs o descripción).
- No se mencionan comandos retirados del catálogo.
- No se requiere proveedor de pago directo (API key externa).

## Rúbrica

| Nivel | Descripción |
|-------|-------------|
| **Inicial** | 1 agente configurado con 1 modelo, sin fallbacks. No hay política de escalamiento. |
| **Competente** | 2 agentes con modelos distintos, 1 fallback cada uno. La política de escalamiento existe pero es superficial. |
| **Avanzado** | 3 agentes configurados con modelos distintos, cada uno con 2+ fallbacks. Política de escalamiento documentada con criterios claros. |
| **Experto** | Asignación óptima documentada con justificación de cada decisión, evidencia de escalamiento con logs, costos estimados por tarea, y perfiles alternativos (económico.json, potente.json) intercambiables. |

## Autoevaluación

Respondé estas preguntas después de completar el laboratorio:

1. **¿Cada modelo está asignado al agente adecuado según el perfil de tarea?** El modelo barato debería ir a exploración, el equilibrado a implementación, el potente a revisión. Si los asignaste al revés, justificá por qué.
2. **¿El fallback mantiene el mismo reasoningEffort o lo escala?** Si el modelo primario usa `reasoningEffort: "low"` y el fallback también, puede que el fallback no resuelva el problema que el primario no pudo. ¿Escalaste el esfuerzo?
3. **¿Simulaste un fallo y viste el escalamiento en logs?** No alcanza con configurar los fallbacks. Hay que forzar un error y verificar que OpenCode escala al siguiente modelo.
4. **¿Documentaste los criterios de cada fallback?** Cada eslabón de la cadena debería tener un por qué: ¿por qué ese modelo y no otro? ¿por qué ese reasoningEffort?
5. **¿Estimaste el costo diferencial entre la configuración barata y la cara?** Si usás el modelo potente para todo, gastás más. Si usás el barato para todo, perdés calidad. ¿Cuál es el punto óptimo?

## Errores frecuentes

- **Poner el modelo caro en todos los agentes.** El equipo se queda sin presupuesto rápido y las tareas simples no necesitan tanta capacidad.
- **No configurar fallbacks.** Si el modelo primario falla (timeout, límite de tokens, error de herramienta), el agente falla silenciosamente sin escalar.
- **ReasoningEffort inconsistente entre primario y fallback.** Si el primario usa `"low"` y el fallback también, el fallback probablemente tampoco resuelva el problema.
- **No probar que el fallback realmente funciona.** La configuración sintácticamente correcta no garantiza que el enrutador active los fallbacks en tiempo de ejecución.
- **Confundir fallback con balanceo de carga.** El fallback es un plan B para cuando el plan A falla, no un round-robin entre modelos.

## Extensión avanzada

- **Escalamiento por timeout:** Configurá el sistema para que si el modelo primario tarda más de 30 segundos, escale automáticamente al fallback. Documentá los umbrales.
- **Cuarto agente de solo lectura:** Agregá un agente `docs-architect` con perfil exclusivamente de lectura (exploración, documentación, revisión de archivos existentes) usando solo el modelo barato.
- **Perfiles intercambiables:** Creá 2 archivos de configuración completos (`opencode.economico.json` con todos los agentes en modelo barato, `opencode.potente.json` con todos en modelo caro) y alterná entre ellos con `opencode --config`.
- **Benchmark de costo:** Ejecutá la misma tarea con cada perfil y medí tiempo, tokens consumidos y calidad del resultado. Publicá la tabla comparativa.

## Solución

### Tabla de asignación

| Agente | Rol | Modelo PRIMARY | reasoningEffort | Fallback 1 | Fallback 2 |
|--------|-----|----------------|-----------------|------------|------------|
| gentle-orchestrator | Revisión y verificación | opencode-go/kimi-k3 | high | opencode-go/deepseek-v4-pro (medium) | opencode-go/deepseek-v4-flash (low) |
| sdd-apply | Implementación de código | opencode-go/deepseek-v4-pro | medium | opencode-go/kimi-k3 (high) | opencode-go/deepseek-v4-flash (low) |
| sdd-init | Exploración y documentación | opencode-go/deepseek-v4-flash | low | opencode-go/deepseek-v4-pro (medium) | opencode-go/kimi-k3 (high) |

### Configuración JSON

```json
{
  "agents": {
    "gentle-orchestrator": {
      "model": "opencode-go/kimi-k3",
      "reasoningEffort": "high",
      "fallbacks": [
        { "model": "opencode-go/deepseek-v4-pro", "reasoningEffort": "medium" },
        { "model": "opencode-go/deepseek-v4-flash", "reasoningEffort": "low" }
      ]
    },
    "sdd-apply": {
      "model": "opencode-go/deepseek-v4-pro",
      "reasoningEffort": "medium",
      "fallbacks": [
        { "model": "opencode-go/kimi-k3", "reasoningEffort": "high" },
        { "model": "opencode-go/deepseek-v4-flash", "reasoningEffort": "low" }
      ]
    },
    "sdd-init": {
      "model": "opencode-go/deepseek-v4-flash",
      "reasoningEffort": "low",
      "fallbacks": [
        { "model": "opencode-go/deepseek-v4-pro", "reasoningEffort": "medium" },
        { "model": "opencode-go/kimi-k3", "reasoningEffort": "high" }
      ]
    }
  }
}
```

### Política de escalamiento

**Criterios de activación:** El sistema escala al siguiente modelo en la cadena cuando ocurre cualquiera de estas condiciones:

1. **Timeout supera 45 segundos** sin recibir el primer token de respuesta.
2. **3 fallos consecutivos de herramienta** (tool call error, parsing error, etc.).
3. **El modelo alcanza el límite de tokens de salida** (aplica a deepseek-v4-flash con 8K).
4. **El modelo devuelve una respuesta vacía o un error interno.**

**Comportamiento ante fallo total:** Si todos los modelos en la cadena fallan, el agente:
1. Registra el evento en los logs con nivel ERROR.
2. Reintenta una vez con el modelo primario después de 5 segundos de espera.
3. Si el reintento también falla, informa al usuario y detiene la ejecución.

**ReasoningEffort progresivo:** El esfuerzo de razonamiento se incrementa en cada eslabón de la cadena. Si el modelo barato con `"low"` no pudo resolver el problema, el fallback usa `"medium"` o `"high"` para intentar con más capacidad de razonamiento.

### Evidencia de escalamiento

Para simular un fallo y verificar el escalamiento:

1. Configurá el agente `sdd-init` con un límite de tokens artificialmente bajo o pedile una tarea que sature el contexto de 8K.
2. Ejecutá la tarea: `opencode run --agent sdd-init --task "Generá 50 páginas de documentación técnica detallada"`.
3. Observá los logs: OpenCode debería mostrar una secuencia como:

```
[INFO  sdd-init] Modelo primario: deepseek-v4-flash
[WARN  sdd-init] Límite de tokens de salida alcanzado (8192 tokens)
[INFO  sdd-init] Escalando a fallback 1: deepseek-v4-pro (reasoningEffort: medium)
[INFO  sdd-init] Tarea completada con fallback 1
```

4. Si también falla el primer fallback, el patrón continúa:

```
[WARN  sdd-init] Error de herramienta en deepseek-v4-pro (3 fallos consecutivos)
[INFO  sdd-init] Escalando a fallback 2: kimi-k3 (reasoningEffort: high)
[INFO  sdd-init] Tarea completada con fallback 2
```

**Estimación de costos por tarea:**

| Perfil | Modelo primario | Costo relativo | Tiempo estimado | Casos de uso |
|--------|-----------------|----------------|-----------------|--------------|
| Económico (sdd-init) | deepseek-v4-flash | 1x | 5-10s | Exploración, docs, tareas simples |
| Balanceado (sdd-apply) | deepseek-v4-pro | 3x | 10-20s | Implementación, refactors |
| Potente (gentle-orchestrator) | kimi-k3 | 6x | 20-35s | Revisión, verificación, diseño |

Cuando ocurre un fallback, el costo de esa tarea específica puede aumentar 3x o 6x, pero sigue siendo menor que tener todos los agentes en el modelo potente permanentemente.

## Fuentes

- Gentle-AI manual, Módulo 12: Configurar OpenCode (`src/content/docs/12-opencode/01-configurar-opencode.md`). Verificado en v2.2.0.
- Gentle-AI manual, Módulo 14: Modelos y enrutamiento (`src/content/docs/14-modelos-y-enrutamiento/01-modelos-y-enrutamiento.md`). Verificado en v2.2.0.
- Laboratorio 18: Model routing (`src/content/docs/19-laboratorios/01-laboratorios.md`). Verificado en v2.2.0.
- Catálogo de comandos Gentle (`data/evidence/gentle-command-catalog.yml`). Verificado al 2026-07-28.
- Fecha de verificación: 2026-07-30.
- Alcance de la comprobación: configuración JSON, política de escalamiento, simulación de fallos.
