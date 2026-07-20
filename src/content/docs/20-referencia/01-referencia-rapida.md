---
title: Referencia rápida
description: "Referencia consolidada: comandos, glosario, catálogo de modelos y matriz de compatibilidad."
level: 3
estimatedTime: Consulta
tags:
  - referencia
  - comandos
  - glosario
  - modelos
  - compatibilidad
  - configuración
prerequisites:
  - Variable
verifiedVersion: "Gentle-AI 2.1.10, OpenCode 1.17.20, Codex 0.144.0, Engram 1.19.0, GGA 2.10.1"
learningOutcomes:
  - Consultar cualquier comando del ecosistema sin buscar en capítulos separados
  - Identificar la versión compatible de cada herramienta
  - Entender 50+ términos del glosario con referencias cruzadas
  - Localizar archivos de configuración y variables de entorno
  - Diagnosticar errores comunes con el índice de troubleshooting
---

# Referencia rápida

## Qué aprenderás

Este capítulo consolida la información dispersa de todos los módulos anteriores en un solo lugar.
No es para leer de principio a fin — es para **consultar** cuando necesitás un comando,
una definición o un dato de compatibilidad rápido.

Cada sección tiene referencias cruzadas al capítulo donde se explica el tema en detalle.

## Por qué importa

Cuando estás en medio de una tarea, no querés navegar 20 capítulos para encontrar la flag de un comando
o el nombre exacto de una variable de entorno. Este capítulo existe para que puedas resolver eso en 10 segundos.

## Gentle-AI CLI — Referencia rápida

### Comandos principales

| Comando | ¿Modifica? | ¿Requiere red? | Descripción | Ver en capítulo |
|---------|-----------|----------------|-------------|-----------------|
| `gentle-ai` | ❌ | ❌ | Abre la TUI (sin argumentos) | 07-02 |
| `gentle-ai install` | ✅ | ✅ | Instala componentes (Engram, SDD, skills, etc.) | 07-02 |
| `gentle-ai doctor` | ❌ | ❌ | Diagnóstico del ecosistema | 07-02 |
| `gentle-ai doctor --json` | ❌ | ❌ | Diagnóstico en JSON (para scripting) | 07-02 |
| `gentle-ai status` | ❌ | ❌ | Estado de componentes instalados | 07-02 |
| `gentle-ai update` | ❌ | ✅ | Verifica si hay versiones nuevas | 07-02 |
| `gentle-ai upgrade` | ✅ | ✅ | Aplica actualizaciones disponibles | 07-02 |
| `gentle-ai uninstall` | ✅ | ❌ | Desinstala componentes | 07-02 |
| `gentle-ai uninstall --all` | ✅ | ❌ | Desinstala TODO y restaura configuración | 07-02 |
| `gentle-ai sync` | ✅ | ❌ | Sincroniza configuración entre componentes | 07-02 |

| `gentle-ai restore` | ✅ | ❌ | Restaura una copia de seguridad | 07-02 |
| `gentle-ai review start` | ⚠️ | ❌ | Inicia sesión de Native Bounded Review | 11-03 |
| `gentle-ai review finalize` | ✅ | ❌ | Finaliza sesión de revisión | 11-03 |
| `gentle-ai review validate` | ❌ | ❌ | Valida el receipt de revisión | 11-03 |
| `gentle-ai sdd-continue [cambio]` | ✅ | ❌ | Avanza a la siguiente fase SDD | 08-02 |
| `gentle-ai sdd-status [cambio]` | ❌ | ❌ | Estado de un cambio SDD | 08-02 |
| `gentle-ai codegraph` | ❌ | ❌ | Comandos de exploración del grafo de código | 16-01 |
| `gentle-ai codegraph init` | ✅ | ❌ | Inicializa CodeGraph en el proyecto | 16-01 |
| `gentle-ai codegraph query` | ❌ | ❌ | Consulta el grafo de código | 16-01 |
| `gentle-ai codegraph explore` | ❌ | ❌ | Explora símbolos y relaciones | 16-01 |

### Flags comunes

