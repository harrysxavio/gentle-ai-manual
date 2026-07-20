---
title: Componentes y agentes
description: Los 10 componentes que instala Gentle-AI y los 16 agentes que soporta. Arquitectura interna, tipos de agente y pipeline.
level: 2
estimatedTime: 25 min
tags:
  - gentle-ai
  - componentes
  - agentes
  - pipeline
  - arquitectura
prerequisites:
  - ¿Qué es Gentle-AI? (07-01)
verifiedVersion: "Gentle-AI 2.1.10"
learningOutcomes:
  - Nombrar los 10 componentes de Gentle-AI y qué hace cada uno
  - Identificar los 16 agentes soportados y sus tipos
  - Explicar los roles de agente: orchestrator, executor, explorer, reviewer
  - Comprender cómo fluye un comando a través del pipeline
  - Activar o desactivar componentes según el perfil del proyecto
---

# Componentes y agentes

## Qué aprenderás

Gentle-AI no es un monolito. Está compuesto de **componentes** (módulos que se instalan sobre tu agente) y soporta distintos **agentes** (asistentes de código con IA). Además, dentro de su arquitectura existen **tipos de agente** con roles específicos.

En este capítulo vas a entender:
- Los 10 componentes que Gentle-AI puede instalar
- Los 16 agentes que soporta y cómo se diferencian
- Los 4 roles de agente en la arquitectura (orquestador, ejecutor, explorador, revisor)
- Cómo fluye un comando a través del planner y pipeline
- Cómo se organiza la TUI con Bubbletea

## Por qué importa

El ecosistema Gentle no es "un programa que hace todo". Es una **arquitectura de componentes intercambiables** que se ensamblan según las necesidades de cada proyecto.

Saber qué componentes existen y para qué sirve cada uno te permite:
- Decidir qué instalar y qué no (no todo proyecto necesita todo)
- Entender qué hace cada pieza cuando algo falla
- Diagnosticar problemas de configuración entre componentes
- Elegir el agente correcto para tu flujo de trabajo

## Explicación simple

Gentle-AI hace dos cosas fundamentales:

1. **Instala componentes** sobre tu asistente de código. Cada componente agrega una capacidad: memoria persistente (Engram), flujo de desarrollo (SDD), skills curados, personalidad, seguridad, etc.

2. **Configura tu asistente** para que pueda usar esos componentes. Dependiendo del agente que uses (OpenCode, Codex, Claude Code, etc.), la configuración se escribe en lugares distintos.

Imaginate que tu asistente de código es una computadora recién formateada. Gentle-AI es el que instala los programas que necesitás: el navegador (Context7), el IDE (SDD), el bloc de notas persistente (Engram), el asistente personal (Persona), etc.

## Analogía

Pensá en Gentle-AI como el **sistema operativo** de un ecosistema de desarrollo. Los **componentes** son las aplicaciones que instalás (cada una hace una cosa específica). Los **agentes** son los usuarios que pueden usar esas aplicaciones (cada usuario tiene preferencias y capacidades distintas). Los **roles de agente** son los permisos que le das a cada usuario: administrador (orquestador), editor (ejecutor), investigador (explorador), revisor (revisor).

No todos los usuarios necesitan todas las aplicaciones, y no todas las aplicaciones funcionan con todos los usuarios.

## Cómo funciona realmente

### Los 10 componentes

Cada **componente** es un conjunto de archivos (skills, configuraciones, system prompts) que Gentle-AI inyecta en la configuración de tu agente.

| Componente | Propósito | ¿Qué archivos instala? | ¿Se puede desactivar? |
|-----------|-----------|----------------------|----------------------|
| **Engram** | Memoria persistente entre sesiones | `~/.config/opencode/skills/engram-agent/`, `AGENTS.md` | Sí |
| **SDD** | Flujo de desarrollo guiado por especificaciones | `./openspec/`, skills `sdd-*` | Sí |
| **Skills** | Biblioteca de skills curados para SDD | `~/.config/opencode/skills/` (10+ skills) | Sí |
| **Context7** | Documentación actualizada de librerías | `~/.config/opencode/skills/context7/` | Sí |
| **Persona** | Personalidad y tono del asistente | `AGENTS.md` (injecta reglas de personalidad) | Sí |
| **Permissions** | Reglas de seguridad y permisos por defecto | `opencode.json` (reglas de permisos) | Sí |
| **GGA** | Hooks de revisión automática antes de commit | `.git/hooks/pre-commit`, binario `gga.exe` | Sí |
| **Theme** | Tema visual Rose Pine para OpenCode | `~/.config/opencode/theme/` | Sí |
| **Claude Theme** | Tema visual para Claude Code | `~/.claude/themes/` | Sí |
| **OpenCode Logo** | Logo personalizado en OpenCode | `~/.config/opencode/logo/` | Sí |

