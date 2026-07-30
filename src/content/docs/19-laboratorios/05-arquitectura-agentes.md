---
title: Diseñar una arquitectura de agentes
description: "Laboratorio de maestría: diseñá un sistema multi-agente con roles, delegación, routing de modelos y políticas de escalamiento."
level: 3
estimatedTime: 60 min
tags:
  - laboratorio-maestría
  - agentes
  - arquitectura
  - delegación
  - opencode
prerequisites:
  - Concepto de agentes OpenCode
  - Familiaridad con SDD
  - Conocimiento de routing de modelos
---

## Contexto

Tu empresa quiere construir un asistente de código que revise PRs, genere tests y ejecute deploys automáticos. Un solo agente no puede mantener calidad aceptable en las tres tareas: el modelo que entiende arquitectura es lento y caro para generar tests; el que genera tests rápido no tiene criterio para revisar seguridad. Necesitás diseñar un sistema multi-agente donde cada uno tenga un rol específico, un modelo asignado según la tarea, y un orquestador que decida quién hace qué.

El desafío no es técnico únicamente. También es económico y operativo: cada modelo cuesta distinto, cada agente puede fallar, y el sistema completo debe seguir funcionando aunque un componente se degrade.

## Objetivo observable

Al completar este laboratorio vas a:

- Diseñar un sistema de 4 o más agentes con roles que no se superponen
- Asignar un modelo y nivel de razonamiento a cada agente según la tarea
- Documentar una política de fallback y escalamiento
- Crear un diagrama de flujo de delegación del orquestador
- Respetar un presupuesto de modelos (máximo 2 agentes con el modelo más caro)
- Estimar el costo operativo mensual del sistema

## Escenario

El sistema se activa cada vez que alguien hace push a una rama. Debe ejecutar este pipeline sin intervención humana:

1. **Analizar el diff**: identificar archivos modificados, impacto en el resto del código, y determinar si el cambio es seguro, riesgoso o inviable.
2. **Sugerir mejoras de código**: revisar estilo, patrones, posibles bugs y regresión.
3. **Generar tests**: crear tests unitarios y de integración para los cambios detectados.
4. **Ejecutar revisión de seguridad**: buscar secretos expuestos, inyecciones, permisos incorrectos o dependencias vulnerables.
5. **Deployar a staging**: si todas las fases anteriores pasan, empaquetar y desplegar en un entorno de staging.

Cada tarea requiere un perfil de modelo distinto. Analizar el diff necesita comprensión profunda del código existente. Generar tests es mecánico pero debe ser exhaustivo. Revisar seguridad no perdona errores. Deployar es puramente procedural.

## Restricciones

- **Sin API keys de pago**: solo modelos OpenCode Go (kimi-k3, deepseek-v4-pro, deepseek-v4-flash).
- **Máximo 2 agentes** pueden usar el modelo más caro (kimi-k3).
- **El orquestador debe funcionar aunque un agente falle**: si Security Auditor no responde, el sistema debe registrar el incidente y continuar o detenerse de forma controlada.
- **Los agentes no comparten contexto directamente**: toda comunicación pasa por el orquestador. Los agentes son cajas negras que reciben una instrucción y devuelven un resultado.
- **Cada agente debe tener modelo y `reasoningEffort` asignado explícitamente.**

## Información disponible

- Módulos 08 (SDD), 11 (Revisión de calidad), 12 (Configurar OpenCode), 14 (Modelos y enrutamiento) del manual.
- Documentación de `opencode.json`: sección `agents` con `model`, `reasoningEffort`, `tools` y `fallbacks`.
- Arquitectura actual de OpenCode: `gentle-orchestrator` → `sdd-explore`, `sdd-general`, `sdd-*`.
- Catálogo de modelos OpenCode Go: `kimi-k3` (potente), `deepseek-v4-pro` (equilibrado), `deepseek-v4-flash` (económico).
- Ejemplo real de `opencode.json` en el módulo 12 con agentes, herramientas y permisos.

## Preguntas de decisión

