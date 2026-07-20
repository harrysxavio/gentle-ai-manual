# Glosario — Gentle AI Mega Manual

> **Nivel**: Referencia
> **Versión**: 2026-07-20

Cada término incluye su primera definición simple (Nivel 1: visión simple) y una referencia a dónde se explica en profundidad (Nivel 3).

---

## A

### Agente
**Simple**: Un programa que usa un modelo de IA, tiene instrucciones, puede usar herramientas y actúa por su cuenta para cumplir una tarea.
**Referencia**: `content/03-fundamentos-de-ia/` — Agentes, subagentes y orquestadores.

### API (Application Programming Interface)
**Simple**: Un contrato que permite que dos programas se comuniquen entre sí.
**Referencia**: `content/01-fundamentos-tecnologicos/` — Frontend y backend.

### Apply (sdd-apply)
**Simple**: Fase de SDD donde se escribe el código según las tareas planificadas.
**Referencia**: `content/08-sdd/` — SDD Apply.

---

## B

### Base de datos
**Simple**: Un sistema que guarda datos de forma organizada y permite recuperarlos después.
**Referencia**: `content/01-fundamentos-tecnologicos/` — Bases de datos.

### Binario
**Simple**: Un archivo ejecutable compilado desde código fuente.
**Referencia**: `content/01-fundamentos-tecnologicos/` — Programación.

### Branch (rama)
**Simple**: Una línea independiente de desarrollo en Git.
**Referencia**: `content/02-git-y-github/` — Ramas.

---

## C

### CLI (Command Line Interface)
**Simple**: Una interfaz de texto donde se escriben comandos.
**Referencia**: `content/15-terminal/` — CLI vs TUI.

### Codex
**Simple**: El CLI de OpenAI para desarrollo asistido por IA.
**Referencia**: `content/13-codex/` — Codex completo.

### Commit
**Simple**: Un punto guardado en el historial de Git con un mensaje que describe el cambio.
**Referencia**: `content/02-git-y-github/` — Commits.

### Compactación (contexto)
**Simple**: Proceso de resumir el historial de una conversación cuando excede la ventana de contexto del modelo.
**Referencia**: `content/03-fundamentos-de-ia/` — Tokens y contexto.

### Context window (ventana de contexto)
**Simple**: La cantidad máxima de tokens que un modelo puede procesar en una sola solicitud.
**Referencia**: `content/03-fundamentos-de-ia/` — Tokens y contexto.

---

## D

### Design (sdd-design)
**Simple**: Fase de SDD donde se define la arquitectura técnica de la solución.
**Referencia**: `content/08-sdd/` — SDD Design.

### Dependencia
**Simple**: Una biblioteca o módulo externo que un proyecto necesita para funcionar.
**Referencia**: `content/01-fundamentos-tecnologicos/` — Dependencias.

### Diff
**Simple**: La diferencia entre dos versiones de un archivo o conjunto de archivos.
**Referencia**: `content/02-git-y-github/` — Diff.

---

## E

### Engram
**Simple**: Sistema de memoria persistente que guarda decisiones, descubrimientos y contexto entre sesiones.
**Referencia**: `content/09-engram/` — Engram completo.

### Explore (sdd-explore)
**Simple**: Fase de SDD para investigar ideas antes de comprometerse a un cambio.
**Referencia**: `content/08-sdd/` — SDD Explore.

---

## F

### Fallback
**Simple**: Un modelo o estrategia de respaldo que se usa cuando el principal falla.
**Referencia**: `content/14-modelos-y-enrutamiento/` — Fallbacks.

### Frontmatter
**Simple**: Bloque de metadatos al inicio de un archivo Markdown, entre `---`.
**Referencia**: `content/10-skills/` — SKILL.md.

### FTS5 (Full-Text Search 5)
**Simple**: Motor de búsqueda de texto completo integrado en SQLite.
**Referencia**: `content/16-arquitectura-tecnica/` — Bases de datos en el ecosistema.

---

## G