Cada componente se puede activar o desactivar independientemente durante `gentle-ai install` o `gentle-ai uninstall`. Las dependencias entre componentes están definidas en el planner:

- SDD depende de Engram (sin memoria, no puede persistir artefactos)
- Skills depende de SDD (los skills son inputs para SDD)
- Persona se ejecuta antes que SDD y Engram (para no sobrescribir configuraciones de personalidad)

### Los 16 agentes soportados

Un **agente** es el asistente de código con IA que usás. Gentle-AI v2.1.10 soporta 16 agentes. Cada uno tiene un adaptador que sabe cómo instalar componentes en ese agente específico.

| Agente | Configuración | Subagentes | MCP | Skills |
|--------|--------------|-----------|-----|--------|
| **OpenCode** | `~/.config/opencode/` | ✅ | ✅ | ✅ |
| **Codex CLI** | `~/.codex/` | ❌ (experimental) | ✅ | ✅ |
| **Claude Code** | `~/.claude/` | ✅ | ✅ | ✅ |
| **Gemini CLI** | `~/.gemini/` | ❌ | ✅ | ✅ |
| **Cursor** | `~/.cursor/` | ✅ | ✅ | ✅ |
| **VS Code Copilot** | `~/.copilot/` | ✅ | ✅ | ✅ |
| **Kilo Code** | `~/.config/kilo/` | ✅ | ✅ | ✅ |
| **Kimi Code** | `~/.kimi/` | ✅ | ✅ | ✅ |
| **Qwen Code** | `~/.qwen/` | ❌ | ✅ | ✅ |
| **Kiro IDE** | `~/.kiro/` | ✅ | ✅ | ✅ |
| **Antigravity** | `~/.gemini/antigravity-cli/` | ❌ | ✅ | ✅ |
| **Windsurf** | `~/.codeium/windsurf/` | ❌ | ✅ | ✅ |
| **OpenClaw** | `~/.openclaw/` | ❌ | ✅ | ✅ |
| **Pi** | `~/.pi/` | ✅ | ✅ | ✅ |
| **Trae IDE** | `~/.trae/` | ❌ | ✅ | ✅ |
| **Hermes** | `~/.hermes/` | ❌ (delegate_task) | ✅ | ✅ |

La diferencia clave está en si el agente soporta **subagentes** (la capacidad de delegar tareas a otros agentes especializados). OpenCode, Claude Code, Cursor, Copilot, Kilo Code, Kiro, Pi y Kimi lo soportan. Los demás no, lo que limita su capacidad de ejecutar el flujo SDD completo.

### Los 4 roles de agente

En la arquitectura Gentle, los agentes no son todos iguales. Cumplen 4 roles:

| Rol | ¿Qué hace? | ¿Quién lo ocupa? | ¿Tiene acceso a herramientas? |
|-----|-----------|-----------------|------------------------------|
| **Orchestrator** | Coordina fases, delega trabajo, mantiene el estado del DAG | `gentle-orchestrator` (skill integrado) | Lectura de estado, decisión de ruteo |
| **Executor** | Ejecuta una fase específica (explorar, proponer, diseñar, implementar, verificar) | `sdd-explore`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive` | Lectura/escritura de archivos, ejecución de tests |
| **Explorer** | Investiga el codebase sin comprometerse a cambios | `sdd-explore` (es tanto executor como explorer) | Solo lectura de código |
| **Reviewer** | Revisa el código implementado contra la especificación | `sdd-verify` (actúa como revisor) | Lectura de código, ejecución de tests |

El orquestador es el cerebro. No escribe código. Su trabajo es decidir **qué fase ejecutar, qué subagente debe ejecutarla, y qué hacer cuando una fase falla**.

### Cómo fluye un comando

Cuando ejecutás un meta-command como `/sdd-new` o `/sdd-continue`, el flujo es:

```
Usuario → Orquestador → Planner → Pipeline → Subagente → Resultado → Orquestador → Usuario
```

1. **Usuario** invoca un meta-command en el chat del asistente
2. **Orquestador** (gentle-orchestrator) recibe el comando
3. El orquestador lee el estado actual del cambio SDD
4. **Planner** determina cuál es la siguiente fase a ejecutar
5. El orquestador lanza el **subagente** de esa fase
6. El **subagente** ejecuta su trabajo (explora, especifica, diseña, etc.)
7. El subagente devuelve un resultado al orquestador
8. El **orquestador** persiste el resultado y decide el siguiente paso
9. El resultado llega al **usuario**

Para un comando CLI como `gentle-ai install`, el flujo es más simple:

```
Terminal → cmd/gentle-ai → internal/cli/install → internal/planner → internal/pipeline → internal/components
```

### Cómo se habilitan y deshabilitan componentes

Desde CLI:

```bash
# Instalar componentes específicos
gentle-ai install

