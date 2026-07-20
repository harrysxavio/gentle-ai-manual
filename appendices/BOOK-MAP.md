# Book Map — The Amazing Gentleman Programming Book

> **Última actualización**: 2026-07-20
> **Estado**: 🟢 Investigación completada — 21 capítulos
> **URL**: https://the-amazing-gentleman-programming-book.vercel.app
> **Autor**: Alan Buscaglia (Gentleman Programming)
> **Idiomas**: Inglés (`/en/book/`) y Español (`/es/book/`)
> **Formato**: Libro online gratuito + PDF descargable

---

## Índice completo de capítulos

### Capítulo 01 — Clean Agile
**Tipo**: Concepto + Tutorial  
**Temas**: Waterfall vs. Agile, Extreme Programming (XP) "Circle of Life", TDD, Atomic Design (átomos/moléculas/organismos), Functional Programming, User Stories.  
**Relación con el manual**: Fundamentos de metodología. El TDD que explica es la base del Strict TDD de SDD.

### Capítulo 02 — Communication First and Foremost
**Tipo**: Concepto  
**Temas**: Equipos distribuidos, trabajo asíncrono, fuentes de verdad (Notion/Confluence + tickets), coordinación de zonas horarias, definición de "done".  
**Relación con el manual**: Indirecta. Contexto de trabajo en equipo con herramientas del ecosistema.

### Capítulo 03 — Hexagonal Architecture
**Tipo**: Concepto + Código (TypeScript)  
**Temas**: Puertos y Adaptadores, drivers vs. driven actors, "Hexagonal Pizza Shop", ejemplo BankAccount.  
**Relación con el manual**: Arquitectura técnica. Referencia para `content/16-arquitectura-tecnica/`.

### Capítulo 04 — GoLang
**Tipo**: Tutorial / Guía de lenguaje  
**Temas**: Data types, structs, slices, pointers, maps, interfaces, goroutines, channels, mutex.  
**Relación con el manual**: Go es el lenguaje de gentle-ai, engram y GGA. Referencia para `content/16-arquitectura-tecnica/`.

### Capítulo 05 — NVIM Gentleman Guide
**Tipo**: Tutorial / Guía de herramientas  
**Temas**: WSL, Homebrew, LazyVim, Fish shell, Zellij, Wezterm, modos Vim, motions, registros, macros.  
**Relación con el manual**: Entorno de desarrollo del autor. Referencia opcional.

### Capítulo 06 — Algorithms the Gentleman Way
**Tipo**: Concepto + Tutorial  
**Temas**: Big O Notation, complejidad espacial, arrays y memoria, búsqueda binaria, bubble sort, crystal ball problem.  
**Relación con el manual**: Fundamentos de CS. No directamente relacionado con el ecosistema.

### Capítulo 07 — Gentleman of Code: Mastering Clean Architecture
**Tipo**: Concepto (15 sub-capítulos)  
**Temas**: Separation of Concerns, Design Patterns vs. Architecture, Plugin Architecture, Capas, Use Cases vs. Domain, Adapters, Performance & Security.  
**Relación con el manual**: Arquitectura. Referencia para `content/16-arquitectura-tecnica/`.

### Capítulo 08 — Applying Clean Architecture in the Front End
**Tipo**: Concepto + Tutorial  
**Temas**: Domain/Use Cases/Adapters/Frameworks en frontend, Scope Rule, Container Pattern, e-commerce example.  
**Relación con el manual**: Frontend con arquitectura limpia. Referencia para `content/18-construccion-de-productos/`.

### Capítulo 09 — Mastering React
**Tipo**: Tutorial / Guía de framework  
**Temas**: React vs. Next.js, JSX, hooks, Virtual DOM, Context API, useRef/useMemo/useCallback, portales, styling.  
**Relación con el manual**: Indirecta. Stack frontend para proyectos del ecosistema.

### Capítulo 10 — TypeScript Con De Tuti
**Tipo**: Tutorial / Guía de lenguaje  
**Temas**: Transpilación, dynamic vs. static typing, tipos, interfaces, union/intersection, utility types, function overloading.  
**Relación con el manual**: TypeScript es ubicuo en skills y plugins. Referencia para `content/10-skills/`.

### Capítulo 11 — Front End Radar
**Tipo**: Referencia / Comparación  
**Temas**: Astro, Next.js, Nuxt, Angular 18, SvelteKit, Qwik. Tabla comparativa (SSR, SSG, API routes, market).  
**Relación con el manual**: Contexto para justificar Astro+Starlight como stack de este manual.

