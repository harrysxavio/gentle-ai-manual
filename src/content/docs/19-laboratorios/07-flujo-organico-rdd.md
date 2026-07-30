---
title: Ejecutar un flujo orgánico y RDD
description: "Laboratorio de maestría: implementá un cambio completo usando Receipt-Driven Development con fuentes verificadas y trazabilidad."
level: 3
estimatedTime: 70 min
tags:
  - laboratorio-maestría
  - RDD
  - trazabilidad
  - verificación
  - gentle-ai
prerequisites:
  - Gentle-AI 2.2.0+
  - SDD completo
  - Native Review
  - Git
---

## Contexto

Los cambios sin trazabilidad son difíciles de auditar y revertir. Receipt-Driven Development (RDD) es un flujo donde cada cambio produce un receipt verificable. Necesitás dominar este flujo para implementar cambios con confianza, usando las fuentes de verdad del ecosistema: el catálogo de comandos y las claims verificadas.

Sin RDD, un equipo no puede responder preguntas como "¿quién aprobó este cambio?", "¿qué lentes se usaron?", "¿el receipt sigue siendo válido contra el contenido actual?". Con RDD, cada cambio deja un rastro que cualquier miembro del equipo puede verificar sin depender de la memoria de quien lo implementó.

## Objetivo observable

Implementar un cambio en un repositorio siguiendo el flujo RDD: spec → tasks → apply → native review → receipt → archive. Usar `verified-claims.yml` como fuente de verdad técnica y `gentle-command-catalog.yml` para comandos válidos.

## Escenario

Tenés un proyecto con SDD ya inicializado (`/sdd-init` ejecutado). Necesitás agregar un comando `gentle-ai doctor --health` que verifique la conectividad de todos los servicios MCP configurados. El cambio debe seguir el flujo RDD completo y generar un receipt verificable.

El comando debe:
- Listar cada servidor MCP configurado en `opencode.json` o `~/.config/opencode/opencode.json`
- Ejecutar un handshake de conectividad contra cada uno
- Reportar pass/warn/fail por servidor
- Devolver un resumen con métricas: total, conectados, fallidos, tiempo total

## Restricciones

- Sin comandos inventados. Cada comando usado debe existir en `gentle-command-catalog.yml` con estado `current`.
- Sin comandos retirados como instrucción actual. No usar `--result` en `review finalize` (retirado en v2.2.0, ver claim `review-finalize-result-retired`).
- El receipt debe ser válido contra `gentle-ai review validate --gate post-apply`.
- No se puede usar el mismo modelo para spec y verify (separación de roles).
- No usar proveedores pagos. Todo el flujo debe funcionar con modelos locales o del ecosistema Gentle.
- El spec debe referenciar al menos una claim de `verified-claims.yml`.

## Información disponible

- Módulos 09 (SDD), 11 (Native Review), 14 (Modelos) del manual.
- Archivo `data/evidence/verified-claims.yml` con claims verificadas (commit 719b0f6, v2.2.0).
- Archivo `data/evidence/gentle-command-catalog.yml` con comandos y estados (actualizado 2026-07-28).
- Documentación de `gentle-ai review start` en el módulo 11.
- Documentación de `gentle-ai sdd-status` para ver el estado del cambio SDD.
- Los comandos `gentle-ai review start`, `gentle-ai review finalize`, `gentle-ai review validate`, `gentle-ai review bind-sdd` están documentados en el catálogo con estado `current`.

## Preguntas de decisión

1. **¿Cuándo ejecutás native review?** La claim `review-starts-after-candidate` es clara: el review ocurre DESPUÉS de que el candidato está congelado, no antes ni durante la implementación. ¿Esto significa que primero aplicás el cambio y después revisás? ¿O primero congelás el candidato y después aplicás?

2. **¿Antes o después de archive?** El receipt debe existir antes de archive. Revisá la secuencia: apply → review start → finalize → validate → bind-sdd → archive.

3. **¿Usás el catálogo para validar que los comandos del spec existen?** Si tu spec usa `gentle-ai doctor --health`, ¿existe ese comando en el catálogo? (Pista: es un comando que estás agregando, así que no existe aún. Pero los comandos del flujo RDD sí deben existir.)

4. **¿Cómo registrás el receipt como evidencia del cambio?** `gentle-ai review bind-sdd` vincula el receipt al cambio SDD. ¿Qué claim del `verified-claims.yml` respalda que el receipt está ligado al contenido exacto?

