---
title: Instalar Gentle-AI
description: "Instalación completa del ecosistema Gentle: gentle-ai, OpenCode, Codex, Engram, skills y configuración inicial."
level: 1
estimatedTime: 30 min
tags:
  - instalación
  - gentle-ai
  - npm
  - opencode
  - codex
  - engram
  - skills
  - configuración
prerequisites:
  - "Visión general del ecosistema (04-01)"
  - "La terminal (01-02)"
verifiedVersion: "Gentle-AI 2.1.10, OpenCode 1.17.20, Codex 0.144.0, Windows 10/11"
learningOutcomes:
  - "Instalar gentle-ai, OpenCode, Codex y Engram en Windows"
  - "Entender dónde vive cada binario y archivo de configuración"
  - "Verificar que todo funciona con --version"
  - "Realizar la configuración inicial post-instalación"
---

# Instalar Gentle-AI

## Qué aprenderás

Vas a instalar el ecosistema Gentle completo desde cero. Al final de este capítulo vas a tener **gentle-ai**, **OpenCode** (o **Codex**), **Engram** y los **skills registry** funcionando en tu máquina.

No importa si usás Windows, macOS o Linux: cada paso incluye las variantes para tu sistema.

## Por qué importa

Una instalación incorrecta es la fuente más común de frustración. Un PATH mal configurado, una versión de Node.js incorrecta, o una carpeta de instalación equivocada pueden hacer que todo funcione mal y no sepas por qué.

Si seguís esta guía paso a paso, vas a tener un entorno predecible y diagnosticable. Cuando algo falle —y va a fallar en algún momento— vas a saber exactamente dónde mirar.

## Visión simple

Instalar el ecosistema Gentle se parece a instalar un taller completo en tu computadora. No es un solo programa: son varias piezas que trabajan juntas.

El proceso completo tiene 4 pasos:

1. **Instalar Node.js** (si no lo tenés): es el runtime que necesita gentle-ai
2. **Instalar gentle-ai** con npm: el orquestador principal
3. **Instalar el agente base**: OpenCode y/o Codex
4. **Instalar Engram**: el sistema de memoria persistente

Cada paso es independiente. Podés tener gentle-ai sin Engram, o Codex sin gentle-ai. Pero el ecosistema completo funciona mejor cuando tenés todo.

## Analogía

Instalar Gentle-AI es como armar un escritorio de trabajo:

1. **Node.js** es la superficie del escritorio. Sin ella, no tenés dónde poner las herramientas.
2. **Gentle-AI** es el organizador de escritorio con separadores y etiquetas. Le da estructura a todo.
3. **OpenCode/Codex** es la herramienta principal que vas a usar todos los días, como un buen martillo o destornillador eléctrico.
4. **Engram** es el cuaderno de notas donde apuntás todo lo que aprendiste, para no tener que descubrirlo de nuevo mañana.

Podés tener el martillo sin el organizador, y el cuaderno sin el martillo. Pero cuando están todos juntos, trabajar es mucho más eficiente.

## Cómo funciona realmente

### Requisitos del sistema

Antes de instalar nada, verificá que tenés lo mínimo necesario:

```
Requisito       Mínimo         Recomendado
Node.js         18.0.0         22.0.0 o superior
npm             9.0.0          10.0.0 o superior
Git             2.30           2.40 o superior
RAM             8 GB           16 GB
Disco           500 MB libres  2 GB libres
Sistema         Windows 10+    Windows 11 / macOS 14+ / Ubuntu 22.04+
                macOS 12+
                Linux kernel 5.x
```

**Node.js** es el único requisito obligatorio. Git lo necesitás para usar GGA (hooks de pre-commit) pero no para gentle-ai en sí.

Para verificar si tenés Node.js:

```powershell
# PowerShell (Windows)
node --version
npm --version
```

```bash
# Bash (macOS/Linux)
node --version
npm --version
```