- **¿Cuántos agentes?** Muy pocos concentran demasiada responsabilidad por agente y el modelo adecuado para una tarea sub-optimiza las otras. Muchos agentes aumentan el overhead de coordinación y el riesgo de fallo en cadena.
- **¿Qué tareas merecen el modelo caro (kimi-k3)?** El orquestador toma decisiones de ruteo, así que probablemente sí. Security Auditor no puede fallar. Code Reviewer y Test Generator tienen perfiles de riesgo distintos.
- **¿El orquestador debe tener acceso a herramientas o solo delegar?** Si el orquestador puede modificar archivos, es un riesgo de seguridad. Si solo delega, depende completamente de la capacidad de los subagentes.
- **¿Cómo manejás fallos silenciosos?** Un modelo puede responder sintácticamente bien pero con contenido incorrecto. El orquestador necesita detectar estas señales sin intervención humana.

## Artefacto esperado

Crear un archivo `arquitectura-agentes.md` (junto a este laboratorio o en tu repositorio de ejercicios) que contenga:

1. **Tabla de agentes**: nombre, rol, modelo, reasoningEffort, política de fallback.
2. **Diagrama de flujo ASCII**: desde que llega el push hasta que se deploya o se rechaza.
3. **Políticas de escalamiento y fallback**: condiciones concretas para escalar de modelo, qué ocurre cuando un agente falla, tiempos de timeout.
4. **Estrategia de monitoreo**: qué métricas observar, cómo se notifican los fallos, dónde se registran los eventos.
5. **Configuración `opencode.json`**: fragmento con la definición de los agentes.

## Criterios de aceptación

- 4 o más agentes definidos con roles que no se superponen.
- Cada agente tiene modelo y reasoningEffort distinto según la tarea.
- El diagrama de flujo muestra delegación del orquestador y retorno de resultados.
- Política de fallback documentada (qué pasa si un agente falla, timesouts, reintentos).
- Presupuesto de modelos respetado: máximo 2 agentes con kimi-k3.
- La tabla de agentes incluye fallback por agente.

## Rúbrica

| Nivel | Descripción |
|-------|-------------|
| **Inicial** | 3 agentes con roles genéricos, un solo modelo para todos, sin fallback documentado. |
| **Competente** | 4 agentes con modelos distintos, diagrama de flujo simple, fallback básico (un solo nivel). |
| **Avanzado** | 5+ agentes con roles específicos, fallbacks por agente con 2+ niveles, política de timeout documentada, configuración opencode.json incluida. |
| **Experto** | Sistema completo con monitoreo, costos estimados por PR, plan de evolución (cómo escalaría a producción real con APIs de pago), y análisis de riesgos del orquestador como punto único de fallo. |

## Autoevaluación

1. **¿Cada agente tiene un rol que no se solapa con otro?** Si dos agentes pueden hacer la misma tarea, la delegación es ambigua y el orquestador no sabe a quién enviar el trabajo. Verificá que cada rol tenga un propósito único.

2. **¿El modelo asignado es apropiado para la tarea?** Un modelo económico para revisión de seguridad es peligroso. Un modelo caro para deployar es derroche. Revisá cada asignación contra el riesgo y la complejidad de la tarea.

3. **¿Los fallbacks cubren todos los modos de fallo?** Timeout del modelo, error de tool calling, respuesta mal formada, respuesta incorrecta pero bien formada (fallo silencioso). Si solo cubrís timeout, los fallos silenciosos pasan desapercibidos.

4. **¿El diagrama es claro para alguien que no diseñó el sistema?** Mostrale el diagrama a un compañero sin contexto. Si no entiende el flujo en 30 segundos, necesitás simplificarlo.

5. **¿Estimaste el costo por mes?** Conocé cuántos PRs revisa tu equipo por día, cuántos tokens consume cada fase, y cuánto cuesta cada modelo. Sin esta estimación, no sabés si el sistema es viable.

## Errores frecuentes

- **Asignar el modelo más caro a todos los agentes.** Se duplica el costo y se ralentiza el pipeline entero. El modelo económico es suficiente para tareas mecánicas como deploy y generación de tests simples.

- **No planificar fallbacks.** Cuando el modelo falla, el agente se queda esperando indefinidamente o la tarea se pierde sin registro.

- **Roles vagos que se solapan.** "Revisor de código" y "Analista de seguridad" pueden parecer distintos, pero si ambos revisan el diff y devuelven sugerencias, el orquestador no sabe a quién creer. Definí límites claros: uno revisa estilo y patrones, el otro revisa secretos y vulnerabilidades.