5. **¿Qué claims usás para verificar el comportamiento esperado?** La claim `cmd-doctor-not-repair` dice que `doctor` es read-only. Tu nuevo `doctor --health` también debe ser read-only. ¿Qué claim del catálogo de comandos respalda que los comandos del flujo están activos?

## Artefacto esperado

`rdd-evidencia.md` con:
- Spec del cambio con claims referenciadas (IDs de `verified-claims.yml`).
- Tareas desglosadas del spec.
- Evidencia de apply: diff del cambio implementado.
- Receipt de native review: salida de `gentle-ai review start` y `gentle-ai review finalize`.
- Claims referenciadas con IDs completos.
- Catálogo referenciado con comandos usados y sus IDs.
- Lecciones aprendidas capturadas.

## Criterios de aceptación

- [ ] El spec referencia al menos 1 claim de `verified-claims.yml` por ID.
- [ ] Los comandos del spec existen en `gentle-command-catalog.yml` con estado `current`.
- [ ] Se ejecutó `gentle-ai review start` sobre el cambio congelado.
- [ ] El receipt fue validado con `gentle-ai review validate --gate post-apply`.
- [ ] La evidencia incluye tanto el approach conceptual como el flujo específico con Gentle-AI.
- [ ] No se usó el mismo modelo para spec (diseño) y verify (revisión).
- [ ] El receipt está vinculado al cambio SDD con `gentle-ai review bind-sdd`.

## Rúbrica

| Nivel | Descripción | Evidencia |
|-------|-------------|-----------|
| Inicial | Solo el flujo conceptual, sin herramientas ni comandos reales | Documento conceptual sin evidencia de ejecución |
| Competente | SDD apply + review ejecutados, pero sin receipt validado ni claims referenciadas | Comandos ejecutados, pero falta trazabilidad |
| Avanzado | RDD completo con receipt, claims y catálogo referenciados | Receipt validado, claims citadas por ID, comandos cotejados contra el catálogo |
| Experto | Todo lo anterior + evidencia de trazabilidad cruzada + lecciones capturadas en Engram | Claims cruzadas contra comandos, lecciones en `mem_save`, receip vinculado al cambio SDD |

## Autoevaluación

1. **¿El spec referencia claims de `verified-claims.yml`?** Cada claim debe tener su ID completo (ej. `review-starts-after-candidate`), no solo una mención genérica.

2. **¿Cada comando del spec existe en el catálogo?** Verificá cada comando contra `gentle-command-catalog.yml`. `gentle-ai doctor --health` es nuevo y no va a estar; pero los comandos del flujo RDD (`review start`, `review validate`, etc.) sí deben estar.

3. **¿Ejecutaste native review sobre el candidato congelado?** La claim `review-starts-after-candidate` dice que el review ocurre después de congelar el candidato. ¿Ejecutaste `gentle-ai review start` después de apply y antes de archive?

4. **¿Validaste el receipt con `gentle-ai review validate`?** Usaste el gate `post-apply`? ¿El receipt pasó la validación?

5. **¿Separaste los modelos de spec y verify?** ¿Usaste un modelo económico/rápido para spec y un modelo más potente para verify?

6. **¿Guardaste la evidencia en Engram?** Las lecciones aprendidas deben persistirse con `mem_save` para que estén disponibles en sesiones futuras.

## Errores frecuentes

- **No verificar que los comandos existen en el catálogo antes de usarlos.** `gentle-command-catalog.yml` es la fuente de verdad. Si un comando no está en el catálogo, no existe o es interno.

- **Usar comandos retirados.** `gentle-ai review finalize --result` fue retirado en v2.2.0. Usar `--result-artifact` o `--result-artifact-file` en su lugar. Ver claim `review-finalize-result-retired`.

- **No ejecutar la revisión porque "el cambio es chico".** La claim `review-tier-by-evidence` dice que el tier se determina por evidencia y riesgo, no por cantidad de líneas. Un cambio chico pero crítico igual necesita revisión.

- **No validar el receipt.** `gentle-ai review validate` es el único modo de confirmar que el receipt sigue siendo válido contra el contenido actual.

- **Usar el mismo modelo para spec y verify.** La separación de roles garantiza que el revisor no esté sesgado por su propio diseño. Configurá modelos distintos.

- **Confundir fases SDD internas con comandos CLI.** Las fases `explore`, `propose`, `spec`, `design`, `tasks`, `apply`, `verify`, `archive`, `onboard` son fases internas del orquestador, no comandos de terminal.