| Flag | Tipo | Descripción | Ejemplo |
|------|------|-------------|---------|
| `--dry-run` | Booleana | Simula sin ejecutar | `gentle-ai install --dry-run` |
| `--yes` / `-y` | Booleana | Salta confirmaciones | `gentle-ai install --yes` |
| `--cwd <ruta>` | String | Directorio de trabajo | `gentle-ai status --cwd ./proyecto` |
| `--json` | Booleana | Salida JSON | `gentle-ai doctor --json` |
| `--verbose` / `-v` | Booleana | Salida detallada | `gentle-ai install --verbose` |
| `--help` / `-h` | Booleana | Ayuda del comando | `gentle-ai install --help` |
| `--version` | Booleana | Versión del binario | `gentle-ai --version` |

## Engram CLI

### Comandos principales

| Comando | Descripción | Ver en capítulo |
|---------|-------------|-----------------|
| `engram` | Abre la TUI de Engram | 09-01 |
| `engram mcp` | Inicia servidor MCP (stdio) para conexión con el agente | 09-01 |
| `engram serve` | Inicia servidor HTTP REST en puerto 7437 | 09-01 |
| `engram doctor` | Diagnóstico de salud de la base de datos | 09-01 |

### Herramientas MCP core (siempre disponibles)

| Herramienta | ¿Qué hace? |
|-------------|-----------|
| `mem_save` | Guarda una observación (decisión, bug, descubrimiento) |
| `mem_search` | Busca observaciones por texto completo (FTS5) |
| `mem_context` | Devuelve contexto reciente del proyecto |
| `mem_session_summary` | Guarda resumen de cierre de sesión |
| `mem_get_observation` | Obtiene contenido completo de una observación por ID |
| `mem_save_prompt` | Guarda el prompt del usuario para contexto futuro |
| `mem_current_project` | Devuelve el proyecto actual detectado |

Ver capítulo 09-01 para la lista completa de 20 herramientas (core + deferred).

## GGA CLI

| Comando | Descripción | Ver en capítulo |
|---------|-------------|-----------------|
| `gga install` | Instala el hook pre-commit en el repositorio actual | 11-02 |
| `gga run` | Ejecuta revisión manual (sin commit) | 11-02 |
| `gga run --ci` | Modo CI: revisa el último commit | 11-02 |
| `gga run --pr-mode` | Modo PR: revisa diff contra la rama base | 11-02 |
| `gga --version` | Versión instalada | 11-02 |

### Proveedores soportados (11)

| Proveedor | Config value | Autenticación |
|-----------|-------------|---------------|
| Claude Code | `claude` | CLI instalado (`claude`) |
| Gemini CLI | `gemini` | CLI instalado (`gemini`) |
| Codex | `codex` | CLI instalado (`codex`) |
| OpenCode | `opencode[:modelo]` | CLI instalado (`opencode`) |
| Cursor | `cursor[:modelo]` | CLI instalado (`cursor`) |
| Kilo | `kilo[:modelo]` | CLI instalado (`kilo`) |
| Kiro | `kiro` | CLI instalado (`kiro`) |
| Ollama | `ollama:modelo` | Servidor local |
| LM Studio | `lmstudio[:modelo]` | Servidor local |
| GitHub Models | `github:modelo` | GitHub CLI (`gh`) |
| MiniMax | `minimax[:modelo]` | API key (`MINIMAX_API_KEY`) |

## Catálogo de modelos (verificado 2026-07-20)

### OpenAI

| Modelo | ID | Clase | Razonamiento | Uso recomendado |
|--------|-----|-------|-------------|-----------------|
| Sol | `openai/gpt-5.6-sol` | Frontier | high/xhigh | Arquitectura, diseño crítico, revisión |
| Terra | `openai/gpt-5.6-terra` | Equilibrado | medium | Implementación, especificación |
| Luna | `openai/gpt-5.6-luna` | Económico | low | Init, archive, tareas mecánicas |

### Anthropic (vía OpenRouter)

