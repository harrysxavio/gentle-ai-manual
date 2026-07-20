---
title: Terminal avanzada
description: "Dominá la terminal: pipes, redirección, procesos foreground/background y scripts básicos."
level: 1
estimatedTime: 30 min
tags:
  - terminal
  - powershell
  - bash
  - zsh
  - pipes
  - redirección
  - procesos
prerequisites:
  - La terminal (01-02)
verifiedVersion: "PowerShell 5.1, Bash 5.2, Zsh 5.9"
learningOutcomes:
  - Usar pipes y redirección para encadenar comandos
  - Interpretar y usar códigos de salida
  - Ejecutar procesos en foreground y background
  - Leer y modificar variables de entorno
  - Crear aliases y funciones en la terminal
  - Diferenciar PowerShell de Bash y Zsh
  - Usar el ecosistema Gentle desde la terminal
---

# Terminal avanzada

## Qué aprenderás

En el capítulo 01-02 aprendiste lo básico: navegar directorios, listar archivos, ejecutar comandos. Ahora es momento de dominar la terminal de verdad.

Este capítulo cubre:

- **Pipes** y **redirección**: cómo encadenar comandos y controlar dónde va la salida
- **Códigos de salida**: cómo saber si un comando funcionó o falló
- **Procesos foreground y background**: cómo ejecutar múltiples tareas
- **Variables de entorno**: cómo leer y modificar PATH, HOME y otras
- **Aliases y funciones**: cómo crear atajos personalizados
- **Scripting básico**: cómo automatizar tareas repetitivas
- **Historial y atajos**: cómo navegar comandos anteriores
- **Gestores de paquetes**: cómo instalar herramientas
- **Diferencias prácticas** entre PowerShell, Bash y Zsh
- **Gentle-AI en la terminal**: CLI vs TUI

## Por qué importa

El ecosistema Gentle se opera desde la terminal. `gentle-ai install`, `gentle-ai sync`, `gentle-ai doctor`, OpenCode, Codex, GGA — todo corre en la terminal. Si solo sabés lo básico, tu techo es bajo.

Entender pipes te permite combinar herramientas. Entender procesos te permite mantener el agente corriendo mientras trabajás en otra cosa. Entender variables de entorno te permite solucionar problemas de PATH cuando un comando "no se reconoce".

Además, el ecosistema mezcla Windows y WSL, PowerShell y Bash. Saber las diferencias te evita errores que cuestan horas de debugging.

## Visión simple

La terminal es un intérprete. Vos le escribís un comando, ella lo ejecuta, y te muestra el resultado. Pero un solo comando rara vez hace todo lo que necesitás. Ahí entran los pipes (`|`) y la redirección (`>`, `<`).

**Pipe**: tomá la salida de un comando y pasásela como entrada a otro. Es como una cinta transportadora entre programas.

**Redirección**: envíá la salida de un comando a un archivo en vez de a la pantalla, o leé la entrada de un archivo en vez del teclado.

## Analogía

Imaginá una fábrica con estaciones de trabajo. Cada estación recibe un material, lo transforma y lo pasa a la siguiente estación.

Un comando simple es una estación sola: recibís madera, producís una tabla.

Un **pipe** (`|`) es la cinta transportadora entre estaciones. La estación A produce clavos, la cinta se los lleva a la estación B que los pinta, y otra cinta se los lleva a la estación C que los empaqueta:
`comandoA | comandoB | comandoC`

La **redirección** (`>`) es como tener un desvío: en vez de que el producto final vaya a la siguiente estación (la pantalla), lo mandás a un depósito (un archivo).

## Cómo funciona realmente

### Pipes (`|`)

El pipe toma el **stdout** (salida estándar) del comando de la izquierda y lo conecta al **stdin** (entrada estándar) del comando de la derecha.

Cada programa en la terminal tiene tres canales estándar:

| Canal | Nombre | Número | ¿Qué es? |
|-------|--------|--------|----------|
| **stdin** | Entrada estándar | 0 | Lo que el programa recibe (teclado o pipe) |
| **stdout** | Salida estándar | 1 | Lo que el programa muestra (pantalla o pipe) |
| **stderr** | Salida de error | 2 | Mensajes de error (pantalla siempre, por defecto) |

Ejemplo práctico: listar archivos, filtrar los que contienen "config" y contar cuántos hay:

```powershell
# PowerShell
Get-ChildItem -Recurse | Where-Object Name -match "config" | Measure-Object
```

```bash
# Bash
ls -R | grep config | wc -l
```

El pipe no solo funciona con texto. Podés encadenar cualquier comando que produzca salida con cualquier comando que acepte entrada.

