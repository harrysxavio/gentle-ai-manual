# ADR-004: Búsqueda

## Estado

Aceptado

## Contexto

El sitio necesita búsqueda de texto completo sobre todo el contenido.

## Decisión

Usar **Pagefind**, el motor de búsqueda estático incluido en Starlight.

Pagefind:
- Indexa el HTML estático post-build
- No requiere servidor ni SaaS externo
- Funciona offline
- Búsqueda por fuzzy matching
- Resultados con contexto (fragmentos del contenido)
- Zero configuración con Starlight

## Consecuencias

- Sin dependencia de Algolia, Elasticsearch u otros servicios
- Búsqueda funciona en GitHub Pages (puramente estático)
- Limitado a búsqueda sobre contenido estático (sin filtros dinámicos avanzados)