| Modelo | ID | Clase | Razonamiento | Uso recomendado |
|--------|-----|-------|-------------|-----------------|
| Opus 4.8 | `openrouter/anthropic/claude-opus-4.8` | Frontier | xhigh | Revisión crítica, seguridad |
| Sonnet 5 | `openrouter/anthropic/claude-sonnet-5` | Potente | high | Diseño, implementación |
| Haiku 4.5 | `openrouter/anthropic/claude-haiku-4.5` | Económico | low | Tareas rápidas |

### Google (vía OpenRouter)

| Modelo | ID | Clase | Razonamiento | Uso recomendado |
|--------|-----|-------|-------------|-----------------|
| Gemini 3.5 Flash | `openrouter/google/gemini-3.5-flash` | Equilibrado | medium | Balance general |
| Gemini 3.1 Pro | `openrouter/google/gemini-3.1-pro-preview` | Potente | high | Diseño (preview) |

### OpenCode Go

| Modelo | ID | Clase | Razonamiento | Uso recomendado |
|--------|-----|-------|-------------|-----------------|
| Kimi K3 | `opencode-go/kimi-k3` | Potente | high | Código complejo, diseño |
| DeepSeek V4 Pro | `opencode-go/deepseek-v4-pro` | Equilibrado | medium | Implementación general |
| DeepSeek V4 Flash | `opencode-go/deepseek-v4-flash` | Económico | low | Tareas rápidas |
| GLM 5.2 | `opencode-go/glm-5.2` | Potente | high | Verificación, análisis |
| Qwen 3.7 Max | `opencode-go/qwen3.7-max` | Potente | high | Tareas complejas |

### Taxonomía de razonamiento

| Nivel canónico | Uso | OpenAI | Google | Anthropic | OpenCode Go |
|---------------|-----|--------|--------|-----------|-------------|
| `minimal` | Formato, clasificación, búsqueda simple | `low` o default | `minimal` | esfuerzo mínimo | default |
| `low` | Tareas claras, resúmenes, cambios mecánicos | `low` | `low` | bajo | default o variante |
| `medium` | Código estándar, planificación, documentación | `medium` | `medium` | medio | opción específica |
| `high` | Arquitectura, debugging, verificación | `high` | `high` | alto | modelo o variante superior |
| `xhigh` | Riesgo alto, seguridad, decisiones críticas | `high` o `xhigh` | `high` (sin xhigh) | extra/max | escalar a modelo superior |

Para la asignación detallada por subagente, ver capítulo 14-modelos-y-enrutamiento.

## Matriz de compatibilidad de versiones

| Versión | OpenCode | Codex | Engram | GGA | Gentle-AI |
|---------|----------|-------|--------|-----|-----------|
| Gentle-AI 2.1.10 | 1.17.20 | 0.144.0 | 1.19.0 | — | — |
| OpenCode 1.17.20 | — | — | 1.19.0+ | 2.10.1 | 2.1.10 |
| Codex 0.144.0 | — | — | 1.19.0+ | — | 2.1.10 |
| Engram 1.19.0 | 1.17.20 | 0.144.0 | — | — | 2.1.10 |

| GGA 2.10.1 | 1.17.20 | 0.144.0 | — | — | — |

**Regla general**: la versión de Gentle-AI determina la compatibilidad. Usá `gentle-ai doctor` para verificar tu ecosistema.

## Glosario de términos

Los términos marcados con → tienen su definición completa en `data/terminology/glossary.yml`.

