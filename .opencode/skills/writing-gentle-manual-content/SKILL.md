---
name: writing-gentle-manual-content
description: Use when creating, rewriting, reviewing, or expanding lessons, glossary entries, diagrams, examples, exercises, tool comparisons, screenshots, or technical explanations in the Gentle-AI manual. Covers V1 and V2 content.
license: MIT
compatibility: opencode
metadata:
  project: gentle-ai-manual
  language: es
  content-system: astro-starlight
  version: 2.0.0
---
# Writing Gentle Manual Content V2

## Propósito

Escribe una explicación amable y continua que una persona principiante pueda comprender, una persona operadora pueda aplicar y una persona arquitecta pueda cuestionar.

## Idioma y voz

- Escribir DIRECTAMENTE en castellano neutral. No usar el flujo español → inglés → español.
- Usar preferentemente: puedes, necesitas, quieres, sabes, elige, configura, ejecuta, guarda, selecciona, agrega, activa, abre, continúa.
- Evitar: vos, podés, necesitás, querés, sabés, elegí, configurá, ejecutá, guardá, seleccioná, agregá, activá, abrí, continuá.
- Tono de profesor paciente y cercano, sin relleno corporativo.
- No exagerar capacidades ni usar superlativos.
- Conservar precisión técnica sin mostrarla como sección repetitiva.
- Párrafos fluidos de 3 a 6 oraciones; evitar frases telegráficas encadenadas.
- La segunda lectura editorial (paso 11) neutraliza cualquier regionalismo residual; el validador solo refuerza formas inequívocas.

## Unidad de trabajo

Máximo una reescritura completa por ejecución. Dos páginas solo si son cortas, vecinas y comparten el mismo ejemplo.

## Archivos obligatorios

Antes de escribir, leer:

1. `src/data/curriculum.mjs` — entrada canónica y lecciones vecinas.
2. `.opencode/skills/writing-gentle-manual-content/SKILL.md` — este skill.
3. `data/evidence/verified-claims.yml` — claims volátiles.
4. `data/evidence/gentle-command-catalog.yml` — comandos actuales.
5. `data/terminology/glossary.yml` — glosario canónico.
6. `data/compatibility/versions.yml` — versiones verificadas.
7. `data/resources/personas.yml` — personas del banco.
8. `data/resources/learning-resources.yml` — recursos educativos.
9. `scripts/validate-manual-content.cjs` — contrato de validación actual.

Además, leer los contratos editoriales hermanos del skill (obligatorios según el tipo de contenido):

10. `lesson-contract.md` — contrato de frontmatter y secciones V1/V2.
11. `audience-levels.md` — vocabulario canónico de niveles (`beginner`, `operator`, `architect`).
12. `design-and-ux.md` — accesibilidad, diseño e interfaz.
13. `images-and-attribution.md` — procedencia de imágenes y atribución.
14. `quality-rubric.md` — rúbrica de calidad, hard failures y puntuación.
15. `source-and-evidence-policy.md` — política de fuentes y evidencia.
16. `diagrams-and-examples.md` — diagramas y ejemplos.
17. `exercises-and-labs.md` — ejercicios y laboratorios.
18. `reference-lesson.md` — páginas de referencia.
19. `route-continuity.md` — continuidad de rutas de aprendizaje.

## Workflow obligatorio

### 1. Inventario

Reportar: URL, archivo, objetivo, audiencia, conceptos canónicos, términos nuevos, persona del ejemplo, claims volátiles, recursos candidatos, duplicidades, observaciones, tests existentes.

### 2. Matriz de fuentes

Separar fuente conceptual, evidencia primaria, recurso de aprendizaje, claim volátil y test.

### 3. RED

Escribir primero una prueba que falle para la brecha demostrada.

### 4. Esqueleto pedagógico

Proponer: por qué importa → explicación simple → analogía (con límite explícito) → ejemplo real continuo → uso → mecanismo → decisiones → errores frecuentes (FAQ) → resumen → términos → recursos.

### 5. Borrador

- Una idea central por párrafo.
- Conectar causa, ejemplo y consecuencia.
- Definir antes de usar.
- Máximo cinco términos nuevos antes de recapitular.
- Aclarar qué hace el usuario, el agente, el modelo y la herramienta.
- No asumir que el lector sabe leer código.
- No convertir listas en sustituto de explicación.

### 6. Ejemplo continuo

Elegir una persona del banco (`data/resources/personas.yml`). Mantener el mismo caso desde la explicación simple hasta los trade-offs. No presentar cinco ejemplos desconectados.

### 7. Términos

- Declarar `lesson_terms` en el frontmatter.
- Marcar con `*` los usos contextuales definidos al final.
- No duplicar definiciones completas.
- Enlazar al glosario canónico.