### GGA (Gentleman Guardian Angel)
**Simple**: Sistema de hooks de Git que ejecuta revisiones automáticas antes de commits y push.
**Referencia**: `content/11-calidad-y-revision/` — GGA.

### Git
**Simple**: Sistema de control de versiones distribuido.
**Referencia**: `content/02-git-y-github/` — Git completo.

### GitHub
**Simple**: Plataforma web para alojar repositorios Git y colaborar en código.
**Referencia**: `content/02-git-y-github/` — GitHub.

---

## H

### Hook (Git)
**Simple**: Un script que Git ejecuta automáticamente en respuesta a eventos como commit o push.
**Referencia**: `content/02-git-y-github/` — Hooks.

### HTTP (HyperText Transfer Protocol)
**Simple**: Protocolo de comunicación usado por navegadores y servidores web.
**Referencia**: `content/01-fundamentos-tecnologicos/` — Frontend y backend.

---

## I

### Init (sdd-init)
**Simple**: Comando que inicializa el contexto SDD para un proyecto.
**Referencia**: `content/08-sdd/` — SDD Init.

---

## J

### Judgment Day
**Simple**: Protocolo de revisión de código con dos jueces independientes que evalúan el mismo cambio sin comunicarse entre sí.
**Referencia**: `content/11-calidad-y-revision/` — Judgment Day.

---

## L

### Lens (lente de revisión)
**Simple**: Una perspectiva especializada de revisión de código (riesgo, legibilidad, confiabilidad, resiliencia).
**Referencia**: `content/11-calidad-y-revision/` — Native Bounded Review.

### Linaje (lineage)
**Simple**: Cadena de identidad criptográfica que conecta revisiones, correcciones y recibos.
**Referencia**: `content/11-calidad-y-revision/` — Native Bounded Review.

---

## M

### MCP (Model Context Protocol)
**Simple**: Protocolo estándar para que agentes de IA se conecten a herramientas y fuentes de datos externas.
**Referencia**: `content/03-fundamentos-de-ia/` — MCP.

### Modelo (de IA)
**Simple**: Un sistema entrenado para procesar instrucciones y generar respuestas.
**Referencia**: `content/03-fundamentos-de-ia/` — Modelos.

---

## N

### Native Bounded Review
**Simple**: Sistema determinístico de revisión de código con presupuesto, linaje y recibo verificable.
**Referencia**: `content/11-calidad-y-revision/` — Native Bounded Review.

---

## O

### OpenCode
**Simple**: Entorno de desarrollo con agentes de IA, extensible con MCP, skills y plugins.
**Referencia**: `content/12-opencode/` — OpenCode completo.

### OpenSpec
**Simple**: Formato de archivos para artefactos SDD (propuesta, especificación, diseño, tareas).
**Referencia**: `content/08-sdd/` — OpenSpec.

### Orquestador (orchestrator)
**Simple**: Un agente especial que distribuye trabajo a otros agentes y controla el flujo.
**Referencia**: `content/03-fundamentos-de-ia/` — Orquestadores.

---

## P

### Persona
**Simple**: Una personalidad predefinida que el orquestador adopta al responder al usuario.
**Referencia**: `content/07-gentle-ai/` — Personas.

### Plugin
**Simple**: Extensión de código que agrega funcionalidad a OpenCode o Codex.
**Referencia**: `content/12-opencode/` — Plugins.

### PR (Pull Request)
**Simple**: Una solicitud para fusionar cambios de una rama a otra en GitHub.
**Referencia**: `content/02-git-y-github/` — Pull Requests.

### Prompt
**Simple**: El texto de instrucción que se envía al modelo de IA.
**Referencia**: `content/03-fundamentos-de-ia/` — System prompt e instrucciones.

### Proposal (sdd-propose)
**Simple**: Fase de SDD donde se define el alcance, objetivo y enfoque de un cambio.
**Referencia**: `content/08-sdd/` — SDD Propose.