### Redirección (`>`, `>>`, `<`, `2>`)

La redirección desvía un canal estándar hacia un archivo:

| Operador | ¿Qué hace? | Ejemplo |
|----------|-----------|---------|
| `>` | Escribe stdout en un archivo (sobrescribe) | `dir > lista.txt` |
| `>>` | Agrega stdout al final de un archivo | `echo "nuevo" >> log.txt` |
| `<` | Lee stdin desde un archivo | `sort < entrada.txt` |
| `2>` | Escribe stderr en un archivo | `comando 2> errores.log` |
| `2>&1` | Redirige stderr al mismo lugar que stdout | `comando > salida.log 2>&1` |

Combinación útil — guardar resultados y errores por separado:

```powershell
# PowerShell
Get-ChildItem "C:\Windows" -ErrorAction SilentlyContinue > archivos.txt 2> errores.log
```

```bash
# Bash
ls /windows > archivos.txt 2> errores.log
# También: redirigir todo junto
ls /windows &> todo.log
```

### Códigos de salida

Todo comando devuelve un número al terminar. Ese número indica si funcionó o no:

| Código | Significado |
|--------|-------------|
| `0` | Éxito |
| `1` | Error genérico |
| `2` | Error de uso (parámetros incorrectos) |
| Otros | Error específico del programa |

En PowerShell se lee con `$?` (booleano: `True` = éxito) o `$LASTEXITCODE` (número):

```powershell
# PowerShell
gentle-ai doctor
$?          # → True si funcionó, False si falló
$LASTEXITCODE  # → 0 si funcionó, otro número si falló
```

En Bash/Zsh se lee con `$?` (número):

```bash
# Bash
gentle-ai doctor
echo $?     # → 0 si funcionó
```

Los códigos de salida permiten encadenar comandos condicionalmente. En Bash:

```bash
# Ejecutar comando2 SOLO si comando1 funciona
comando1 && comando2

# Ejecutar comando2 SOLO si comando1 falla
comando1 || comando2
```

PowerShell no tiene `&&` nativo (solo en PowerShell 7+). Usá `; if ($?) { }`:

```powershell
# PowerShell 5.1
gentle-ai sync; if ($?) { Write-Output "Sincronizado correctamente" }
```

### Procesos foreground y background

Cuando ejecutás un comando, el programa **bloquea** la terminal hasta que termina. Eso es **foreground** (primer plano). Si el programa tarda mucho (un agente analizando código, una instalación), no podés hacer nada más en esa terminal hasta que termine.

**Background** (segundo plano) ejecuta el programa sin bloquear la terminal:

```bash
# Bash: agregar & al final
gentle-ai install &

# Ver procesos en background
jobs

# Traer un proceso al foreground
fg %1
```

PowerShell no tiene `&` para background. Usá `Start-Process` o `Start-Job`:

```powershell
# PowerShell: iniciar como proceso separado
Start-Process gentle-ai -ArgumentList "install"

# PowerShell: iniciar como job
Start-Job -ScriptBlock { gentle-ai install }

# Ver jobs activos
Get-Job

# Recibir resultado del job
Receive-Job -Id 1
```

Para detener un proceso en ejecución:

| Atajo | Efecto |
|-------|--------|
| `Ctrl+C` | Interrumpir (terminar el proceso) — PowerShell y Bash |
| `Ctrl+Z` luego `fg`/`bg` | Suspender y reanudar — solo Bash/Zsh (PowerShell no tiene equivalente directo) |

### Variables de entorno

Las **variables de entorno** son valores del sistema que los programas leen como configuración global. Las más importantes: `PATH` (dónde buscar ejecutables), `HOME` (directorio personal), `USERNAME` (usuario actual).

Leer y modificar una variable:

```powershell
# PowerShell: leer, asignar (sesión actual), y agregar al PATH
$env:OPENCODE_LLM_PROVIDER
$env:OPENCODE_LLM_PROVIDER = "anthropic"
$env:Path += ";C:\tools\mi-programa"
```

```bash
# Bash: leer, exportar, y agregar al PATH
echo $OPENCODE_LLM_PROVIDER
export OPENCODE_LLM_PROVIDER=anthropic
export PATH="$PATH:/tools/mi-programa"
```

Para cambios permanentes, editá `$PROFILE` (PowerShell), `~/.bashrc` (Bash) o `~/.zshrc` (Zsh).

### Aliases

Un **alias** es un nombre corto para un comando largo. Se definen en el archivo de perfil de tu shell:

```powershell
# PowerShell ($PROFILE)
Set-Alias gai gentle-ai
```

```bash
# Bash (~/.bashrc) o Zsh (~/.zshrc)
alias gai='gentle-ai'
```

