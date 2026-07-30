---
title: Revisar una PR con confianza verificable
description: "Laboratorio de maestría: ejecutá una revisión de PR usando native bounded review, interpretá lentes y receipt, y distinguí confianza verificable de revisión informal."
level: 2-3
estimatedTime: 60 min
tags:
  - laboratorio-maestría
  - revisión
  - PR
  - native-review
  - receipt
prerequisites:
  - Git y GitHub básico
  - Gentle-AI 2.2.0+
  - Concepto de native bounded review
---

## Contexto

"Revisé la PR" no significa lo mismo para todos. Sin un proceso estandarizado, una revisión puede ser una mirada rápida de 30 segundos al diff sin ningún método. El problema no es la mala intención — es que no hay un estándar compartido. Lo que para una persona es "revisar", para otra es "hojear".

Necesitás un flujo que produzca confianza verificable: un receipt que demuestre que la revisión ocurrió, qué lentes se usaron para inspeccionar el código, y qué hallazgos se encontraron con su severidad y evidencia asociada. Sin este proceso, cualquier auditoría o retrospective se reduce a confiar en la palabra de quien revisó.

Este laboratorio te da el proceso para que "revisé" signifique algo concreto y demostrable.

## Objetivo observable

Al terminar este laboratorio, vas a poder revisar una PR usando native bounded review con 2 o más lentes, generar un receipt válido, y distinguir entre una revisión informal (opinar sobre el diff) y una revisión verificable (hallazgos con evidencia + receipt firmado).

Vas a poder responder preguntas como "¿qué lentes usaste?", "¿cuál es el receipt ID?", "¿el receipt es válido?" sin recurrir a "lo miré y me pareció bien".

## Escenario

Un colega abre una PR que agrega una ruta `/api/users/:id/profile` a una API Express existente. El cambio incluye:

- Nuevo endpoint GET con parámetro `:id`
- Middleware de autenticación JWT
- Query a PostgreSQL: `SELECT * FROM profiles WHERE user_id = $1`
- Manejo de error para usuario no encontrado (404)
- Test de integración para el endpoint
- Actualización de tipos TypeScript

Tu trabajo es revisar esta PR usando el proceso nativo de Gentle-AI, no solo mirando el diff. Necesitás producir una revisión que puedas defender en una auditoría.

## Restricciones

- Sin depender solo de leer el diff: la revisión informal no alcanza para este laboratorio.
- Debe usarse `gentle-ai review` con native bounded review.
- Al menos 2 lentes obligatorios. Se recomienda R1 (Risk) + R3 (Reliability) para un endpoint nuevo.
- El receipt debe generarse y validarse con `gentle-ai review validate`.
- Sin depender de proveedores de IA pagos fuera del ecosistema Gentle.
- La recomendación final (approve / request changes / block) debe basarse en hallazgos documentados, no en opinión.

## Información disponible

- Módulo 11 (Calidad y revisión), específicamente:
  - `03-native-bounded-review.md` — flujo start → lenses → evidence → finalize → validate
  - `04-judgment-day.md` — revisión adversarial como extensión
- Catálogo de comandos para `gentle-ai review` en `gentle-command-catalog.yml`
- `verified-claims.yml` para claims sobre el flujo de revisión
- GitHub Docs: proceso de revisión de PRs

### Comandos clave

| Comando | Propósito |
|---------|-----------|
| `gentle-ai review start` | Inicia sesión de revisión, selecciona lentes |
| `gentle-ai review capture-result` | Captura hallazgos de los lentes |
| `gentle-ai review validate` | Valida el receipt de la revisión |
| `gentle-ai review finalize` | Cierra la sesión de revisión |
| `gentle-ai review --ci-mode` | Ejecuta revisión en modo CI (no interactivo) |

## Preguntas de decisión

Antes de ejecutar la revisión, respondé estas preguntas:

1. **¿Qué lentes elegís para este tipo de cambio?** Un endpoint nuevo expone riesgos de seguridad (R1) y necesita confiabilidad (R3: manejo de errores, tests, parámetros). R2 (Readability) sería complementario si el código existente tiene problemas de legibilidad. La elección depende del perfil de riesgo del cambio.

2. **¿Ejecutás la revisión local o en CI?** Local te da control interactivo y podés explorar hallazgos. CI (`--ci-mode`) automatiza pero no permite decisiones contextuales. Para este laboratorio, ejecutalo local para aprender el flujo interactivo. Como extensión, probá `--ci-mode`.