- **Ignorar el costo de coordinación.** El orquestador consume tokens cada vez que recibe y reenvía resultados. Si el sistema tiene 6 agentes y cada uno devuelve 2000 tokens, el orquestador gasta 12 000 tokens solo en leer respuestas. Eso se multiplica por cada PR.

- **No considerar que el orquestador es un punto único de fallo.** Si el orquestador se cae, todo el pipeline se detiene. Necesitás un plan para detectar y recuperar el orquestador, o al menos registrar el estado para retomar después.

## Extensión avanzada

Si terminás los criterios de aceptación y querés ir más allá:

- **Agente escalador**: agregá un sexto agente que monitorea la tasa de fallo del resto. Si un agente falla más de N veces seguidas, el escalador lo desconecta temporalmente y notifica al operador.

- **Simulación de fallo**: escribí un escenario donde el agente de seguridad no responde (timeout). Documentá paso a paso cómo responde el sistema: ¿el orquestador reintenta? ¿escala a otro modelo? ¿cancela el deploy? ¿dónde queda registrado el incidente?

- **Costeo real**: investigá los precios actuales de OpenCode Go (o de los proveedores que usarías en producción) y estimá el costo por PR. Asumí un equipo de 10 desarrolladores, 3 PRs por persona por día, y un tamaño promedio de diff de 500 líneas. ¿El sistema es viable económicamente?

- **Plan de evolución**: ¿cómo migrarías este sistema de OpenCode Go a OpenAI/Anthropic cuando el equipo crezca? ¿Qué cambiaría en la arquitectura? ¿Qué riesgos aparecen al depender de APIs externas?

## Solución

### Arquitectura de referencia

La solución propone 5 agentes con roles específicos, dos de ellos usando el modelo más caro.

| Agente | Rol | Modelo | reasoningEffort | Fallback |
|--------|-----|--------|-----------------|----------|
| **Orchestrator** | Recibe el push, analiza el diff, decide qué agentes invocar, consolida resultados y decide si deployar. | `opencode-go/kimi-k3` | `high` | Ninguno (es el punto de entrada; si falla, todo se detiene). Timeout de 60s. |
| **Code Reviewer** | Revisa estilo, patrones, bugs potenciales y regresión. Devuelve sugerencias priorizadas. | `opencode-go/deepseek-v4-pro` | `medium` | 1. deepseek-v4-flash (baja calidad pero responde). 2. Reportar fallo si ambos fallan. |
| **Test Generator** | Genera tests unitarios y de integración para los archivos modificados. | `opencode-go/deepseek-v4-flash` | `low` | 1. deepseek-v4-pro si el diff es complejo. 2. deepseek-v4-flash con menos cobertura. |
| **Security Auditor** | Busca secretos, inyecciones SQL, permisos incorrectos, dependencias vulnerables. | `opencode-go/kimi-k3` cuando cambia `security/`, `auth/` o `db/`; `opencode-go/deepseek-v4-pro` en el resto. | `high` / `medium` | 1. deepseek-v4-pro si kimi-k3 falla (solo para archivos críticos). 2. Bloquear el deploy si no se pudo auditar. |
| **Deployer** | Ejecuta el pipeline de build y deploy a staging. | `opencode-go/deepseek-v4-flash` | `low` | 1. deepseek-v4-pro si flash falla. 2. Cancelar deploy si ambos fallan. |

### Diagrama de flujo ASCII

```
                                ┌─────────────────────────────────┐
                                │         Push a rama              │
                                │   (evento: webhook o polling)    │
                                └───────────────┬─────────────────┘
                                                │
                                                ▼
                                ┌─────────────────────────────────┐
                                │       ORCHESTRATOR (kimi-k3)     │
                                │   Analiza el diff, clasifica     │
                                │   archivos por categoría         │
                                └──┬───────┬───────┬───────┬───────┘
                                   │       │       │       │
                    ┌──────────────┘       │       │       └──────────────┐
                    ▼                      ▼       ▼                      ▼
        ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
        │  CODE REVIEWER   │   │ TEST GENERATOR   │   │SECURITY AUDITOR  │   │    DEPLOYER      │
        │ (deepseek-v4-pro,│   │(deepseek-v4-flash│   │(kimi-k3 / pro,   │   │(deepseek-v4-flash│
        │  medium)         │   │  low)            │   │ high / medium)   │   │  low)            │
        │                  │   │                  │   │                  │   │                  │
        │ Revisa estilo,   │   │ Genera tests     │   │Busca secretos,   │   │ Build y deploy   │
        │ patrones, bugs,  │   │ unitarios y de   │   │inyecciones,      │   │ a staging        │
        │ regresión        │   │ integración      │   │vulnerabilidades  │   │                  │
        └────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
                 │                     │                      │                      │
                 └─────────────────────┴──────────────────────┴──────────────────────┘
                                                │
                                                ▼
                                ┌─────────────────────────────────┐
                                │       ORCHESTRATOR (kimi-k3)     │
                                │   Consolida resultados:          │
                                │   ¿Todo OK? ¿Hay bloqueos?       │
                                └──┬──────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌──────────────────────┐     ┌────────────────────────┐
        │    Todo OK           │     │  Hay bloqueos/fallos    │
        │                      │     │                        │
        │ Deploy a staging     │     │ Notificar al equipo    │
        │ vía Deployer         │     │ Registrar en log       │
        │                      │     │ NO hacer deploy        │
        └──────────────────────┘     └────────────────────────┘
```

