---
title: Asignar modelos con perfiles y fallbacks
description: Cómo crear perfiles de modelos por fase SDD, configurar cadenas de fallback, usar herencia de modelos y manejar degradación de capacidad.
level: 2
estimatedTime: 25 min
tags:
  - modelos
  - enrutamiento
  - perfiles
  - fallback
  - asignacion
  - costos
  - modelo-config
prerequisites:
  - "Modelos y enrutamiento (14-01)"
  - "CLI y TUI de Gentle-AI (07-02)"
verifiedVersion: "Gentle-AI 2.2.0, OpenCode 1.17.20"
learningOutcomes:
  - Configurar perfiles de modelos (económico, equilibrado, potente) para fases SDD
  - Diseñar cadenas de fallback con distintos proveedores
  - Explicar cómo funciona la herencia de modelo entre fases
  - Usar el dashboard /model-config en OpenCode
  - Diagnosticar y manejar degradación de capacidad
---

# Asignar modelos con perfiles y fallbacks

## Qué aprenderás

No alcanza con elegir un modelo general. Cada fase SDD tiene necesidades distintas de razonamiento, costo y velocidad. Asignar el modelo correcto a cada fase requiere entender perfiles, fallbacks y cómo se heredan las configuraciones.

En este capítulo vas a entender:
- Cómo crear y aplicar perfiles de modelos para fases SDD
- Cómo funcionan las cadenas de fallback entre proveedores
- El concepto de herencia de modelo (un perfil hereda de otro)
- Degradación de capacidad: qué pasa cuando un modelo falla
- Cómo usar `/model-config` en OpenCode
- Cómo sync crea perfiles SDD con `--profile` y `--profile-phase`

## Por qué importa

Asignar el mismo modelo a todas las fases SDD es como usar la misma herramienta para todos los trabajos: funciona, pero mal. Una fase exploratoria no necesita capacidad frontier; una fase de diseño no debería usar un modelo económico.

Sin perfiles bien configurados:
- Gastás tokens de más en fases que no los necesitan
- Obtenés resultados pobres en fases que requieren capacidad
- Las cadenas de fallback mal diseñadas dejan el proceso bloqueado cuando un proveedor cae

## Explicación simple

Un **perfil de modelos** es una receta que asigna qué modelo usar en cada fase SDD. En lugar de configurar modelo por modelo, definís perfiles (económico, equilibrado, potente) y los aplicás a las fases.

Un **fallback** es un modelo de respaldo. Si tu modelo principal falla (timeout, error, costo excesivo), el sistema intenta con el siguiente de la cadena.

La **herencia de modelo** permite que un perfil herede la configuración de otro y solo cambie lo necesario. El perfil "potente" puede heredar del "equilibrado" y solo cambiar el modelo de `sdd-design` y `sdd-verify`.

## Modelo mental

Imaginá un **taller de carpintería** con tres bancos de trabajo:

- **Banco económico**: herramientas básicas, para lijar y medir. Rápido, barato, suficiente para tareas simples.
- **Banco equilibrado**: herramientas estándar, para cortar y ensamblar. Buen balance para la mayoría del trabajo.
- **Banco potente**: herramientas profesionales, para tallado fino y acabado de calidad. Caro y lento, pero necesario para lo crítico.

Asignás cada tarea al banco adecuado: la medición va al banco económico, el ensamblaje al equilibrado, el tallado decorativo al potente.

Si un banco se rompe (fallback), mandás la tarea al siguiente banco disponible. Si todos están rotos (degradación), el taller se detiene y necesitás intervención manual.

## Cómo funciona realmente

### Perfiles de modelos

Hay tres perfiles predefinidos:

| Perfil | Modelo principal | Alternativa | Costo | Velocidad |
|--------|-----------------|-------------|------|-----------|
| **Económico** | Luna / Haiku 4.5 / deepseek-v4-flash | Terra / Gemini 3.5 Flash | Bajo | Rápida |
| **Equilibrado** | Terra / Sonnet 5 / deepseek-v4-pro | Gemini 3.5 Flash / GLM 5.2 | Medio | Media |
| **Potente** | Sol / Opus 4.8 / kimi-k3 | Sonnet 5 / deepseek-v4-pro | Alto | Lenta |

Cada perfil asigna modelos por fase SDD. Por ejemplo, el perfil económico usa modelos baratos para init y archive, y escala a modelos equilibrados solo para design y verify:

```yaml
# Perfil económico
sdd-init:     luna / haiku-4.5 / deepseek-v4-flash
sdd-explore:  terra / gemini-3.5-flash / deepseek-v4-pro
sdd-propose:  terra / sonnet-5 / deepseek-v4-pro
sdd-spec:     terra / sonnet-5 / deepseek-v4-pro
sdd-design:   sol / opus-4.8 / kimi-k3           # Escalar aquí
sdd-tasks:    terra / sonnet-5 / deepseek-v4-pro
sdd-apply:    terra / sonnet-5 / deepseek-v4-pro
sdd-verify:   terra / sonnet-5 / deepseek-v4-pro
sdd-archive:  luna / haiku-4.5 / deepseek-v4-flash
```

### Fallback

Cada fase tiene una **cadena de fallback** de al menos 2 modelos, preferiblemente de proveedores distintos:

```yaml
# Buena cadena de fallback
sdd-apply: [deepseek-v4-pro, sonnet-5, gemini-3.5-flash]
# Tres proveedores distintos: OpenCode Go, Anthropic, Google
```

```yaml
# Mala cadena de fallback
sdd-apply: [sonnet-5, opus-4.8]
# Mismo proveedor: si Anthropic cae, ambos fallan
```

