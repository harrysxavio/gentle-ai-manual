---
title: CLI y TUI de Gentle-AI
description: Cómo usar Gentle-AI desde la terminal (CLI) y desde su interfaz visual (TUI). Comandos, flags, navegación y buenas prácticas.
level: 2
estimatedTime: 20 min
tags:
  - gentle-ai
  - cli
  - tui
  - comandos
  - terminal
prerequisites:
  - ¿Qué es Gentle-AI? (07-01)
  - La terminal (01-02)
verifiedVersion: "Gentle-AI 2.1.10"
learningOutcomes:
  - Ejecutar Gentle-AI en modo CLI con comandos específicos
  - Navegar la interfaz TUI con teclado
  - Distinguir comandos que modifican archivos de los de solo lectura
  - Usar flags como --dry-run, --yes, --cwd y --json
  - Decidir cuándo usar CLI vs TUI según la tarea
---

# CLI y TUI de Gentle-AI

## Qué aprenderás

Gentle-AI tiene dos caras: una **interfaz de línea de comandos (CLI)** para ejecutar tareas específicas, y una **interfaz visual de terminal (TUI)** con paneles navegables con teclado.

En este capítulo vas a entender:
- Cómo lanzar cada modo
- Todos los comandos disponibles y qué hace cada uno
- Cómo navegar la TUI con atajos de teclado
- Cuándo conviene usar CLI y cuándo TUI
- Cómo pedir ayuda y qué significan las flags comunes
- Qué comandos escriben archivos y cuáles solo leen

## Por qué importa

Gentle-AI no es un programa que se usa de una sola forma. Algunas tareas requieren precisión (un comando específico con flags), otras requieren exploración visual (ver componentes disponibles, seleccionar qué instalar).

Si solo conocés un modo, vas a forzar tareas en la herramienta equivocada. Saber cuándo usar cada uno te ahorra tiempo y errores. Además, los comandos tienen distintos niveles de riesgo: algunos solo consultan, otros modifican tu configuración. Entender la diferencia evita sorpresas.

## Explicación simple

Gentle-AI ofrece dos formas de usarlo:

**CLI** (Command Line Interface): escribís `gentle-ai` seguido de un comando y flags. El programa hace lo que le pedís y termina. Ideal para tareas concretas y scripts.

```bash
gentle-ai doctor           # diagnóstico, rápido
gentle-ai install --yes    # instalar sin preguntar
```

**TUI** (Terminal User Interface): escribís `gentle-ai` solo, sin comandos. Se abre una interfaz visual con paneles, colores y navegación por teclado. Ideal para explorar opciones, ver estados y hacer instalaciones guiadas.

```bash
gentle-ai                  # abre la TUI
```

La TUI usa **Bubbletea**, un framework de Go para construir interfaces de terminal. El tema visual por defecto es **Rose Pine**.

## Analogía

Pensá en la CLI como el **volante y pedales** de un auto: cada acción tiene un control preciso y directo. La TUI es el **tablero y la pantalla táctil**: te da visión general, te permite explorar opciones y hacer configuraciones sin memorizar comandos.

Los que saben manejar usan ambos: volante para maniobras exactas, pantalla para configuración y monitoreo.

## Cómo funciona realmente

### Cómo se lanza cada modo

Gentle-AI detecta el modo según los argumentos que le pasás:

| Modo | Comando | Cuándo se activa |
|------|---------|-------------------|
| **CLI** | `gentle-ai <comando>` | Cuando pasás un comando (install, doctor, status, etc.) |
| **TUI** | `gentle-ai` (sin argumentos) | Cuando no pasás ningún comando |

La decisión está en `cmd/gentle-ai/main.go`. Si hay un comando reconocido, lo ejecuta como CLI. Si no, arranca la TUI con Bubbletea.

### Comandos CLI disponibles