### Políticas de escalamiento y fallback

**Regla general**: cada agente tiene una cadena de fallback de 2 niveles. Si el modelo principal falla, se intenta con el secundario. Si ambos fallan, el agente devuelve un error estructurado al orquestador.

**Condiciones de escalamiento**:

| Señal | Acción |
|-------|--------|
| Timeout de herramienta (30s) | Reintentar 1 vez con el mismo modelo. Si vuelve a fallar, escalar al fallback. |
| Tres fallos consecutivos en el mismo PR | Escalar al siguiente modelo y marcar el PR como "revisión degradada" en el log. |
| Security Auditor no responde | Si el archivo es crítico (security/, auth/, db/), bloquear el deploy. Si no es crítico, continuar con advertencia. |
| Error de formato en la respuesta | Reintentar con el mismo modelo hasta 2 veces. Si persiste, escalar al fallback. |
| Modelo devuelve respuesta vacía | Contar como fallo. Escalar al fallback después del segundo intento. |

**Timeouts**:

| Agente | Timeout |
|--------|---------|
| Orchestrator | 60s (global del pipeline) |
| Code Reviewer | 45s |
| Test Generator | 60s (puede generar muchos tests) |
| Security Auditor | 45s |
| Deployer | 120s (incluye build) |

**Manejo de fallos silenciosos**: el orquestador verifica que la respuesta del agente contenga los campos esperados (estructura JSON conocida). Si la respuesta es sintácticamente válida pero semánticamente dudosa (por ejemplo, Code Reviewer devuelve "todo ok" sin sugerencias cuando el diff es grande), se registra una advertencia pero no se bloquea el pipeline.

### Estrategia de monitoreo

| Métrica | Dónde se registra | Frecuencia | Alerta si |
|---------|-------------------|------------|-----------|
| Tasa de fallo por agente | Log centralizado | Por PR | > 10% en la última hora |
| Tiempo de respuesta por modelo | Log centralizado | Por llamada | > 30s promedio |
| Costo por PR | Log centralizado + cálculo mensual | Por PR | > umbral definido (ej. $0.50/PR) |
| Fallos de orquestador | Log centralizado + alerta | Por evento | Inmediata (bloquea el pipeline) |
| Deploys exitosos vs fallidos | Log centralizado | Por PR | < 80% de tasa de éxito |

El orquestador expone un endpoint o archivo de log estructurado (JSON) que un sistema externo puede consumir para generar dashboards. Cada evento incluye: timestamp, agente, modelo usado, tiempo de respuesta, éxito/fallo, y causa del fallo si lo hubo.

### Configuración opencode.json

