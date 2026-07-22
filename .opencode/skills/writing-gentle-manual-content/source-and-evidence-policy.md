# Source and Evidence Policy

## Authority order

1. First-party specifications, documentation, code and tests.
2. Official repositories and release notes.
3. The Gentleman Programming book for pedagogical framing.
4. The System Design video/article for concept mapping.
5. Secondary sources for examples only.

## Stable and volatile content

Stable concepts still require a credible source, but not repeated version dates.

Volatile claims include commands, configuration keys, install paths, product surfaces, supported agents, releases, models and compatibility.

Every volatile claim stores:

```text
source
verified_at
observed version or commit
scope
status
```

## Source matrix

Before drafting:

| Concept | Canonical page | Conceptual source | Primary technical source | Volatile | Test |
|---|---|---|---|---|---|

## Paraphrasing

- Write original explanations.
- Do not reproduce long passages.
- A video may provide sequence and vocabulary, not verbatim prose.
- A book may provide a mental model, not proof of current product behavior.

## Current product boundaries

Explain using first-party evidence and re-check whenever the page is edited:

- OpenCode surfaces and capabilities.
- Codex app, editor and CLI surfaces.
- Gentle-AI as a configurator that equips supported coding agents.
- Engram interfaces and storage behavior.

## Uncertainty

When evidence is incomplete:

```markdown
> Estado de verificación: pendiente.
> La explicación conceptual es válida, pero esta capacidad concreta no se publica como disponible hasta verificarla.
```

Pending claims cannot appear in quick-start commands or recommendations.