## Extensión avanzada

1. **Escenario dual:** Resolver el mismo cambio con y sin RDD, comparando la confianza de release. Documentá las diferencias en un archivo comparativo.

2. **PR con receipt adjunto:** Implementar el cambio en un fork y generar un PR. Adjuntar el receipt como artefacto del PR.

3. **Gate simulado:** Configurar un gate `pre-push` que ejecute `gentle-ai review validate` automáticamente antes de permitir el push. Verificá que rechaza pushes sin receipt válido.

4. **Cross-sesión con Engram:** Implementar el cambio en dos sesiones separadas, usando `mem_save` para preservar contexto entre ellas. En la segunda sesión, recuperar las lecciones con `mem_search`.

5. **Auditoría de claims:** Cruzar todas las claims de `verified-claims.yml` contra los comandos de `gentle-command-catalog.yml` y verificar que cada claim de tipo `cli` tenga su comando correspondiente en el catálogo.

## Solución

### Variante conceptual (sin Gentle-AI)

El flujo RDD es independiente de la herramienta. Cualquier equipo puede implementarlo con procesos manuales:

1. **Documentar el requisito y expected behavior.** Escribí una especificación clara: qué debe hacer el cambio, qué inputs recibe, qué outputs produce, cómo se verifica.

2. **Descomponer en tareas.** Dividí el cambio en unidades atómicas: implementar la lógica de health check, conectar con MCP, escribir tests, documentar.

3. **Implementar cada tarea con tests.** Cada tarea produce código y tests que la verifican. El orden importa: primero la lógica central, después las integraciones.

4. **Ejecutar validación.** Corré los tests, revisá el diff, verificá que no hay regresiones. Esto es el "receipt" manual.

5. **Registrar el resultado.** Documentá qué se implementó, qué tests pasaron, qué decisiones se tomaron. Este documento es el "receipt".

6. **Capturar lecciones.** Qué salió bien, qué salió mal, qué se haría diferente la próxima vez.

### Variante con Gentle-AI v2.2.0

Basado en `verified-claims.yml` (claim `review-starts-after-candidate`, v2.2.0, commit 719b0f6) y `gentle-command-catalog.yml`:

#### Paso 1: Iniciar el cambio SDD

Usá el slash command del host para iniciar un nuevo cambio. El comando `/sdd-init` ya se ejecutó (es prerequisito). Ahora iniciá el cambio:

```
/sdd-new
```

Esto inicia el flujo orquestado. Las fases internas (`explore`, `propose`, `spec`, `design`, `tasks`) las maneja el orquestador automáticamente.

#### Paso 2: Verificar el spec contra las fuentes de verdad

El spec debe referenciar claims de `verified-claims.yml`. Por ejemplo:

- Claim `cmd-doctor-not-repair`: respalda que `doctor` es read-only y no modifica nada. El nuevo `doctor --health` hereda esta propiedad.
- Claim `review-starts-after-candidate`: respalda que el review se ejecuta post-apply, no antes.
- Claim `review-receipt-content-bound`: respalda que el receipt está ligado al contenido exacto del candidato.
- Claim `snapshot-v2.2.0-release`: respalda que la versión 2.2.0 es la release publicada.

Cada comando del spec debe cotejarse contra `gentle-command-catalog.yml`. Verificá que los comandos del flujo RDD existen:

| Comando | ID en catálogo | Estado |
|---------|----------------|--------|
| `gentle-ai review start` | `cli-review-start` | current |
| `gentle-ai review finalize` | `cli-review-finalize` | current |
| `gentle-ai review validate` | `cli-review-validate` | current |
| `gentle-ai review bind-sdd` | `cli-review-bind-sdd` | current |
| `gentle-ai sdd-status` | `cli-sdd-status` | current |
| `gentle-ai doctor` | `cli-doctor` | current |

Usar `--result-artifact-file` en `finalize`, NO `--result` (retirado, ver `cli-review-finalize-result-retired` en el catálogo).

#### Paso 3: Aplicar el cambio

Cuando el orquestador llegue a la fase `apply`, implementá el comando `gentle-ai doctor --health`. El cambio debe incluir:

- Lógica de descubrimiento: leer servidores MCP desde la configuración.
- Handshake de conectividad contra cada servidor.
- Reporte estructurado con resultados por servidor.
- Tests que verifiquen cada escenario (servidor conectado, caído, timeout).

#### Paso 4: Ejecutar native review

Una vez que el candidato está implementado y congelado:

