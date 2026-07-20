# Índice pedagógico — Gentle AI Mega Manual

> **Versión**: 2026-07-20 | **Módulos**: 20 | **Rutas**: 8

---

## Cómo usar este manual

Este manual está organizado en 20 módulos progresivos. Cada módulo incluye:

| Dato | Significado |
|------|------------|
| **Dificultad** | 1 = principiante, 2 = intermedio, 3 = avanzado |
| **Tiempo** | Minutos estimados de lectura (sin ejercicios) |
| **Prerrequisitos** | Qué necesitás saber o haber leído antes |
| **Competencias** | Qué habilidades adquirís al completarlo |
| **Herramientas** | Qué software o comandos usarás |
| **Laboratorios** | Ejercicios prácticos asociados |

---

## Módulos

### 00 — Empezar aquí
| Campo | Valor |
|-------|-------|
| **Dificultad** | 1 |
| **Tiempo** | 10 min |
| **Por qué importa** | Sin orientación, el manual es abrumador. Este módulo te da el mapa. |
| **Prerrequisitos** | Ninguno |
| **Herramientas** | Navegador web |
| **Laboratorios** | — |
| **Competencias** | Navegar el manual, elegir tu ruta de aprendizaje, entender los niveles de explicación |

### 01 — Fundamentos tecnológicos
| Campo | Valor |
|-------|-------|
| **Dificultad** | 1 |
| **Tiempo** | 60 min |
| **Por qué importa** | No podés entender agentes de IA si no sabés qué es un proceso, un archivo o una variable. |
| **Prerrequisitos** | Módulo 00 |
| **Herramientas** | Terminal, editor de texto |
| **Laboratorios** | Lab 01 (Entorno seguro), Lab 02 (Terminal) |
| **Competencias** | Explicar hardware, software, SO, procesos, terminal, shell, CLI/TUI, programación, frontend/backend, bases de datos |

### 02 — Git y GitHub
| Campo | Valor |
|-------|-------|
| **Dificultad** | 1 |
| **Tiempo** | 90 min |
| **Por qué importa** | Todo el ecosistema (SDD, GGA, Native Review, Engram) depende de Git. Sin Git no hay trazabilidad. |
| **Prerrequisitos** | Módulo 01 (terminal) |
| **Herramientas** | Git, GitHub, terminal |
| **Laboratorios** | Lab 03 (Git desde cero) |
| **Competencias** | Hacer commits, crear ramas, resolver conflictos, abrir PRs, entender hooks, explicar cómo Gentle-AI usa Git |

### 03 — Fundamentos de IA
| Campo | Valor |
|-------|-------|
| **Dificultad** | 1 |
| **Tiempo** | 60 min |
| **Por qué importa** | Antes de usar agentes, necesitás entender qué es un modelo, un token, un proveedor y cómo se comunican. |
| **Prerrequisitos** | Módulo 01 |
| **Herramientas** | Navegador (para explorar APIs) |
| **Laboratorios** | — |
| **Competencias** | Diferenciar modelo/proveedor/cliente/agente/orquestador/subagente, explicar tokens, context window, MCP, tool calling, system prompt |

### 04 — Ecosistema Gentle
| Campo | Valor |
|-------|-------|
| **Dificultad** | 1 |
| **Tiempo** | 20 min |
| **Por qué importa** | Antes de instalar nada, necesitás el mapa completo: qué hace cada pieza y cómo se conectan. |
| **Prerrequisitos** | Módulo 03 |
| **Herramientas** | — |
| **Laboratorios** | — |
| **Competencias** | Nombrar los 4 repositorios, explicar las 4 capas del ecosistema, ubicar cada herramienta en el diagrama macro |

### 05 — Instalación
| Campo | Valor |
|-------|-------|
| **Dificultad** | 1 |
| **Tiempo** | 30 min |
| **Por qué importa** | Una instalación incorrecta genera errores difíciles de diagnosticar. |
| **Prerrequisitos** | Módulo 04 |
| **Herramientas** | npm, gentle-ai CLI, terminal |
| **Laboratorios** | Lab 04 (Instalar Gentle-AI), Lab 05 (Doctor) |
| **Competencias** | Instalar gentle-ai, verificar con `doctor`, entender paths de configuración, instalar en Windows/macOS/Linux |

### 06 — Primer proyecto
| Campo | Valor |
|-------|-------|
| **Dificultad** | 2 |
| **Tiempo** | 60 min |
| **Por qué importa** | La mejor forma de aprender SDD es usándolo. Este módulo te guía en un proyecto real chico. |
| **Prerrequisitos** | Módulo 05 |
| **Herramientas** | gentle-ai, OpenCode, Git |
| **Laboratorios** | Lab 06 (Primer SDD completo) |
| **Competencias** | Ejecutar un ciclo SDD completo (init → archive), interpretar artefactos, verificar implementación |

