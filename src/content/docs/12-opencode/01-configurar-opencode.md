---
title: Configurar OpenCode
description: "Cómo configurar OpenCode: opencode.json, asignación de modelos por agente, skills, plugins y comandos."
level: 2
estimatedTime: 45 min
tags:
  - opencode
  - configuración
  - opencode.json
  - agentes
  - modelos
  - skills
prerequisites:
  - ¿Qué es Gentle-AI? (07-01)
  - Skills — Conocimiento especializado (10-01)
verifiedVersion: "OpenCode 1.17.20"
learningOutcomes:
  - Localizar y editar el archivo opencode.json
  - Definir agentes, modelos y permisos
  - Configurar herramientas y comandos slash
  - Instalar skills y plugins desde el registro
  - Integrar Gentle-AI con OpenCode
---

# Configurar OpenCode

## Qué aprenderás

OpenCode es el agente principal del ecosistema Gentle. Soporta subagentes, skills, MCP y una arquitectura de herramientas granular. Todo eso se configura desde un solo archivo: `opencode.json`.

En este capítulo vas a entender:

- Qué es `opencode.json` y dónde vive
- Cómo se definen los agentes internos (orquestador, SDD, revisores)
- Cómo se asigna un modelo y un nivel de razonamiento a cada agente
- Cómo se configuran herramientas y permisos
- Qué son los comandos slash y cómo se usan
- Dónde se instalan los skills y los plugins
- Cómo se integra Gentle-AI con OpenCode

## Por qué importa

OpenCode es el agente más completo del ecosistema: soporta 15 subagentes, permisos granulares y descubrimiento de skills. Pero cada una de esas capacidades exige una configuración explícita en `opencode.json`.

Si no sabés cómo configurarlo, estás usando OpenCode con valores por defecto que quizás no se ajustan a tu proyecto. Un `razonamiento` mal configurado en un agente crítico puede generar errores silenciosos. Una herramienta mal restringida puede exponer archivos sensibles. Un comando slash mal definido puede romper el flujo SDD.

Configurar OpenCode correctamente es la diferencia entre tener un asistente genérico y tener un asistente que entiende tu proyecto, tu presupuesto de modelos y tu flujo de trabajo.

## Explicación simple

OpenCode se configura con un archivo JSON llamado `opencode.json`. Ese archivo le dice a OpenCode:

- **Qué modelos usar** y para qué tareas (explorar, diseñar, implementar, revisar)
- **Qué herramientas** cada agente puede usar (escribir archivos, ejecutar comandos, navegar el código)
- **Qué comandos** están disponibles (como `/sdd-new` o `/sdd-continue`)
- **Dónde están los skills** instalados

No hay interfaz gráfica. Todo se escribe a mano en el JSON. Pero una vez que entendés la estructura, es predecible.

## Analogía

Imaginá que OpenCode es una empresa de consultoría. Tiene varios empleados (agentes), cada uno con un rol específico. Un empleado explora proyectos nuevos (`sdd-explore`), otro escribe las especificaciones (`sdd-spec`), otro diseña la arquitectura (`sdd-design`), otro implementa (`sdd-apply`), y otro revisa el resultado (`sdd-verify`).

`opencode.json` es el **contrato de la empresa**: define qué empleados existen, qué herramientas puede usar cada uno (un diseñador no necesita acceso a producción), qué presupuesto de modelo tiene cada rol, y qué comandos rápidos están disponibles.

## Cómo funciona realmente

### El archivo `opencode.json`

OpenCode busca su configuración en `~/.config/opencode/opencode.json` (Linux/macOS) o en la ruta equivalente en Windows. También puede leer un `opencode.json` local en el proyecto si existe.

La estructura raíz tiene estas secciones principales:

| Sección | Propósito | ¿Obligatoria? |
|---------|-----------|---------------|
| `agents` | Define los subagentes, su modelo y herramientas | Sí |
| `commands` | Comandos slash que el usuario puede invocar | No |
| `skills` | Habilita o deshabilita habilidades instaladas | Sí |
| `permissions` | Reglas de permisos globales y por agente | No |
| `theme` | Tema visual | No |
| `mcpServers` | Servidores MCP (Model Context Protocol) | No |

### Definición de agentes

Cada agente es un objeto dentro de `agents`. OpenCode 1.17.20 soporta estos agentes internos:

