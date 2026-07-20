# Mapa de competencias

> **Versión**: 2026-07-20 | **Niveles**: 6 | **Módulos**: 20

---

## Matriz módulo × nivel de competencia

Cada celda indica qué nivel de competencia se alcanza al completar ese módulo y sus laboratorios.

| Módulo | Fundamentos | Operador | Configurador | Constructor | Arquitecto | Experto |
|--------|:----------:|:--------:|:------------:|:-----------:|:----------:|:-------:|
| 00 — Empezar aquí | ✅ | — | — | — | — | — |
| 01 — Fundamentos tecnológicos | ✅ | — | — | — | — | — |
| 02 — Git y GitHub | ✅ | ✅ | — | — | — | — |
| 03 — Fundamentos de IA | ✅ | — | — | — | — | — |
| 04 — Ecosistema Gentle | ✅ | — | — | — | — | — |
| 05 — Instalación | — | ✅ | — | — | — | — |
| 06 — Primer proyecto | — | ✅ | — | — | — | — |
| 07 — Gentle-AI | — | ✅ | — | — | — | — |
| 08 — SDD | — | ✅ | ✅ | — | — | — |
| 09 — Engram | — | ✅ | ✅ | — | — | — |
| 10 — Skills | — | ✅ | ✅ | — | — | — |
| 11 — Calidad y revisión | — | ✅ | — | — | — | — |
| 12 — OpenCode | — | — | ✅ | — | — | — |
| 13 — Codex | — | — | ✅ | — | — | — |
| 14 — Modelos y enrutamiento | — | — | ✅ | — | — | ✅ |
| 15 — Terminal | ✅ | ✅ | — | — | — | — |
| 16 — Arquitectura técnica | — | — | — | — | ✅ | — |
| 17 — Seguridad, costos y gobierno | — | — | ✅ | — | — | ✅ |
| 18 — Construcción de productos | — | — | — | ✅ | — | — |
| 19 — Laboratorios | — | ✅ | ✅ | ✅ | — | — |
| 20 — Referencia | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Niveles en detalle

### Nivel 1: Fundamentos
**Definición**: Puede explicar conceptos técnicos con precisión.

| Competencia específica | Módulo(s) |
|------------------------|-----------|
| Explicar qué es hardware, software, sistema operativo, proceso, archivo | 01 |
| Explicar qué es la terminal, shell, CLI, TUI, PATH, código de salida | 01, 15 |
| Explicar qué es un programa, código fuente, compilar, interpretar, runtime | 01 |
| Explicar qué es frontend, backend, API, base de datos | 01 |
| Explicar qué es Git, repositorio, commit, rama, merge, PR | 02 |
| Explicar qué es un modelo, proveedor, agente, token, MCP, tool calling | 03 |
| Nombrar los 4 repositorios del ecosistema y su propósito | 04 |
| Explicar el diagrama macro del ecosistema | 04 |
| Consultar el glosario y el catálogo de referencia | 20 |

### Nivel 2: Operador
**Definición**: Puede usar las herramientas del ecosistema para tareas guiadas.

| Competencia específica | Módulo(s) |
|------------------------|-----------|
| Clonar repositorios, hacer commits, crear ramas, resolver conflictos simples | 02 |
| Instalar gentle-ai y verificar con `doctor` | 05 |
| Ejecutar un ciclo SDD completo guiado | 06 |
| Usar gentle-ai CLI y TUI | 07 |
| Ejecutar fases SDD individuales | 08 |
| Guardar, buscar y recuperar memoria con Engram | 09 |
| Leer y seguir skills existentes | 10 |
| Configurar GGA y leer su output | 11 |
| Navegar el filesystem, usar pipes y redirección | 15 |
| Ejecutar laboratorios guiados | 19 |

### Nivel 3: Configurador
**Definición**: Puede modificar configuraciones, perfiles y asignaciones de modelos.

| Competencia específica | Módulo(s) |
|------------------------|-----------|
| Elegir backend SDD (OpenSpec/Engram/híbrido) | 08 |
| Configurar project detection y topic keys en Engram | 09 |
| Crear y probar skills propias con triggers | 10 |
| Configurar opencode.json con agentes y modelos | 12 |
| Configurar perfiles TOML en Codex | 13 |
| Seleccionar modelo por tarea, riesgo, costo y velocidad | 14 |
| Configurar niveles de razonamiento por agente | 14 |
| Crear cadenas de fallback | 14 |
| Configurar permisos y políticas de seguridad | 17 |
| Estimar costos por sesión y por mes | 17 |

### Nivel 4: Constructor
**Definición**: Puede crear productos completos con frontend, backend, base de datos, tests y CI.

| Competencia específica | Módulo(s) |
|------------------------|-----------|
| Ejecutar el ciclo completo idea → deploy | 18 |
| Integrar frontend + backend + SQLite + tests | 18 |
| Usar SDD para planificar y ejecutar un producto real | 18 |
| Configurar CI/CD con GitHub Actions | 18 |
| Aplicar GGA y Native Review en un producto real | 18 |
| Resolver problemas de integración entre componentes | 19 |
| Completar el proyecto integrador | 19 |

### Nivel 5: Arquitecto
**Definición**: Puede explicar y modificar la arquitectura interna del ecosistema.

| Competencia específica | Módulo(s) |
|------------------------|-----------|
| Leer y modificar código fuente Go de gentle-ai | 16 |
| Leer y modificar código fuente Go de engram | 16 |
| Entender el pipeline interno de gentle-ai | 16 |
| Explicar la arquitectura Bubbletea TUI | 16 |
| Entender la estructura de paquetes de cada repositorio | 16 |
| Contribuir con PRs a los repositorios | 16 |
| Consultar documentación de arquitectura en referencia | 20 |

### Nivel 6: Experto operativo
**Definición**: Puede diagnosticar, optimizar costos, evaluar modelos y gobernar el ecosistema.

| Competencia específica | Módulo(s) |
|------------------------|-----------|
| Evaluar modelos con evals/ y benchmarks locales | 14 |
| Medir latencia, tokens y costo por agente | 14 |
| Diagnosticar fallos de tool calling, memoria y MCP | 17 |
| Auditar uso de modelos y optimizar presupuestos | 17 |
| Implementar políticas de gobierno (fallback, escalamiento, permisos) | 17 |
| Diagnosticar problemas de instalación y configuración | 17, 20 |
| Consultar la matriz de compatibilidad y snapshots | 20 |

---

## Progresión esperada por ruta

| Ruta | Inicio | Fin esperado |
|------|--------|-------------|
| Principiante total | Fundamentos | Operador → Configurador |
| Ya sé programar | Operador | Configurador → Constructor |
| OpenCode / Codex | Operador | Configurador |
| Engram | — | Arquitecto (Engram) |
| Modelos | Operador | Configurador → Experto |
| Producto | Fundamentos | Constructor |
| Arquitectura | Operador | Arquitecto |

---

*Mapa alineado con INDEX.md y los criterios de aceptación de la misión (sección 48).*