| Comando | ¿Modifica archivos? | ¿Requiere red? | Descripción |
|---------|--------------------|----------------|-------------|
| `install` | ✅ Sí | ✅ Sí | Instala y configura componentes en tu agente |
| `doctor` | ❌ No | ❌ No | Diagnóstico del ecosistema: detecta agentes, componentes, configuración |
| `status` | ❌ No | ❌ No | Muestra el estado de los componentes instalados |
| `update` | ❌ No | ✅ Sí | Verifica si hay versiones nuevas de componentes |
| `upgrade` | ✅ Sí | ✅ Sí | Aplica las actualizaciones disponibles |
| `uninstall` | ✅ Sí | ❌ No | Desinstala componentes seleccionados |
| `uninstall --all` | ✅ Sí | ❌ No | Desinstala TODO y restaura configuración original |
| `sync` | ✅ Sí | ❌ No | Sincroniza la configuración entre componentes |
| `backup` | ✅ Sí | ❌ No | Crea una copia de seguridad de la configuración actual |
| `restore` | ✅ Sí | ❌ No | Restaura una copia de seguridad |
| `review start` | ❌ No (crea archivos temporales) | ❌ No | Inicia una sesión de revisión de código |
| `sdd-status [cambio]` | ❌ No | ❌ No | Muestra el estado de un cambio SDD |
| `sdd-continue [cambio]` | ✅ Sí | ❌ No | Continúa la siguiente fase SDD disponible |
| `codegraph` | ❌ No (solo lectura) | ❌ No | Comandos de exploración del grafo de código |

Los comandos se dividen en tres categorías de riesgo:

**Solo lectura** (siempre seguros): `doctor`, `status`, `update`, `sdd-status`, `codegraph`

**Modifican configuración** (requieren precaución): `install`, `uninstall`, `upgrade`, `sync`, `backup`, `restore`, `sdd-continue`

**Híbridos** (crean archivos pero no modifican configuración del agente): `review start`

### Flags comunes

Todas las flags se pueden pasar a cualquier comando:

| Flag | Tipo | Descripción | Ejemplo |
|------|------|-------------|---------|
| `--dry-run` | Booleana | Muestra lo que haría sin ejecutarlo | `gentle-ai install --dry-run` |
| `--yes` o `-y` | Booleana | Responde "sí" a todas las confirmaciones | `gentle-ai install --yes` |
| `--cwd <ruta>` | String | Directorio de trabajo (proyecto) | `gentle-ai status --cwd ./mi-proyecto` |
| `--json` | Booleana | Salida en formato JSON (para scripting) | `gentle-ai doctor --json` |
| `--verbose` o `-v` | Booleana | Salida detallada | `gentle-ai install --verbose` |
| `--help` o `-h` | Booleana | Muestra ayuda del comando | `gentle-ai install --help` |
| `--version` | Booleana | Muestra versión del binario | `gentle-ai --version` |

**`--dry-run`** es especialmente útil para comandos que modifican archivos. Te muestra el plan de ejecución sin tocar nada:

```bash
gentle-ai install --dry-run
# → Mostraría: "Instalaría: engram, sdd, skills. No modificaría ningún archivo (dry-run)"
```

**`--json`** permite integrar Gentle-AI con scripts y herramientas. Por ejemplo, para verificar si todo está bien desde un hook de Git:

```bash
$resultado = gentle-ai doctor --json | ConvertFrom-Json
if ($resultado.status -ne "healthy") { exit 1 }
```

### Cómo pedir ayuda

```bash
# Ayuda general
gentle-ai --help

# Ayuda de un comando específico
gentle-ai install --help
gentle-ai doctor --help

# Lista de comandos disponibles
gentle-ai help
```

La ayuda muestra:
- Nombre del comando
- Descripción breve
- Flags disponibles
- Ejemplos de uso

### Navegación TUI

Cuando ejecutás `gentle-ai` sin argumentos, se abre la TUI. La interfaz tiene estos paneles:

```
┌──────────────────────────────────────────────┐
│  Gentle-AI v2.1.10          [Components]     │
├──────────────────────────────────────────────┤
│                                              │
│  [●] engram      Memoria persistente         │
│  [○] sdd         Spec-Driven Development     │
│  [○] skills      Biblioteca de skills        │
│  [○] context7    Documentación actualizada   │
│  [○] persona     Personalidad del asistente  │
│  [○] permissions Reglas de seguridad         │
│  [○] gga         Hooks de revisión           │
│  [○] theme       Tema visual                 │
│  [○] claude-theme Tema para Claude Code      │
│  [○] logo        Logo personalizado          │
│                                              │
│  [Instalar seleccionados]  [Salir]           │
└──────────────────────────────────────────────┘
```

| Tecla | Acción |
|-------|--------|
| `↑` / `↓` | Navegar entre componentes |
| `Espacio` | Seleccionar/deseleccionar componente |
| `Tab` | Cambiar entre paneles (lista, botones, detalle) |
| `Enter` | Confirmar acción (instalar, continuar) |
| `?` | Mostrar ayuda de teclado |
| `q` o `Esc` | Salir / cerrar panel |
| `/` | Buscar componente |

