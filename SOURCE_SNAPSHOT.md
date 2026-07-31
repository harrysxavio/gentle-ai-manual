# Source Snapshot — Gentle AI Mega Manual

> **Fecha de investigación**: 2026-07-20
> **Estado**: 🟢 Repositorios principales verificados — Fuentes complementarias pendientes

---

## Repositorios del ecosistema

### gentle-ai

| Campo | Valor |
|-------|-------|
| URL | https://github.com/Gentleman-Programming/gentle-ai |
| Rama | `main` |
| Commit SHA | `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d` |
| Fecha del commit | 2026-07-20 09:47:23 -0500 |
| Mensaje del commit | `feat(tui): clarify persona selection labels` |
| Tag | `v2.1.10` |
| Release | v2.1.10 |
| Go version | 1.25.10 |
| Módulo Go | `github.com/gentleman-programming/gentle-ai` |
| Dependencias principales | Bubble Tea TUI, Lipgloss, Bubbles |
| Agentes soportados | 16 (Claude Code, OpenCode, Kilo Code, Gemini CLI, Cursor, VS Code Copilot, Codex, Antigravity, Windsurf, Kimi, Qwen, Kiro, OpenClaw, Pi, Trae, Hermes) |
| Componentes | 10 (engram, sdd, skills, context7, persona, permissions, gga, theme, claude-theme, opencode-gentle-logo) |
| Fases SDD | 10 (init, explore, propose, spec, design, tasks, apply, verify, archive, onboard) |
| Skills embebidas | 22 |

### engram

| Campo | Valor |
|-------|-------|
| URL | https://github.com/Gentleman-Programming/engram |
| Rama | `main` |
| Commit SHA | `763a6ba432713725d6ce82a2416eec6cbd9ec94e` |
| Fecha del commit | 2026-07-20T11:16:07-03:00 |
| Mensaje del commit | `fix(pi): hide detached process windows on Windows (#604)` |
| Tag | `v1.20.0` |
| Release | v1.20.0 |
| Go version | 1.25.10 |
| Módulo Go | `github.com/Gentleman-Programming/engram` |
| Dependencias principales | modernc.org/sqlite (SQLite sin CGO), mark3labs/mcp-go (MCP), jackc/pgx (Postgres), Bubble Tea (TUI) |
| Base de datos | SQLite + FTS5 (local), Postgres (cloud opcional) |
| Herramientas MCP | 20 herramientas totales (7 core, 13 deferred) |
| Perfiles MCP | agent (18 tools), admin (4 tools), all (20 tools) |
| Submodo cloud | Postgres, dashboard HTMX, autosync |

### gentleman-guardian-angel (GGA)

| Campo | Valor |
|-------|-------|
| URL | https://github.com/Gentleman-Programming/gentleman-guardian-angel |
| Rama | `main` |
| Commit SHA | `fbf1091da170a33d42cb97577a9813e652e98a4a` |
| Fecha del commit | 2026-07-08 10:13:56 +0200 |
| Mensaje del commit | `fix(release): avoid shell expansion in formula comment` |
| Tag | `v2.10.1` |
| Release | v2.10.1 |
| Lenguaje | Bash 5.0+ (NO Go. NO Node.js) |
| Entry point | `bin/gga` (1372 líneas) |
| Tests | 266+ (ShellSpec BDD) |
| Proveedores | 11 (Claude, OpenCode, Gemini, Codex, Cursor, Kilo, Kiro, Ollama, LM Studio, GitHub Models, MiniMax) |
| Hooks | pre-commit, commit-msg |

### Gentleman-Skills

| Campo | Valor |
|-------|-------|
| URL | https://github.com/Gentleman-Programming/Gentleman-Skills |
| Rama | `main` |
| Commit SHA | `c8036a37893679dc5e942484975405d39689c63b` |
| Fecha del commit | 2026-03-28 10:23:50 +0100 |
| Mensaje del commit | `docs: add supported agents table with skills directory paths for 8 agents` |
| Tag | Sin tags |
| Release | Sin releases |
| Skills totales | 24 (18 curadas + 6 comunitarias) |
| Directorios | `curated/` (15 skills), `community/` (6 skills) |
| Formato | SKILL.md con frontmatter YAML, secciones obligatorias |
| Licencia repo | MIT |

---

## Herramientas del entorno de investigación

| Herramienta | Versión | Estado | Notas |
|------------|---------|--------|-------|
| Git | 2.55.0 | 🟢 Verificado | Windows |
| Go | ❌ No instalado | 🟡 No disponible | No necesario para documentar el ecosistema |
| Node.js | 22.17.0 | 🟢 Verificado | |
| OpenCode | 1.17.20 | 🟢 Verificado | npm global |
| Codex CLI | 0.144.0 | 🟢 Verificado | npm global |
| Gentle-AI CLI | 2.1.10 | 🟢 Verificado | Ruta de instalación por defecto en Windows |
| Engram | 1.19.0 (1.20.0 disponible) | 🟢 Verificado | Ruta de instalación por defecto en Windows |
| GGA | 2.10.1 | 🟢 Verificado contra código | No instalado localmente |
| Sistema operativo | Windows 10/11 (win32) | 🟢 Verificado | |
| Shell | PowerShell 5.1 | 🟢 Verificado | |

---

## Fuentes complementarias

| Fuente | URL | Estado |
|--------|-----|--------|
| Canal YouTube | https://youtube.com/@gentlemanprogramming | 🟢 Verificado — ~843 videos, ~124K subs, investigado 2026-07-20 |
| Libro oficial | https://the-amazing-gentleman-programming-book.vercel.app/es/book | 🟢 Verificado — 21 capítulos, investigado 2026-07-20 |
| Documentación OpenCode | https://opencode.ai/docs | 🔴 PENDIENTE |
| Documentación Codex | https://github.com/openai/codex | 🔴 PENDIENTE |
| MCP spec | https://modelcontextprotocol.io | 🔴 PENDIENTE |
| Gentle-AI docs internas | `docs/` en repositorio | 🟢 Verificado |
| Engram docs internas | `docs/` en repositorio | 🟢 Verificado |

---

## Commits congelados por repositorio

| Repositorio | Commit | Fecha | Tag | Estado |
|------------|--------|-------|-----|--------|
| gentle-ai | `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d` | 2026-07-20 | v2.1.10 | 🟢 Verificado |
| engram | `763a6ba432713725d6ce82a2416eec6cbd9ec94e` | 2026-07-20 | v1.20.0 | 🟢 Verificado |
| GGA | `fbf1091da170a33d42cb97577a9813e652e98a4a` | 2026-07-08 | v2.10.1 | 🟢 Verificado |
| Gentleman-Skills | `c8036a37893679dc5e942484975405d39689c63b` | 2026-03-28 | Sin tag | 🟢 Verificado |

---

## Leyenda

- 🟢 **Verificado** — confirmado contra el código del commit
- 🟡 **Documentado** — confirmado contra documentación oficial, no ejecutado
- 🔴 **PENDIENTE** — investigación en curso o no iniciada
- ⚪ **No aplica** — no relevante para esta sección
- 🧪 **Experimental** — funcionalidad marcada como experimental en el código
- ⚠️ **Beta** — funcionalidad beta
- 🗑️ **Deprecado** — funcionalidad marcada como deprecada
