# ADR-008: Model Routing y recomendaciones por agente

**Fecha**: 2026-07-20  
**Estado**: Aceptado  
**Decisión**: Usar archivos YAML estructurados con perfiles de enrutamiento, niveles de razonamiento normalizados y reglas de fallback documentadas.

---

## Contexto

El ecosistema Gentle-AI expone ~22 agentes (SDD, review, Judgment Day, generales) que requieren modelos de distintos proveedores (OpenAI, Google, Anthropic, OpenCode Go, OpenCode Zen). Cada agente tiene un perfil de riesgo y razonamiento distinto. Sin una estructura clara de recomendaciones:

1. El usuario novato no sabe qué modelo elegir para cada agente
2. El usuario avanzado no puede optimizar costos sin perder calidad
3. Las recomendaciones se vuelven obsoletas sin una fuente actualizable

## Decisión

### 1. Archivo canónico: `data/models/routing.yml`

Contiene tres secciones:
- **Perfiles de enrutamiento** (`profiles`): economic, balanced, powerful
- **Rutas por subagente** (`subagent_routing`): modelo recomendado por proveedor + fallbacks
- **Reglas de enrutamiento** (`routing_rules`): condiciones de escalamiento y fallback

### 2. Taxonomía normalizada de razonamiento

Usamos 5 niveles canónicos independientes del proveedor:

| Nivel | Uso |
|-------|-----|
| `minimal` | Formato, clasificación, búsqueda simple |
| `low` | Tareas claras, resúmenes |
| `medium` | Código estándar, planificación |
| `high` | Arquitectura, debugging, revisión |
| `xhigh` | Seguridad, decisiones críticas |

Cada nivel se mapea a los parámetros reales de cada proveedor. Si un proveedor no soporta control de razonamiento, se indica `provider-default` y se controla mediante selección de modelo.

### 3. Independencia de jueces (Judgment Day)

`jd-judge-a` y `jd-judge-b` usan por defecto modelos y proveedores diferentes para reducir errores correlacionados. El sistema de archivos YAML permite configurar esta regla explícitamente.

### 4. Actualización

El archivo `routing.yml` debe actualizarse cuando:
- El catálogo de modelos cambie (nuevo snapshot)
- Un modelo sea deprecado
- Las pruebas locales (evals/) muestren que una recomendación ya no es óptima

## Alternativas consideradas

### A. Recomendaciones inline en cada capítulo
- ❌ Duplicación masiva
- ❌ Difícil mantener consistencia
- ❌ Sin visión global de costos

### B. Base de datos o CMS
- ❌ Over-engineering para un sitio estático
- ❌ El sitio compila desde Markdown/MDX estático

### C. YAML estructurado (elegido)
- ✅ Fuente única de verdad
- ✅ Validable automáticamente
- ✅ Legible por humanos y máquinas
- ✅ Las páginas del manual pueden referenciarlo sin duplicar

## Consecuencias

### Positivas
- Una sola fuente de verdad para recomendaciones de modelos
- Validación automática posible (modelo existe en catalog.yml, razonamiento soportado)
- Fácil de auditar: diff de YAML muestra exactamente qué cambió

### Negativas
- Requiere disciplina de actualización al cambiar el catálogo
- No captura matices cualitativos ("este modelo es bueno para React pero no para Go")
- Los fallbacks son lineales; no modelan estrategias complejas de enrutamiento

### Neutrales
- Las páginas del manual deben enlazar al YAML, no duplicarlo
- Los perfiles de enrutamiento son sugerencias, no reglas forzadas por el sistema

---

## Referencias

- `data/models/catalog.yml` — catálogo de modelos fuente
- `data/models/routing.yml` — implementación de esta decisión
- `MODEL_CATALOG_SNAPSHOT.md` — snapshot legible del catálogo
- Sección 26 de la misión — requisitos de modelo, razonamiento y enrutamiento
- Capítulo 20 del libro oficial — "From Token to Agent" (economía de tokens y selección de modelos)
