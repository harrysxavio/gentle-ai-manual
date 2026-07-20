# ADR-002: Markdown como fuente de verdad única

## Estado

Aceptado

## Contexto

El sitio web puede renderizar contenido de dos formas: generarlo desde Markdown o tener contenido HTML/JSX como fuente principal.

## Decisión

Markdown es la fuente de verdad absoluta. La web se genera desde los archivos `.md` en `content/`.

Esto significa:
- Todo el contenido educativo existe en Markdown primero
- La web es un render del Markdown, no al revés
- No existe contenido en la web que no esté en Markdown
- Los componentes interactivos (modo esencial/profundo, selector de modelos) operan sobre el Markdown usando frontmatter y selectores CSS

## Consecuencias

- Cualquier editor de texto puede modificar contenido
- El contenido funciona sin el sitio web (GitHub, editores, IDEs)
- Migración futura simplificada
- Los componentes interactivos deben implementarse como overlays sobre Markdown renderizado
- No se puede depender de JSX para contenido educativo
