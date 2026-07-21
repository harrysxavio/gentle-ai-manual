# Verificación de cobertura de los criterios de aceptación

> **Versión**: 2026-07-20 | **Criterios**: 45 | **Resultado**: 22 Implemented, 18 Partial, 2 Planned y 3 Not verified

Esta matriz mapea los 45 criterios de la sección 48 de la misión a evidencia presente en el repositorio. Un archivo, un ADR, una plantilla o una configuración no demuestran por sí solos que un comportamiento esté completo.

## Leyenda

| Estado | Significado |
|---|---|
| Implemented | El contenido o comportamiento visible para el usuario existe y tiene evidencia directa en el repositorio. |
| Partial | Existe evidencia, pero no demuestra por completo el criterio de aceptación. |
| Planned | Existe un diseño, marcador o intención, pero no una implementación utilizable. |
| Not verified | El repositorio no contiene evidencia suficiente para afirmar el criterio. |

Los elementos `Planned` **no cuentan como cobertura implementada**.

## Criterios técnicos (1-20)

| # | Criterio | Estado | Evidencia actual y límite |
|---|---|---|---|
| 1 | El sitio compila | Implemented | `package.json` expone `npm run build`; el contrato genera 49 páginas con Astro. |
| 2 | Markdown es fuente principal | Implemented | El contenido fuente está en `src/content/docs/` como archivos `.md` y `.mdx`; véase también `docs/adr/ADR-002-content-source-of-truth.md`. |
| 3 | Sidebar completo | Implemented | `astro.config.mjs` declara la navegación de los módulos 00-20. |
| 4 | Responsive | Partial | Starlight y `src/styles/custom.css` aportan una base adaptable, pero no hay pruebas de viewport ni una auditoría responsive completa. |
| 5 | Claro/oscuro | Implemented | El tema de Starlight configurado en `astro.config.mjs` incluye el selector de apariencia. |
| 6 | Búsqueda | Implemented | El build de Starlight genera el índice Pagefind para el sitio. |
| 7 | Modos Esencial y Profundo | Planned | `docs/adr/ADR-009-learning-modes.md` describe la intención; el selector de modo y su comportamiento no están implementados. |
| 8 | Diagramas válidos | Implemented | `scripts/validate-mermaid.cjs` analiza 50 diagramas con `mermaid.parse`; `rehype-mermaid` los transforma a SVG y `scripts/validate-built-site.cjs` rechaza bloques sin renderizar. |
| 9 | Enlaces válidos | Implemented | `scripts/validate-built-site.cjs` comprueba los destinos generados bajo `/gentle-ai-manual/`; `tests/site-contract.test.cjs` cubre rutas relativas, base y escapes. |
| 10 | Comandos documentados | Partial | Existen cuatro catálogos en `data/commands/` y una referencia en el módulo 20; no se verificó que cubran todos los comandos y versiones actuales. |
| 11 | Git explicado | Implemented | `src/content/docs/02-git-y-github/` contiene la ruta dedicada a Git y GitHub. |
| 12 | Frontend/backend explicado | Implemented | `src/content/docs/01-fundamentos-tecnologicos/04-frontend-backend.md` contiene la explicación dedicada. |
| 13 | Bases de datos explicado | Implemented | `src/content/docs/01-fundamentos-tecnologicos/05-bases-de-datos.md` contiene la explicación dedicada. |
| 14 | MCP explicado | Implemented | `src/content/docs/03-fundamentos-de-ia/03-mcp-y-tool-calling.md` y el módulo 09 cubren concepto y uso con Engram. |
| 15 | Agentes/modelos/proveedores diferenciados | Implemented | `src/content/docs/03-fundamentos-de-ia/01-modelos-proveedores-agentes.md` separa los conceptos y el módulo 14 amplía el enrutamiento. |
| 16 | Skills/agentes/comandos diferenciados | Implemented | Los módulos 07, 10 y 20 presentan cada superficie por separado. |
| 17 | OpenCode completo | Partial | El módulo 12 contiene instalación y configuración, pero `RESEARCH-GAPS.md` mantiene pendientes las fuentes oficiales y funciones actuales de OpenCode. |
| 18 | Codex completo | Partial | El módulo 13 contiene configuración y flujos, pero `RESEARCH-GAPS.md` registra verificación oficial y multiagente como pendientes. |
| 19 | Engram funcional y técnico | Partial | El módulo 09 cubre uso y arquitectura; `RESEARCH-GAPS.md` registra comportamiento de conflictos y estabilidad cloud por verificar. |
| 20 | GGA/Judgment/Native Review separados | Implemented | El módulo 11 contiene capítulos diferenciados para GGA, Native Review y Judgment Day. |