3. **¿Compartís el receipt en la PR o solo los hallazgos?** El receipt contiene el lineage completo (qué lentes, qué evidencia, estado de validación). Compartir el receipt ID en la PR da transparencia. Los hallazgos individuales se comparten como comentarios de revisión en los archivos relevantes.

4. **¿Cómo manejás hallazgos no críticos?** No todos los hallazgos merecen bloquear la PR. La convención es: CRITICAL → block, WARNING → request changes, SUGGESTION → comment sin bloquear. Si un hallazgo no crítico es recurrente, capturalo como lección para el equipo, no como blocker.

## Artefacto esperado

Un archivo `revision-pr-evidencia.md` que documente:

- Descripción de la PR revisada (qué cambia, por qué)
- Lentes seleccionados y justificación de cada uno
- Tabla de hallazgos con severidad, descripción, archivo/linea, y evidencia
- Receipt ID y resultado de validación
- Recomendación final (approve / request changes / block) basada en hallazgos
- Lecciones aprendidas para futuras revisiones

El archivo debe ser autónomo: cualquiera que lo lea debe entender qué pasó en la revisión sin tener acceso a la PR original.

## Criterios de aceptación

- [ ] Se ejecutó `gentle-ai review start` sobre el cambio.
- [ ] Se usaron 2 o más lentes (R1 + R3 como mínimo recomendado).
- [ ] Los hallazgos tienen severidad asignada (CRITICAL, WARNING, SUGGESTION).
- [ ] Cada hallazgo incluye evidencia concreta (línea de código, patrón observado, referencia).
- [ ] El receipt se generó y `gentle-ai review validate` confirma que es válido.
- [ ] La recomendación final está basada en hallazgos, no en opinión subjetiva.
- [ ] `revision-pr-evidencia.md` existe con todos los campos del artefacto esperado.

## Rúbrica

| Nivel | Descripción | Evidencia |
|-------|-------------|-----------|
| Inicial | Leíste el diff y opinaste, sin usar el proceso nativo | Solo comentarios en la PR sin receipt, sin lentes |
| Competente | Ejecutaste native review pero no validaste el receipt | `review start` ejecutado, receipt generado pero `validate` no se ejecutó o falló |
| Avanzado | 2+ lentes, receipt válido, hallazgos documentados con severidad y evidencia | `review validate` confirma receipt válido, tabla de hallazgos completa |
| Experto | Todo lo anterior + recomendación basada en evidencia + receipt compartido en la PR + lecciones capturadas para el equipo | `revision-pr-evidencia.md` completo, receipt ID visible en la PR, lecciones documentadas |

## Autoevaluación

Respondé estas preguntas después de completar el laboratorio:

1. **¿Ejecutaste native review o solo miraste el diff?** Si no ejecutaste `gentle-ai review start`, no hay sesión de revisión. La diferencia no es técnica, es de proceso: sin el comando no hay receipt, sin receipt no hay verificación.

2. **¿Validaste el receipt con `gentle-ai review validate`?** Un receipt generado no es necesariamente válido. La validación confirma que el artifact está firmado correctamente y que su contenido (lineage, target, lens evidence) es íntegro.

3. **¿Los hallazgos tienen severidad y evidencia, o son opiniones?** "Este código no me gusta" no es un hallazgo. "La query usa interpolación de strings en lugar de parámetros tipados (línea 23), lo que permite SQL injection" es un hallazgo con severidad CRITICAL y evidencia concreta.

4. **¿Compartiste el resultado con el autor de la PR?** La revisión no termina cuando generás el receipt. Termina cuando el autor recibe los hallazgos y puede actuar sobre ellos. Sin comunicación, la revisión es un ejercicio privado sin impacto.

5. **¿Podrías demostrar que la revisión ocurrió si te lo pidieran en una auditoría?** Si tenés el receipt válido y el archivo de evidencia, sí. Si solo tenés "lo revisé en mi cabeza", no. Esta es la diferencia entre confianza verificable y confianza subjetiva.

## Errores frecuentes

