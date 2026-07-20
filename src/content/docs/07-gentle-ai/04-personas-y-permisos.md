---
title: Personas y permisos
description: Cómo las personas definen la personalidad del asistente, cómo funcionan los permisos, y cómo configurar perfiles de uso.
level: 2
estimatedTime: 15 min
tags:
  - gentle-ai
  - personas
  - permisos
  - perfiles
  - personalizacion
prerequisites:
  - ¿Qué es Gentle-AI? (07-01)
verifiedVersion: "Gentle-AI 2.1.10"
learningOutcomes:
  - Explicar qué es una persona y cómo afecta las respuestas
  - Listar las personas disponibles y cuándo usar cada una
  - Comprender el sistema de permisos y cómo funciona
  - Distinguir entre presets, perfiles y configuración personalizada
  - Configurar opciones globales vs. específicas de un proyecto
---

# Personas y permisos

## Qué aprenderás

Gentle-AI no solo instala componentes. También define **cómo se comporta tu asistente**: su tono, su personalidad, lo que puede y no puede hacer, y qué tan caro o rápido debe operar.

En este capítulo vas a entender:
- Qué son las personas y cómo afectan las respuestas del asistente
- Las personas disponibles y cuándo conviene usar cada una
- El sistema de permisos: qué puede y no puede hacer Gentle-AI por defecto
- Los presets y perfiles de configuración (económico, balanceado, potente)
- Cómo crear tu propia configuración personalizada
- La diferencia entre configuración global y por proyecto

## Por qué importa

Un asistente sin personalidad da respuestas genéricas. Un asistente sin permisos puede ser peligroso. Un asistente sin perfil económico puede gastar tokens de más.

Las personas, permisos y perfiles son las **tres palancas de control** que tenés sobre tu asistente. Entenderlas te permite ajustar el comportamiento, la seguridad y el costo de tu ecosistema Gentle.

## Explicación simple

**Persona**: un conjunto de instrucciones que definen el tono y la personalidad del asistente. Es como darle un "rol" al asistente: cuando activás la persona `senior-architect`, el asistente responde como un arquitecto senior con 15 años de experiencia.

**Permisos**: reglas que definen qué puede hacer el asistente automáticamente y qué requiere tu aprobación. Por ejemplo, leer archivos no requiere permiso, pero borrarlos sí.

**Perfiles**: configuraciones predefinidas que ajustan el balance entre costo, velocidad y calidad. Un perfil económico usa modelos más baratos; uno potente usa los mejores modelos disponibles.

## Analogía

Imaginá que contratás a un asistente personal para tu proyecto:

- La **persona** es su personalidad: un contador serio, un creativo entusiasta, un ingeniero pragmático. Cada uno te va a dar respuestas con un estilo distinto.
- Los **permisos** son lo que le permitís hacer sin consultarte: puede abrir cajones (leer archivos) pero no puede romper paredes (borrar directorios).
- El **perfil** es su nivel de seniority y costo: podés contratar un junior (económico, respuestas básicas), un semi-senior (balanceado) o un senior (caro pero profundo).

Vos elegís la personalidad, definís los límites, y decidís cuánto estás dispuesto a gastar.

## Cómo funciona realmente

### Personas disponibles

Una **persona** es un conjunto de instrucciones que se inyectan en el system prompt del asistente. Gentle-AI v2.1.10 incluye estas personas:

| Persona | Descripción | Ideal para |
|---------|-------------|-----------|
| **senior-architect** | Arquitecto senior, 15+ años. Enseña conceptos, explica el porqué, corrige con fundamentos. | Proyectos serios, aprendizaje profundo |
| **passionate-teacher** | Profesor apasionado. Explica con entusiasmo, usa analogías, se frustra cuando el alumno no da el máximo. | Aprendizaje guiado, mentorship |
| **code-gardener** | Enfoque en código limpio y mantenible. Prefiere refactorizar antes que agregar. | Mantenimiento, deuda técnica |
| **minimalist** | Respuestas cortas, va al grano. Solo explica si le preguntan. | Ingenieros experimentados, tareas rápidas |
| **default** | Sin personalidad adicional. El asistente se comporta con su configuración nativa. | Cuando no querés personalización |