```bash
gentle-ai review start --focus reliability --focus resilience
```

La claim `review-starts-after-candidate` (ID: `review-starts-after-candidate`) respalda que este es el momento correcto para la revisión.

Elegí los lentes según el riesgo. Para un comando de diagnóstico, `reliability` y `resilience` son los lentes dominantes. La claim `review-tier-by-evidence` (ID: `review-tier-by-evidence`) dice que el tier se determina por evidencia y riesgo, no por cantidad de líneas.

#### Paso 5: Finalizar y validar el receipt

```bash
gentle-ai review finalize --result-artifact-file rdd-receipt.json
gentle-ai review validate --gate post-apply
```

La claim `review-check-green-not-production-proof` (ID: `review-check-green-not-production-proof`) aclara que un check verde valida el receipt contra el gate, NO el readiness de producción.

La claim `review-gates-validated-only` (ID: `review-gates-validated-only`) respalda que los gates validan el receipt existente, no inician una revisión nueva.

#### Paso 6: Vincular el receipt al cambio SDD

```bash
gentle-ai review bind-sdd --change health-check --lineage <ID-del-receipt> --expected-binding-revision <HASH>
```

#### Paso 7: Archivar el cambio

Cuando el receipt está validado y vinculado, el orquestador ejecuta la fase `archive`. Verificá con:

```bash
gentle-ai sdd-status health-check
```

Debe mostrar "Phase: archive" y "Tasks: X/X completed".

#### Paso 8: Capturar lecciones en Engram

```markdown
Lecciones aprendidas:
- El catálogo de comandos debe consultarse antes de escribir el spec.
- `review finalize --result` está retirado; usar `--result-artifact-file`.
- Los claims de `verified-claims.yml` proporcionan respaldo verificable para decisiones de diseño.
```

Guardar con `mem_save` para que estén disponibles en la próxima sesión.

### Mapa de trazabilidad

```
spec
 ├─ claim: cmd-doctor-not-repair (verified-claims.yml)
 ├─ claim: review-starts-after-candidate (verified-claims.yml)
 ├─ claim: review-receipt-content-bound (verified-claims.yml)
 └─ claim: snapshot-v2.2.0-release (verified-claims.yml)
      │
      ▼
tasks
 └─ comandos cotejados contra gentle-command-catalog.yml
      ├─ cli-review-start → current ✓
      ├─ cli-review-finalize → current ✓
      ├─ cli-review-validate → current ✓
      ├─ cli-review-bind-sdd → current ✓
      └─ cli-doctor → current ✓
           │
           ▼
apply
 └─ implementación de gentle-ai doctor --health
      │
      ▼
review start
 └─ lentes: reliability, resilience
      │
      ▼
review finalize
 └─ receipt: rdd-receipt.json
      │
      ▼
review validate --gate post-apply
 └─ resultado: pass ✓
      │
      ▼
review bind-sdd
 └─ receipt vinculado a cambio health-check
      │
      ▼
archive
 └─ cambio archivado en .sdd/changelog.md
```

## Fuentes

- Módulo 09 del manual: SDD completo: `src/content/docs/09-sdd/`
- Módulo 11 del manual: Native Bounded Review: `src/content/docs/11-calidad-y-revision/03-native-bounded-review.md`
- Módulo 14 del manual: Modelos y enrutamiento: `src/content/docs/14-modelos-y-enrutamiento/`
- `data/evidence/verified-claims.yml` — claims verificadas (v2.2.0, commit 719b0f6). Claims referenciadas: `review-starts-after-candidate`, `review-receipt-content-bound`, `review-check-green-not-production-proof`, `review-gates-validated-only`, `review-kill-switch-not-approval`, `review-tier-by-evidence`, `cmd-doctor-not-repair`, `snapshot-v2.2.0-release`, `concept-stable-vs-observed`, `review-finalize-result-retired`.
- `data/evidence/gentle-command-catalog.yml` — catálogo de comandos (v2.2.0). IDs referenciados: `cli-doctor`, `cli-review-start`, `cli-review-finalize`, `cli-review-validate`, `cli-review-bind-sdd`, `cli-review-mode-disable`, `cli-sdd-status`, `cli-review-finalize-result-retired`.
- PR #1801 de gentle-ai: documentación RDD orgánico.
- Fecha de verificación: 2026-07-30.
- Estado: 🟢 Verificado contra `verified-claims.yml` (commit 719b0f6) y `gentle-command-catalog.yml` (actualizado 2026-07-28).
