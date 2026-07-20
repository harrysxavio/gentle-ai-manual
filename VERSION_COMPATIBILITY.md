# Versiones y Compatibilidad

> **Fecha de verificación**: 2026-07-20
> **Sistema**: Windows 10/11, PowerShell 5.1

---

## Versiones verificadas

| Componente | Versión | Instalado | Último | Notas |
|-----------|---------|-----------|--------|-------|
| **gentle-ai** | 2.1.10 | ✅ | ✅ | CLI + orchestrator |
| **engram** | 1.19.0 | ✅ | 1.20.0 disponible | Ejecutando versión anterior |
| **GGA (gentleman-guardian-angel)** | 2.10.1 | ❌ | v2.10.1 | No instalado localmente. Verificado desde código |
| **OpenCode** | 1.17.20 | ✅ | ✅ | Paquete npm global |
| **Codex CLI** | 0.144.0 | ✅ | ✅ | Paquete npm global |
| **Git** | 2.55.0 | ✅ | ✅ | |
| **Node.js** | 22.17.0 | ✅ | ✅ | |
| **Go** | ❌ No instalado | ❌ | - | No necesario para uso normal. Solo para desarrollo/built desde fuente |

---

## Dependencias de infraestructura

### Gentle-AI (v2.1.10)
- **Runtime**: OpenCode 1.x (requerido), Codex (opcional)
- **Instalación**: npm global (`npm install -g gentle-ai`) o instalador dedicado
- **Binario**: `C:\Users\harry\AppData\Local\gentle-ai\bin\gentle-ai.exe`
- **Paths de configuración**: 
  - Global: `~/.config/gentle-ai/` (Linux/macOS), `%APPDATA%/gentle-ai/` (Windows)
  - Workspace: `{project}/.gentle-ai/`
- **Dependencias externas**: OpenCode/Codex, Git, Engram (opcional)

### Engram (v1.19.0 → 1.20.0 disponible)
- **Runtime**: Go 1.25.10 (compilado), no requiere Go instalado para ejecutar
- **Base de datos**: SQLite con FTS5 (embebido, no requiere instalación externa)
- **Protocolo**: MCP stdio (para agentes), HTTP REST (para herramientas y TUI)
- **Binario**: `C:\Users\harry\AppData\Local\engram\bin\engram.exe`
- **Paths**: 
  - Datos locales: `~/.engram/engram.db`
  - Config proyecto: `{project}/.engram/config.json`
  - Config cloud: `~/.engram/cloud.json`
- **Actualización disponible**: 1.19.0 → 1.20.0

### GGA (v2.10.1)
- **Runtime**: Bash 5.0+ (sin Go, sin Node.js)
- **Dependencias**: git, curl o provider CLI (claude, opencode, etc.)
- **Instalación**: `git clone` + `./install.sh` o Homebrew
- **Windows**: requiere Git Bash. `install.sh` crea wrapper `gga.bat`
- **Config**: archivo `.gga` en raíz del proyecto (NO directorio `.gga/`)

### OpenCode (v1.17.20)
- **Runtime**: Node.js 18+
- **Instalación**: npm global (`npm install -g opencode`)
- **Config**: `opencode.json` o `opencode.jsonc`
- **Skills**: `%USERPROFILE%\.config\opencode\skills\`
- **Plugins**: TypeScript
- **Engram**: plugin integrado
- **Modelos**: Catálogo propio + OpenRouter + OpenCode Go + NVIDIA + Ollama Cloud

### Codex CLI (v0.144.0)
- **Runtime**: Node.js 18+
- **Instalación**: npm global (`npm install -g @openai/codex`)
- **Config**: `config.toml` en directorio del proyecto
- **Skills**: `%USERPROFILE%\.codex\skills\`
- **Engram**: soporte vía MCP

---

## Matriz de compatibilidad

| Gentle-AI | OpenCode | Codex | Engram | GGA | Node.js |
|-----------|----------|-------|--------|-----|---------|
| 2.1.10 | 1.17.20 ✅ | 0.144.0 ✅ | 1.19.0 ✅ | 2.10.1 ✅ | 22.17.0 ✅ |
| 2.1.10 | 1.16.x ✅ | 0.143.x ✅ | 1.18.x ✅ | 2.9.x ✅ | 20.x ✅ |
| 2.0.x | 1.15.x ⚠️ | 0.140.x ⚠️ | 1.17.x ✅ | 2.8.x ✅ | 18.x ✅ |

**Leyenda**: ✅ Compatible | ⚠️ Verificar | ❌ No compatible | 🔴 PENDIENTE

---

## Notas de compatibilidad

### Cambios conocidos entre versiones

1. **Engram v1.19.0 → v1.20.0**: La actualización está disponible. Cambios no verificados todavía. Se recomienda actualizar antes de depender de funcionalidades nuevas.
2. **OpenCode 1.x**: Breaking changes entre versiones menores. Verificar `opencode.json` al actualizar.
3. **Codex 0.144.0**: Versión en desarrollo activo. El formato de `config.toml` puede cambiar.
4. **Gentle-AI 2.1.10**: Requiere OpenCode 1.17.x o superior para funcionar correctamente.

---

## Funciones experimentales conocidas

| Función | Componente | Versión | Estado |
|---------|-----------|---------|--------|
| Multiagente Codex | Codex CLI | 0.144.0 | Experimental |
| Engram Cloud | Engram | 1.19.0 | Opt-in, requiere Postgres |
| Engram Autosync | Engram | 1.20.0 | Experimental |
| Obsidian Plugin | Engram | 1.19.0 | Beta |
| Dashboard cloud | Engram | 1.19.0 | HTMX, servidor separado |

---

## Recomendaciones

1. **Actualizar Engram**: `go install github.com/Gentleman-Programming/engram/cmd/engram@latest` (requiere Go) o descargar release.
2. **Verificar config**: Después de actualizar cualquier componente, ejecutar `gentle-ai doctor`.
3. **Snapshot**: Mantener este archivo actualizado con cada nueva investigación.