La persona se configura durante la instalación o manualmente en el archivo de configuración.

**¿Cómo afecta la persona las respuestas?**

Cada persona inyecta instrucciones en el `AGENTS.md` del proyecto. Por ejemplo, la persona `senior-architect` agrega:

```
Eres un arquitecto senior con 15+ años de experiencia.
- Cuando alguien está mal, explícale POR QUÉ con evidencia técnica.
- No des respuestas superficiales. Enseña conceptos, no solo código.
- Usa analogías de arquitectura y construcción cuando ayuden.
- Prioriza fundamentos sobre frameworks.
```

La persona `passionate-teacher` agrega:

```
Eres un profesor apasionado que realmente quiere que la gente aprenda.
- Validá primero que la pregunta tiene sentido.
- Si alguien se equivoca, mostra el camino correcto con ejemplos.
- Usá CAPS para énfasis cuando sea necesario.
- Tu frustración viene de que te importa el crecimiento del otro.
```

### Sistema de permisos

El sistema de **permisos** define qué acciones puede realizar Gentle-AI sin preguntar. Está diseñado con un enfoque de **seguridad por defecto**: el asistiente arranca con capacidades limitadas y se le otorgan permisos explícitos.

| Permiso | ¿Activado por defecto? | ¿Qué permite? |
|---------|----------------------|---------------|
| `read` | ✅ Sí | Leer archivos del proyecto |
| `write` | ❌ No, requiere permiso | Escribir o modificar archivos |
| `execute` | ❌ No, requiere permiso | Ejecutar comandos en la terminal |
| `network` | ❌ No, requiere permiso | Hacer solicitudes de red |
| `delete` | ❌ No, requiere permiso | Borrar archivos o directorios |
| `environment` | ✅ Sí | Leer variables de entorno |

Cuando el asistente necesita hacer algo que no está permitido, muestra un **permission prompt**:

```
¿Puedo modificar el archivo src/config.ts? [S/N]
```

Si respondés que sí, el asistente procede. Si respondés que no, busca una alternativa o se detiene.

Este sistema lo implementa el componente **Permissions**, que escribe reglas en la configuración de tu agente. En OpenCode, se traduce a reglas de `opencode.json`:

```json
{
  "permissions": {
    "read": true,
    "write": "prompt",
    "execute": "prompt"
  }
}
```

Los valores posibles para cada permiso son:
- `true`: permitido sin preguntar
- `"prompt"`: preguntar cada vez (recomendado para acciones destructivas)
- `false`: denegado siempre

### Presets

Los **presets** son configuraciones predefinidas que incluyen selección de componentes, persona y permisos. Son como "recetas" para distintos escenarios.

| Preset | Componentes | Persona | Permisos | Ideal para |
|--------|------------|--------|---------|-----------|
| **minimal** | Engram + SDD | default | read-only + write prompt | Proyectos chicos, aprendizaje |
| **standard** | Engram + SDD + Skills + Context7 + Persona | senior-architect | read ok, write prompt, execute prompt | La mayoría de proyectos |
| **full** | Todos los componentes | senior-architect | read ok, write ok, execute prompt | Proyectos grandes con confianza |
| **security-hardened** | Engram + SDD + Permissions | default | read ok, write prompt, execute prompt, network false | Entornos sensibles |

### Perfiles (economic, balanced, powerful)

Los **perfiles** controlan el **costo y la calidad** de las respuestas del asistente. Afectan qué modelo de IA se usa para cada operación.

| Perfil | Modelo sugerido | Costo relativo | Velocidad | Calidad |
|--------|----------------|---------------|-----------|---------|
| **economic** | Claude Haiku / GPT-4o-mini | Bajo | Rápida | Suficiente para tareas simples |
| **balanced** | Claude Sonnet / GPT-4o | Medio | Media | Bueno para la mayoría de tareas |
| **powerful** | Claude Opus / GPT-4.5 | Alto | Lenta | Máxima calidad para tareas complejas |