### 07 — Gentle-AI
| Campo | Valor |
|-------|-------|
| **Dificultad** | 2 |
| **Tiempo** | 30 min |
| **Por qué importa** | Gentle-AI es el orquestador central. Sin entenderlo, usás el ecosistema a ciegas. |
| **Prerrequisitos** | Módulo 05 |
| **Herramientas** | gentle-ai CLI, gentle-ai TUI |
| **Laboratorios** | — |
| **Competencias** | Usar CLI y TUI, listar agentes y componentes, entender el pipeline, configurar personas y permisos |

### 08 — SDD (Spec-Driven Development)
| Campo | Valor |
|-------|-------|
| **Dificultad** | 2 |
| **Tiempo** | 35 min |
| **Por qué importa** | SDD es la metodología central del ecosistema. Sin SDD, los agentes trabajan sin plan ni verificación. |
| **Prerrequisitos** | Módulo 07 |
| **Herramientas** | gentle-ai, OpenCode, Git |
| **Laboratorios** | Lab 07 (SDD completo) |
| **Competencias** | Ejecutar las 10 fases SDD, elegir backend (OpenSpec/Engram/híbrido), entender Strict TDD, interpretar artefactos |

### 09 — Engram (Memoria persistente)
| Campo | Valor |
|-------|-------|
| **Dificultad** | 2 |
| **Tiempo** | 40 min |
| **Por qué importa** | Sin memoria, cada sesión empieza de cero. Engram es lo que hace que los agentes aprendan. |
| **Prerrequisitos** | Módulo 07 |
| **Herramientas** | engram CLI, engram MCP |
| **Laboratorios** | Lab 08 (Engram) |
| **Competencias** | Guardar, buscar y recuperar memoria, usar MCP tools, entender project detection, explicar SQLite+FTS5 |

### 10 — Skills
| Campo | Valor |
|-------|-------|
| **Dificultad** | 2 |
| **Tiempo** | 25 min |
| **Por qué importa** | Las skills son el conocimiento especializado del ecosistema. Crearlas bien es la diferencia entre un agente útil y uno que alucina. |
| **Prerrequisitos** | Módulo 07 |
| **Herramientas** | Editor de texto, gentle-ai |
| **Laboratorios** | Lab 09 (Crear una skill) |
| **Competencias** | Leer y escribir SKILL.md, definir triggers, probar skills, usar el registry, entender carga por contexto |

### 11 — Calidad y revisión
| Campo | Valor |
|-------|-------|
| **Dificultad** | 2 |
| **Tiempo** | 40 min |
| **Por qué importa** | El código sin revisión es deuda técnica. GGA, Native Review y Judgment Day son tres herramientas distintas para tres momentos distintos. |
| **Prerrequisitos** | Módulo 07, Módulo 02 (Git) |
| **Herramientas** | GGA, gentle-ai review, Git hooks |
| **Laboratorios** | Lab 15 (GGA), Lab 16 (Native Review), Lab 17 (Judgment Day) |
| **Competencias** | Configurar GGA, ejecutar Native Bounded Review, diferenciar los 4R lenses, ejecutar Judgment Day con jueces independientes |

### 12 — OpenCode
| Campo | Valor |
|-------|-------|
| **Dificultad** | 2 |
| **Tiempo** | 45 min |
| **Por qué importa** | OpenCode es el entorno donde los agentes viven. Configurarlo bien es la diferencia entre un asistente útil y uno que rompe cosas. |
| **Prerrequisitos** | Módulo 07, Módulo 10 |
| **Herramientas** | OpenCode, opencode.json, gentle-ai |
| **Laboratorios** | Lab 10 (Configurar OpenCode), Lab 11 (Perfiles) |
| **Competencias** | Configurar opencode.json, asignar modelos por agente, instalar skills y plugins, usar slash commands, entender subagentes |

### 13 — Codex
| Campo | Valor |
|-------|-------|
| **Dificultad** | 2 |
| **Tiempo** | 30 min |
| **Por qué importa** | Codex es la alternativa de OpenAI. Tiene capacidades distintas (multiagente experimental, perfiles TOML) que OpenCode no ofrece. |
| **Prerrequisitos** | Módulo 07, Módulo 10 |
| **Herramientas** | Codex CLI, config.toml, gentle-ai |
| **Laboratorios** | Lab 12 (Configurar Codex), Lab 13 (Multiagente Codex) |
| **Competencias** | Configurar perfiles TOML, usar reasoning effort, activar multiagente, compartir Engram entre OpenCode y Codex |