| Agente | Rol | ¿Cuándo se usa? |
|--------|-----|-----------------|
| `gentle-orchestrator` | Orquestador | Coordina el flujo SDD completo |
| `sdd-init` | Inicializador | Prepara el proyecto para SDD |
| `sdd-explore` | Explorador | Investiga el codebase sin hacer cambios |
| `sdd-propose` | Proponente | Redacta la propuesta de cambio |
| `sdd-spec` | Especificador | Escribe especificaciones detalladas |
| `sdd-design` | Diseñador | Diseña la arquitectura técnica |
| `sdd-tasks` | Planificador | Divide el diseño en tareas |
| `sdd-apply` | Implementador | Ejecuta las tareas y escribe código |
| `sdd-verify` | Verificador | Valida que el código cumpla la especificación |
| `sdd-archive` | Archivador | Cierra el cambio y sincroniza |
| `sdd-onboard` | Onboarding | Guía al usuario en el flujo SDD |
| `review-risk` | Revisor de riesgo | Evalúa impacto y seguridad |
| `jd-judge-a` | Juez A (Judgment Day) | Primera opinión en doble revisión |
| `jd-judge-b` | Juez B (Judgment Day) | Segunda opinión independiente |
| `jd-fix-agent` | Agente de reparación | Corrige basado en feedback de los jueces |

Cada agente se define así:

```json
{
  "agents": {
    "gentle-orchestrator": {
      "model": "openai/gpt-5.6-sol",
      "reasoningEffort": "high",
      "tools": ["read", "grep", "glob", "task"],
      "permissions": ["allow-write"]
    }
  }
}
```

### Asignación de modelos por agente

Cada agente recibe un modelo específico. OpenCode soporta dos formas de especificar el modelo:

| Formato | Ejemplo | Proveedor |
|---------|---------|-----------|
| `provider/model` | `openai/gpt-5.6-sol` | OpenAI, Anthropic, Google (vía API directa) |
| `openrouter/provider/model` | `openrouter/anthropic/claude-sonnet-5` | OpenRouter (múltiples proveedores) |
| `opencode-go/model` | `opencode-go/deepseek-v4-pro` | OpenCode Go (modelos integrados) |

El nivel de razonamiento (`reasoningEffort`) controla cuánto "piensa" el modelo antes de responder. Los valores posibles dependen del proveedor:

| Valor | Cuándo usarlo | Ejemplo de agente |
|-------|---------------|-------------------|
| `low` | Tareas mecánicas, formateo, archive | `sdd-archive`, `sdd-init` |
| `medium` | Código estándar, especificaciones | `sdd-spec`, `sdd-tasks` |
| `high` | Arquitectura, revisión crítica | `sdd-design`, `sdd-verify` |

### Configuración de herramientas por agente

Cada agente puede tener acceso a un subconjunto de herramientas. Las herramientas disponibles son:

| Herramienta | ¿Qué hace? | ¿Riesgo? |
|-------------|-----------|----------|
| `bash` | Ejecuta comandos en la terminal | Alto (puede modificar el sistema) |
| `write` | Escribe archivos | Alto (puede sobrescribir) |
| `edit` | Edita archivos existentes | Medio |
| `read` | Lee archivos | Bajo |
| `glob` | Busca archivos por patrón | Bajo |
| `grep` | Busca contenido en archivos | Bajo |
| `task` | Delega trabajo a otro agente | Medio |
| `mcp` | Accede a servidores MCP | Medio |

Un agente sin herramientas de escritura no puede modificar archivos. Esto es útil para agentes de solo lectura como `sdd-explore` o `review-*`:

```json
{
  "agents": {
    "sdd-explore": {
      "model": "openai/gpt-5.6-terra",
      "tools": ["read", "grep", "glob", "task"],
      "permissions": ["deny-write"]
    }
  }
}
```

### Sistema de permisos

El sistema de permisos usa reglas `allow` y `deny` con patrones glob. Se pueden definir a nivel global y por agente:

```json
{
  "permissions": {
    "global": {
      "allow": ["**/*"],
      "deny": ["**/secrets/**", "**/.env", "**/node_modules/**"]
    },
    "overrides": {
      "sdd-apply": {
        "allow": ["src/**/*", "tests/**/*"]
      }
    }
  }
}
```

### Comandos slash

Los **comandos slash** son accesos directos que escribís en el chat de OpenCode precedidos por `/`. Se definen en la sección `commands`:

```json
{
  "commands": {
    "sdd-init": {
      "description": "Inicializa SDD en el proyecto",
      "agent": "sdd-init",
      "prompt": "Inicializa SDD para este proyecto"
    },
    "sdd-new": {
      "description": "Crea una nueva propuesta de cambio",
      "agent": "sdd-propose",
      "prompt": "Crea una propuesta de cambio SDD"
    },
    "sdd-continue": {
      "description": "Continúa el flujo SDD desde donde quedó",
      "agent": "gentle-orchestrator",
      "prompt": "Continúa el flujo SDD actual"
    },
    "sdd-ff": {
      "description": "Avanza una fase SDD manualmente",
      "agent": "gentle-orchestrator",
      "prompt": "Avanza a la siguiente fase SDD"
    }
  }
}
```