- **Decir "revisé" pero no poder probarlo.** Sin receipt, no hay evidencia. La revisión informal es necesaria pero no suficiente para procesos que requieren auditoría o trazabilidad.
- **Ignorar los lentes y revisar "por encima".** Los lentes no son burocracia. Cada lente tiene un propósito específico: R1 busca riesgos de seguridad, R3 busca problemas de confiabilidad. Saltearlos es revisión incompleta.
- **No validar el receipt.** Un receipt mal formado o inválido no sirve como evidencia. La validación es parte del proceso, no un paso opcional.
- **Compartir solo la opinión sin hallazgos.** "La PR está bien" no le dice nada al autor. "Encontré 2 WARNINGs en auth middleware y 1 SUGGESTION en naming de variables, acá están las líneas y por qué" le permite actuar.
- **Revisar tarde (cuando la PR ya está aprobada).** La revisión debe ocurrir antes del merge. Revisar después es una retrospectiva, no una revisión. Si la PR ya está merged, el momento de revisar pasó.

## Extensión avanzada

Si querés ir más allá de los criterios de aceptación:

1. **Agregar lente R4 (Resilience).** Evaluá la nueva ruta contra fallos externos: ¿qué pasa si PostgreSQL está caído? ¿Hay timeout configurado? ¿El middleware de auth falla gracefulmente o deja el servidor en un estado inconsistente?

2. **Simular una PR con un security issue deliberado.** Creá una versión de la PR que contenga una vulnerabilidad (por ejemplo, SQL injection por interpolación de strings, o exposición de datos sensibles en el mensaje de error de auth) y verificá que R1 lo detecta. Documentá si el lente encontró el issue y con qué severidad.

3. **Automatizar la revisión en CI.** Configurá `gentle-ai review --ci-mode` como step de GitHub Actions. La revisión debe ejecutarse automáticamente en cada PR y fallar si hay hallazgos CRITICAL. El receipt debe publicarse como artifact del workflow.

4. **Comparar resultados con Judgment Day.** Ejecutá Judgment Day sobre el mismo cambio y compará los hallazgos de los dos jueces independientes contra los hallazgos de tu revisión. ¿Coinciden? ¿Qué encontró uno que el otro no?

## Solución

### Flujo de revisión verificable paso a paso

1. **Leer la PR y entender el cambio.** Antes de ejecutar cualquier comando, necesitás saber qué estás revisando. Leé la descripción de la PR, los archivos modificados, y el contexto del cambio. En este escenario: un endpoint nuevo que expone perfiles de usuario.

2. **Ejecutar `gentle-ai review start`.** Este comando inicia una sesión de native bounded review. Podés dejar que el native facade seleccione los lentes automáticamente según el tipo de cambio, o forzar lentes específicos:

   ```bash
   gentle-ai review start --lenses R1,R3
   ```

   Si el sistema usa un envelope typed y pide consentimiento, revisá el contenido del envelope (describe qué lentes se van a ejecutar, qué alcance tienen, y qué datos van a inspeccionar). Aceptá solo si estás de acuerdo con lo que describe.

3. **Dejar que los lentes ejecuten inspección sobre el diff del candidate.** Cada lente examina el código desde su perspectiva:
   - **R1 (Risk)**: busca riesgos de seguridad, exposición de datos, validación faltante, inyección.
   - **R3 (Reliability)**: busca errores no manejados, falta de tests, queries sin parámetros, timeouts no configurados.

4. **Capturar los resultados con `gentle-ai review capture-result`.** Esto guarda los hallazgos de cada lente en la sesión activa. Si hay hallazgos CRITICAL, el comando los muestra con prioridad.

5. **Evaluar los hallazgos y clasificarlos por severidad:**
   - **CRITICAL**: bloquea la PR. Ejemplo: SQL injection potencial, datos sensibles en errores.
   - **WARNING**: requiere cambios pero no bloquea. Ejemplo: falta de test para caso borde.
   - **SUGGESTION**: mejora opcional. Ejemplo: nombre de variable poco descriptivo.

6. **Validar el receipt:**

   ```bash
   gentle-ai review validate
   ```

   Este comando verifica que el receipt está firmado correctamente, que el lineage (cadena de lentes → evidencia) es íntegro, y que el target (el commit o diff revisado) coincide con lo que se inspeccionó.

   Un receipt válido confirma que la revisión ocurrió con un proceso definido y trazable. Sin esta validación, el receipt no es evidencia.

