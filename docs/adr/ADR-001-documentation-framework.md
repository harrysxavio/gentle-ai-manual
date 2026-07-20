# ADR-001: Framework de documentación

## Estado

Aceptado

## Contexto

Necesitamos un framework web que renderice el contenido Markdown/MDX del manual como un sitio documental moderno, interactivo y accesible.

Requisitos:
- Markdown como fuente de verdad única
- Búsqueda integrada
- Modo claro/oscuro
- Mermaid para diagramas
- Sidebar jerárquica
- Tabla de contenidos derecha
- Breadcrumbs
- Navegación anterior/siguiente
- Despliegue estático (GitHub Pages)
- Accesibilidad
- Rendimiento
- Bajo mantenimiento

## Opciones consideradas

### Astro + Starlight

Ventajas:
- Construido sobre Astro (rendimiento nativo, cero JS por defecto)
- Starlight es un theme documental oficial de Astro
- Markdown/MDX como fuente de verdad
- Search integrado (Pagefind)
- Sidebar y navegación automática desde estructura de archivos
- Tema claro/oscuro nativo
- Mermaid vía plugin `@astrojs/mdx` + `astro-embed`
- Despliegue estático directo
- Comunidad activa, documentación excelente

Desventajas:
- Relativamente nuevo (ecosistema madurando)
- Personalización avanzada requiere Astro knowledge

### Docusaurus

Ventajas:
- Maduro, ampliamente adoptado
- MDX nativo
- Búsqueda (Algolia DocSearch)
- Versiones y traducciones integradas
- Plugins robustos

Desventajas:
- React pesado (más JS bundle)
- Sidebar y config basada en archivos YAML (no en estructura de directorios)
- Personalización compleja
- Docusaurus 3 aún en desarrollo activo

### Vitepress

Ventajas:
- Rápido, minimalista
- Markdown extendido
- Tema predeterminado sólido

Desventajas:
- Sin soporte MDX nativo
- Ecosistema de plugins pequeño
- Menos adecuado para documentación grande con muchos componentes

## Decisión

Usaremos **Astro + Starlight**.

Justificación:
1. Markdown/MDX es fuente de verdad — Starlight lo usa nativamente
2. La estructura de archivos define la sidebar — sin archivos YAML separados
3. Pagefind (búsqueda) funciona sin configuración adicional de SaaS
4. Mermaid funciona con plugins estándar de Astro
5. Cero JS por defecto = rendimiento excelente en GitHub Pages
6. Starlight permite componentes personalizados (Astro islands) para:
   - Selector de modelos interactivo
   - Modos esencial/profundo
   - Exploradores
7. Astro 5+ es maduro y bien documentado

## Consecuencias

Positivas:
- Contenido portátil (Markdown puro funciona fuera del sitio web)
- Migración futura trivial (MDX es universal)
- Sidebar automática desde sistema de archivos
- Build estático directo a GitHub Pages
- Componentes React/Vue/Svelte opcionales para interactividad

Riesgos:
- Starlight está en evolución activa — posibles breaking changes menores
- Mermaid requiere configuración específica para SSR

Mitigación:
- Fijar versiones de Astro y Starlight en package.json
- Probar build antes de cada actualización mayor
- Documentar configuración de Mermaid en ADR-003

## Referencias

- https://astro.build/
- https://starlight.astro.build/
- https://mermaid.js.org/
- https://pagefind.app/
