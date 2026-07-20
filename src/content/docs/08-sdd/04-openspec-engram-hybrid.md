---
title: OpenSpec, Engram e híbrido
description: Los tres modos de persistencia de SDD — cómo funcionan, cuándo usar cada uno, cómo cambiar entre ellos.
level: 2
estimatedTime: 15 min
tags:
  - sdd
  - openspec
  - engram
  - hibrido
  - almacenamiento
prerequisites:
  - Las 10 fases de SDD (08-02)
  - Engram — Memoria persistente (09-01)
verifiedVersion: "Gentle-AI 2.1.10"
learningOutcomes:
  - Diferenciar los tres modos de persistencia de SDD
  - Elegir el modo adecuado según el contexto del proyecto
  - Comprender las ventajas y desventajas de cada modo
  - Cambiar entre modos sin perder datos
  - Explicar qué ocurre con los artefactos existentes al cambiar de modo
---

# OpenSpec, Engram e híbrido

## Qué aprenderás

SDD necesita guardar los artefactos que produce cada fase (propuestas, especificaciones, diseños, tareas, reportes). El lugar donde se guardan depende del **modo de persistencia** que elijas.

En este capítulo vas a entender:
- Los tres modos de persistencia: OpenSpec, Engram e híbrido
- Cómo funciona cada modo por dentro
- Las ventajas y desventajas de cada uno
- Cuándo usar cada modo según el tipo de proyecto
- Cómo cambiar entre modos sin perder artefactos
- Qué pasa con los artefactos existentes cuando cambiás

## Por qué importa

La elección del modo de persistencia afecta directamente:
- **Si tu equipo puede ver los artefactos** (OpenSpec es compartible, Engram es local)
- **Si los artefactos sobreviven a compactaciones** (Engram sí, OpenSpec necesita Git)
- **Si podés recuperar cambios después de cerrar la sesión** (Engram e híbrido sí)
- **Cuántos tokens consume cada operación** (híbrido es el más costoso)

Elegir el modo incorrecto puede resultar en artefactos perdidos, trabajo duplicado, o configuraciones que tu equipo no puede ver.

## Explicación simple

SDD puede guardar sus artefactos en tres lugares:

**OpenSpec**: archivos de Markdown y YAML en una carpeta `openspec/` dentro de tu repositorio. Lo mismo que tener documentación versionada en Git. Tu equipo puede verla, revisarla en PRs, y mantener historial de cambios.

**Engram**: base de datos SQLite local que guarda los artefactos como "memorias". No se ve en el explorador de archivos. Es privada, automática, y sobrevive entre sesiones sin que hagas nada.

**Híbrido**: ambos a la vez. Cada artefacto se guarda como archivo Y EN Engram. Lo mejor de ambos mundos, pero cada operación cuesta el doble de escritura.

Además existe el modo **Ninguno**, donde los artefactos solo existen en la conversación actual. Se pierden cuando cerrás el chat. Solo útil para experimentos rápidos.

## Analogía

Pensá en los artefactos SDD como el **plano de una casa** que estás construyendo.

- **OpenSpec** es el plano impreso, archivado en la carpeta del proyecto. Cualquier persona del equipo puede abrir la carpeta y ver el plano. Si alguien lo modifica, Git registra quién y cuándo.
- **Engram** es el plano que solo vos tenés en tu memoria. Lo recordás entre sesiones, pero nadie más puede verlo a menos que se lo contés. Es rápido de consultar, pero no compartible.
- **Híbrido** es tener el plano impreso Y habértelo memorizado. Tenés respaldo si perdés uno, pero te tomó el doble de trabajo registrar ambos.

Si trabajás solo, Engram es suficiente. Si trabajás en equipo, necesitás OpenSpec. Si querés ambas ventajas, usá híbrido.

## Cómo funciona realmente

### OpenSpec: artefactos como archivos

En modo **OpenSpec**, SDD crea y lee archivos dentro de la carpeta `openspec/` en la raíz del proyecto.

```
mi-proyecto/
├── openspec/
│   ├── config.yaml              ← Contexto del proyecto
│   ├── specs/                   ← Especificaciones principales
│   │   └── auth/
│   │       └── spec.md
│   └── changes/                 ← Cambios activos y archivados
│       ├── archive/
│       │   └── 2026-07-20-agregar-login/
│       │       ├── proposal.md
│       │       ├── design.md
│       │       └── ...
│       └── agregar-login/       ← Cambio activo
│           ├── state.yaml
│           ├── proposal.md
│           ├── design.md
│           └── tasks.md
```

**Ventajas**:
- 📁 Se ve en el explorador de archivos
- 🔄 Se versiona con Git (commits, diffs, PRs)
- 👥 El equipo puede revisar y comentar
- 📜 Historial completo de cambios
- 🔌 No depende de Engram

