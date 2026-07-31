# Migración V1 → V2

## ¿Qué páginas están en V1?

Todas las páginas actuales usan `manual_contract: lesson-v1` (7 páginas con contrato explícito) o no declaran contrato (la mayoría). Las páginas V1 se mantienen sin cambios durante PR 7.

## ¿Cómo se identifica una página V2?

Una página V2 declara en el frontmatter:

```yaml
manual_contract: lesson-v2
```

Y debe incluir los campos obligatorios del contrato V2 (ver `.opencode/skills/writing-gentle-manual-content/SKILL.md`).

## ¿Cómo migrar una página?

1. Leer el skill V2 completo.
2. Cambiar `manual_contract` a `lesson-v2`.
3. Agregar los nuevos campos requeridos: `lesson_terms`, `persona`, `learning_resources`, `faq_mode`, `practice_mode`, `diagram_mode`, `snapshot` (versión verificada de `data/compatibility/versions.yml`, formato canónico `X.Y.Z`, o `none`).
4. Elegir una persona del banco (`data/resources/personas.yml`).
5. Registrar los términos de la lección (deben existir en `data/terminology/glossary.yml`).
6. Referenciar recursos por ID (`data/resources/learning-resources.yml`).
7. Revisar la prosa: castellano neutral, sin voseo, párrafos fluidos.
8. Ejecutar `npm run validate` para confirmar contratos y voseo.
9. Si la página tiene errores frecuentes, usar el patrón FAQ; si no, declarar `faq_mode: none`.
10. Si la página tiene diagrama Mermaid, declarar `diagram_mode: mermaid`; si no, `diagram_mode: none`.
11. Si la página tiene práctica guiada, declarar `practice_mode: guided`; si no, `practice_mode: none`.

## ¿Cómo agregar un recurso?

Editar `data/resources/learning-resources.yml` y agregar una entrada con `id`, `title`, `url`, `type`, `language`, `access`, `provider`, `topics`, `level`, `purpose`, `verified_at`, `status`, `scope`.

## ¿Cómo agregar una persona?

Editar `data/resources/personas.yml` y agregar una entrada con `id`, `nombre`, `perfil`, `contexto`, `problemas_tipicos`, `restricciones`, `herramientas`, `nivel_tecnico`.

## ¿Cómo agregar un término?

Editar `data/terminology/glossary.yml` y agregar una entrada con `term`, `definition`, `reference` y demás campos canónicos. Los términos se comparten entre V1 y V2.

## ¿Qué validadores se ejecutan?

- `validate:manual-content`: contratos V1, placeholders, imágenes, comandos.
- `validate:voseo`: castellano neutral en páginas V2.
- `validate:v2-contracts`: contratos V2, personas, recursos, términos, modos.
- `validate:curriculum`: contrato curricular.
- `validate-mermaid`: sintaxis Mermaid.
- `validate-models`: catálogo de modelos.
- `validate-claims`: afirmaciones verificadas.

Todos se integran en `npm run validate`.

## ¿Cómo revertir una migración?

1. Cambiar `manual_contract` de vuelta a `lesson-v1`.
2. Quitar los campos V2 agregados.
3. Restaurar la estructura de headings V1.
4. Ejecutar `npm run validate` para confirmar.

## ¿Qué NO debe hacerse?

- No migrar páginas en lote sin revisión editorial.
- No usar `git add .` ni `git add -A`.
- No crear términos duplicados en el glosario.
- No referenciar recursos que no existen en `learning-resources.yml`.
- No inventar IDs de persona.
- No usar voseo en páginas V2.
- No eliminar los contratos V1 mientras existan páginas que dependan de ellos.
