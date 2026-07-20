# Gentle AI — Mega Manual (Español)

El manual pedagógico, técnico e interactivo del ecosistema **Gentleman Programming**.

> 🌐 **Versión web**: [harrysxavio.github.io/gentle-ai-manual](https://harrysxavio.github.io/gentle-ai-manual/)

---

## 🎯 ¿Qué es esto?

Un curso completo que te lleva desde **"no sé nada de programación"** hasta **"diseño, construyo, reviso y gobierno productos con agentes de IA"**.

No es una referencia de comandos. Es un sistema de aprendizaje progresivo con 20 módulos, 49 capítulos, 20 laboratorios prácticos y 8 rutas de aprendizaje según tu perfil.

---

## 🧭 ¿Cómo estudiar con este manual?

### Paso 1 — Elegí tu perfil

| Soy... | Ruta | Tiempo estimado |
|--------|------|:---:|
| 🟢 **Principiante total** | `00 → 01 → 02 → 03 → 04 → 05 → 06 → 15` | ~8 horas |
| 🟡 **Ya sé programar** | `03 → 04 → 05 → 06 → 07 → 08 → 09 → 10` | ~6 horas |
| 🔵 **Uso OpenCode** | `04 → 05 → 07 → 08 → 09 → 10 → 02 → 11 → 12 → 14` | ~8 horas |
| 🟣 **Uso Codex** | `04 → 05 → 07 → 08 → 09 → 10 → 02 → 11 → 13 → 14` | ~7 horas |
| 🟠 **Quiero entender Engram** | `01 → 03 → 04 → 05 → 07 → 09 → 02 → 11 → 16` | ~7 horas |
| 🔴 **Quiero configurar modelos** | `01 → 03 → 05 → 07 → 10 → 12/13 → 14 → 17` | ~6 horas |
| ⚫ **Quiero construir un producto** | `00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 14 → 18 → 19` | ~12 horas |
| 🟤 **Arquitectura del ecosistema** | `02 → 03 → 04 → 05 → 07 → 08 → 09 → 11 → 14 → 16 → 17` | ~9 horas |

### Paso 2 — Seguí la ruta en orden

Cada módulo declara sus **prerrequisitos**. No saltees módulos: el contenido está diseñado para construirse capa sobre capa. La [versión web](https://harrysxavio.github.io/gentle-ai-manual/) tiene navegación lateral, búsqueda y barra de progreso.

### Paso 3 — Hacé los laboratorios

El Módulo 19 contiene **20 laboratorios prácticos** con instrucciones paso a paso, resultado esperado y autodiagnóstico. Hacé cada lab al terminar su módulo correspondiente.

### Paso 4 — Construí algo real

El Módulo 18 te guía en la construcción de un producto completo con el ecosistema: idea → SDD → código → tests → revisión → deploy.

---

## 📚 Mapa de módulos

| # | Módulo | Dificultad | ¿Qué aprendés? |
|:-:|--------|:----------:|-----------------|
| 00 | Empezar aquí | 1 | Cómo usar este manual, perfiles de aprendizaje |
| 01 | Fundamentos tecnológicos | 1 | Computadora, terminal, programación, frontend/backend, bases de datos |
| 02 | Git y GitHub | 1-2 | Commits, ramas, remotos, PRs, hooks, worktrees |
| 03 | Fundamentos de IA | 1-2 | Modelos, proveedores, agentes, tokens, contexto, MCP, tool calling |
| 04 | Ecosistema Gentle | 2 | Arquitectura general, OpenCode vs Codex |
| 05 | Instalación | 1 | Instalar y verificar todo el ecosistema |
| 06 | Primer proyecto | 2 | Tutorial guiado de SDD completo |
| 07 | Gentle-AI | 2 | CLI, TUI, componentes, agentes, personas, permisos |
| 08 | SDD | 2 | Las 10 fases, artefactos, Strict TDD, OpenSpec/Engram/Híbrido |
| 09 | Engram | 2 | Memoria persistente, herramientas MCP, arquitectura interna |
| 10 | Skills | 2 | Crear skills, registry, descubrimiento |
| 11 | Calidad y revisión | 2 | GGA, Native Bounded Review, Judgment Day |
| 12 | OpenCode | 2 | Configuración de agentes, modelos, permisos, skills |
| 13 | Codex | 2 | Perfiles TOML, razonamiento, multiagente |
| 14 | Modelos y enrutamiento | 2 | Catálogo de 34 modelos, selección por tarea/riesgo/costo |
| 15 | Terminal | 1 | Pipes, redirección, procesos, scripts |
| 16 | Arquitectura técnica | 3 | Paquetes Go, Bubbletea TUI, pipeline, contribución |
| 17 | Seguridad, costos y gobierno | 2 | Permisos, presupuestos, auditoría, políticas |
| 18 | Construcción de productos | 3 | Ciclo completo idea→deploy con el ecosistema |
| 19 | Laboratorios | 2-3 | 20 ejercicios prácticos acumulativos |
| 20 | Referencia | 3 | Comandos, glosario, modelos, compatibilidad |

---

## 🚀 Ejecutar localmente

```bash
git clone https://github.com/harrysxavio/gentle-ai-manual.git
cd gentle-ai-manual/gentle-ai-mega-manual-es
npm install
npm run dev        # http://localhost:4321
npm run build      # compila a dist/
npm run validate   # lint + mermaid + modelos + tests + build
```

---

## 🧪 Verificaciones automáticas

| Comando | Qué verifica |
|---------|-------------|
| `npm run check` | TypeScript/Astro type-checking |
| `npm run lint` | Markdownlint en todo el contenido |
| `npm run check-mermaid` | Sintaxis de diagramas Mermaid |
| `npm run check-models` | Catálogo de 34 modelos |
| `npm test` | Integridad de archivos, caracteres, frontmatter |
| `npm run build` | Build Astro + Pagefind + validación de enlaces |
| `npm run check-links` | Enlaces rotos en el sitio generado |
| `npm run validate` | Todos los anteriores en secuencia |

---

## 🤝 Contribuir

1. **Fork** del repositorio
2. **Rama**: `feat/tu-mejora`
3. **Commits**: convencionales (`feat:`, `fix:`, `docs:`)
4. **Validación**: `npm run validate` debe pasar
5. **PR**: contra `main`, describí qué cambia y por qué

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md) para la guía completa de estilo y estructura de capítulos.

---

## 📸 Versiones verificadas

| Herramienta | Versión |
|------------|---------|
| Gentle-AI | 2.1.10 |
| OpenCode | 1.17.20 |
| Codex | 0.144.0 |
| Engram | 1.19.0 |
| GGA | 2.10.1 |
| Node.js | 22.x |

Ver [`SOURCE_SNAPSHOT.md`](SOURCE_SNAPSHOT.md) para el snapshot completo con commits verificados.

---

## 🔗 Ecosistema

| Repositorio | Propósito |
|------------|-----------|
| [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) | Orquestador, CLI, TUI, SDD |
| [engram](https://github.com/Gentleman-Programming/engram) | Memoria persistente (MCP + SQLite + FTS5) |
| [gga](https://github.com/Gentleman-Programming/gentleman-guardian-angel) | Hooks Git de revisión (Bash) |
| [Gentleman-Skills](https://github.com/Gentleman-Programming/Gentleman-Skills) | Biblioteca de 24 skills curadas |

---

## 📄 Licencia

Ver [`LICENSE`](LICENSE).

---

*¿Encontraste un error? ¿Querés contribuir un capítulo o laboratorio? Abrí un [issue](https://github.com/harrysxavio/gentle-ai-manual/issues) o un PR.*