7. **Dejar la revisión en la PR.** Compartí los hallazgos como comentarios en los archivos relevantes de la PR, e incluí el receipt ID para trazabilidad:

   ```
   ## Revisión con native bounded review

   Receipt ID: `rev-abc123-def456`
   Estado del receipt: ✅ Válido

   Lentes usados: R1 (Risk), R3 (Reliability)

   | Severidad | Hallazgo | Archivo | Evidencia |
   |-----------|----------|---------|-----------|
   | CRITICAL | El middleware de auth expone el payload del token en el mensaje de error 401 | src/middleware/auth.ts:24 | `res.status(401).json({ error: err.message })` — `err.message` puede contener datos sensibles del token decodificado |
   | WARNING | No hay test para el caso "usuario no existente" (404) | tests/profile.test.ts | Solo hay test para el caso exitoso (200) y el caso de token inválido (401) |
   | SUGGESTION | El parámetro `id` no se valida como UUID antes de la consulta | src/routes/profile.ts:12 | Si el parámetro no es numérico/UUID, la query igual se ejecuta. Agregar validación con `uuid.validate()` |

   Recomendación: **Request changes** — el hallazgo CRITICAL en el middleware de auth requiere corrección. Los WARNINGs y SUGGESTIONs pueden abordarse en PRs separadas.
   ```

8. **Finalizar la sesión:**

   ```bash
   gentle-ai review finalize
   ```

### Receipt: qué es y por qué importa

El receipt es un artifact firmado que contiene:

- **Lineage**: qué lentes se ejecutaron, en qué orden, con qué configuración.
- **Target**: el commit, diff o candidate que se revisó (incluye SHA o hash).
- **Lens evidence**: para cada lente, la lista de hallazgos con severidad y evidencia.
- **Estado de validación**: si el receipt fue verificado o no.

Sin receipt válido, la revisión puede haber ocurrido o no — no hay forma de probarlo. Con receipt válido, cualquier persona (incluyendo una auditoría) puede verificar que la revisión ocurrió, qué se revisó, y qué se encontró.

### Ejemplo de hallazgos esperados para este escenario

Para la PR de ejemplo (ruta `/api/users/:id/profile` con middleware JWT, query PostgreSQL, y tests):

**R1 (Risk)**:

| Hallazgo | Severidad | Evidencia |
|----------|-----------|-----------|
| El middleware de auth expone `err.message` en la respuesta 401 | CRITICAL | `catch (err) { res.status(401).json({ error: err.message }) }` — el mensaje de error puede contener el payload del token JWT decodificado, exponiendo datos del usuario |
| No hay rate limiting en el nuevo endpoint | WARNING | El endpoint no tiene middleware de rate limiting. Un atacante podría hacer brute force sobre IDs de usuario |
| El error 404 revela si el usuario existe o no | SUGGESTION | `if (!profile) { res.status(404).json({ error: 'Profile not found' }) }` — mensaje genérico, no revela información. Esto está bien. |

**R3 (Reliability)**:

| Hallazgo | Severidad | Evidencia |
|----------|-----------|-----------|
| La query usa parámetros tipados (`$1`) | ✅ Correcto | `await db.query('SELECT * FROM profiles WHERE user_id = $1', [userId])` — no hay interpolación de strings |
| No hay test para usuario no existente | WARNING | El archivo `tests/profile.test.ts` solo cubre: 200 con token válido, 401 sin token. Falta el caso 404 |
| No hay timeout configurado para la query | SUGGESTION | La query a PostgreSQL no tiene `timeout` o `statement_timeout`. Si la BD está lenta, el endpoint puede colgarse |

**Recomendación final**: **Request changes** por el hallazgo CRITICAL de R1. Los hallazgos WARNING y SUGGESTION se documentan para el autor pero no bloquean la PR.

### Nota sobre hallazgos positivos

No todo hallazgo es negativo. Si un lente encuentra que algo está bien hecho, también se documenta. En la tabla de R3, la query parametrizada es un hallazgo positivo. Documentarlo refuerza buenas prácticas y da contexto al autor sobre qué no cambiar.

## Fuentes

- Módulo 11 (Calidad y revisión), secciones `03-native-bounded-review.md` y `04-judgment-day.md` del manual Gentle-AI.
- `gentle-command-catalog.yml`: catálogo de comandos `gentle-ai review` (verificado en Gentle-AI 2.2.0).
- `verified-claims.yml`: claims sobre el flujo de revisión y receipt.
- GitHub Docs: revisión de pull requests, proceso de code review.
- Documentación de PostgreSQL: parameterized queries, SQL injection prevention.
- Fecha de verificación: 2026-07-30.
- Estado de fuentes externas: los comandos `gentle-ai review` y el flujo native bounded review son comandos del ecosistema Gentle-AI. La validación de receipt depende de la implementación de Gentle-AI 2.2.0+.