### 8. Práctica

Solo cuando demuestra una capacidad real. Si no corresponde, declarar `practice_mode: none` en el frontmatter. No crear preguntas de control ni quiz.

### 9. Errores frecuentes (FAQ)

Usar el patrón:

```text
Qué observas → Qué significa → Cómo comprobar → Cómo resolver → Cómo confirmar
```

Si la lección no tiene errores frecuentes aplicables, declarar `faq_mode: none`.

### 10. Recursos

Mostrar recursos gratuitos desde `data/resources/learning-resources.yml` por ID. No presentar videos como prueba de comportamiento actual. No usar YouTube como fuente verificable de comandos o versiones.

### 11. Segunda lectura editorial

Aplicar solo a las páginas MODIFICADAS en esta ejecución (no a todo el manual). Leer el borrador completo una segunda vez con lente exclusivamente editorial:

- Neutralizar regionalismos residuales (voseo, localismos).
- Mejorar fluidez: unir frases telegráficas, ajustar transiciones.
- Conservar el hilo pedagógico y la persona del ejemplo.
- NO cambiar comandos, código, rutas, enlaces ni versiones (verificarlos y dejarlos intactos).
- Confirmar que los campos visibles del frontmatter (`title`, `description`, `learning_outcome`) están en castellano neutral.

### 12. Revisión triple

Simular principiante, operador y arquitecto. Verificar: comprensión, aplicación, diagnóstico, límites y alternativas.

### 13. GREEN

Ejecutar `npm run validate`, `npm run test:visual`, `npm run build`, `npm run check-site`. Corregir en la misma rama y PR.

### 14. Puntaje

>= 90/100, cero hard failures.

### 15. Review loop

Misma rama, misma PR, prueba de regresión, nuevo HEAD, nuevo CI, nueva revisión de Codex.

## Contratos V1 y V2

### Páginas V1 (`manual_contract: lesson-v1`)

Campos requeridos en frontmatter:
- `manual_contract`, `title`, `description`, `content_level`
- `estimated_minutes`, `learning_outcome`, `canonical_concepts`
- `source_status`

`level` y `estimatedTime` NO son requeridos en V1: `validate-manual-content.cjs` no los exige y las páginas V1 los omiten. Las páginas V1 se mantienen sin cambios; esos campos pertenecen al contrato V2.

Secciones requeridas en el cuerpo: 13 headings (ver `scripts/validate-manual-content.cjs`).

Estas páginas se mantienen. No se migran en PR 7. La migración ocurre en fases posteriores módulo por módulo.

### Páginas V2 (`manual_contract: lesson-v2`)

Campos requeridos en frontmatter:
- `manual_contract: lesson-v2`
- `title`, `description`, `content_level` (lista de niveles)
- `estimated_minutes`, `learning_outcome`
- `canonical_concepts`, `lesson_terms`
- `persona` (ID del banco de personas o `none`)
- `learning_resources` (lista de IDs)
- `snapshot` (versión o `none`; formato canónico `X.Y.Z`, se normaliza el prefijo `v`)
- `practice_mode` (`guided` o `none`)
- `diagram_mode` (`mermaid` o `none`)
- `faq_mode` (`faq` o `none`)
- `source_status`, `level`, `estimatedTime`

Secciones editoriales recomendadas (no obligatorias uniformemente):
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

El validador comprueba frontmatter, no uniformidad de headings.

## Reglas para Gentle-AI

- Gentle-AI configura; el host ejecuta.
- El usuario normalmente abre OpenCode, Codex, Claude u otro agente.
- No enseñar cada paso interno como comando manual si el orquestador lo realiza.
- Toda versión, comando, ruta o capacidad requiere fuente oficial y snapshot (`data/compatibility/versions.yml`).
- Revalidar la versión al editar.
- Diferenciar release, `@latest` y `@main`.

## Reglas de PowerShell

- PowerShell es la pestaña inicial para comandos.
- Bash/macOS/Linux aparecen cuando existe una diferencia real.
- Los comandos se etiquetan por shell.
- Bash no se presupone instalado en Windows.

## Stop conditions

Detenerse cuando:

- Falta evidencia primaria.
- La versión no está confirmada en `data/compatibility/versions.yml`.
- La URL canónica es ambigua.
- Una imagen no tiene permiso.
- El cambio exige mover una URL existente.
- Un test falla.
- Un hilo de Codex sigue vigente.
- El contenido supera el alcance de la PR.

## Salida final

Reportar: archivo, observaciones cubiertas, tests RED, tests GREEN, claims, recursos, términos, score, hard failures, capturas, limitaciones.