| Término | Definición breve | Ver en capítulo |
|---------|-----------------|-----------------|
| **4R** | Risk, Readability, Reliability, Resilience — los 4 lentes de Native Bounded Review | 11-03 |
| **Agente** | Programa de IA que ejecuta tareas usando herramientas y modelos | 03-04 |
| **Alias** | Atajo de terminal para un comando largo | 15-01 |
| **API key** | Clave de autenticación para servicios de IA | 05-01 |
| **Artefacto SDD** | Documento generado en una fase del ciclo SDD | 08-02 |
| **Benchmark** | Prueba estandarizada para comparar modelos o configuraciones | 14-01 |
| **Binario** | Archivo ejecutable compilado (`.exe`) | 01-03 |
| **Bubbletea** | Framework Go para construir interfaces de terminal (TUI) | 07-02 |
| **Caché GGA** | Almacenamiento SHA256 que evita revisiones repetidas de archivos sin cambios | 11-02 |
| **Cambio SDD** | Unidad de trabajo atómica en SDD (un feature, un bugfix) | 08-01 |
| **CLI** | Command Line Interface — interfaz de terminal | 07-02 |
| **Código de salida** | Número que devuelve un programa al terminar (0 = éxito) | 01-02 |
| **Código fuente** | Texto escrito por un programador en un lenguaje de programación | 01-03 |
| **Compilar** | Traducir código fuente a binario ejecutable | 01-03 |
| **Componente** | Módulo instalable de Gentle-AI (Engram, SDD, skills, etc.) | 07-03 |
| **Contexto** | Ventana de tokens que un modelo de IA puede procesar | 03-02 |
| **Dependencia** | Librería o framework que un programa necesita para funcionar | 01-03 |
| **Engram** | Sistema de memoria persistente del ecosistema Gentle | 09-01 |
| **Enrutamiento** | Estrategia para asignar modelos a tareas según costo y capacidad | 14-01 |
| **Fallback** | Modelo alternativo cuando el principal falla o no está disponible | 14-01 |
| **Framework** | Estructura que define cómo organizar tu código (ej. Bubbletea, React) | 01-03 |
| **FTS5** | Full-Text Search v5 — motor de búsqueda de SQLite que usa Engram | 09-01 |
| **Gestor de paquetes** | Programa que instala y administra dependencias (npm, go mod) | 01-03 |
| **GGA** | Gentleman Guardian Angel — hook de Git que revisa código antes del commit | 11-02 |
| **Git** | Sistema de control de versiones distribuido | 02-01 |
| **Hook** | Script que Git ejecuta automáticamente en eventos (pre-commit, pre-push) | 02-04 |
| **Interpretar** | Ejecutar código fuente línea por línea sin compilar | 01-03 |
| **Judgment Day** | Revisión adversarial ciega con dos jueces independientes | 11-04 |
| **Lente** | Categoría de análisis en Native Bounded Review (Risk, Readability, etc.) | 11-03 |
| **Librería** | Funciones reutilizables que tu programa puede llamar | 01-03 |
| **MCP** | Model Context Protocol — protocolo de comunicación agente-herramienta | 03-03 |
| **Memoria** | Sistema que persiste contexto entre sesiones de desarrollo | 09-01 |
| **Modelo** | Red neuronal entrenada que genera texto, código o análisis | 03-01 |
| **Native Bounded Review** | Revisión post-implementación con lentes 4R, receipt y presupuesto de líneas | 11-03 |
| **Observación** | Unidad de información en Engram (decisión, bug, descubrimiento) | 09-01 |
| **OpenCode** | Agente de código abierto del ecosistema, configurable vía JSON | 12-01 |
| **Orquestador** | Agente principal que coordina subagentes y fases SDD | 07-03 |
| **Perfil** | Conjunto de configuración de modelo y razonamiento (Codex: TOML, OpenCode: JSON) | 12-01, 13-01 |
| **Pipeline** | Flujo de ejecución de Gentle-AI: prepare → apply → rollback | 07-03 |
| **Plugin** | Extensión externa que agrega capacidades al agente | 10-01 |
| **PR** | Pull Request — solicitud de fusión de código entre ramas | 02-03 |
| **Proveedor** | Servicio cloud que ofrece modelos de IA (OpenAI, Anthropic, Google) | 03-01 |
| **Razonamiento** | Nivel de esfuerzo cognitivo que un modelo aplica a una tarea | 14-01 |
| **Receipt** | Prueba verificable de que una revisión ocurrió (Native Bounded Review) | 11-03 |
| **Runtime** | Entorno de ejecución para lenguajes interpretados (Node.js) | 01-03 |
| **SDD** | Specification-Driven Development — desarrollo guiado por especificaciones | 08-01 |
| **Skill** | Instrucción especializada que se carga en el agente para una tarea específica | 10-01 |
| **SQLite** | Base de datos embebida que Engram usa para persistencia local | 09-01 |
| **TUI** | Terminal User Interface — interfaz visual dentro de la terminal | 07-02 |
| **Worktree** | Copia de trabajo de Git que permite tener múltiples ramas abiertas simultáneamente | 02-04 |
| **Variable de entorno** | Valor que el sistema operativo guarda y los programas pueden leer | 01-03 |