## Criterios de modelos y enrutamiento (21-35)

| # | Criterio | Estado | Evidencia actual y límite |
|---|---|---|---|
| 21 | Model routing completo | Partial | El módulo 14 y `data/models/routing.yml` documentan reglas; `RESEARCH-GAPS.md` mantiene fallbacks reales, tool calling y esfuerzo por proveedor sin verificar. |
| 22 | Tabla por subagente Gentle | Implemented | `data/agents/gentle-agents.yml` contiene el catálogo usado por el módulo 14. |
| 23 | Tabla de agentes genéricos | Implemented | `data/agents/generic-agents.yml` contiene la tabla correspondiente. |
| 24 | Niveles de razonamiento normalizados | Implemented | `MODEL_CATALOG_SNAPSHOT.md` y el módulo 14 presentan la normalización utilizada por el curso. |
| 25 | OpenAI, Google, Anthropic, Go y Zen cubiertos | Partial | `MODEL_CATALOG_SNAPSHOT.md` y `data/models/catalog.yml` contienen entradas de proveedores; `RESEARCH-GAPS.md` mantiene el catálogo Zen y fuentes de modelos pendientes. |
| 26 | Fallbacks | Implemented | `data/models/routing.yml` incluye `routing_rules` y el módulo 14 explica cadenas de fallback. |
| 27 | Benchmark local | Planned | Hay instrucciones y un laboratorio de benchmarking, pero no existe un runner ni un conjunto local `evals/` utilizable. |
| 28 | Costos | Partial | El módulo 17 explica estimación y gobierno; los precios actualizados siguen pendientes en `RESEARCH-GAPS.md`. |
| 29 | Laboratorios | Partial | `src/content/docs/19-laboratorios/01-laboratorios.md` contiene 20 laboratorios, pero no demuestra una evaluación ejecutada ni una rúbrica completa y validada para todos. |
| 30 | Ruta principiante | Implemented | `INDEX.md` define la ruta «Principiante total» con su secuencia de módulos. |
| 31 | Ruta avanzada | Implemented | `INDEX.md` define rutas avanzadas para perfiles técnicos, OpenCode, Codex y arquitectura. |
| 32 | Proyecto integrador | Partial | El módulo 18 y el laboratorio 20 describen el proyecto; no hay evidencia de una ejecución completa ni una rúbrica de aceptación validada. |
| 33 | Trazabilidad | Partial | 46 archivos de contenido incluyen `Fuentes verificadas`, pero `SOURCE_TRACEABILITY.md` solo mapea de forma explícita siete capítulos. |
| 34 | Funciones experimentales marcadas | Partial | Existe `src/components/pedagogicos/Experimental.astro` y un registro en `RESEARCH-GAPS.md`; no hay una comprobación que garantice el marcado de todas las afirmaciones experimentales. |
| 35 | Diferencias de versión | Partial | Existe `src/components/pedagogicos/DiferenciaVersion.astro` y `VERSION_COMPATIBILITY.md`; no se verificó cobertura completa de todas las diferencias citadas. |

## Criterios de calidad (36-45)