### 14 — Modelos y enrutamiento
| Campo | Valor |
|-------|-------|
| **Dificultad** | 2 |
| **Tiempo** | 45 min |
| **Por qué importa** | El modelo incorrecto para la tarea incorrecta = dinero desperdiciado o calidad insuficiente. Esta es la decisión más costosa del ecosistema. |
| **Prerrequisitos** | Módulo 07, Módulo 03 (IA) |
| **Herramientas** | opencode models, catálogos, evals/ |
| **Laboratorios** | Lab 18 (Model routing), Lab 19 (Benchmarking) |
| **Competencias** | Seleccionar modelo por tarea/riesgo/costo/velocidad, configurar razonamiento, crear cadenas de fallback, evaluar modelos |

### 15 — Terminal
| Campo | Valor |
|-------|-------|
| **Dificultad** | 1 |
| **Tiempo** | 30 min |
| **Por qué importa** | La terminal es la interfaz principal del ecosistema. Sin soltura en CLI, todo se vuelve más lento y propenso a errores. |
| **Prerrequisitos** | Módulo 01 |
| **Herramientas** | PowerShell, Bash, Zsh |
| **Laboratorios** | Lab 02 (Terminal avanzado) |
| **Competencias** | Navegar el filesystem, usar pipes y redirección, entender procesos foreground/background, leer códigos de salida |

### 16 — Arquitectura técnica
| Campo | Valor |
|-------|-------|
| **Dificultad** | 3 |
| **Tiempo** | 60 min |
| **Por qué importa** | Para contribuir, diagnosticar bugs profundos o extender el ecosistema, necesitás entender qué hace cada paquete Go y cómo se comunican. |
| **Prerrequisitos** | Módulo 07, Módulo 09, Módulo 11 |
| **Herramientas** | Go, editor de código |
| **Laboratorios** | — |
| **Competencias** | Leer código fuente de gentle-ai/engram/GGA, entender Bubbletea TUI, explicar el pipeline interno, navegar la estructura de paquetes |

### 17 — Seguridad, costos y gobierno
| Campo | Valor |
|-------|-------|
| **Dificultad** | 2 |
| **Tiempo** | 40 min |
| **Por qué importa** | Un agente sin gobierno puede gastar USD 100 en una tarde, exponer secretos o aceptar código inseguro. |
| **Prerrequisitos** | Módulo 07, Módulo 14 |
| **Herramientas** | gentle-ai doctor, opencode models, presupuestos |
| **Laboratorios** | — |
| **Competencias** | Configurar permisos, estimar costos por sesión, auditar uso de modelos, implementar políticas de fallback, proteger secretos |

### 18 — Construcción de productos
| Campo | Valor |
|-------|-------|
| **Dificultad** | 3 |
| **Tiempo** | 90 min |
| **Por qué importa** | El objetivo final no es usar herramientas — es construir productos. Este módulo integra todo lo aprendido. |
| **Prerrequisitos** | Módulos 06–14 |
| **Herramientas** | gentle-ai, OpenCode/Codex, Git, SQLite, frontend framework |
| **Laboratorios** | Lab 20 (Producto integrador) |
| **Competencias** | Ejecutar el ciclo completo idea→deploy, integrar frontend+backend+DB+tests+SDD+review+CI |

### 19 — Laboratorios
| Campo | Valor |
|-------|-------|
| **Dificultad** | 2-3 |
| **Tiempo** | 120 min |
| **Por qué importa** | La teoría sin práctica no se fija. Los labs son ejercicios acumulativos que construyen confianza real. |
| **Prerrequisitos** | Varía por laboratorio |
| **Herramientas** | Todas las del ecosistema |
| **Laboratorios** | 20 laboratorios acumulativos |
| **Competencias** | Resolver problemas reales con el ecosistema, diagnosticar fallos, verificar resultados |

### 20 — Referencia
| Campo | Valor |
|-------|-------|
| **Dificultad** | 3 |
| **Tiempo** | Consulta |
| **Por qué importa** | Cuando ya sabés lo que buscás pero necesitás el detalle exacto: sintaxis, parámetros, modelos, comandos. |
| **Prerrequisitos** | Variable según la referencia |
| **Herramientas** | — |
| **Laboratorios** | — |
| **Competencias** | Consultar comandos, glosario, catálogo de modelos, archivos de configuración y matriz de compatibilidad |

---

## Rutas de aprendizaje

