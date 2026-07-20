---
title: Skills — Conocimiento especializado
description: Cómo los skills agregan conocimiento especializado a los agentes según el contexto.
level: 2
estimatedTime: 25 min
tags:
  - skills
  - conocimiento
  - skill-registry
  - triggers
  - skil
prerequisites:
  - Conceptos de agentes (capítulo 03)
  - Gentle-AI (capítulo 07)
verifiedVersion: "gentle-ai 2.1.10, Gentleman-Skills commit c8036a37"
learningOutcomes:
  - Explicar qué es un skill y para qué sirve
  - Comprender la estructura de un SKILL.md
  - Diferenciar skills curadas de comunitarias
  - Instalar y probar skills en OpenCode y Codex
---

# Skills — Conocimiento especializado

## Qué aprenderás

Los **skills** son archivos de conocimiento especializado que los agentes de IA cargan cuando el contexto lo requiere. Son como manuales de instrucciones que el agente lee antes de trabajar con una tecnología específica.

## Por qué importa

Los modelos de IA saben mucho de todo, pero no saben las **convenciones específicas de tu proyecto o tecnología**. Un skill le dice al agente:

- "En React 19 no uses `useMemo` ni `useCallback` — el compilador lo hace solo"
- "En este proyecto, los archivos de test terminan en `.spec.ts`"
- "Los commits deben seguir conventional commits"

Sin skills, el agente inventa patrones. Con skills, sigue estándares verificados.

## Explicación simple

Un skill es un archivo `SKILL.md`. Cuando el asistente detecta que estás trabajando con React, busca si existe un skill de React y lo carga. El skill le dice cómo escribir React correctamente según las convenciones del equipo o del ecosistema.

## Estructura de un SKILL.md

Un skill tiene **frontmatter YAML** (metadatos) y **contenido Markdown** (instrucciones):

```markdown
---
name: react-19
description: >
  React 19 with React Compiler: no useMemo/useCallback, Server Components,
  use(), Actions, and React DOM.
  Trigger: When writing React components, or working with JSX/TSX files.
metadata:
  author: gentleman-programming
  version: "1.0"
---

# React 19

## Critical Patterns

- **REQUIRED**: Do NOT use `useMemo` or `useCallback`. React Compiler
  handles memoization automatically.
- **REQUIRED**: Use `ref` as a prop instead of `forwardRef`.

## Code Examples

... (ejemplos)
```

### Frontmatter

| Campo | ¿Requerido? | Descripción |
|-------|------------|-------------|
| `name` | ✅ Sí | Identificador único, minúsculas, guiones. Ej: `react-19` |
| `description` | ✅ Sí | Debe contener "Trigger:" para que el agente sepa cuándo cargarlo |
| `metadata.author` | Recomendado | Usuario de GitHub |
| `metadata.version` | Recomendado | Versión semántica del skill |

### Contenido recomendado

| Sección | ¿Requerido? | Descripción |
|---------|------------|-------------|
| `## Critical Patterns` (o Core Patterns) | ✅ Sí | Reglas obligatorias que el agente DEBE seguir |
| `## Code Examples` | ✅ Sí | Mínimo 1 bloque, recomendado 3+ |
| `## Anti-Patterns` | Recomendado | Lo que NO debe hacer el agente |
| `## Commands` | Opcional | Comandos CLI relevantes |
| `## Resources` | Opcional | Enlaces a documentación oficial |

## Skills curadas vs comunitarias