# En la TUI, seleccionás con espacio los que querés
gentle-ai

# Desinstalar componentes específicos
gentle-ai uninstall
# → Te muestra la lista de instalados, seleccionás los que querés sacar

# Desinstalar todo
gentle-ai uninstall --all
```

El estado de instalación se persiste en `~/.config/gentle-ai/state.json`. Gentle-AI lee este archivo para saber qué está instalado y qué no.

### La TUI y Bubbletea

La TUI de Gentle-AI está construida con **Bubbletea**, un framework de Go para interfaces de terminal. Bubbletea usa el patrón **Model-Update-View** (similar a Elm o Redux):

- **Model**: el estado actual (qué componentes existen, cuáles están seleccionados, posición del cursor)
- **Update**: función que recibe mensajes (teclas presionadas) y devuelve un nuevo modelo
- **View**: función que renderiza el modelo como texto en pantalla

El bucle es: el usuario presiona una tecla → Update recibe el mensaje → modifica el modelo → View redibuja la pantalla.

Esto hace que la TUI sea:
- **Predecible**: el estado siempre está en el modelo
- **Testeable**: podés probar Update sin interfaz
- **Rápida**: solo redibuja lo que cambió

## Errores frecuentes

1. **Componente no encontrado**: `gentle-ai install` no muestra un componente que esperabas. Probablemente ya está instalado o no es compatible con tu agente. Ejecutá `gentle-ai doctor` para diagnosticar.
2. **Agente no detectado**: "No supported agent found". Instalá primero OpenCode, Codex o Claude Code antes de ejecutar Gentle-AI.
3. **Subagente no disponible**: el orquestador no puede delegar una fase porque tu agente no soporta subagentes. Usá un agente compatible (OpenCode, Claude Code, Cursor, etc.).
4. **Skills no cargados**: instalaste SDD pero los skills no aparecen. Verificá que SDD esté instalado y ejecutá `gentle-ai sync`.
5. **Confundir componentes con agentes**: los componentes son módulos que se instalan; los agentes son los asistentes de código. No son lo mismo.

## Resumen

| Concepto | ¿Qué es? |
|----------|---------|
| **Componente** | Módulo instalable que agrega una capacidad |
| **Agente** | Asistente de código con IA (OpenCode, Codex, etc.) |
| **Orquestador** | Coordina fases SDD, no escribe código |
| **Subagente** | Ejecuta una fase específica |
| **Planner** | Calcula el orden de operaciones según dependencias |
| **Pipeline** | Ejecuta operaciones con prepare/apply/rollback |
| **Bubbletea** | Framework Go para interfaces de terminal |

## Preguntas

1. ¿Cuántos componentes puede instalar Gentle-AI v2.1.10?
2. ¿Qué componente es requisito para que SDD funcione?
3. ¿Cuál es la diferencia entre un orquestador y un subagente?
4. ¿Qué agente NO soporta subagentes?
5. ¿Para qué sirve el archivo `state.json`?

## Fuentes verificadas

- Repositorio: gentle-ai, commit `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d`
- Archivos: `internal/components/`, `internal/agents/`, `internal/planner/`, `internal/pipeline/`
- Framework: Bubbletea (documentación oficial, `github.com/charmbracelet/bubbletea`)
- Versión verificada: gentle-ai 2.1.10
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
