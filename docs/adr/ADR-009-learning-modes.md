# ADR-009: Modos de lectura — Esencial y Profundo

**Fecha**: 2026-07-20  
**Estado**: Aceptado  
**Decisión**: Implementar dos profundidades de lectura (Esencial y Profundo) mediante secciones colapsables y filtros de visualización sobre el MISMO documento Markdown/MDX. No mantener versiones duplicadas del contenido.

---

## Contexto

El manual atiende a lectores con tres perfiles distintos (principiante, intermedio, arquitecto) que necesitan diferentes niveles de profundidad:

1. **Principiante**: quiere entender qué es, para qué sirve, cómo se usa
2. **Intermedio**: quiere configurar, personalizar, diagnosticar
3. **Arquitecto**: quiere entender la implementación interna, protocolos, decisiones

La misión exige explícitamente "dos profundidades de lectura" sin duplicar contenido.

## Decisión

### 1. Un solo documento fuente por capítulo

Cada capítulo es UN archivo Markdown/MDX. No existen versiones "essential" y "deep" separadas.

### 2. Secciones marcadas por nivel

El contenido se organiza en el documento con marcadores de nivel:

```markdown
## Explicación simple          ← Nivel 1 (siempre visible)
## Uso práctico                ← Nivel 2 (expandible)
## Cómo funciona realmente     ← Nivel 3 (colapsable por defecto)
## Arquitectura interna        ← Nivel 3 (colapsable por defecto)
```

El frontmatter indica el nivel base del capítulo:

```yaml
level: 1  # Mínimo: nivel 1 visible, niveles 2-3 colapsables
```

### 3. Implementación técnica

Usamos componentes Astro/Starlight personalizados:

- `<SectionLevel level={2}>` — envuelve contenido de nivel 2 o 3
- En modo Esencial, las secciones de nivel > 1 se colapsan
- En modo Profundo, todas las secciones se expanden
- El usuario alterna entre modos con un toggle en la UI

Alternativa de implementación (si componentes personalizados resultan complejos):
- Usar `<details>` HTML nativo con clases de Starlight para nivel 3
- Usar badges visuales que indiquen el nivel de cada sección

### 4. Comportamiento del toggle

- **Modo Esencial** (default para nivel 1): muestra definición, beneficio, funcionamiento macro, ejemplo, pasos de uso, resultado esperado
- **Modo Profundo**: expande arquitectura, procesos, protocolos, archivos, código, decisiones, limitaciones, tests, riesgos
- La preferencia se guarda en `localStorage`
- El toggle persiste entre páginas durante la sesión

## Alternativas consideradas

### A. Dos archivos por capítulo (essential.md + deep.md)
- ❌ Duplicación de contenido
- ❌ Divergencia garantizada con el tiempo
- ❌ El doble de archivos que mantener

### B. Capítulos completamente diferentes por perfil
- ❌ El lector no puede profundizar gradualmente
- ❌ Pierde la progresión pedagógica

### C. Secciones colapsables en un solo documento (elegido)
- ✅ Sin duplicación
- ✅ El lector controla su profundidad
- ✅ Mismo contenido, distinta presentación
- ✅ Implementable con HTML/CSS estándar + un poco de JS

## Consecuencias

### Positivas
- Una sola fuente de verdad por capítulo
- El lector puede elegir su profundidad sin cambiar de página
- Sin riesgo de divergencia entre versiones
- Build size no se duplica

### Negativas
- Requiere disciplina de los redactores para marcar secciones por nivel
- Los componentes personalizados requieren desarrollo frontend adicional
- El SEO puede ser ligeramente peor que páginas separadas (aunque el contenido completo está en el HTML)

### Neutrales
- El toggle de modo requiere JavaScript (no funciona sin JS, pero el contenido completo está en el DOM)
- La impresión incluye todo el contenido; se necesitará CSS de impresión específico

---

## Referencias

- Sección 10 de la misión — "Dos profundidades de lectura"
- ADR-002 (content-source-of-truth) — principio de no duplicación
- ADR-001 (documentation-framework) — elección de Astro + Starlight
- `astro.config.mjs` — componentes personalizados