El repositorio [Gentleman-Skills](https://github.com/Gentleman-Programming/Gentleman-Skills) tiene dos categorías:

### Skills curadas (18 archivos)

Creadas y mantenidas por @Gentleman-Programming:

| Skill | Tecnología |
|-------|-----------|
| `react-19` | React 19 con React Compiler |
| `nextjs-15` | Next.js 15 App Router |
| `typescript` | TypeScript strict |
| `tailwind-4` | Tailwind CSS 4 |
| `zod-4` | Zod 4 |
| `zustand-5` | Zustand 5 |
| `angular-core` | Angular standalone components, signals |
| `angular-forms` | Angular Signal Forms |
| `angular-architecture` | Estructura de proyectos Angular |
| `angular-performance` | Optimización Angular |
| `playwright` | E2E testing |
| `pytest` | Testing Python |
| `django-drf` | Django REST Framework |
| `github-pr` | Creación de PRs |
| `jira-epic` / `jira-task` | Jira con MCP |
| `ai-sdk-5` | Vercel AI SDK 5 |
| `skill-creator` | Meta-skill para crear skills |

### Skills comunitarias (6 archivos)

Contribuidas por la comunidad y aprobadas por votación de 7 días:

| Skill | Autor | Tecnología |
|-------|-------|-----------|
| `electron` | @gentleman-programming | Electron |
| `elixir-antipatterns` | @tsardinasGitHub | Elixir/Phoenix |
| `hexagonal-architecture-layers-java` | @diegnghrmr | Java Hexagonal |
| `java-21` | @diegnghrmr | Java 21 |
| `react-native` | @gentleman-programming | React Native |
| `spring-boot-3` | @diegnghrmr | Spring Boot 3 |

### Skills embebidas de Gentle-AI

Además, Gentle-AI v2.1.10 incluye **22 skills embebidas** para las fases SDD, revisión y otros flujos:

```
internal/assets/skills/
├── sdd-init/
├── sdd-explore/
├── sdd-propose/
├── sdd-spec/
├── sdd-design/
├── sdd-tasks/
├── sdd-apply/
├── sdd-verify/
├── sdd-archive/
├── sdd-onboard/
├── judgment-day/
├── go-testing/
├── skill-creator/
├── skill-improver/
├── _shared/         (contratos compartidos)
└── ...
```

## Instalación de skills

### En OpenCode

```bash
# Copiar skills curadas al directorio de OpenCode
cp -r Gentleman-Skills/curated/* ~/.config/opencode/skills/

# O un skill específico
cp -r Gentleman-Skills/curated/react-19 ~/.config/opencode/skills/
```

### En Codex

```bash
cp -r Gentleman-Skills/curated/* ~/.codex/skills/
```

### Agentes soportados

| Agente | Ruta de skills (Linux/macOS) | Ruta (Windows) |
|--------|------------------------------|----------------|
| Claude Code | `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` |
| OpenCode | `~/.config/opencode/skills/` | `%USERPROFILE%\.config\opencode\skills\` |
| Gemini CLI | `~/.gemini/skills/` | `%USERPROFILE%\.gemini\skills\` |
| Codex | `~/.codex/skills/` | `%USERPROFILE%\.codex\skills\` |
| Cursor | `~/.cursor/skills/` | `%USERPROFILE%\.cursor\skills\` |
| VS Code Copilot | `~/.copilot/skills/` | `%USERPROFILE%\.copilot\skills\` |

## Cómo se cargan los skills

Cuando el agente detecta contexto relevante (por ejemplo, estás editando un archivo `.tsx`):

1. Busca en su directorio de skills archivos `SKILL.md`
2. Lee el frontmatter y el campo `description` con el trigger
3. Si el trigger coincide con el contexto actual, carga el skill
4. El skill se agrega al prompt del agente como instrucción adicional

No hay un registry centralizado automático. Los skills se descubren por **convención de nombres y directorios**.

## Cómo crear un skill

```bash
# 1. Crear directorio con el nombre del skill
mkdir ~/.config/opencode/skills/mi-skill

# 2. Crear SKILL.md
cat > ~/.config/opencode/skills/mi-skill/SKILL.md << 'EOF'
---
name: mi-skill
description: >
  Qué hace este skill.
  Trigger: cuándo cargarlo.
metadata:
  author: tu-usuario
  version: "1.0"
---

# Mi Skill

## Critical Patterns

- REQUIRED: Regla obligatoria 1
- REQUIRED: Regla obligatoria 2

## Code Examples

\`\`\`typescript
// Buen ejemplo
\`\`\`

\`\`\`typescript
// Mal ejemplo (anti-pattern)
\`\`\`
EOF

# 3. Verificar que el agente lo carga
# (depende del agente, pero debería detectarlo automáticamente)
```

### Reglas de naming

- Minúsculas, solo guiones (`[a-z0-9-]+`)
- Ejemplos: `react-19`, `go-testing`, `mi-skill`
- El nombre del directorio debe coincidir con el `name` del frontmatter

## Cómo verificar que un skill funciona

1. Creá un archivo del tipo que activa el skill (ej: `.tsx` para react-19)
2. Preguntale al agente: "¿Qué convenciones de React 19 conocés?"
3. Si cargó el skill correctamente, va a mencionar las reglas del skill

## Errores frecuentes

1. **Trigger sin "Trigger:"**: el campo `description` debe contener la palabra "Trigger:" para que el agente lo asocie.
2. **Nombre sin guiones**: usar guiones bajos o espacios rompe la convención.
3. **Skills demasiado genéricos**: "escribe buen código" no es útil. Un skill debe ser específico y accionable.
4. **Skills desactualizados**: si la tecnología avanza, el skill queda obsoleto. Mantenelo actualizado.

## Preguntas

1. ¿Qué información debe contener el frontmatter de un SKILL.md?
2. ¿Cuál es la diferencia entre skills curadas y comunitarias?
3. ¿Dónde se instalan los skills en OpenCode?
4. ¿Cómo sabe un agente qué skill cargar en cada momento?
5. ¿Qué sección es obligatoria en el contenido de un skill?

## Fuentes verificadas

- Repositorio: Gentleman-Skills, commit `c8036a37893679dc5e942484975405d39689c63b`
- Repositorio: gentle-ai, commit `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d`
- Archivos: `curated/*/SKILL.md`, `community/*/SKILL.md`, `SKILL_TEMPLATE.md`
- Archivos: `internal/assets/skills/` en gentle-ai
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
