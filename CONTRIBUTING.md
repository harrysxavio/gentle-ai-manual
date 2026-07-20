# Contributing

Gracias por tu interés en contribuir al **Gentle AI Mega Manual**.

Este manual sigue un proceso estructurado para garantizar precisión técnica, trazabilidad de fuentes y calidad pedagógica.

---

## Principios

1. **Markdown es la fuente de verdad**. La web se genera desde `content/`.
2. **No duplicar información**. Los datos estructurados viven en `data/`.
3. **Verificar cada afirmación**. Toda afirmación técnica debe tener fuente.
4. **Congelar versiones**. No uses "versión actual" o "último modelo".
5. **Explicar simple, luego profundo**. Tres niveles de explicación.
6. **Registrar incertidumbre**. Si no está verificado, márcalo como `🔴 PENDIENTE`.

---

## Flujo de contribución

### 1. Issue primero

Abre un issue describiendo:
- ¿Qué quieres añadir/cambiar/corregir?
- ¿Qué fuente respalda el cambio?
- ¿Qué nivel de verificación tiene?

### 2. Snapshot

Antes de escribir, verifica las versiones actuales:

```bash
# Verificar versiones del ecosistema
opencode --version
codex --version
gentle-ai --version
engram --version
```

Si el contenido depende de una versión específica, actualiza `SOURCE_SNAPSHOT.md`.

### 3. Rama

```bash
git checkout -b docs/tema-descripcion
```

Conventional commits:
- `docs(tema): descripción` para contenido nuevo
- `fix(tema): descripción` para correcciones
- `chore(scope): descripción` para infraestructura

### 4. Escribir

Usa la plantilla de capítulo (ver sección abajo).

Enlaza términos al GLOSSARY.md.

Incluye `## Fuentes verificadas` al final.

### 5. Validar

```bash
npm run lint        # Markdown lint
npm run check-links # Enlaces válidos
npm run check-mermaid # Diagramas válidos
npm run build       # Build completo
npm run test        # Tests
```

### 6. Pull Request

El PR debe pasar todos los checks de CI.

Referencia el issue: `Closes #N`.

---

## Formato de commit

```
tipo(alcance): descripción

- tipo: docs, fix, feat, chore, test, refactor
- alcance: el módulo o capítulo afectado
- descripción: presente imperativo, sin punto final
```

Ejemplos:
```
docs(instalacion): agregar verificación de PATH en Windows
fix(engram): corregir nombre de herramienta mem_doctor
chore(ci): actualizar action de markdown-lint a v3
```

---

## Plantilla de capítulo

```markdown
---
title:
description:
level: 1|2|3
estimatedTime:
tags:
prerequisites:
verifiedVersion:
learningOutcomes:
---

# Título

## Qué aprenderás

## Por qué importa

## Explicación simple

## Analogía

## Cómo funciona realmente

## Componentes

## Flujo

## Diagrama

## Ejemplo básico

## Ejemplo avanzado

## Archivos relacionados

## Comandos

## Modelos o agentes involucrados

## Resultado esperado

## Cómo verificar

## Cómo revertir

## Errores frecuentes

## Seguridad

## Resumen

## Preguntas

## Ejercicio

## Fuentes verificadas
```

### Niveles

- **level: 1** — Conceptos básicos, definiciones, analogías. Para principiantes.
- **level: 2** — Uso práctico, comandos, configuraciones. Para usuarios intermedios.
- **level: 3** — Arquitectura, código, protocolos, riesgos. Para avanzados.

---

## Fuentes: jerarquía de confianza

1. Código del commit congelado
2. Tests del mismo commit
3. Salida real de `--help`
4. Especificaciones y contratos
5. Documentación del mismo commit
6. Release notes
7. Documentación oficial del proveedor
8. Libro oficial
9. Videos oficiales
10. Fuentes comunitarias

---

## Archivos de datos

No dupliques información. Si un comando, modelo o agente ya existe en `data/`, enlázalo desde el contenido.

### data/commands/
```yaml
name: gentle-ai doctor
description: Ejecuta diagnóstico del ecosistema
usage: gentle-ai doctor
args:
  - name: --verbose
    description: Salida detallada
requires:
  - gentle-ai >= 2.1.0
```

### data/models/
```yaml
catalog.yml: Lista completa de modelos verificados
routing.yml: Asignaciones por agente y perfil
```

---

## Seguridad

- No incluyas tokens, API keys o secretos reales
- No modifiques configuraciones personales del usuario sin advertencia
- Los ejemplos deben usar valores ficticios o variables de entorno