### Proveedor (provider)
**Simple**: La empresa o servicio que ofrece acceso a modelos de IA (OpenAI, Google, Anthropic).
**Referencia**: `content/03-fundamentos-de-ia/` — Proveedores.

---

## R

### Razonamiento (reasoning effort)
**Simple**: Control de cuánto "piensa" un modelo antes de responder.
**Referencia**: `content/14-modelos-y-enrutamiento/` — Niveles de razonamiento.

### Receipt (recibo)
**Simple**: Registro verificable de que una revisión de código se completó para un conjunto específico de cambios.
**Referencia**: `content/11-calidad-y-revision/` — Native Bounded Review.

### Review
**Simple**: Proceso de examinar código para encontrar errores, riesgos o mejoras.
**Referencia**: `content/11-calidad-y-revision/` — Revisión de código.

### Runtime
**Simple**: El entorno donde se ejecuta un programa (Node.js, Go, navegador).
**Referencia**: `content/01-fundamentos-tecnologicos/` — Runtime.

---

## S

### SDD (Spec-Driven Development)
**Simple**: Metodología de desarrollo donde se planifica y especifica antes de implementar.
**Referencia**: `content/08-sdd/` — SDD completo.

### Shell
**Simple**: El programa que interpreta comandos en la terminal (PowerShell, Bash, Zsh).
**Referencia**: `content/15-terminal/` — Shell.

### Skill
**Simple**: Un archivo de conocimiento especializado que se carga cuando el contexto coincide.
**Referencia**: `content/10-skills/` — Skills completo.

### Spec (sdd-spec)
**Simple**: Fase de SDD donde se escriben los requisitos detallados y escenarios.
**Referencia**: `content/08-sdd/` — SDD Spec.

### SQL (Structured Query Language)
**Simple**: Lenguaje para consultar y manipular bases de datos relacionales.
**Referencia**: `content/01-fundamentos-tecnologicos/` — Bases de datos.

### SQLite
**Simple**: Base de datos liviana que guarda todo en un solo archivo, sin servidor.
**Referencia**: `content/01-fundamentos-tecnologicos/` — SQLite.

### Staging (Git)
**Simple**: Área intermedia donde se preparan los archivos antes de hacer commit.
**Referencia**: `content/02-git-y-github/` — Staging.

### Subagente (subagent)
**Simple**: Un agente especializado, con instrucciones y herramientas limitadas, que recibe tareas del orquestador.
**Referencia**: `content/03-fundamentos-de-ia/` — Subagentes.

### System prompt
**Simple**: Las instrucciones base que definen cómo debe comportarse un agente.
**Referencia**: `content/03-fundamentos-de-ia/` — System prompt.

---

## T

### Tasks (sdd-tasks)
**Simple**: Fase de SDD donde se desglosa la implementación en tareas concretas.
**Referencia**: `content/08-sdd/` — SDD Tasks.

### TDD (Test-Driven Development)
**Simple**: Metodología donde se escribe el test antes del código.
**Referencia**: `content/08-sdd/` — Strict TDD.

### Token
**Simple**: La unidad mínima de texto que un modelo de IA procesa (aproximadamente ¾ de palabra en inglés).
**Referencia**: `content/03-fundamentos-de-ia/` — Tokens.

### Tool calling
**Simple**: Capacidad de un modelo de solicitar ejecutar una herramienta externa.
**Referencia**: `content/03-fundamentos-de-ia/` — Tool calling.

### TUI (Text User Interface)
**Simple**: Interfaz de usuario basada en texto con elementos visuales como paneles y menús.
**Referencia**: `content/15-terminal/` — CLI vs TUI.

---

## V

### Verify (sdd-verify)
**Simple**: Fase de SDD donde se comprueba que la implementación cumple las especificaciones.
**Referencia**: `content/08-sdd/` — SDD Verify.

---

## W

### Worktree (Git)
**Simple**: Una copia de trabajo adicional de un repositorio Git, útil para trabajar en múltiples ramas simultáneamente.
**Referencia**: `content/02-git-y-github/` — Worktrees.