**Desventajas**:
- ❌ No sobrevive a una pérdida del repo (sin Git, se pierde)
- ❌ El orquestador no puede recuperar estado automáticamente después de compactación
- ❌ Ocupa espacio en el repositorio

**¿Quién escribe los archivos?**:
- El subagente de cada fase escribe su archivo directamente
- `sdd-apply` actualiza `tasks.md` (marca tareas como `[x]`)
- `sdd-archive` mueve la carpeta del cambio a `archive/`

### Engram: artefactos como memorias

En modo **Engram**, SDD guarda los artefactos como observaciones en la base de datos SQLite de Engram. No se crea ningún archivo en el proyecto.

Cada artefacto se guarda con un nombre determinístico:

| Fase | `topic_key` en Engram |
|------|----------------------|
| Init | `sdd-init/{proyecto}` |
| Explore | `sdd/{cambio}/explore` |
| Propose | `sdd/{cambio}/proposal` |
| Spec | `sdd/{cambio}/spec` |
| Design | `sdd/{cambio}/design` |
| Tasks | `sdd/{cambio}/tasks` |
| Apply progress | `sdd/{cambio}/apply-progress` |
| Verify | `sdd/{cambio}/verify-report` |
| Archive | `sdd/{cambio}/archive-report` |
| State | `sdd/{cambio}/state` |

**Cómo se guarda:**
```
mem_save(
  title: "sdd/agregar-login/proposal",
  topic_key: "sdd/agregar-login/proposal",
  type: "architecture",
  project: "mi-proyecto",
  content: "## Proposal\n\nAgregar login con Google OAuth..."
)
```

**Cómo se recupera:**
```
Step 1: mem_search(query: "sdd/agregar-login/proposal", project: "mi-proyecto") → ID
Step 2: mem_get_observation(id: {ID}) → contenido completo
```

**Ventajas**:
- 🚀 No llena el repo con archivos
- 💾 Sobrevive a compactaciones (Engram es persistente)
- 🔄 Recuperación automática entre sesiones
- ⚡ Rápido (base de datos local SQLite)

**Desventajas**:
- 🔒 Solo el usuario local puede verlo
- ❌ No compartible por Git
- ❌ Sin historial de versiones (cada save sobrescribe)
- 🔍 Las búsquedas devuelven previsualizaciones truncadas (requiere `mem_get_observation`)

### Híbrido: ambos

En modo **Híbrido**, cada artefacto se persiste en Engram Y como archivo OpenSpec simultáneamente.

**Cómo funciona:**
1. El subagente escribe el archivo en `openspec/changes/{cambio}/`
2. El subagente guarda el mismo contenido en Engram con `mem_save`
3. La lectura prioriza Engram (más rápido); si no encuentra, busca en archivos

**Ventajas**:
- ✅ Lo mejor de ambos mundos
- ✅ Compartible (archivos en Git)
- ✅ Recuperable (Engram)
- ✅ Sobrevive a compactaciones

**Desventajas**:
- ⚠️ Cada operación de escritura cuesta EL DOBLE de tokens
- ⚠️ La lectura prioriza Engram, pero verifica en archivos si falta
- ⚠️ Más complejo de mantener (dos fuentes de verdad)

### Comparación completa

| Capacidad | OpenSpec | Engram | Híbrido | Ninguno |
|-----------|----------|--------|---------|---------|
| Se ve en archivos | ✅ | ❌ | ✅ | ❌ |
| Compartible por Git | ✅ | ❌ | ✅ | ❌ |
| Sobrevive a compactación | ❌ (sin Git) | ✅ | ✅ | ❌ |
| Recuperación entre sesiones | ❌ | ✅ | ✅ | ❌ |
| Historial de versiones | ✅ (Git) | ❌ (sobrescribe) | ✅ (Git) | ❌ |
| Rápido en lectura | Medio | Rápido | Rápido | N/A |
| Costo de tokens por escritura | Bajo | Medio | Alto | Mínimo |
| Dependencia externa | Git | Engram | Ambos | Ninguna |

### Cuándo usar cada modo

| Contexto | Modo recomendado | Por qué |
|----------|-----------------|---------|
| Proyecto personal, trabajo solo | **Engram** | Rápido, sin archivos, recuperación automática |
| Proyecto en equipo con Git | **OpenSpec** | Compartible, revisable en PRs, historial |
| Proyecto en equipo + querés recuperación | **Híbrido** | Compatibilidad + respaldo |
| Experimentos rápidos, spikes | **Ninguno** | Sin overhead, pérdida aceptable |
| OpenSource con contribuidores externos | **OpenSpec** | Los contribuidores deben ver los artefactos |
| Proyecto sin Git (carpeta local) | **Engram** | OpenSpec no tendría backup |

### Cómo elegir en la práctica