| Perfil | Ruta | Nivel final esperado |
|--------|------|---------------------|
| 🟢 **Principiante total** | 00 → 01 → 02 → 03 → 04 → 05 → 06 → 15 | Operador |
| 🟡 **Ya sé programar** | 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 | Configurador |
| 🔵 **Uso OpenCode** | 03 → 04 → 05 → 07 → 08 → 09 → 10 → 02 → 11 → 12 → 14 | Configurador |
| 🟣 **Uso Codex** | 03 → 04 → 05 → 07 → 08 → 09 → 10 → 02 → 11 → 13 → 14 | Configurador |
| 🟠 **Quiero entender Engram** | 01 → 03 → 04 → 05 → 07 → 09 → 02 → 11 → 16 | Arquitecto (Engram) |
| 🔴 **Quiero configurar modelos** | 01 → 03 → 05 → 07 → 10 → 12/13 → 14 → 17 | Configurador |
| ⚫ **Quiero construir un producto** | 00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 14 → 18 → 19 | Constructor |
| 🟤 **Quiero entender la arquitectura** | 02 → 03 → 04 → 05 → 07 → 08 → 09 → 11 → 14 → 16 → 17 | Arquitecto |

---

## Niveles de competencia

| Nivel | Nombre | ¿Qué puede hacer? |
|-------|--------|-------------------|
| 1 | **Fundamentos** | Explicar conceptos: qué es un agente, un modelo, un token, Git |
| 2 | **Operador** | Usar herramientas: instalar, ejecutar SDD, guardar memoria, crear skills |
| 3 | **Configurador** | Modificar perfiles, asignar modelos por agente, configurar fallbacks |
| 4 | **Constructor** | Crear productos completos con frontend, backend, DB, tests, CI |
| 5 | **Arquitecto** | Explicar y modificar la arquitectura interna, contribuir al código fuente |
| 6 | **Experto operativo** | Diagnosticar, optimizar costos, evaluar modelos, gobernar el ecosistema |

---

## Herramientas del ecosistema por módulo

| Herramienta | Módulos donde se usa |
|------------|---------------------|
| **gentle-ai** CLI/TUI | 05, 06, 07, 08, 11, 12, 13, 16, 17, 18, 19 |
| **engram** CLI/MCP | 09, 12, 13, 16, 18 |
| **GGA** | 11, 17, 18, 19 |
| **OpenCode** | 06, 07, 08, 10, 11, 12, 14, 18, 19 |
| **Codex CLI** | 06, 07, 08, 10, 11, 13, 14, 18, 19 |
| **Git** | 02, 06, 08, 11, 18, 19 |
| **GitHub** | 02, 06, 18 |
| **SQLite** | 01, 09, 16 |
| **Go** | 16 |
| **Node.js** | 05, 12, 13 |

---

## Mapa de laboratorios

| # | Laboratorio | Módulo | Objetivo |
|---|------------|--------|----------|
| 01 | Entorno seguro | 01 | Crear un directorio temporal aislado para experimentar |
| 02 | Terminal | 01, 15 | Navegar, crear archivos, usar pipes, redirección |
| 03 | Git desde cero | 02 | Init, add, commit, branch, merge, conflict, PR |
| 04 | Instalar Gentle-AI | 05 | npm install, verificar, doctor |
| 05 | Doctor | 05 | Diagnosticar instalación, leer output |
| 06 | Primer SDD | 06 | Ciclo completo init → archive en proyecto pequeño |
| 07 | SDD completo | 08 | Proyecto mediano con todas las fases |
| 08 | Engram | 09 | mem_save, mem_search, mem_context, project detection |
| 09 | Crear una skill | 10 | Escribir SKILL.md, probar trigger, instalar |
| 10 | Configurar OpenCode | 12 | opencode.json, agentes, modelos, slash commands |
| 11 | Perfiles OpenCode | 12 | Crear perfiles económico/equilibrado/potente |
| 12 | Configurar Codex | 13 | config.toml, perfiles, reasoning effort |
| 13 | Multiagente Codex | 13 | Activar features.multi_agent, spawn, wait, close |
| 14 | Comparar OpenCode y Codex | — | Misma tarea en ambos entornos |
| 15 | GGA | 11 | Configurar .gga, ejecutar pre-commit, leer output |
| 16 | Native Review | 11 | Ejecutar review/start, interpretar lenses, leer receipt |
| 17 | Judgment Day | 11 | Dos jueces independientes, fix agent, ledger |
| 18 | Model routing | 14 | Configurar modelos por agente, probar fallbacks |
| 19 | Benchmarking | 14 | Evaluar modelos con evals/, medir latencia y costo |
| 20 | Producto integrador | 18 | Ciclo completo idea→deploy con todo el ecosistema |

---

*Índice actualizado al 2026-07-20. Versiones verificadas en SOURCE_SNAPSHOT.md.*