Si el comando no se encuentra, instalá Node.js desde [nodejs.org](https://nodejs.org) (versión LTS recomendada).

> **Nota para usuarios de Windows**: instalá Node.js con el instalador MSI. Asegurate de marcar "Add to PATH" durante la instalación.

### Paso 1: Instalar gentle-ai

El método principal y recomendado es con npm:

```bash
npm install -g gentle-ai
```

El flag `-g` significa **global**: instala gentle-ai en todo el sistema, no en una carpeta específica.

Lo que hace este comando:

1. npm descarga el paquete `gentle-ai` del registro público
2. Lo instala en la carpeta global de npm
3. Crea un enlace `gentle-ai` (o `gentle-ai.cmd` en Windows) en el PATH del sistema
4. Descarga las dependencias necesarias

Después de instalar, verificá:

```bash
gentle-ai --version
```

Deberías ver algo como:

```
gentle-ai version 2.1.10
```

También existe un **instalador dedicado** para sistemas que no tienen Node.js. Se descarga desde GitHub Releases:

```bash
# Windows (PowerShell)
# Descargar el .exe desde https://github.com/Gentleman-Programming/gentle-ai/releases
# Y ejecutar el instalador
```

Pero el método npm es el más simple y el que recibe actualizaciones primero.

### Dónde se instala cada cosa

**Instalación global de npm (Windows)**:

```
C:\Users\<tu-usuario>\AppData\Roaming\npm\
  ├── gentle-ai
  ├── gentle-ai.cmd
  ├── gentle-ai.ps1
  └── node_modules\
      └── gentle-ai\
          ├── package.json
          ├── dist/
          └── ...
```

**Instalación global de npm (macOS/Linux)**:

```
/usr/local/lib/node_modules/gentle-ai/
  ├── package.json
  ├── dist/
  └── ...

/usr/local/bin/gentle-ai  (enlace simbólico)
```

**Archivos de configuración del usuario**:

```
Windows: C:\Users\<tu-usuario>\.config\gentle-ai\
macOS:   ~/.config/gentle-ai/
Linux:   ~/.config/gentle-ai/
```

Allí se guardan:

- `config.yaml` — configuración global de gentle-ai
- `skills/` — skills instalados localmente
- `agents/` — definiciones de agentes personalizados
- `presets/` — presets de configuración reutilizables

### Paso 2: Instalar el agente base

Tenés dos opciones: **OpenCode** (recomendado para el ecosistema completo) o **Codex CLI** (más simple).

**Instalar OpenCode**:

```bash
npm install -g @opencode/cli
```

```bash
opencode --version
# opencode version 1.17.20
```

**Instalar Codex CLI**:

```bash
npm install -g @openai/codex
```

```bash
codex --version
# codex version 0.144.0
```

También podés ejecutar Codex sin instalarlo:

```bash
npx @openai/codex
```

Pero la instalación global es más rápida para uso diario.

### Dónde vive la configuración de cada agente

**OpenCode**:

```
Proyecto/
  ├── .opencode/
  │   ├── mcp.json       # Configuración de servidores MCP
  │   ├── agents.yaml    # Definición de subagentes
  │   └── skills.yaml    # Registry de skills
  └── opencode.json      # Configuración principal del proyecto
```

**Codex CLI**:

```
Proyecto/
  ├── .codex/
  │   ├── mcp.json       # Configuración de servidores MCP (opcional)
  │   └── rules.md       # Instrucciones adicionales (opcional)
  └── codex.json         # Configuración principal
```

### Paso 3: Instalar Engram

Engram es el sistema de memoria persistente. Se conecta a los agentes vía MCP.

**Opción A — npm** (recomendada):

```bash
npm install -g engram
```

```bash
engram --version
# engram version 1.20.0
```

**Opción B — Binario desde GitHub**:

Descargá el binario para tu sistema desde [github.com/Gentleman-Programming/engram/releases](https://github.com/Gentleman-Programming/engram/releases).

**Opción C — Compilar desde fuente** (solo si tenés Go instalado):

```bash
git clone https://github.com/Gentleman-Programming/engram.git
cd engram
go build -o engram .
# Mové el binario a una carpeta en tu PATH
```

### Dónde vive Engram

```
Base de datos local (SQLite):
  Windows: C:\Users\<tu-usuario>\.engram\
  macOS:   ~/.engram/
  Linux:   ~/.engram/

Allí se guardan:
  engram.db       — Base de datos SQLite con FTS5
  config.yaml     — Configuración de conexiones y proyectos
```

### Paso 4: Configurar el workspace

Ahora que tenés las herramientas instaladas, configurá tu proyecto para usar el ecosistema.

```bash
# Crear carpeta del proyecto
mkdir mi-proyecto
cd mi-proyecto

# Inicializar con gentle-ai
gentle-ai init
```

Este comando:

1. Crea la estructura de carpetas `.opencode/` (si usás OpenCode)
2. Genera un `opencode.json` con configuración por defecto
3. Configura Engram como servidor MCP
4. Descarga los skills base del registry
5. Crea el archivo `gentle-ai.yaml` de configuración del proyecto

Opcionalmente, podés pasar flags para personalizar:

```bash
gentle-ai init --agent opencode --with-engram --with-gga
```

| Flag | Qué hace |
|------|----------|
| `--agent opencode` | Configura OpenCode como agente base |
| `--agent codex` | Configura Codex CLI como agente base |
| `--with-engram` | Instala y configura Engram |
| `--with-gga` | Configura GGA hooks de pre-commit |
| `--with-skills` | Descarga skills recomendados para el proyecto |
| `--yes` | Responde sí a todas las preguntas |

### Rutas importantes: global vs workspace

Es crucial entender la diferencia:

| Tipo | Dónde está | Qué contiene |
|------|------------|--------------|
| **Global** (`~/.config/gentle-ai/`) | Configuración de usuario | Preferencias personales, API keys, skills globales |
| **Workspace** (`./gentle-ai.yaml`) | Configuración del proyecto | Agentes del proyecto, skills del proyecto, reglas de equipo |

Las reglas de resolución son:

1. Si existe configuración de workspace, se usa esa
2. Si no, se usa la configuración global
3. Las variables de entorno `OPENCODE_*` sobreescriben ambas

### Primera ejecución

Después de instalar todo, ejecutá gentle-ai para verificar que funciona:

```bash
gentle-ai
```

Deberías ver la interfaz TUI (Text User Interface) con:

- Un menú principal con opciones
- Información del proyecto actual
- Estado de conexión con Engram
- Skills disponibles

Si ves la interfaz, la instalación fue exitosa.

### Instalación en macOS (particularidades)

En macOS, npm global puede requerir permisos sudo:

```bash
sudo npm install -g gentle-ai
```

Para evitar usar sudo, configurá npm para instalar globales en tu directorio de usuario:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# Agregá a ~/.zshrc o ~/.bashrc:
export PATH=~/.npm-global/bin:$PATH
```

Luego instalá sin sudo:

```bash
npm install -g gentle-ai
```

### Instalación en Linux (particularidades)

En distribuciones basadas en Debian/Ubuntu, primero instalá Node.js:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Luego:

```bash
npm install -g gentle-ai
```

En Fedora/RHEL:

```bash
sudo dnf install nodejs
npm install -g gentle-ai
```

### Instalación en Windows (particularidades)

En Windows, el instalador MSI de Node.js ya configura el PATH. Pero a veces npm global no queda en el PATH automáticamente.

Verificá que la carpeta `npm` esté en el PATH:

```powershell
# PowerShell
$env:Path -split ';' | Select-String -Pattern 'npm'
```

Si no aparece, agregala manualmente:

```powershell
# Temporal (solo esta sesión)
$env:Path += ";$env:APPDATA\npm"

# Permanente
# Buscá "Editar variables de entorno" en el menú inicio
# Agregá %APPDATA%\npm a la variable "Path" del usuario
```

### Resolución de problemas comunes de instalación

| Problema | Causa típica | Solución |
|----------|--------------|----------|
| `npm: command not found` | Node.js no instalado | Instalá Node.js desde nodejs.org |
| `ENOENT: no such file or directory` | Carpeta de npm global no existe | `mkdir ~/AppData/Roaming/npm` (Windows) |
| `EACCES: permission denied` | npm sin permisos (Linux/macOS) | Usá sudo o configurá prefix de usuario |
| `gentle-ai: command not found` | npm global no está en PATH | Agregá la carpeta npm global a tu PATH |
| `Error: Cannot find module` | Instalación corrupta | `npm uninstall -g gentle-ai` y reinstalá |
| Versión incorrecta de Node.js | Node.js < 18 | Actualizá Node.js a la versión LTS más reciente |
| `engram: command not found` | Engram no instalado o no en PATH | `npm install -g engram` |
| `codex: command not found` | Codex no instalado | `npm install -g @openai/codex` |
| SSL error en npm | Proxy corporativo o antivirus | `npm config set strict-ssl false` (temporal) |
| Permiso denegado en `~/.config/` | Carpeta de configuración bloqueada | Verificá permisos de la carpeta `~/.config/` |

### Instalar versión específica

Si necesitás una versión concreta por compatibilidad:

```bash
# Versión específica
npm install -g gentle-ai@2.1.5

# Última versión disponible
npm install -g gentle-ai@latest

# Versión candidata a release (prerelease)
npm install -g gentle-ai@next
```

Para ver qué versiones están disponibles:

```bash
npm view gentle-ai versions --json
```

### Actualizar el ecosistema

Para mantener todo actualizado:

```bash
# Actualizar gentle-ai
npm update -g gentle-ai

# Actualizar OpenCode
npm update -g @opencode/cli

# Actualizar Codex
npm update -g @openai/codex

# Actualizar Engram
npm update -g engram

# Verificar versiones después de actualizar
npm list -g --depth=0
```

### Configuración de proxies y redes corporativas

Si estás detrás de un proxy corporativo, npm puede fallar al descargar paquetes. Configurá el proxy:

```bash
npm config set proxy http://tu-proxy:8080
npm config set https-proxy http://tu-proxy:8080
```

Para entornos con certificados autofirmados:

```bash
# Solo si confiás en el certificado
npm config set strict-ssl false
```

### Post-instalación: verificación rápida

Después de instalar todo, una verificación rápida de 10 segundos:

```bash
# Versiones de cada componente
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Gentle-AI: $(gentle-ai --version)"
echo "OpenCode: $(opencode --version)"
echo "Codex: $(codex --version 2>$null || echo 'no instalado')"
echo "Engram: $(engram --version)"
```

En PowerShell:

```powershell
# Versiones de cada componente en Windows
"Node.js: $(node --version)"
"npm: $(npm --version)"
"Gentle-AI: $(gentle-ai --version)"
"OpenCode: $(opencode --version)"
"Engram: $(engram --version)"
```

### Variables de entorno importantes

El ecosistema Gentle respeta estas variables de entorno:

| Variable | Qué hace |
|----------|----------|
| `OPENCODE_CONFIG` | Ruta al archivo de configuración de OpenCode |
| `ENGRAW_DATA_DIR` | Ruta al directorio de datos de Engram |
| `GENTLE_AI_CONFIG` | Ruta al archivo de configuración de gentle-ai |
| `GENTLE_AI_SKILLS_DIR` | Ruta a la carpeta de skills |
| `NODE_OPTIONS` | Opciones adicionales para Node.js |
| `HTTP_PROXY` / `HTTPS_PROXY` | Proxy para conexiones de red |
| `NO_PROXY` | Excepciones del proxy |

## Resumen

| Qué instalar | Comando | Verificar |
|--------------|---------|-----------|
| Node.js | nodejs.org (LTS) | `node --version` |
| gentle-ai | `npm install -g gentle-ai` | `gentle-ai --version` |
| OpenCode | `npm install -g @opencode/cli` | `opencode --version` |
| Codex (opcional) | `npm install -g @openai/codex` | `codex --version` |
| Engram | `npm install -g engram` | `engram --version` |
| Configurar workspace | `gentle-ai init` | `gentle-ai` (TUI) |

## Preguntas

1. ¿Qué hace el flag `-g` en `npm install -g gentle-ai`?
2. ¿Dónde se guardan los archivos de configuración global de gentle-ai en tu sistema operativo?
3. ¿Cuál es la diferencia entre la configuración global y la del workspace?
4. ¿Qué comando usás para verificar que gentle-ai se instaló correctamente?
5. Si tenés un error de permisos en macOS, ¿cómo lo solucionás?
6. ¿Qué tres archivos crea `npm install -g gentle-ai` en Windows?
7. ¿Por qué Engram necesita estar en el PATH para que funcione desde cualquier directorio?

## Ejercicio

1. Verificá que tenés Node.js 18+ con `node --version`
2. Instalá gentle-ai globalmente con npm
3. Verificá la instalación con `gentle-ai --version`
4. Instalá OpenCode con `npm install -g @opencode/cli`
5. Instalá Engram con `npm install -g engram`
6. Creá un proyecto nuevo y ejecutá `gentle-ai init`
7. Abrí la carpeta `.opencode/` y explorá los archivos generados
8. Verificá que Engram está instalado con `engram --version`
9. Ejecutá el comando de verificación rápida de 10 segundos

## Fuentes verificadas

- Paquete npm: gentle-ai, versión 2.1.10
- Paquete npm: @opencode/cli, versión 1.17.20
- Paquete npm: @openai/codex, versión 0.144.0
- Paquete npm: engram, versión 1.20.0
- Documentación: npm-install, npm-folders en docs.npmjs.com
- Repositorio: gentle-ai, archivos `cmd/`, `internal/setup/`
- Repositorio: engram, archivos `cmd/engram/`
- Documentación: Node.js installation guide en nodejs.org
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