La TUI está construida con **Bubbletea**. El modelo Bubbletea tiene tres partes:

```go
// Modelo simplificado de la TUI
type Model struct {
    componentes []Componente  // lista de componentes disponibles
    cursor      int           // posición del cursor
    seleccion   map[int]bool  // qué componentes están seleccionados
}

// Init: estado inicial
func (m Model) Init() tea.Cmd { ... }

// Update: maneja teclas y actualiza estado
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) { ... }

// View: renderiza la pantalla
func (m Model) View() string { ... }
```

Cada vez que presionás una tecla, Bubbletea llama a `Update`, que devuelve el nuevo modelo y opcionalmente un comando (como ejecutar la instalación). Después llama a `View` para redibujar la pantalla.

### Cuándo usar cada modo

| Situación | Modo recomendado | Por qué |
|-----------|-----------------|---------|
| Diagnóstico rápido | CLI `doctor` | Un comando, resultado inmediato |
| Instalación guiada | TUI | Ves todos los componentes, elegís con espacio |
| Script de CI/CD | CLI `--json` | Salida estructurada, sin interacción |
| Ver estado de SDD | CLI `sdd-status` | Preciso, se puede encadenar |
| Explorar qué hay disponible | TUI | Visual, navegás las opciones |
| Actualizar componentes | CLI `upgrade` | Rápido, no necesitás ver la UI |
| Backup de configuración | CLI `backup` | Un comando, se puede automatizar |

### Comandos que usan el planner/pipeline

`install`, `uninstall` y `upgrade` usan el **planner** (grafo de dependencias) y el **pipeline** (prepare → apply → rollback). Esto significa que:

- Calculan el orden correcto de operaciones
- Si algo falla, intentan revertir los cambios
- Pueden tardar más que un comando simple

El resto de los comandos (`doctor`, `status`, `backup`, `restore`, `sync`, `review`, `sdd-status`, `sdd-continue`, `codegraph`) son operaciones directas sin planner.

## Errores frecuentes

1. **Ejecutar `gentle-ai install` sin permisos**: en algunas configuraciones, Gentle-AI necesita permisos de escritura en `~/.config/opencode/`. Si ves errores de permisos, ejecutá la terminal como administrador.
2. **Usar `--yes` sin revisar**: la flag salta todas las confirmaciones. Si no sabés exactamente qué va a hacer, usá `--dry-run` primero.
3. **Confundir `update` con `upgrade`**: `update` solo VERIFICA si hay novedades; `upgrade` las APLICA. No son lo mismo.
4. **TUI sin terminal que la soporte**: algunas terminales (CMD clásico, terminales muy viejas) no renderizan bien Bubbletea. Usá Windows Terminal, PowerShell 7+ o cualquier terminal moderna.
5. **`sdd-status` sin proyecto SDD inicializado**: si el proyecto no tiene SDD configurado, `sdd-status` no encuentra cambios que reportar.

## Resumen

| Concepto | ¿Qué es? |
|----------|---------|
| **CLI** | `gentle-ai <comando>` — para tareas concretas y scripting |
| **TUI** | `gentle-ai` sin argumentos — interfaz visual con Bubbletea |
| **Comandos solo lectura** | `doctor`, `status`, `update`, `sdd-status`, `codegraph` |
| **Comandos modifican** | `install`, `uninstall`, `upgrade`, `sync`, `backup`, `restore`, `sdd-continue` |
| **Flag clave** | `--dry-run` para ensayar sin consecuencias |
| **Salida estructurada** | `--json` para integrar con scripts |
| **Ayuda** | `--help` en cualquier comando |

## Preguntas

1. ¿Cuál es la diferencia entre `update` y `upgrade`?
2. ¿Qué comando usarías para verificar si tus componentes están bien configurados sin modificar nada?
3. ¿Cómo harías un backup de la configuración actual desde un script?
4. ¿Qué tecla usás en la TUI para seleccionar un componente?
5. ¿Qué flag usarías para simular una instalación sin tocar archivos?

## Fuentes verificadas

- Repositorio: gentle-ai, commit `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d`
- Archivos: `cmd/gentle-ai/main.go`, `internal/tui/`, `internal/cli/`
- Framework: Bubbletea (documentación oficial)
- Versión verificada: gentle-ai 2.1.10
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