### Capítulo 12 — Angular: Mastering the Framework
**Tipo**: Tutorial / Guía de framework  
**Temas**: Signals, RxJS, decorators, container/presentational, control flow (`@if/@for/@switch`), forms, interceptors SSR, testing.  
**Relación con el manual**: Indirecta. Alternativa de framework.

### Capítulo 13 — Barrels
**Tipo**: Concepto / Buena práctica  
**Temas**: Barrel exports, tree-shaking, módulos muertos, dependencias circulares, mitigaciones, alternativas.  
**Relación con el manual**: Indirecta. Patrón de organización de código.

### Capítulo 14 — Front-End History
**Tipo**: Referencia / Histórico  
**Temas**: 1990 a presente: web estática, Web 2.0, SPA era, consolidación SSR/JAMstack, meta-frameworks actuales.  
**Relación con el manual**: Contexto histórico. No directamente relacionado con el ecosistema.

### Capítulo 15 — AI-Driven Development with Claude Code 🟢
**Tipo**: Tutorial / Workflow  
**Temas**: Tony Stark/Jarvis analogy, Scope Rule, sistema de 7 subagentes, PROJECT_SPECS.md, TDD workflow (RED/GREEN + security/accessibility audits), proyecto TaskFlow con 10 user stories, 11 iteraciones.  
**Relación con el manual**: **DIRECTA.** El sistema de subagentes descrito es el precursor del que implementa gentle-ai. Referencia para `content/07-gentle-ai/`, `content/08-sdd/`, `content/12-opencode/`.

### Capítulo 16 — The Definitive Frontend Developer Manual
**Tipo**: Tutorial / Handbook (3 partes)  
**Temas**: HTML semántico, CSS cascade/box model/flexbox/grid, JavaScript event loop/closures/promises, Forms, Responsive, HTTP/caching, Accessibility/WCAG, State Management, Rendering Strategies, Build systems, Security XSS/CSRF, CI/CD.  
**Relación con el manual**: Referencia comprehensiva de frontend. Complementa `content/01-fundamentos-tecnologicos/`.

### Capítulo 17 — Soft Skills and Leadership
**Tipo**: Concepto / Filosofía  
**Temas**: "Heart of a Junior, knowledge of a Senior", tipos de liderazgo (Mentor vs. Task Completer), cómo convertirse en Senior, comunicación, mentoring.  
**Relación con el manual**: Filosofía del autor. Informa el tono pedagógico del manual.

### Capítulo 18 — Software Architecture Concepts
**Tipo**: Concepto  
**Temas**: Monolith/Modular Monolith/Microservices, Layered vs. Vertical Slice vs. Hexagonal vs. Scope Rule, Accidental vs. Essential complexity, Sync/async, Idempotency, Race conditions, Queues/Streams, Sagas, Circuit breakers, Caching, Scaling, Hot partitions, Schema evolution.  
**Relación con el manual**: Arquitectura de sistemas. Referencia para `content/16-arquitectura-tecnica/` y `content/18-construccion-de-productos/`.

### Capítulo 19 — AI Orchestration Patterns 🟢
**Tipo**: Concepto + Arquitectura  
**Temas**: NxM integration problem, 4 patrones (Supervisor, Hierarchical, ReAct, Plan-and-Execute), MCP deep dive (Host/Client/Server, Tools/Resources/Prompts/Sampling), Handoff/Magentic/Code Execution patterns, Clean Architecture for AI systems, Production readiness.  
**Relación con el manual**: **DIRECTA.** Base conceptual de gentle-ai como orquestador. El NxM problem justifica MCP. Referencia para `content/07-gentle-ai/`, `content/03-fundamentos-de-ia/`.

### Capítulo 20 — From Token to Agent 🟢
**Tipo**: Concepto / Técnico profundo  
**Temas**: Transformers, 3 etapas de entrenamiento, parámetros/VRAM, MoE, API stateless, tokens como moneda (BPE, "Spanish tax", problema "strawberry"), KV Cache (prefill/decode, prompt caching 1.25x/0.1x), cuantización (FP16/Q8/Q4), sampling (temperature/top-k/top-p), context window budget, "Lost in the Middle" (Liu et al. 2023), compaction, 3 estrategias de ingeniería, agentic loop (5 líneas), MCP, progressive disclosure (AGENTS.md → router+modules → skills registry), patrones de agente (parallel, sequential, routing, evaluator-optimizer, swarm, debate), spec-driven verifiable generation.  
**Relación con el manual**: **DIRECTA Y FUNDACIONAL.** Explica TODO lo que el manual debe enseñar sobre Modelos e IA. Referencia para `content/03-fundamentos-de-ia/`, `content/14-modelos-y-enrutamiento/`, `content/09-engram/`.