## Rutas de archivos de configuración

### OpenCode

| Archivo | Propósito | Ruta típica |
|---------|-----------|-------------|
| `opencode.json` | Configuración principal | `~/.config/opencode/opencode.json` o raíz del proyecto |
| `opencode.jsonc` | Configuración con comentarios | `~/.config/opencode/opencode.jsonc` |
| `.opencode/` | Configuración del agente por proyecto | `./.opencode/` |
| `~/.opencode/` | Configuración global del agente | `~/.opencode/` |

### Codex

| Archivo | Propósito | Ruta típica |
|---------|-----------|-------------|
| `config.toml` | Configuración principal con perfiles | `~/.codex/config.toml` |
| `.codex/` | Configuración local del proyecto | `./.codex/` |

### Engram

| Archivo | Propósito | Ruta típica |
|---------|-----------|-------------|
| `config.json` | Configuración de proyecto | `./.engram/config.json` |
| `engram.db` | Base de datos SQLite de memoria | `~/.engram/engram.db` |

### GGA

| Archivo | Propósito | Ruta típica |
|---------|-----------|-------------|
| `.gga` | Configuración del hook | `./.gga` (raíz del proyecto) |
| `config` | Configuración global de GGA | `~/.config/gga/config` |

### Gentle-AI

| Archivo | Propósito | Ruta típica |
|---------|-----------|-------------|
| `gentle-ai.yaml` | Configuración del ecosistema | `./gentle-ai.yaml` o `~/.config/gentle-ai/gentle-ai.yaml` |
| `.sdd/` | Artefactos SDD del proyecto | `./.sdd/` |

## Variables de entorno

### OpenCode

| Variable | ¿Qué hace? | Valor típico |
|----------|-----------|-------------|
| `OPENCODE_LLM_PROVIDER` | Proveedor de IA por defecto | `openai`, `anthropic`, `opencode-go` |
| `OPENCODE_AGENT_CONFIG` | Ruta al archivo de configuración del agente | `~/.config/opencode/opencode.json` |
| `OPENCODE_PROJECT` | Nombre del proyecto actual | `mi-proyecto` |
| `OPENCODE_MODEL` | Modelo por defecto | `opencode-go/kimi-k3` |
| `OPENCODE_REASONING_EFFORT` | Nivel de razonamiento global | `low`, `medium`, `high` |
| `OPENCODE_MCP_SERVERS` | Servidores MCP adicionales (JSON) | — |

### Engram

| Variable | ¿Qué hace? | Valor típico |
|----------|-----------|-------------|
| `ENGRAM_PROJECT` | Proyecto para detección manual | `mi-proyecto` |
| `ENGRAM_DB_PATH` | Ruta a la base de datos SQLite | `~/.engram/engram.db` |
| `ENGRAM_PORT` | Puerto del servidor HTTP | `7437` |
| `ENGRAM_LOG_LEVEL` | Nivel de log | `info`, `debug`, `warn` |

### GGA

| Variable | ¿Qué hace? | Valor típico |
|----------|-----------|-------------|
| `GGA_PROVIDER` | Proveedor de IA para revisión | `opencode:opencode-go/kimi-k3` |
| `GGA_MODEL` | Modelo específico | `opencode-go/deepseek-v4-pro` |
| `GGA_TIMEOUT` | Timeout por archivo (segundos) | `300` |
| `GGA_STRICT_MODE` | Si falla el proveedor, bloquea el commit | `true`, `false` |
| `GGA_CACHE_DIR` | Directorio de caché | `~/.cache/gga/` |