```json
{
  "agents": {
    "orchestrator-ci": {
      "model": "opencode-go/kimi-k3",
      "reasoningEffort": "high",
      "tools": ["read", "grep", "glob", "task"],
      "permissions": ["deny-write"]
    },
    "code-reviewer": {
      "model": "opencode-go/deepseek-v4-pro",
      "reasoningEffort": "medium",
      "fallbacks": [
        { "model": "opencode-go/deepseek-v4-flash", "reasoningEffort": "low" }
      ],
      "tools": ["read", "grep", "glob"],
      "permissions": ["deny-write"]
    },
    "test-generator": {
      "model": "opencode-go/deepseek-v4-flash",
      "reasoningEffort": "low",
      "fallbacks": [
        { "model": "opencode-go/deepseek-v4-pro", "reasoningEffort": "medium" }
      ],
      "tools": ["read", "write", "bash"],
      "permissions": ["allow-write"]
    },
    "security-auditor": {
      "model": "opencode-go/kimi-k3",
      "reasoningEffort": "high",
      "fallbacks": [
        { "model": "opencode-go/deepseek-v4-pro", "reasoningEffort": "high" }
      ],
      "tools": ["read", "grep", "glob"],
      "permissions": ["deny-write"]
    },
    "deployer": {
      "model": "opencode-go/deepseek-v4-flash",
      "reasoningEffort": "low",
      "fallbacks": [
        { "model": "opencode-go/deepseek-v4-pro", "reasoningEffort": "medium" }
      ],
      "tools": ["bash"],
      "permissions": ["allow-write"]
    }
  }
}
```

### Estimación de costos

La estimación asume 10 PRs por día, 20 días hábiles por mes. Los costos por token son estimados para modelos OpenCode Go; verificá los precios actualizados con `opencode models`.

| Agente | Modelo | Tokens/PR (est.) | Costo/PR (est.) |
|--------|--------|------------------|-----------------|
| Orchestrator | kimi-k3 | 4 000 entrada + 1 000 salida | $0.008 |
| Code Reviewer | deepseek-v4-pro | 6 000 + 2 000 | $0.004 |
| Test Generator | deepseek-v4-flash | 5 000 + 3 000 | $0.003 |
| Security Auditor | kimi-k3 (40%) / pro (60%) | 3 000 + 1 000 | $0.005 |
| Deployer | deepseek-v4-flash | 1 000 + 500 | $0.001 |

**Costo por PR**: ~$0.021 (2.1 centavos de dólar).
**Costo mensual**: 200 PRs × $0.021 = ~$4.20/mes.
**Costo anual**: ~$50.40/año.

El sistema es extremadamente económico porque usa modelos OpenCode Go sin APIs externas de pago. En producción con APIs de pago, el costo podría multiplicarse por 5-10x, pero sigue siendo viable para un equipo pequeño.

### Plan de evolución

| Fase | Cambio | Impacto |
|------|--------|---------|
| 1 (actual) | OpenCode Go, solo staging | Sin costos de API, límite de capacidad |
| 2 | Agregar OpenAI Terra para Code Reviewer | Mejor calidad en revisión, ~$0.02/PR extra |
| 3 | Security Auditor con Anthropic Opus | Seguridad crítica con frontier, ~$0.05/PR |
| 4 | Deployer a producción con aprobación humana | El orquestador delega pero un humano confirma |
| 5 | Agente escalador dedicado | Monitoreo automatizado, auto-recuperación |

Cada fase es opcional y se activa solo cuando el equipo necesita la capacidad adicional.

### Análisis de riesgos

**Punto único de fallo**: el orquestador. Si falla, ningún PR se procesa. Mitigaciones posibles:

- Log estructurado por fase: cada paso del pipeline registra su estado. Si el orquestador se recupera, puede leer el log y continuar desde donde falló.
- Timeout global: si el orquestador no responde en 60s, un watchdog externo (GitHub Action o cron) notifica al equipo.
- Orquestador secundario (hot standby): una segunda instancia monitorea la primera y toma el control si detecta fallo. Esto duplica el costo pero elimina el punto único de fallo.

**Fallo silencioso de seguridad**: el Security Auditor puede devolver "todo seguro" cuando hay una vulnerabilidad. Sin una segunda opinión, esto no se detecta. Para archivos críticos, el orquestador puede ejecutar el Security Auditor dos veces con modelos distintos y comparar resultados.

## Fuentes

- Fuente conceptual: Módulo 08 — SDD, flujo de fases y orquestación.
- Fuente técnica primaria: Módulo 12 — Configurar OpenCode, sección `agents`.
- Routing de modelos: Módulo 14 — Modelos y enrutamiento, tabla de subagentes y perfiles.
- Calidad y revisión: Módulo 11 — GGA, Native Bounded Review, Judgment Day.
- Catálogo de modelos: `opencode models` con OpenCode 1.17.20.
- Arquitectura OpenCode: `gentle-orchestrator` como coordinador SDD.
- Fecha de verificación: 2026-07-28.
- Estado: 🟢 Verificado.
