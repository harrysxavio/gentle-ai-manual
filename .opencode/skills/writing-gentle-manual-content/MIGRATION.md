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

La migración V1 → V2 incluye seis etapas:

1. **Migración estructural**: cambiar `manual_contract` a `lesson-v2` y completar los campos obligatorios del contrato V2 (ver `REQUIRED_FIELDS` de `scripts/validate-v2-contracts.cjs`): `content_level` (lista: `beginner`, `operator`, `architect`), `estimated_minutes` (entero), `learning_outcome`, `canonical_concepts`, `lesson_terms`, `persona`, `learning_resources`, `faq_mode`, `practice_mode`, `diagram_mode`, `snapshot` (versión verificada de `data/compatibility/versions.yml`, formato canónico `X.Y.Z`, o `none`), `level` (entero 1–3) y `estimatedTime` (texto, ej. `"15 min"`).
2. **Reescritura pedagógica**: aplicar el esqueleto pedagógico y el tono del skill.
3. **Normalización dialectal por IA**: primera pasada de normalización a castellano neutral con tuteo (instrucción canónica del skill), aplicada solo a las páginas modificadas.
4. **Revisión de fidelidad**: segunda pasada de IA que compara original y normalizado y corrige solo las diferencias necesarias.
5. **Validadores deterministas**: contratos, frontmatter, tipos, listas obligatorias, IDs canónicos, personas, recursos, términos, snapshots, claims, enlaces, build e integridad del sitio.
6. **Build y review**: `npm run validate`, `npm run test:visual`, `npm run build`, `npm run check-site`, revisión de Codex en la misma PR.

Pasos operativos:

1. Leer el skill V2 completo.
2. Cambiar `manual_contract` a `lesson-v2`.
3. Agregar todos los campos obligatorios del contrato V2 que la página aún no tenga. La lista completa está en `REQUIRED_FIELDS` de `scripts/validate-v2-contracts.cjs`; `npm run validate` rechaza cualquier campo faltante.
4. Elegir una persona del banco (`data/resources/personas.yml`).
5. Registrar los términos de la lección (deben existir en `data/terminology/glossary.yml`).
6. Referenciar recursos por ID (`data/resources/learning-resources.yml`).
7. Normalizar la prosa a castellano neutral con tuteo mediante el flujo de IA del skill (normalización + revisión de fidelidad).
8. Ejecutar `npm run validate` para confirmar los contratos deterministas.
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
- `validate:v2-contracts`: contratos V2, personas, recursos, términos, modos.
- `validate:curriculum`: contrato curricular.
- `validate-mermaid`: sintaxis Mermaid.
- `validate-models`: catálogo de modelos.
- `validate-claims`: afirmaciones verificadas.

El castellano neutral NO se valida con scripts: la normalización dialectal y su
revisión las realiza un modelo de IA (ver el flujo en SKILL.md). Todos los
validadores deterministas se integran en `npm run validate`.

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
- No usar voseo en páginas V2 (la normalización es responsabilidad del modelo, no de scripts).
- No crear scripts ni parsers para detectar o corregir dialecto.
- No eliminar los contratos V1 mientras existan páginas que dependan de ellos.
