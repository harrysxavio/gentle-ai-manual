# ADR-007: Catálogo de modelos

## Estado

Aceptado

## Decisión

El catálogo de modelos se mantiene en `data/models/catalog.yml` como fuente de verdad única.

- Cada modelo incluye: id, provider, class, reasoning, tool_call, status, verification_date
- Los capítulos referencian el catálogo, no duplican datos
- El catálogo se valida contra `opencode models` en CI
- Los modelos deprecados se marcan como `status: deprecated` no se eliminan
- ID de modelo sigue el formato del proveedor (e.g., `openai/gpt-5.6-sol`)
- Las evaluaciones locales viven en `evals/` con referencias al catálogo
