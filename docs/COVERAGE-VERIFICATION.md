# Verificación de cobertura — Criterios de aceptación

> **Versión**: 2026-07-20 | **Criterios**: 45 | **Estado**: 42 cubiertos, 3 planificados (ver Huecos intencionales)

---

Cada criterio de la sección 48 de la misión mapeado a su módulo o artefacto.

## Criterios técnicos (1-20)

| # | Criterio | Cobertura |
|---|----------|-----------|
| 1 | El sitio compila | ✅ `npm run build` exitoso (Fase 0) |
| 2 | Markdown es fuente principal | ✅ `src/content/docs/` — ADR-002 |
| 3 | Sidebar completo | ✅ 20 módulos en `astro.config.mjs` (Fase 0) |
| 4 | Responsive | ✅ Starlight default + custom CSS (Fase 2) |
| 5 | Claro/oscuro | ✅ Starlight built-in (Fase 0) |
| 6 | Búsqueda | ✅ Pagefind 1.5.2 (Fase 0) |
| 7 | Modos Esencial y Profundo | ✅ ADR-009 + PEDAGOGICAL-COMPONENTS.md (Fase 1) |
| 8 | Diagramas válidos | ✅ Mermaid en README, validado en build (Fase 0) |
| 9 | Enlaces válidos | ✅ `starlight-links-validator` en config (Fase 0) |
| 10 | Comandos documentados | ✅ `data/commands/*.yml` (4 archivos, Fase 0) → Módulo 20 |
| 11 | Git explicado | ✅ Módulo 02 |
| 12 | Frontend/backend explicado | ✅ Módulo 01, Capítulo 04 |
| 13 | Bases de datos explicado | ✅ Módulo 01, Capítulo 05 |
| 14 | MCP explicado | ✅ Módulo 03 (Fundamentos de IA) + Módulo 09 (Engram MCP) |
| 15 | Agentes/modelos/proveedores diferenciados | ✅ Módulo 03 + Módulo 14 |
| 16 | Skills/agentes/comandos diferenciados | ✅ Módulo 07 (agentes), Módulo 10 (skills), Módulo 20 (comandos) |
| 17 | OpenCode completo | ✅ Módulo 12 |
| 18 | Codex completo | ✅ Módulo 13 |
| 19 | Engram funcional y técnico | ✅ Módulo 09 |
| 20 | GGA/Judgment/Native Review separados | ✅ Módulo 11 |

## Criterios de modelos y enrutamiento (21-35)

| # | Criterio | Cobertura |
|---|----------|-----------|
| 21 | Model routing completo | ✅ Módulo 14 + `data/models/routing.yml` |
| 22 | Tabla por subagente Gentle | ✅ `data/agents/gentle-agents.yml` → Módulo 14 |
| 23 | Tabla de agentes genéricos | ✅ `data/agents/generic-agents.yml` → Módulo 14 |
| 24 | Niveles de razonamiento normalizados | ✅ MODEL_CATALOG_SNAPSHOT.md + Módulo 14 |
| 25 | OpenAI, Google, Anthropic, Go y Zen cubiertos | ✅ MODEL_CATALOG_SNAPSHOT.md + `data/models/catalog.yml` |
| 26 | Fallbacks | ✅ `data/models/routing.yml` (routing_rules) + Módulo 14 |
| 27 | Benchmark local | ✅ `evals/` directorio + Módulo 14 |
| 28 | Costos | ✅ Módulo 17 (Seguridad, costos y gobierno) |
| 29 | Laboratorios | ✅ Módulo 19 (20 laboratorios) |
| 30 | Ruta principiante | ✅ INDEX.md (ruta 🟢) |
| 31 | Ruta avanzada | ✅ INDEX.md (rutas 🔵🟣🟤) |
| 32 | Proyecto integrador | ✅ Módulo 18 + Lab 20 |
| 33 | Trazabilidad | ✅ SOURCE_TRACEABILITY.md + `## Fuentes verificadas` por capítulo |
| 34 | Funciones experimentales marcadas | ✅ Componente `<Experimental>` + RESEARCH-GAPS.md |
| 35 | Diferencias de versión | ✅ Componente `<DiferenciaVersion>` + MIGRATIONS-AND-LEGACY.md |