Cada comando ejecuta un agente específico con un prompt predefinido.

### Skills y plugins

OpenCode carga skills desde directorios específicos. Los skills son conjuntos de instrucciones que extienden las capacidades del agente.

**Skills instalados por Gentle-AI**: se ubican en `~/.config/opencode/skills/`. Cada skill tiene un archivo `SKILL.md` que define su trigger y su comportamiento.

**Plugins**: son paquetes instalables que agregan funcionalidad. Se instalan desde el registro de plugins de OpenCode. La sección `skills` en `opencode.json` habilita o deshabilita skills:

```json
{
  "skills": {
    "enabled": ["sdd-*", "engram-agent", "judgment-day"],
    "disabled": ["canvas-design"]
  }
}
```

### Servidores MCP

OpenCode soporta el **Model Context Protocol** (MCP), un estándar para conectar agentes con herramientas externas como Engram. Se configuran en `mcpServers` con comando, argumentos y variables de entorno.

### Integración con Gentle-AI

Gentle-AI automatiza la configuración de OpenCode. Al ejecutar `gentle-ai install`, Gentle-AI:

1. Detecta que OpenCode está instalado
2. Genera la configuración de agentes en `opencode.json`
3. Instala skills en `~/.config/opencode/skills/`
4. Configura comandos slash para SDD
5. Establece permisos por defecto

Después de la instalación, se puede sincronizar la configuración con:

```bash
# Sincronizar skills y comandos
gentle-ai sync

# Diagnosticar problemas de configuración
gentle-ai doctor
```

### Ejemplo: configuración mínima de producción

Los agentes de alto riesgo usan modelo frontier y razonamiento alto. Los mecánicos usan modelo económico. El orquestador solo necesita herramientas de lectura y delegación:

```json
{
  "agents": {
    "gentle-orchestrator": {
      "model": "openai/gpt-5.6-sol",
      "reasoningEffort": "high",
      "tools": ["read", "grep", "glob", "task"]
    },
    "sdd-design": {
      "model": "openai/gpt-5.6-sol",
      "reasoningEffort": "high",
      "tools": ["read", "write", "glob", "grep"]
    },
    "sdd-verify": {
      "model": "openai/gpt-5.6-sol",
      "reasoningEffort": "high",
      "tools": ["read", "glob", "grep", "bash"]
    },
    "sdd-apply": {
      "model": "openai/gpt-5.6-terra",
      "reasoningEffort": "medium",
      "tools": ["read", "write", "edit", "glob", "grep", "bash"]
    },
    "sdd-archive": {
      "model": "openai/gpt-5.6-luna",
      "reasoningEffort": "low",
      "tools": ["read", "write", "glob", "grep"]
    }
  },
  "skills": {
    "enabled": ["sdd-*", "engram-agent", "judgment-day"]
  },
  "permissions": {
    "global": {
      "allow": ["**/*"],
      "deny": ["**/secrets/**", "**/*.env", "**/node_modules/**"]
    }
  }
}
```

## Errores frecuentes

1. **Agente sin herramientas de escritura en `sdd-apply`**: el implementador no puede escribir archivos. Toda implementación falla silenciosamente. Verificá que `sdd-apply` tenga `write` y `edit` habilitados.

2. **Mismo modelo y razonamiento para todos los agentes**: estás pagando de más por tareas mecánicas o rindiendo de menos en tareas críticas. Diferenciá modelos por rol.

3. **Comando slash sin agente definido**: definís `/sdd-new` pero el agente `sdd-propose` no existe en `agents`. OpenCode no ejecuta nada y no da error claro. Revisá que cada comando tenga su agente correspondiente.

4. **Skills deshabilitados por defecto**: instalás Gentle-AI pero los skills no se cargan. Ejecutá `gentle-ai sync` para sincronizar la configuración de skills en `opencode.json`.

5. **Ruta incorrecta de `opencode.json`**: OpenCode no encuentra la configuración porque el archivo está en `~/.config/opencode/opencode.json` y no en `~\.opencode\opencode.json`. Verificá la ubicación exacta.

## Preguntas

1. ¿Qué sección de `opencode.json` define qué herramientas puede usar un agente?
2. ¿Por qué `sdd-apply` necesita herramientas de escritura pero `sdd-explore` no?
3. ¿Cuál es la diferencia entre un comando slash y un agente?
4. ¿Qué hace `gentle-ai sync` después de instalar los componentes?
5. ¿Cómo se configura un servidor MCP en OpenCode?

## Fuentes verificadas

- Repositorio: OpenCode 1.17.20, documentación oficial
- Archivos de referencia: `~/.config/opencode/opencode.json` (instalación con Gentle-AI)
- Integración: gentle-ai 2.1.10, comando `gentle-ai install` y `gentle-ai sync`
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