Para comandos con lógica condicional, usá una **función** en vez de un alias:

### Scripting básico

Un **script** es un archivo con comandos secuenciales (`.ps1` en PowerShell, `.sh` en Bash). Se ejecuta con la ruta completa:

```powershell
# diagnosticar.ps1
Write-Output "=== Diagnóstico Gentle-AI ==="
gentle-ai doctor
Get-ChildItem Env: | Where-Object Name -like "OPENCODE*"
# Ejecutar: .\diagnosticar.ps1
```

```bash
#!/bin/bash
# diagnosticar.sh
echo "=== Diagnóstico Gentle-AI ==="
gentle-ai doctor
env | grep OPENCODE
# Ejecutar: ./diagnosticar.sh
```

### Atajos de teclado

| Atajo | Efecto |
|-------|--------|
| `↑` / `↓` | Navegar comandos anteriores |
| `Ctrl+R` | Buscar en el historial |
| `Ctrl+C` | Interrumpir comando actual |
| `Ctrl+L` | Limpiar pantalla |
| `Ctrl+A` / `Ctrl+E` | Ir al inicio / final de la línea |
| `Tab` | Autocompletar |

El historial se guarda en `$PROFILE` (PowerShell), `~/.bash_history` (Bash) o `~/.zsh_history` (Zsh).

### Gestores de paquetes

Cada plataforma tiene su gestor: **winget** (Windows nativo), **choco** (Windows tradicional), **apt** (Debian/Ubuntu), **brew** (macOS), **npm** (Node.js). En el ecosistema Gentle se usan para instalar dependencias:

```bash
winget install OpenJS.NodeJS.LTS
winget install GoLang.Go
npm install -g gentle-ai
```

### PowerShell vs Bash vs Zsh en Windows

| Aspecto | PowerShell | Bash (Git Bash) | Zsh |
|---------|-----------|-----------------|-----|
| Sistema nativo | Windows | Linux/Unix | Linux/macOS |
| Comandos | `Get-ChildItem` (verbo) | `ls` (corto) | `ls` (corto) |
| Variables | `$env:NOMBRE` | `$NOMBRE` | `$NOMBRE` |
| Pipe | Objects tipados | Texto plano | Texto plano |
| Separador | `\` | `/` | `/` |

### Gentle-AI en la terminal

El ecosistema Gentle ofrece dos modos: **CLI** (comandos directos como `gentle-ai install`, `gentle-ai doctor`, `gentle-ai sync`) y **TUI** (interfaz visual con menús, `gentle-ai` sin argumentos). En la TUI navegás con flechas, seleccionás con `Espacio` y confirmás con `Enter`.

## Errores frecuentes

1. **`command not found` o `no se reconoce`**: el ejecutable no está en PATH. Verificá con `Get-Command gentle-ai` (PowerShell) o `which gentle-ai` (Bash). Si no aparece, agregá el directorio al PATH o instalá la herramienta.

2. **Pipe sin salida**: `comandoA | comandoB` no muestra nada porque `comandoA` produce la salida en stderr, no en stdout. Usá `2>&1` para incluir stderr: `comandoA 2>&1 | comandoB`.

3. **Redirección que borra el archivo**: `>` sobrescribe sin preguntar. Usá `>>` para agregar contenido sin borrar lo anterior. Hacé backup de archivos importantes antes de redirigir.

4. **Código de salida incorrecto en PowerShell**: `$?` da `False` incluso si el comando funcionó, porque PowerShell lo evalúa distinto que Bash. Usá `$LASTEXITCODE` para comandos externos.

5. **Alias que no persisten**: definís un alias pero al cerrar la terminal desaparece. Agregalo a tu perfil: `$PROFILE` (PowerShell), `~/.bashrc` (Bash) o `~/.zshrc` (Zsh).

## Preguntas

1. ¿Cuál es la diferencia entre `>` y `>>` en redirección?
2. ¿Qué código de salida indica que un comando funcionó correctamente?
3. ¿Cómo ejecutás un proceso en background en Bash? ¿Y en PowerShell?
4. ¿Qué hace `Ctrl+R` en la terminal?
5. ¿Cuál es la diferencia entre CLI y TUI en Gentle-AI?

## Fuentes verificadas

- Shell: PowerShell 5.1, Bash 5.2 (Git Bash), Zsh 5.9 (WSL)
- Documentación: Conceptos básicos de terminal (Microsoft Learn, tldr-pages)
- Ecosistema: gentle-ai 2.1.10, opencode 1.17.20
- Fecha: 2026-07-20
- Estado: 🟢 Verificado (conocimiento fundamental, no depende de versión específica)
