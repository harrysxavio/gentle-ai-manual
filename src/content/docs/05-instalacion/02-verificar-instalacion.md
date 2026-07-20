---
title: Verificar la instalación
description: Cómo diagnosticar que el ecosistema Gentle funciona correctamente, interpretar el doctor output y resolver problemas comunes.
level: 1
estimatedTime: 15 min
tags:
  - instalación
  - verificación
  - doctor
  - diagnóstico
  - solución-problemas
prerequisites:
  - Instalar Gentle-AI (05-01)
verifiedVersion: "Gentle-AI 2.1.10, Engram 1.20.0, OpenCode 1.17.20"
learningOutcomes:
  - Ejecutar y entender el output de gentle-ai doctor
  - Diagnosticar y resolver los 5 problemas de instalación más comunes
  - Verificar que Engram funciona correctamente
  - Desinstalar componentes del ecosistema de forma limpia
---

# Verificar la instalación

## Qué aprenderás

Instalaste gentle-ai, OpenCode y Engram. Ahora necesitás asegurarte de que todo funciona correctamente antes de empezar a trabajar. Este capítulo te enseña a diagnosticar el estado de tu instalación, interpretar los mensajes de error más comunes y solucionarlos.

## Por qué importa

Un problema de instalación no detectado puede generar horas de frustración. Podés pensar que el error está en tu código cuando en realidad es un PATH mal configurado, una versión incorrecta de Node.js, o Engram que no arrancó.

Aprender a diagnosticar la instalación te ahorra tiempo y te da confianza: cuando ves que todo está verde, sabés que el problema —si aparece— está en otra parte.

## Visión simple

El ecosistema Gentle incluye un comando llamado `gentle-ai doctor`. Es como un chequeo médico para tu instalación: ejecuta una serie de pruebas y te dice qué está bien (✓) y qué está mal (✗).

Si ves un ✓, esa parte funciona. Si ves un ✗, te dice exactamente qué falla y cómo arreglarlo.

Además del doctor, hay otros comandos para verificar componentes específicos: `engram doctor`, `opencode --version` y `node --version`.

## Analogía

Imaginá que compraste un auto nuevo y querés verificar que todo funcione antes de salir a la ruta. No prendés el motor y acelerás a fondo; primero revisás:

- ¿Hay aceite? (Node.js instalado)
- ¿Tiene nafta? (npm completo)
- ¿Las luces funcionan? (gentle-ai en PATH)
- ¿Los frenos responden? (Engram conectado)
- ¿El cinturón de seguridad está bien? (skills registrados)

`gentle-ai doctor` hace todo esto automáticamente y te da un informe.

## Cómo funciona realmente

### Ejecutar gentle-ai doctor

Abrí tu terminal y ejecutá:

```bash
gentle-ai doctor
```

El resultado es algo así:

```
🏥 Gentle-AI Diagnostic Report
══════════════════════════════

Gentle-AI ............ ✓ (v2.1.10)
Node.js .............. ✓ (v22.3.0)
npm .................. ✓ (v10.8.1)
OpenCode ............. ✓ (v1.17.20)
Codex CLI ............ ✓ (v0.144.0)
Engram ............... ✓ (v1.20.0)
Engram MCP .......... ✓ (connected)
Skills Registry ..... ✓ (12 skills, 3 global)
GGA Hook ............ ✗ (not installed)
Git ................. ✓ (v2.45.0)
OS .................. ✓ (Windows 10.0.22631)
PATH ................ ✓ (npm global found)

══════════════════════════════
Status: 10 passed, 1 warning
```

### Qué significa cada chequeo

Cada línea del doctor verifica un componente específico. Entendamos cada uno:

| Componente | ¿Qué verifica? | ¿Por qué es importante? |
|-----------|---------------|------------------------|
| **Gentle-AI** | Que el binario `gentle-ai` existe y responde | Sin esto, no hay orquestador |
| **Node.js** | Que `node --version` devuelve una versión >= 18 | gentle-ai y OpenCode necesitan Node.js para funcionar |
| **npm** | Que `npm --version` devuelve una versión >= 9 | npm instala y actualiza los paquetes |
| **OpenCode** | Que `opencode --version` funciona | Opcional: solo si instalaste OpenCode |
| **Codex CLI** | Que `codex --version` funciona | Opcional: solo si instalaste Codex |
| **Engram** | Que `engram --version` funciona | Engram es necesario para memoria persistente |
| **Engram MCP** | Que Engram responde vía MCP | Confirma que la conexión MCP está activa |
| **Skills Registry** | Que la carpeta de skills existe y tiene archivos | Sin skills, el agente no tiene conocimiento especializado |
| **GGA Hook** | Que el hook pre-commit de GGA está instalado en el repo actual | Opcional: mejora la calidad del código |
| **Git** | Que `git --version` funciona | Necesario para GGA y control de versiones |
| **OS** | El sistema operativo detectado | Ayuda a diagnosticar problemas específicos de plataforma |
| **PATH** | Que la carpeta de npm global está en el PATH | Si no está, los comandos globales no se encuentran |

### Los 5 problemas más comunes (y cómo solucionarlos)

#### 1. "gentle-ai: command not found"

```
Gentle-AI ............ ✗ (command not found)
```

**Causa**: npm instaló gentle-ai pero la carpeta de binarios globales no está en tu PATH.

**Solución**:

```powershell
# PowerShell — encontrar dónde está npm global
npm config get prefix
# Tipicamente: C:\Users\<tu-usuario>\AppData\Roaming\npm

# Agregar al PATH (temporal, para esta sesión)
$env:Path += ";C:\Users\<tu-usuario>\AppData\Roaming\npm"

# Agregar al PATH (permanente)
# Buscá "Editar variables de entorno" en el menú inicio
# Agregá la ruta a "Path" del usuario
```

```bash
# Bash — encontrar dónde está npm global
npm config get prefix
# Tipicamente: /usr/local

# Agregar al PATH permanente
echo 'export PATH="$PATH:/usr/local/bin"' >> ~/.bashrc
source ~/.bashrc
```

#### 2. Node.js version mismatch

```
Node.js .............. ✗ (v16.20.0 — expected >= 18.0.0)
```

**Causa**: tenés Node.js instalado pero es una versión anterior a la 18.

**Solución**:

```bash
# Verificar versión actual
node --version

# Actualizar Node.js
# Opción A: descargar instalador desde nodejs.org
# Opción B: usar nvm (Node Version Manager)
nvm install 22
nvm use 22
```

En Windows, usá el instalador MSI desde nodejs.org. NVM para Windows también funciona (`nvm-windows`).

#### 3. Engram not found or not connected

```
Engram ............... ✗ (not found)
Engram MCP .......... ✗ (not connected)
```

**Causa**: Engram no está instalado, o está instalado pero no en el PATH, o el MCP no está configurado.

**Solución**:

```bash
# Verificar si Engram está instalado
engram --version

# Si no está, instalarlo
npm install -g engram

# Si está pero no conecta, verificar el archivo MCP
# Abrí .opencode/mcp.json y asegurate que Engram esté configurado
cat .opencode/mcp.json
# Debería incluir un servidor "engram"
```

El MCP puede no conectar si Engram no está corriendo como servidor. Verificá con:

```bash
engram doctor
```

#### 4. Skills Registry vacío

```
Skills Registry ..... ✓ (0 skills)
```

**Causa**: el registry de skills existe pero está vacío. No hay skills instalados.

**Solución**:

```bash
# Instalar skills base
gentle-ai skills install base

# Ver skills disponibles
gentle-ai skills list

# Sincronizar desde el registry de GitHub
gentle-ai skills sync
```

Sin skills, el agente funciona pero sin conocimiento especializado. Es como tener un asistente genérico que no sabe las convenciones de tu proyecto.

#### 5. GGA Hook no instalado (warning)

```
GGA Hook ............ ✗ (not installed)
```

**Causa**: GGA no está instalado como hook de Git en el repo actual.

**Solución** (opcional — GGA no es obligatorio):

```bash
# Instalar GGA en el proyecto actual
gentle-ai install-gga

# O manualmente
npx gentleman-guardian-angel install
```

GGA solo tiene sentido si querés revisión automática antes de cada commit. Para proyectos personales o prototipos, no es necesario.

### Verificar Engram específicamente

Además del doctor general, Engram tiene su propio comando de diagnóstico:

```bash
engram doctor
```

Output esperado:

```
🔍 Engram Diagnostic
═════════════════════
Version ................ ✓ (1.20.0)
Data directory ........ ✓ (C:\Users\tu-usuario\.engram)
Database .............. ✓ (engram.db — 2.3 MB)
FTS5 search ........... ✓ (available)
MCP server ............ ✓ (listening on stdio)
Project context ....... ✓ (mi-proyecto)
Observations .......... 42 stored, 3 pending review
═════════════════════
Status: All checks passed
```

Si ves `✗` en Database, podés repararla:

```bash
engram doctor --fix
```

Si ves `✗` en MCP server, Engram no está corriendo como servidor. Inicialo:

```bash
engram mcp
```

Esto arranca Engram en modo MCP. Debería quedar en primer plano. En uso normal, el agente (OpenCode/Codex) lo arranca automáticamente.

### Verificar la configuración del proyecto

Después del doctor, verificá que la configuración del proyecto es válida:

```bash
gentle-ai init --check
```

Esto valida la sintaxis de los archivos de configuración sin modificarlos:

```
✅ gentle-ai.yaml — válido
✅ .opencode/mcp.json — válido
✅ .opencode/agents.yaml — válido
✅ opencode.json — válido
✅ skills registry — 12 skills encontrados
```

### Cómo desinstalar de forma limpia

Si algo salió mal y querés empezar de cero:

**Desinstalar gentle-ai**:

```bash
npm uninstall -g gentle-ai
```

**Desinstalar OpenCode**:

```bash
npm uninstall -g @opencode/cli
```

**Desinstalar Codex**:

```bash
npm uninstall -g @openai/codex
```

**Desinstalar Engram**:

```bash
npm uninstall -g engram

# Opcional: borrar la base de datos
rm -r ~\.engram          # Windows PowerShell
rm -rf ~/.engram         # macOS / Linux Bash
```

**Desinstalar GGA hook**:

```bash
gentle-ai uninstall-gga
```

**Limpiar archivos de proyecto**:

```
# Eliminar configuraciones del proyecto (esto no afecta la instalación global)
rm .opencode/           # Windows: Remove-Item -Recurse .opencode
rm opencode.json
rm gentle-ai.yaml
rm .codex/
rm codex.json
```

## Resumen

| Síntoma | Comando de diagnóstico | Solución típica |
|---------|----------------------|-----------------|
| Comando no encontrado | `gentle-ai --version` | Agregar npm global al PATH |
| Versión de Node.js vieja | `node --version` | Actualizar a Node.js 22 LTS |
| Engram no funciona | `engram doctor` | Reinstalar o reparar DB |
| Skills vacíos | `gentle-ai skills list` | `gentle-ai skills install base` |
| GGA no instalado | `gentle-ai doctor` | `gentle-ai install-gga` (opcional) |
| Config inválida | `gentle-ai init --check` | Revisar sintaxis YAML/JSON |

## Preguntas

1. ¿Qué hace exactamente `gentle-ai doctor`?
2. ¿Qué significa un ✗ al lado de "Engram MCP"?
3. Si `gentle-ai --version` dice "command not found", ¿cuál es la causa más probable?
4. ¿Para qué sirve `engram doctor`?
5. ¿Cómo desinstalás Engram completamente, incluyendo la base de datos?

## Ejercicio

1. Ejecutá `gentle-ai doctor` y leé cada línea del output
2. Si ves algún ✗, solucionalo usando las guías de esta sección
3. Ejecutá `engram doctor` y verificá que la base de datos y el MCP están bien
4. Ejecutá `gentle-ai init --check` para validar tu configuración
5. Si no tenés skills instalados, ejecutá `gentle-ai skills install base`
6. Ejecutá `gentle-ai doctor` de nuevo y confirmá que ahora todo está ✓

## Fuentes verificadas

- Repositorio: gentle-ai, archivo `cmd/doctor.go`
- Repositorio: gentle-ai, archivo `internal/diagnostic/`
- Repositorio: engram, archivo `cmd/doctor.go`
- Comando: `gentle-ai doctor --help` (versión 2.1.10)
- Comando: `engram doctor --help` (versión 1.20.0)
- Documentación: npm-folders en docs.npmjs.com
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