Cuando ejecutás `/sdd-new` o `/sdd-ff` por primera vez en una sesión, el orquestador te pregunta:

```
¿En qué modo querés persistir los artefactos?
1. Engram (solo memoria, sin archivos)
2. OpenSpec (archivos en openspec/)
3. Híbrido (ambos)
4. Ninguno (solo esta sesión)
```

Si no elegís, el orquestador usa el default: **Engram** si está disponible, **Ninguno** si no.

### Cómo cambiar entre modos

Para cambiar el modo de persistencia, hay que considerar el estado actual de los artefactos:

**Si NO hay cambios activos** (empezás de cero):
Solo elegí el nuevo modo al crear el próximo cambio. Simple.

**Si HAY cambios activos:**

| De \ A | OpenSpec | Engram | Híbrido |
|--------|----------|--------|---------|
| **OpenSpec** | — | ❌ No recomendado (los archivos existentes no se migran automáticamente) | ✅ Solo cambia el modo para nuevos artefactos |
| **Engram** | ❌ No recomendado (se perderían los artefactos en Engram) | — | ✅ A partir de ahora escribe ambos |
| **Híbrido** | ✅ Seguí usando los archivos (Engram deja de usarse) | ✅ Los archivos existentes se pueden migrar manualmente | — |

**Recomendación general**: si ya empezaste un cambio con un modo, **terminalo en ese modo** antes de cambiar. Cambiar a mitad de un cambio puede dejar artefactos inconsistentes.

Para cambiar el modo por defecto:

```bash
# En la configuración global
~/.config/gentle-ai/config.json → agregar: "sdd_default_mode": "openspec"

# En la configuración del proyecto
./.gentle-ai/config.json → agregar: "sdd_default_mode": "engram"
```

### Qué pasa al archivar en cada modo

| Modo | Qué pasa cuando archivás |
|------|------------------------|
| **OpenSpec** | La carpeta `openspec/changes/{cambio}/` se mueve a `openspec/changes/archive/AAAA-MM-DD-{cambio}/`. Las specs delta se fusionan en `openspec/specs/`. |
| **Engram** | Se guarda un `archive-report` con el resumen del cambio y los IDs de todos los artefactos. Los artefactos anteriores NO se borran (siguen siendo recuperables por `topic_key`). |
| **Híbrido** | Pasa lo mismo que en OpenSpec (archivo movido) Y se guarda el `archive-report` en Engram. |

En Engram, los artefactos archivados no se borran nunca. El `topic_key` sigue siendo el mismo, pero el estado del cambio pasa a `archived`.

## Errores frecuentes

1. **Usar Engram en equipo**: si trabajás con más personas, Engram no es suficiente porque cada persona tiene su propia base de datos local. Usá OpenSpec o híbrido.
2. **Cambiar de modo a mitad de un cambio**: los artefactos existentes pueden quedar en un modo y los nuevos en otro. Terminal el cambio antes de cambiar.
3. **Híbrido sin necesidad**: el modo híbrido consume más tokens. Si no necesitás ambas capacidades, usá solo una.
4. **Asumir que OpenSpec se comparte solo**: los archivos existen pero no se comparten mágicamente. Necesitás `git add`, `git commit` y `git push` para que el equipo los vea.
5. **Perder artefactos en modo Ninguno**: si seleccionaste "ninguno" y cerrás la sesión, los artefactos se pierden. No es recuperable.

## Resumen

| Modo | Persiste en | Compartible | Recuperable | Costo |
|------|------------|------------|-------------|-------|
| **OpenSpec** | Archivos en `openspec/` | ✅ (Git) | ❌ (sin Git) | Bajo |
| **Engram** | Base de datos SQLite | ❌ (local) | ✅ | Medio |
| **Híbrido** | Ambos | ✅ (Git) | ✅ | Alto |
| **Ninguno** | Solo en chat | ❌ | ❌ | Mínimo |

**Regla práctica**: proyecto solo → Engram. Proyecto en equipo → OpenSpec. Proyecto en equipo + querés respaldo → Híbrido. Experimentos → Ninguno.

## Preguntas

1. ¿Cuál es la principal ventaja de OpenSpec sobre Engram?
2. ¿Cuál es la principal desventaja del modo híbrido?
3. ¿Qué modo usarías para un proyecto open-source con 10 colaboradores?
4. ¿Qué pasa con los artefactos de Engram cuando archivás un cambio?
5. ¿Por qué no es recomendable cambiar de modo a mitad de un cambio?

## Fuentes verificadas

- Repositorio: gentle-ai, commit `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d`
- Archivos: `internal/assets/skills/_shared/persistence-contract.md`, `internal/assets/skills/_shared/openspec-convention.md`, `internal/assets/skills/_shared/engram-convention.md`
- Versión verificada: gentle-ai 2.1.10
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
