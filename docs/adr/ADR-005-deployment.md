# ADR-005: Despliegue

## Estado

Aceptado

## Decisión

Desplegar en **GitHub Pages** desde la rama `main` mediante GitHub Actions.

Workflow:
1. Checkout del repositorio
2. Instalar dependencias (`npm ci`)
3. Build (`npm run build`)
4. Desplegar a GitHub Pages (`actions/deploy-pages`)

No se requiere servidor, base de datos ni configuración de DNS adicional.

## Consecuencias

- Gratuito para repositorios públicos
- Build estático, cero mantenimiento de servidor
- Sin costs operativos
- Sin secretos de despliegue
- HTTTPS automático con dominio custom opcional