### Capítulo 21 — Verifiable Trust 🟢
**Tipo**: Concepto / Diseño de protocolo  
**Temas**: Protocolo completo de review: 5-action path (start, run lenses, produce evidence, finalize, validate), modelo de responsabilidades (Go vs. modelos), matriz de admisión causal, corrección acotada con budget forecasting, compact state CAS, gate context (pre-commit/pre-push/pre-pr/release), recovery e invalidación, threat model (stale writers, sin firmas criptográficas), trust model (content-bound, state-consistent, CAS-protected), comandos `gentle-ai` como facade del protocolo.  
**Relación con el manual**: **DIRECTA.** El capítulo usa comandos reales de gentle-ai. Especifica v2.1.8 como versión del protocolo. Referencia para `content/11-calidad-y-revision/`.

---

## Mapeo conceptual → capítulos del manual

| Concepto del libro | Capítulo(s) del libro | Módulo(s) del manual |
|-------------------|----------------------|---------------------|
| TDD y Atomic Design | 01 | 08 (SDD — Strict TDD) |
| Go lang | 04 | 16 (Arquitectura técnica) |
| TypeScript | 10 | 10 (Skills) |
| AI-Driven Development + subagentes | 15 | 07, 08, 12 |
| AI Orchestration Patterns + MCP | 19 | 03, 07 |
| Token to Agent + memoria + skills | 20 | 03, 09, 10, 14 |
| Verifiable Trust + review protocol | 21 | 11 |
| Clean / Hexagonal Architecture | 03, 07, 08 | 16, 18 |
| Frontend frameworks | 09, 11, 12 | 18 |
| Soft Skills | 17 | Filosofía del manual |

---

## Progresión del libro

El libro sigue una progresión **breadth-first, luego depth**:

```
Fase 1: Fundamentos (01-03) → Agile, comunicación, arquitectura
Fase 2: Lenguajes y herramientas (04-06) → Go, Neovim, algoritmos
Fase 3: Arquitectura profunda (07-08) → Clean Architecture, frontend
Fase 4: Frameworks (09-12) → React, TypeScript, Angular, comparación
Fase 5: Ingeniería avanzada (13-14, 16) → Barrels, historia, manual
Fase 6: AI y Arquitectura (15, 17-21) → AI-driven dev, liderazgo, orquestación, tokens, trust
```

---

## Insights únicos del libro (no derivables del código)

1. **"Every token competes with every other token"** (Ch.20) — el context window como presupuesto zero-sum
2. **"The API is stateless"** como insight unificador de todo el diseño de agentes (Ch.20)
3. **"Lost in the Middle"** (Liu et al. 2023) con reglas de ingeniería accionables (Ch.20)
4. **NxM Problem** formalizado como justificación económica de MCP (Ch.19)
5. **"Verifiable Trust, Never Blind Trust"** — tesis central del review protocol (Ch.20-21)
6. **Compact Receipt threat model**: content-bound, no cryptographically unforgeable (Ch.21)
7. **"Accidental vs. Essential Complexity"** aplicado a AI systems (Ch.18)
8. **Tres etapas de entrenamiento** como framework de diagnóstico de fallos de AI (Ch.20)
9. **"Heart of a Junior, Knowledge of a Senior"** — filosofía de liderazgo (Ch.17)
10. **Bytes-identical caching constraint**: `Current time: 14:32:07` destruye cache silenciosamente (Ch.20)

---

## Versiones referenciadas en el libro

| Capítulo | Referencia | Contexto |
|----------|-----------|----------|
| 05 | NVIM 0.9.5 (beta) | "still in beta phase" al momento de escritura |
| 11 | Angular 18 | Versión específica para SSR |
| 12 | Angular 19 updates | Sección dedicada |
| 15 | React 19, TypeScript, Tailwind CSS | Stack del proyecto TaskFlow |
| 15 | Claude Opus 4.1, Claude 4 Sonnet, Claude 3.5 Haiku | Subagentes |
| 16 | Node.js 20 | CI/CD GitHub Actions |
| 16 | WCAG 2.1 Level AA | Target de accesibilidad |
| 21 | **gentle-ai v2.1.8** | Versión explícita del review protocol |
| 21 | `gentle-ai.review-receipt/v2` | Schema versioning |

---

*Investigación completada el 2026-07-20. Capítulos verificados uno por uno contra el sitio web oficial.*