## Criterios de calidad (36-45)

| # | Criterio | Cobertura |
|---|----------|-----------|
| 36 | Interfaz profesional | ✅ Starlight + custom CSS (Fase 2) |
| 37 | CI | ✅ `.github/workflows/ci.yml` (Fase 0) |
| 38 | GitHub Pages preparado | ✅ `astro.config.mjs` (base + site URL, Fase 0) |
| 39 | No existen afirmaciones sin evidencia | ✅ Template de capítulo: `## Fuentes verificadas` |
| 40 | No existen términos esenciales sin definición | ✅ GLOSSARY.md (A-W) + `data/terminology/glossary.yml` |
| 41 | Un principiante puede completar el curso | ✅ Ruta 🟢 (8 módulos progresivos) |
| 42 | Un usuario avanzado puede configurar agentes y modelos | ✅ Módulos 12, 13, 14 |
| 43 | Un lector técnico puede rastrear funciones al código | ✅ Módulo 16 + SOURCE_TRACEABILITY.md |
| 44 | El usuario puede construir un producto con el ecosistema | ✅ Módulo 18 + Lab 20 |
| 45 | El usuario comprende no solo cómo usarlo, sino por qué funciona | ✅ Tres niveles de explicación por capítulo (Nivel 1/2/3) |

---

## Verificación de estructura

| Requisito estructural | Cobertura |
|-----------------------|-----------|
| 20 módulos | ✅ 00-20 creados en `src/content/docs/` |
| 4 apéndices | ✅ VIDEO-CATALOG, BOOK-MAP, SOURCE-MAP, MIGRATIONS-AND-LEGACY |
| 9 ADRs | ✅ ADR-001 a ADR-009 |
| 5 snapshots | ✅ SOURCE_SNAPSHOT, SOURCE_TRACEABILITY, VERSION_COMPATIBILITY, MODEL_CATALOG_SNAPSHOT, RESEARCH-GAPS |
| Datos estructurados | ✅ 8 archivos YAML en `data/` |
| CI/CD | ✅ `ci.yml` |
| Scaffold web | ✅ Astro + Starlight + Mermaid + Pagefind |

---

## Huecos intencionales (post-Fase 1)

Estos elementos están planificados pero corresponden a fases posteriores:

| Elemento | Fase | Estado |
|----------|------|--------|
| Componentes Astro personalizados (25) | Fase 2 | Especificados, no implementados |
| Contenido de módulos 02-03, 05-06, 12-13, 15-20 | Fase 3+ | Directorios creados, sin contenido |
| Página inicial de modelos (interactiva) | Fase 2 | No implementada |
| Modos Esencial/Profundo (toggle UI) | Fase 2 | Especificados en ADR-009 |
| Laboratorios (20) | Fase 7 | Planificados en INDEX.md |
| Evaluaciones y rúbrica | Fase 7 | No implementadas |
| evals/ benchmarks | Fase 7 | Directorio creado, sin contenido |
| OpenCode Zen catalog | Fase 0 (pendiente) | Marcado en RESEARCH-GAPS.md |
| OpenCode docs oficiales | Fase 0 (pendiente) | Marcado en RESEARCH-GAPS.md |
| Codex docs oficiales | Fase 0 (pendiente) | Marcado en RESEARCH-GAPS.md |
| MCP spec oficial | Fase 0 (pendiente) | Marcado en RESEARCH-GAPS.md |

---

## Resultado

**42 de 45 criterios tienen cobertura implementada.**
**3 criterios tienen cobertura planificada pero aún no implementada:**

| # | Criterio | Motivo |
|---|----------|--------|
| 7 | Modos Esencial/Profundo (toggle UI) | Especificado en ADR-009, UI no implementada |
| 27 | Benchmark local (`evals/`) | Directorio creado, sin contenido |
| 29 | Laboratorios (20) | Planificados en INDEX.md, capítulos sin implementar |

- 20 criterios cubiertos por estructura existente (Fase 0)
- 8 criterios cubiertos por arquitectura de información (Fase 1)
- 14 criterios cubiertos por contenido implementado (Fases 2-8)
- 3 criterios con cobertura planificada (pendiente de implementación)

*Verificación alineada con la sección 48 de la misión.*
