---
title: "Gentle-AI como configurador de ecosistema"
description: "Cómo Gentle-AI actúa como configurador sobre distintos hosts (OpenCode, Codex, Claude Code): assets administrados, runtime, y diferencias entre plataformas."
level: 3
estimatedTime: 25 min
tags:
  - arquitectura
  - gentle-ai
  - hosts
  - runtime
  - assets
  - configuración
  - adaptadores
prerequisites:
  - "Arquitectura técnica (16-01)"
  - "Componentes y agentes (07-03)"
verifiedVersion: "Gentle-AI 2.2.0"
learningOutcomes:
  - Explicar por qué Gentle-AI es un configurador de ecosistema, no un agente
  - Describir qué es un host y cómo se diferencian los hosts soportados
  - Distinguir entre runtime del host y runtime de los assets
  - Identificar los assets administrados que Gentle-AI gestiona
  - Explicar cómo el adaptador conoce las capacidades de cada host
---

# Gentle-AI como configurador de ecosistema

## Qué aprenderás

Gentle-AI no es un agente de IA, ni un modelo, ni un IDE. Es un **configurador de ecosistema**: un programa que prepara tu host (OpenCode, Codex, Claude Code, etc.) para que pueda usar componentes del ecosistema Gentle.

En este capítulo vas a entender:
- Por qué Gentle-AI es un configurador, no un agente ni un runtime
- Qué es un **host** y qué hosts soporta
- La diferencia entre el **runtime del host** y el **runtime de los assets**
- Qué es un **asset administrado** y cómo Gentle-AI lo gestiona
- Cómo los adaptadores conocen las capacidades de cada host
- La relación entre configurador, host y assets

## Por qué importa

Sin entender el rol de Gentle-AI como configurador, es fácil confundir sus responsabilidades: esperar que Gentle-AI ejecute código (no lo hace), que sea un runtime (no lo es), o que funcione igual en todos los hosts (no funciona igual).

Cada host tiene capacidades distintas: algunos soportan subagentes, otros no; algunos leen skills del sistema de archivos, otros los cargan de forma distinta. Gentle-AI adapta su configuración según las capacidades del host detectado. Entender esta relación es clave para diagnosticar por qué un componente funciona en OpenCode pero no en Codex, o por qué un comando no está disponible en un host específico.

## Explicación simple

**Gentle-AI** es un programa que prepara tu asistente de código para trabajar con el ecosistema Gentle. No ejecuta agentes, no corre modelos, no es un IDE. Su trabajo es: detectar qué asistente usás (OpenCode, Codex, Claude Code, etc.), instalar componentes (Engram, SDD, Skills, etc.) y sincronizar configuraciones.

El **host** es el asistente de código que usás. Es quien ejecuta los agentes, corre los modelos, carga los skills. Gentle-AI configura al host, no lo reemplaza.

El **runtime** es el entorno donde el host se ejecuta: Node.js para OpenCode, Python para Codex, etc. Los **assets administrados** son los componentes que Gentle-AI instala sobre el host: skills, configuraciones, system prompts, hooks.

Pensalo como instalar programas en una computadora: Gentle-AI es el instalador, el host es la computadora, el runtime es el sistema operativo, y los assets son los programas instalados.

## Analogía

Imaginá una **consola de videojuegos**:

- **Gentle-AI** es el que compra los juegos, los instala en la consola y configura los controles. No juega, solo prepara.
- El **host** es la consola misma (PlayStation, Xbox, Nintendo Switch). Cada consola tiene capacidades distintas.
- El **runtime** es el sistema operativo de la consola (Node.js, Python, Go). Sin él, los juegos no funcionan.
- Los **assets administrados** son los juegos instalados: cada uno agrega una capacidad nueva (Engram es un juego de memoria, SDD es un juego de estrategia, Skills son expansiones).

Gentle-AI sabe en qué consola está instalando y adapta la instalación: en una PlayStation instala de una forma, en una Xbox de otra. No todas las consolas soportan todos los juegos.

## Cómo funciona realmente

### Gentle-AI como configurador

Gentle-AI no es un runtime ni un agente. Es un **configurador de ecosistema** porque:

