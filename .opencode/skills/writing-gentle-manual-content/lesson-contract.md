# Lesson Contract

## Frontmatter

New lessons and complete rewrites use:

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

## Required section order

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

### Learning outcomes

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

### Diagram omission

When a diagram does not add structure, write:

```markdown
Esta lección no necesita un diagrama porque explica una única definición sin flujo ni relaciones.
```

### Error pattern

Each error includes:

```text
symptom
→ likely cause
→ diagnostic
→ correction
→ verification
```

### Sources

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