Reglas de fallback:
- Preferí proveedores distintos en la cadena
- El primer modelo debe ser el óptimo para la tarea
- El último debe ser un modelo confiable (aunque más caro)
- Si toda la cadena falla, se activa la degradación de capacidad

### Degradación de capacidad

La **degradación de capacidad** ocurre cuando ningún modelo de la cadena está disponible. El sistema:

1. Reporta el error con el diagnóstico del último fallo
2. No avanza la fase
3. Requiere intervención para resolver (cambiar la cadena, esperar recuperación del proveedor, o cambiar a un perfil distinto)

No es lo mismo que un fallback exitoso. La degradación es cuando **todos** los fallbacks fallaron.

Señales de degradación:
- Tool calling falla repetidamente en todos los modelos de la cadena
- Todos los modelos de la cadena devuelven timeout
- El proveedor principal está caído y los alternativos también

### Herencia de modelo

La **herencia de modelo** permite definir un perfil base y solo sobrescribir fases específicas. Funciona como las clases en programación:

```yaml
Perfil base "equilibrado":
  sdd-init:     terra
  sdd-explore:  terra
  sdd-propose:  terra
  sdd-spec:     terra
  sdd-design:   sol          # Solo esta fase cambia
  sdd-tasks:    terra
  sdd-apply:    terra
  sdd-verify:   sol          # Y esta
  sdd-archive:  terra

Perfil "potente" hereda de "equilibrado":
  hereda: equilibrado
  sdd-design:   sol          # Sobrescribe
  sdd-verify:   sol          # Sobrescribe
  # El resto hereda de "equilibrado"
```

Esto evita repetir la configuración completa cuando solo necesitás cambiar algunas fases.

### Dashboard /model-config

El slash command `/model-config` abre un dashboard interactivo en OpenCode para asignar modelos por fase SDD. Es la forma visual de crear perfiles sin editar archivos YAML manualmente.

```bash
/model-config
```

El dashboard muestra:
- Las fases SDD disponibles
- El modelo actual asignado a cada fase
- La cadena de fallback configurada
- Opciones para cambiar, agregar o reordenar modelos

Es un **slash command**, no un comando CLI. Se escribe en el chat de OpenCode.

### Perfiles con sync

También podés crear perfiles desde CLI usando `gentle-ai sync`:

```bash
# Crear un perfil durante el sync
gentle-ai sync --profile equilibrado

# Asignar un modelo a una fase específica
gentle-ai sync --profile-phase design=sol
```

Esto sincroniza las reglas de ruteo en los adaptadores configurados.

### Configuración en OpenCode

Los perfiles se traducen a la configuración de `opencode.json`:

```json
{
  "agents": {
    "gentle-orchestrator": {
      "model": "openai/gpt-5.6-sol",
      "reasoningEffort": "high"
    },
    "sdd-apply": {
      "model": "openai/gpt-5.6-terra",
      "reasoningEffort": "medium"
    },
    "sdd-archive": {
      "model": "openai/gpt-5.6-luna",
      "reasoningEffort": "low"
    }
  }
}
```

## Errores frecuentes

1. **Cadena de fallback con un solo proveedor**: si OpenAI cae y todos tus modelos son de OpenAI, no tenés respaldo. Usá al menos 2 proveedores distintos.
2. **Perfil económico para diseño**: ahorrar tokens en fases críticas produce resultados pobres. Usá perfiles baratos solo para init, archive y explore.
3. **No verificar disponibilidad de modelos**: los modelos se deprecan, aparecen nuevos, cambian de precio. Revisá el catálogo periódicamente con `gentle-ai update`.
4. **Confundir herencia con copia**: si modificás el perfil base después de crear el heredero, los cambios NO se propagan automáticamente. La herencia se evalúa al crear el perfil.
5. **Degradación sin notificación**: si toda la cadena falla, el sistema se detiene. Configurá alertas o monitoreo para saber cuándo ocurre.

## Resumen

| Concepto | Definición |
|----------|-----------|
| **Perfil de modelos** | Asignación de modelos por fase SDD (económico, equilibrado, potente) |
| **Fallback** | Modelo de respaldo cuando el principal falla |
| **Cadena de fallback** | Lista ordenada de modelos de respaldo (preferir proveedores distintos) |
| **Degradación** | Estado cuando todos los fallbacks fallaron |
| **Herencia** | Un perfil hereda configuraciones de otro y solo sobrescribe lo necesario |
| **/model-config** | Slash command de OpenCode para asignar modelos visualmente |
| **sync --profile** | Crea perfiles SDD desde CLI |

## Preguntas

1. ¿Cuál es la diferencia entre fallback exitoso y degradación de capacidad?
2. ¿Por qué es importante usar proveedores distintos en una cadena de fallback?
3. ¿Cómo funciona la herencia de modelo entre perfiles?
4. ¿Qué slash command usás para asignar modelos visualmente en OpenCode?
5. Si el perfil "potente" hereda de "equilibrado" y después cambiás "equilibrado", ¿el "potente" se actualiza automáticamente?
6. ¿Qué fase SDD nunca debería usar un perfil económico y por qué?

## Fuentes verificadas

- Repositorio: gentle-ai, commit `ee83e83d56f0d149c52f93fd13b3296858f5147f`
- Archivos: README.md, `docs/architecture/organic-rdd.md`
- Modelos: catálogo verificado en `opencode models` con OpenCode 1.17.20
- Versión verificada: Gentle-AI 2.2.0
- Fecha: 2026-07-28
- Estado: 🟢 Verificado