1. **No ejecuta agentes**: los agentes los ejecuta el host (OpenCode, Codex, etc.)
2. **No corre modelos**: los modelos los llama el agente a través del host
3. **No es un servidor**: no abre puertos de red, no corre como daemon
4. **No tiene estado interno**: el estado lo persisten el host y Engram
5. **Solo configura**: instala, sincroniza, actualiza, verifica

Lo que realmente hace es **escribir archivos de configuración** en los directorios del host y **copiar skills** a las rutas que el host espera.

### Hosts soportados

Un **host** es cualquier asistente de código con IA que Gentle-AI puede configurar. Gentle-AI v2.2.0 soporta 16 hosts. Cada host tiene un **adaptador** que implementa la interfaz `Adapter` y sabe:

- Cómo detectar si el host está instalado
- Dónde están sus directorios de configuración
- Qué estrategia usa para system prompts, MCP, skills y subagentes
- Si soporta slash commands y subagentes

| Host | Directorio de configuración | Subagentes | MCP | Skills | Runtime |
|------|---------------------------|-----------|-----|--------|---------|
| **OpenCode** | `~/.config/opencode/` | ✅ | ✅ | ✅ | Node.js |
| **Codex CLI** | `~/.codex/` | ❌ (experimental) | ✅ | ✅ | Python |
| **Claude Code** | `~/.claude/` | ✅ | ✅ | ✅ | Node.js |
| **Gemini CLI** | `~/.gemini/` | ❌ | ✅ | ✅ | Python |
| **Cursor** | `~/.cursor/` | ✅ | ✅ | ✅ | Node.js |
| **VS Code Copilot** | `~/.copilot/` | ✅ | ✅ | ✅ | Node.js |
| **Kilo Code** | `~/.config/kilo/` | ✅ | ✅ | ✅ | Node.js |
| **Kimi Code** | `~/.kimi/` | ✅ | ✅ | ✅ | ? |
| **Qwen Code** | `~/.qwen/` | ❌ | ✅ | ✅ | ? |
| **Kiro IDE** | `~/.kiro/` | ✅ | ✅ | ✅ | Node.js |
| **Antigravity** | `~/.gemini/antigravity-cli/` | ❌ | ✅ | ✅ | Node.js |
| **Windsurf** | `~/.codeium/windsurf/` | ❌ | ✅ | ✅ | ? |
| **OpenClaw** | `~/.openclaw/` | ❌ | ✅ | ✅ | ? |
| **Pi** | `~/.pi/` | ✅ | ✅ | ✅ | Node.js |
| **Trae IDE** | `~/.trae/` | ❌ | ✅ | ✅ | ? |
| **Hermes** | `~/.hermes/` | ❌ (delegate_task) | ✅ | ✅ | Node.js |

La diferencia clave: los hosts que soportan **subagentes** pueden ejecutar el flujo SDD completo (explore, propose, design, spec, tasks, apply, verify, archive). Los que no, dependen del orquestador para todo.

### Runtime del host vs runtime de los assets

El **runtime del host** es el entorno donde el host se ejecuta: Node.js, Python, Go. Gentle-AI no modifica esto. Si OpenCode necesita Node.js 18+, Gentle-AI no lo instala ni lo actualiza.

El **runtime de los assets** es el entorno que cada componente necesita para funcionar:

| Asset (componente) | Runtime | ¿Gentle-AI lo instala? |
|-------------------|---------|----------------------|
| Engram | Binario Go | Sí (descarga o go install) |
| SDD | Skills declarativos (archivos md) | Sí (copia skills) |
| Skills | Archivos markdown | Sí (copia archivos) |
| Context7 | Skill MCP de documentación | Sí |
| GGA | Bash (hooks de Git) | Sí (instala en .git/hooks/) |
| Persona | System prompt en AGENTS.md | Sí (inyecta texto) |
| Permissions | Reglas en opencode.json | Sí (escribe JSON) |
| Theme | Archivos de tema visual | Sí (copia archivos) |

### Assets administrados

Un **asset administrado** es cualquier archivo o configuración que Gentle-AI instala, actualiza o remueve en el host. Cada asset tiene:

- **Origen**: el archivo empaquetado en el binario de Gentle-AI o descargado de GitHub
- **Destino**: la ruta exacta donde debe instalarse en el sistema de archivos del host
- **Estrategia de instalación**: copia directa, inyección en archivo existente, merge JSON
- **Estrategia de rollback**: qué deshacer si la instalación falla
- **Dependencias**: qué otros assets debe tener instalados antes