### Generales

| Variable | ¿Qué hace? |
|----------|------------|
| `PATH` | Lista de directorios donde el sistema busca ejecutables |
| `HOME` / `USERPROFILE` | Directorio personal del usuario |
| `EDITOR` | Editor de texto por defecto |
| `SHELL` | Shell por defecto (Bash, Zsh, PowerShell) |

## Códigos de salida

### Estándar

| Código | Significado |
|--------|-------------|
| `0` | ✅ Éxito |
| `1` | ❌ Error genérico |
| `2` | Uso incorrecto (flags inválidas, argumentos faltantes) |
| `130` | Interrupción (Ctrl+C) |
| `137` | Terminación forzada (SIGKILL) |
| `143` | Terminación (SIGTERM) |
| `255` | Error de ejecución (comando no encontrado, etc.) |

### GGA

| Código | Significado |
|--------|-------------|
| `0` | ✅ PASSED — todos los archivos cumplen |
| `1` | ❌ FAILED — violaciones encontradas |
| `124` | ⏱️ Timeout (depende de STRICT_MODE) |

### Gentle-AI

| Código | Significado |
|--------|-------------|
| `0` | ✅ Comando ejecutado exitosamente |
| `1` | Error durante la ejecución |
| `2` | Error de validación de argumentos |
| `100+` | Errores específicos de pipeline/planner |

## Índice rápido de troubleshooting

| Problema | Causa más común | Solución rápida | Ver en capítulo |
|----------|----------------|-----------------|-----------------|
| "command not found" | Herramienta no instalada o no en PATH | Verificá con `--version`, instalá o agregá al PATH | 05-01 |
| "module not found" | Faltan dependencias | Ejecutá `npm install` o `go mod tidy` | 01-03 |
| GGA no se activa | Hook no instalado | `gga install` en la raíz del proyecto | 11-02 |
| GGA timeout | Modelo lento o proveedor caído | Aumentá `TIMEOUT` o cambiá de proveedor | 11-02 |
| SDD no avanza | Faltan artefactos de fase anterior | `gentle-ai sdd status` para diagnosticar | 08-02 |
| Engram no detecta proyecto | Sin git remote ni `.engram/config.json` | Creá `.engram/config.json` con `project_name` | 09-01 |
| OpenCode no reconoce agente | Error de sintaxis en `opencode.json` | Validá el JSON o ejecutá `opencode doctor` | 12-01 |
| Codex no carga perfil | Error de sintaxis en `config.toml` | Verificá que las secciones TOML estén correctas | 13-01 |
| MCP server no conecta | Ruta incorrecta o server caído | Ejecutá el server manualmente para ver errores | 03-03 |
| Modelo no responde | API key vencida o saldo insuficiente | Verificá la API key y el saldo del proveedor | 05-01 |
| Native Review receipt inválido | El receipt fue modificado | Volvé a ejecutar `review validate` | 11-03 |
| Judgment Day no ejecuta jueces | Jueces no configurados en `opencode.json` | Agregá `jd-judge-a` y `jd-judge-b` | 11-04 |
| "Permission denied" | Archivo sin permisos de ejecución | `chmod +x archivo` (Bash) | 01-02 |
| "database is locked" | Engram abierto en otro proceso | Esperá o reiniciá el agente | 09-01 |
| Error de versión | Herramienta demasiado vieja | Ejecutá `gentle-ai upgrade` | 05-01 |

## Fuentes verificadas

- Comandos CLI: gentle-ai 2.1.10, `cmd/gentle-ai/main.go` y `internal/cli/`
- Engram: engram 1.19.0, `cmd/engram/main.go` y `internal/mcp/`
- GGA: GGA 2.10.1, `bin/gga` y `lib/providers.sh`
- Modelos: `opencode models` ejecutado el 2026-07-20, OpenCode 1.17.20
- Archivos: `data/models/catalog.yml`, `data/models/routing.yml`, `data/terminology/glossary.yml`
- Repositorios: gentle-ai, engram, GGA (commits verificados en cada capítulo)
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
