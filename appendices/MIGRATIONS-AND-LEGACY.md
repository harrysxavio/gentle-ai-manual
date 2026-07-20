# Migraciones y diferencias de versión

> **Última actualización**: 2026-07-20

---

## Comandos heredados de revisión (gentle-ai)

### Problema

Gentle-AI v2.1.10 contiene comandos de revisión que parecen ser de una versión anterior (v1):

- `review-start`
- `review-step`
- `review-resume`
- `review-bundle-export`
- `review-bundle-import`
- `review-validate`

### Estado

Estos comandos están marcados como "Legacy v1 surface (read-only)" en el código. Existen pero no parecen ser funcionales en v2.1.10.

### Recomendación

Usar el sistema de revisión actual (`review start`, `review finalize`, `review validate`) en lugar de los comandos heredados.

---

## Catálogo de modelos

### GPT-5.6 Sol Pro

**Documentación anterior**: Menciona `GPT-5.6 Sol Pro` como modelo separado.

**Código actual**: Existe `openai/gpt-5.6-sol` y `openrouter/openai/gpt-5.6-sol-pro`. No está claro si son el mismo modelo con distinta ruta.

**Estado**: Pendiente de verificación.

### Gemini 3.1 Pro

**Documentación anterior**: Menciona `Gemini 3.1 Pro` como modelo estable.

**Catálogo actual**: Solo disponible como `openrouter/google/gemini-3.1-pro-preview`.

**Estado**: Preview, no estable. Puede cambiar sin aviso.

---

## Contratos

El directorio `contracts/` en gentle-ai está vacío. Los contratos reales están en `internal/assets/skills/_shared/`. Posiblemente los contratos se movieron de `contracts/` a los skills compartidos.

---

## GGA

### .gga (archivo) vs .gga/ (directorio)

**Documentación anterior**: Algunas fuentes mencionan un directorio `.gga/`.

**Código actual**: GGA v2.10.1 usa un archivo `.gga` (sin barra) en la raíz del proyecto. No existe directorio `.gga/`.

### Go version

**Alguna documentación**: Menciona GGA como proyecto Go.

**Código actual**: GGA v2.10.1 es 100% Bash. No tiene `go.mod`.

---

## Engram

### V1.19.0 → v1.20.0

Engram 1.20.0 está disponible pero no instalado localmente (se tiene 1.19.0). Cambios no verificados. Se recomienda actualizar.