El conjunto de assets administrados que Gentle-AI gestiona son los **10 componentes**: Engram, SDD, Skills, Context7, Persona, Permissions, GGA, Theme, Claude Theme, Logo.

Cada asset se puede activar o desactivar independientemente. Gentle-AI conoce las dependencias entre assets y las respeta al instalar o remover.

### Cómo el adaptador conoce las capacidades del host

Cada host implementa un **adaptador** que expone:

```go
type Adapter interface {
    ID() string                    // Ej: "opencode", "codex"
    Detect() bool                  // ¿Está instalado?
    ConfigDir() string             // ¿Dónde está su configuración?
    SupportsSubAgents() bool       // ¿Tiene subagentes?
    SupportsMCP() bool             // ¿Soporta MCP?
    SupportsSlashCommands() bool   // ¿Tiene slash commands?
    InstallStrategy() Strategy     // ¿Cómo se instalan assets?
    MCPStrategy() MCPStrategy      // ¿Cómo se configura MCP?
}
```

Gentle-AI itera sobre todos los adaptadores registrados, detecta cuál está presente, y usa el primero que encuentra. Con las capacidades reportadas, decide qué componentes instalar y cómo configurarlos. Por ejemplo, si el host no soporta subagentes, Gentle-AI no instala skills que dependan de subagentes.

### Relación entre los tres niveles

```
Gentle-AI (configurador)
  ↓ escribe configuraciones y copia assets
Host (OpenCode, Codex, Claude Code, etc.)
  ↓ ejecuta agentes y carga configuración
Assets (Engram, SDD, Skills, etc.)
  ↓ se ejecutan en el runtime del asset
Runtime (Node.js, Go, Bash)
```

Gentle-AI → configura → Host → ejecuta → Assets → corren en → Runtime

## Errores frecuentes

1. **Esperar que Gentle-AI ejecute código**: Gentle-AI no ejecuta agentes ni corre modelos. Solo configura. Si un componente no funciona, no es que Gentle-AI lo haya instalado mal (aunque puede pasar), es que el host no lo está cargando correctamente.
2. **Confundir host con runtime**: el host es el asistente de código (OpenCode), el runtime es Node.js. Si OpenCode no funciona, no es lo mismo que Node.js no esté instalado.
3. **Asumir que todos los hosts tienen las mismas capacidades**: Codex no soporta subagentes (excepto experimentalmente). Si tu flujo requiere subagentes, no podés usar Codex.
4. **Instalar assets que el host no puede cargar**: si el host no soporta MCP, instalar Context7 no sirve de nada. Gentle-AI debería detectarlo, pero no siempre es perfecto.
5. **Runtime incorrecto**: algunos assets requieren Go (Engram) o Bash (GGA). Si el runtime no está en el PATH, el asset no funciona aunque esté instalado.

## Resumen

| Concepto | Definición |
|----------|-----------|
| **Configurador** | Gentle-AI prepara el host, no ejecuta agentes |
| **Host** | Asistente de código (OpenCode, Codex, Claude Code, etc.) |
| **Runtime del host** | Entorno donde el host se ejecuta (Node.js, Python) |
| **Runtime del asset** | Entorno donde el componente se ejecuta (Go, Bash) |
| **Asset administrado** | Componente instalable: origen, destino, estrategia, dependencias |
| **Adaptador** | Código que sabe cómo configurar un host específico |

## Preguntas

1. ¿Por qué Gentle-AI es un configurador y no un runtime?
2. ¿Cuántos hosts soporta Gentle-AI v2.2.0?
3. ¿Cuál es la diferencia entre el runtime del host y el runtime de un asset?
4. ¿Qué es un asset administrado y qué información necesita para instalarse?
5. Si un host no soporta subagentes, ¿qué consecuencias tiene para el flujo SDD?
6. ¿Qué host usarías si necesitás subagentes, MCP y skills?

## Fuentes verificadas

- Repositorio: gentle-ai, commit `ee83e83d56f0d149c52f93fd13b3296858f5147f`
- Archivos: `internal/agents/agent.go`, `internal/agents/opencode.go`, `internal/agents/codex.go`
- Fuente: README.md (lista de agentes soportados, v2.2.0)
- Versión verificada: Gentle-AI 2.2.0
- Fecha: 2026-07-28
- Estado: 🟢 Verificado