El perfil se puede configurar globalmente o por fase SDD. Por ejemplo, podés usar `economic` para `sdd-explore` (solo lectura exploratoria) y `powerful` para `sdd-design` (la fase más crítica).

En la configuración:

```json
{
  "profile": {
    "default": "balanced",
    "phases": {
      "explore": "economic",
      "design": "powerful",
      "apply": "balanced"
    }
  }
}
```

### Configuración global vs. por proyecto

Gentle-AI distingue dos niveles de configuración:

**Global** (`~/.config/gentle-ai/config.json`): afecta a todos los proyectos. Ideal para:
- Persona por defecto
- Perfil por defecto
- Permisos globales
- Preferencias personales

**Workspace** (`.gentle-ai/config.json` en la raíz del proyecto): afecta solo al proyecto actual. Ideal para:
- Persona específica del proyecto
- Perfil específico
- Componentes necesarios para el proyecto
- Permisos adaptados al equipo

La configuración del workspace **hereda** de la global y la **sobrescribe** si hay conflicto.

```bash
# Configuración global
~/.config/gentle-ai/config.json

# Configuración por proyecto
./mi-proyecto/.gentle-ai/config.json
```

### Cómo crear una configuración personalizada

Si los presets no alcanzan, podés crear tu propia configuración editando el archivo directamente:

```json
{
  "persona": "senior-architect",
  "profile": "balanced",
  "permissions": {
    "read": true,
    "write": "prompt",
    "execute": "prompt"
  },
  "components": {
    "engram": true,
    "sdd": true,
    "skills": true,
    "context7": false,
    "persona": true,
    "permissions": true,
    "gga": false
  },
  "theme": "rose-pine"
}
```

O configurando desde la TUI durante `gentle-ai install`, donde podés seleccionar componentes y ver las opciones disponibles.

## Errores frecuentes

1. **Persona incorrecta para el contexto**: si el asistente responde muy extenso cuando querés algo rápido, cambiá a persona `minimalist`. Si respuestas muy cortas cuando necesitás aprendizaje, cambiá a `passionate-teacher`.
2. **Permisos demasiado restrictivos**: si el asistente no puede escribir archivos y estás en medio de un SDD Apply, la implementación se va a frenar constantemente. Ajustá los permisos antes de empezar.
3. **Perfil económico para diseño**: ahorrar tokens en fases críticas (design, verify) produce resultados de baja calidad. Usá perfiles baratos solo para fases exploratorias.
4. **Confundir global con workspace**: si configurás algo en el proyecto y no funciona, verificá si no hay una configuración global que lo esté pisando. La workspace siempre tiene prioridad.
5. **No revisar permisos después de instalar**: la instalación por defecto configura permisos seguros. Si necesitás más permisos, ajustalos explícitamente después de instalar.

## Resumen

| Concepto | ¿Qué es? | Dónde se configura |
|----------|---------|-------------------|
| **Persona** | Personalidad y tono del asistente | `AGENTS.md`, `config.json` |
| **Permiso** | Regla sobre qué puede hacer el asistente | `opencode.json`, `config.json` |
| **Preset** | Configuración predefinida para un escenario | `config.json` (referencia) |
| **Perfil** | Balance costo/velocidad/calidad | `config.json` |
| **Config global** | Afecta a todos los proyectos | `~/.config/gentle-ai/config.json` |
| **Config workspace** | Afecta solo al proyecto actual | `.gentle-ai/config.json` |

## Preguntas

1. ¿Cuál es la diferencia entre una persona y un perfil?
2. ¿Qué permiso está desactivado por defecto y por qué?
3. ¿Qué preset usarías para un proyecto que maneja datos sensibles?
4. ¿Cómo harías para que `sdd-explore` use el perfil económico pero `sdd-design` use el potente?
5. Si tenés configuración global y de workspace, ¿cuál prevalece?

## Fuentes verificadas

- Repositorio: gentle-ai, commit `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d`
- Archivos: `internal/components/persona/`, `internal/components/permissions/`
- Archivos persona: `internal/assets/personas/senior-architect.md`, `internal/assets/personas/passionate-teacher.md`
- Versión verificada: gentle-ai 2.1.10
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
