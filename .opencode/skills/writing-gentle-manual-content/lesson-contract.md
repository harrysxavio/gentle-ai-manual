# Lesson Contract

Este archivo describe los contratos de lección V1 y V2. Las páginas V1 se mantienen sin cambios; las reescrituras y las páginas nuevas usan el contrato V2 (ver `SKILL.md` y `MIGRATION.md` del skill).

## Contrato V1 (`manual_contract: lesson-v1`)

### Frontmatter

```yaml
---
title: "Título concreto"
description: "Qué podrá comprender o hacer el lector."
manual_contract: lesson-v1
content_level:
  - beginner
  - operator
  - architect
estimated_minutes: 25
learning_outcome: "Explicar y verificar..."
canonical_concepts:
  - concepto-uno
  - concepto-dos
source_status: verified
---
```

Adapt field names only when the repository already has a canonical schema. Do not introduce two schemas.

### Required section order (V1)

1. Resultado de aprendizaje.
2. Respuesta simple.
3. Modelo mental.
4. Mapa o recorrido.
5. Ejemplo continuo.
6. Recorrido práctico.
7. Cómo funciona internamente.
8. Cuándo usarlo y cuándo evitarlo.
9. Costos y trade-offs.
10. Errores frecuentes.
11. Comprueba lo aprendido.
12. Resumen.
13. Fuentes y alcance.

## Contrato V2 (`manual_contract: lesson-v2`)

### Frontmatter

```yaml
---
title: "Título concreto"
description: "Qué podrá comprender o hacer el lector."
manual_contract: lesson-v2
content_level:
  - beginner
  - operator
  - architect
estimated_minutes: 25
learning_outcome: "Explicar y verificar..."
canonical_concepts:
  - concepto-uno
  - concepto-dos
lesson_terms:
  - termino-uno
persona: producto
learning_resources:
  - mdn-web-docs
snapshot: 2.2.3
practice_mode: none
diagram_mode: none
faq_mode: none
source_status: verified
level: 1
estimatedTime: 25 min
---
```

Los campos obligatorios completos viven en `REQUIRED_FIELDS` de `scripts/validate-v2-contracts.cjs`; `npm run validate` rechaza cualquier campo faltante, vacío o fuera de rango. Reglas clave:

- `content_level` — lista del vocabulario canónico (`beginner`, `operator`, `architect`); nunca vacía ni con valores ajenos.
- `canonical_concepts` y `lesson_terms` — listas de strings no vacíos; los términos deben existir en `data/terminology/glossary.yml`.
- `snapshot` — versión verificada de `data/compatibility/versions.yml` en formato canónico `X.Y.Z` (se normaliza el prefijo `v`), o `none` como exclusión explícita.
- `persona` — ID de `data/resources/personas.yml` o `none`.
- `learning_resources` — lista de IDs de `data/resources/learning-resources.yml`.
- `practice_mode` (`guided` o `none`), `diagram_mode` (`mermaid` o `none`), `faq_mode` (`faq` o `none`).
- `level` — entero de 1 a 3 (nivel de profundidad de la lección).
- `estimatedTime` — texto legible, por ejemplo `"25 min"`.

### Secciones editoriales (V2)

El validador comprueba frontmatter, no la uniformidad de headings. Las secciones recomendadas (no obligatorias uniformemente) son:

1. Propósito
2. Respuesta simple
3. Analogía (con límite explícito, opcional)
4. Ejemplo continuo
5. Explicación progresiva
6. Aplicación práctica
7. Funcionamiento técnico (opcional)
8. Decisiones, alternativas y límites
9. FAQ de errores (solo si `faq_mode: faq`)
10. Resumen
11. Términos de esta lección
12. Para seguir aprendiendo

## Learning outcomes

Use observable verbs:

- explain;
- distinguish;
- trace;
- configure;
- diagnose;
- compare;
- justify;
- verify.

Avoid “conocer”, “aprender todo” or “dominar” without measurable evidence.

## Diagram omission

When a diagram does not add structure, write:

```markdown
Esta lección no necesita un diagrama porque explica una única definición sin flujo ni relaciones.
```

## Error pattern

Each error includes:

```text
symptom
→ likely cause
→ diagnostic
→ correction
→ verification
```

## Sources

```markdown
## Fuentes y alcance

- Fuente conceptual:
- Fuente técnica primaria:
- Hechos volátiles verificados:
- Fecha de verificación:
- Alcance de la comprobación:
```

Omit volatile-date fields only when no volatile claim exists.

## Reference pages

Reference pages use `manual_contract: reference-v1` and may omit the continuous example, but must include scope, canonical links, provenance and usage guidance.

## Lab pages

Lab pages use `manual_contract: lab-v1` and follow `exercises-and-labs.md`.