| # | Criterio | Estado | Evidencia actual y límite |
|---|---|---|---|
| 36 | Interfaz profesional | Partial | Astro, Starlight y `src/styles/custom.css` producen una interfaz consistente; no existe una auditoría visual, responsive y de accesibilidad que cierre el criterio cualitativo. |
| 37 | CI | Implemented | `.github/workflows/ci.yml` instala Chromium y ejecuta el contrato secuencial `npm run validate`, que cubre Astro, lint, Mermaid, modelos, pruebas, build y sitio generado. El contrato pasó localmente; la primera ejecución remota posterior al cambio requiere un push. |
| 38 | GitHub Pages preparado | Implemented | `astro.config.mjs` usa el sitio y base correctos; el job `quality` sube el `dist/` validado y `deploy` consume ese mismo artefacto solo en un push a `main`. La publicación remota posterior al cambio aún no fue comprobada. |
| 39 | No existen afirmaciones sin evidencia | Not verified | Las secciones `Fuentes verificadas` ayudan, pero no prueban que cada afirmación tenga respaldo ni que las fuentes estén actualizadas. |
| 40 | No existen términos esenciales sin definición | Partial | `GLOSSARY.md` y `data/terminology/glossary.yml` ofrecen un glosario; no hay una prueba de cobertura de todos los términos esenciales usados. |
| 41 | Un principiante puede completar el curso | Not verified | Existe una ruta principiante en `INDEX.md`, pero no hay evidencia de prueba con alumnos, finalización o criterios de evaluación completos. |
| 42 | Un usuario avanzado puede configurar agentes y modelos | Partial | Los módulos 12-14 y los laboratorios 11-14 ofrecen instrucciones; no existe evidencia de ejecución reproducible de extremo a extremo. |
| 43 | Un lector técnico puede rastrear funciones al código | Partial | El módulo 16 y `SOURCE_TRACEABILITY.md` aportan rutas, pero la matriz explícita solo cubre siete capítulos. |
| 44 | El usuario puede construir un producto con el ecosistema | Partial | El módulo 18 y el laboratorio 20 describen el recorrido; no hay una implementación de referencia ejecutada y verificada en este repositorio. |
| 45 | El usuario comprende no solo cómo usarlo, sino por qué funciona | Not verified | Parte del contenido separa explicaciones simples y técnicas, pero la comprensión del alumno no está evaluada ni demostrada. |

## Inventario verificable

Este inventario ayuda a localizar evidencia, pero sus cantidades no sustituyen los estados de la matriz.

| Elemento | Evidencia actual |
|---|---|
| Módulos | 21 directorios numerados, del 00 al 20, en `src/content/docs/`. |
| Contenido | 48 archivos `.md` o `.mdx` bajo `src/content/docs/`. |
| Laboratorios | 20 secciones numeradas en `src/content/docs/19-laboratorios/01-laboratorios.md`. |
| Componentes pedagógicos | 25 componentes Astro en `src/components/pedagogicos/`. |
| ADR | 9 archivos `ADR-*.md` en `docs/adr/`. |
| Datos estructurados | 10 archivos YAML bajo `data/`. |
| Trazabilidad explícita | 7 capítulos en `SOURCE_TRACEABILITY.md`. |
| Validación de Mermaid | 50 bloques analizados; el sitio generado debe contener SVG y ningún bloque `language-mermaid` sin renderizar. |

## Resultado

| Estado | Cantidad | Interpretación |
|---|---:|---|
| Implemented | 22 | Hay contenido o comportamiento y evidencia directa. |
| Partial | 18 | Existe una base, pero falta evidencia o alcance para cerrar el criterio. |
| Planned | 2 | Hay intención documentada sin implementación utilizable. |
| Not verified | 3 | La afirmación no puede demostrarse con el repositorio actual. |
| **Total** | **45** | Todos los criterios conservan su numeración original. |

Los principales huecos implementables son los modos Esencial/Profundo, el benchmark local, la evaluación de los laboratorios y la trazabilidad completa. La ejecución remota del nuevo CI y el despliegue deben comprobarse después de un push. Los resultados de aprendizaje que dependen de usuarios reales permanecen `Not verified` hasta contar con evaluación observable.

*Verificación alineada con la sección 48 de la misión.*
