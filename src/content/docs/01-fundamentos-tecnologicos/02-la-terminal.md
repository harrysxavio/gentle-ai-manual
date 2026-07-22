---
title: La terminal
description: Qué es la terminal, cómo funciona el shell, qué es un comando, y por qué todo el ecosistema se usa desde acá.
level: 1
estimatedTime: 25 min
tags:
  - terminal
  - shell
  - comandos
  - cli
  - tui
  - powershell
  - bash
prerequisites:
  - Cómo funciona una computadora (01-01)
verifiedVersion: "PowerShell 5.1, Git Bash en Windows"
learningOutcomes:
  - Explicar qué es una terminal y un shell
  - Ejecutar comandos básicos (navegar, listar, leer archivos)
  - Entender qué es stdin, stdout, stderr y el código de salida
  - Diferenciar CLI de TUI
  - Comprender por qué las herramientas del ecosistema usan terminal
---

# La terminal

## Respuesta simple

Una **terminal** es la aplicación donde escribís comandos. Un **shell** es el lenguaje que entiende esos comandos. No son lo mismo.

## Qué es cada cosa

Tres conceptos distintos que se mezclan constantemente:

| Concepto | ¿Qué es? | Ejemplos |
|----------|----------|----------|
| **Terminal** | Aplicación con pantalla y teclado | Windows Terminal, iTerm2, GNOME Terminal |
| **Shell** | Intérprete de comandos | PowerShell, Bash, Zsh, Fish |
| **Multiplexor** | Organizador de sesiones de terminal | tmux, Zellij |

La terminal muestra texto y te deja escribir. El shell recibe lo que escribís, lo interpreta y ejecuta programas. El multiplexor te permite tener varias sesiones en una sola ventana y mantenerlas vivas aunque cerrés la terminal.

Ninguno de los tres es lo mismo. Cuando alguien dice "usá la terminal", puede estar refiriéndose a cualquiera de los tres, lo que genera confusión.

## PowerShell en Windows

PowerShell es el shell moderno de Windows. Viene instalado, es potente y trabaja con **objetos** (no solo texto).

Su sintaxis es DIFERENTE a Bash:

| Acción | PowerShell | Bash |
|--------|-----------|------|
| Listar archivos | `Get-ChildItem` | `ls` |
| Leer archivo | `Get-Content archivo.txt` | `cat archivo.txt` |
| Variable | `$env:NOMBRE` | `$NOMBRE` |
| Pipe | <code>Get-ChildItem &#124; Where-Object {...}</code> | <code>ls &#124; grep algo</code> |
| Encadenar | `cmd1; if ($?) { cmd2 }` | `cmd1 && cmd2` |

PowerShell usa verbos (`Get-`, `Set-`, `Remove-`) en vez de comandos cortos. Tiene alias para algunos comandos clásicos (`ls`, `cat`, `rm`) pero el comportamiento puede diferir del de Bash.

## Bash en macOS/Linux

Bash es el shell clásico de Unix. Viene por defecto en la mayoría de distribuciones Linux. En macOS, el shell por defecto ahora es Zsh (2019+), pero Bash sigue disponible.

Bash usa sintaxis corta y todo es texto:

```
ls -la | grep config
echo $HOME
cat archivo.txt
```

## Git Bash en Windows

Git Bash es un entorno que emula Bash dentro de Windows. Viene incluido con **Git for Windows**.

Útil para:
- Comandos de Git con sintaxis familiar
- Scripts Bash sin necesidad de WSL
- Herramientas que esperan entorno Unix

No es un Linux real. Faltan comandos y el sistema de archivos subyacente sigue siendo Windows.

## WSL — Windows Subsystem for Linux

WSL ejecuta un **kernel Linux real** dentro de Windows. No es una terminal ni un shell — es un entorno completo.

Características:
- Necesita una distribución (Ubuntu, Debian, Alpine)
- Sin distribución instalada no hay Bash operativo
- Acceso al sistema de archivos de Windows desde /mnt/c/
- Bash real, no emulado

Para usar WSL: `wsl --install` (Windows 10/11), luego `wsl` para entrar.

WSL es la opción más potente si necesitás herramientas Linux en Windows. Si solo necesitás Git, Git Bash alcanza.

## tmux y Zellij — multiplexores

Los multiplexores NO son shells. Son programas que organizan sesiones de terminal.

| Función | tmux | Zellij |
|---------|------|--------|
| Dividir pantalla | `Ctrl+B` + `%` | `Ctrl+P` o layout automático |
| Sesiones persistentes | Sí | Sí |
| Paneles | Sí | Sí |
| Funciona en Windows | No nativo (WSL) | Sí, nativo |

Sirven para:
- Mantener sesiones activas aunque cerrés la terminal
- Dividir la terminal en paneles (editor a la izquierda, comandos a la derecha)
- Conectarte a la misma sesión desde otra máquina

## Guía de decisión

| Si usás... | Usá esto... |
|------------|-------------|
| Windows, tareas Windows | **PowerShell** (viene instalado) |
| Windows, solo Git | **Git Bash** (viene con Git) |
| Windows, herramientas Linux | **WSL + Bash** |
| macOS | **Terminal.app + Zsh** (viene por defecto) |
| Linux | **GNOME Terminal + Bash** (viene por defecto) |
| Cualquier SO, sesiones persistentes | **tmux** o **Zellij** |

## PowerShell vs Bash — comandos comunes

| Operación | PowerShell | Bash |
|-----------|-----------|------|
| Navegar a carpeta | `cd ruta` | `cd ruta` |
| Listar archivos | `Get-ChildItem` o `ls` | `ls` |
| Crear carpeta | `New-Item -ItemType Dir nombre` o `mkdir nombre` | `mkdir nombre` |
| Eliminar archivo | `Remove-Item archivo` o `rm archivo` | `rm archivo` |
| Mover/renombrar | `Move-Item origen destino` o `mv origen destino` | `mv origen destino` |
| Copiar | `Copy-Item origen destino` o `cp origen destino` | `cp origen destino` |
| Leer archivo | `Get-Content archivo` o `cat archivo` | `cat archivo` |
| Variable de entorno | `$env:NOMBRE` | `$NOMBRE` |
| Código de salida | `$LASTEXITCODE` | `$?` |
| Ejecutar si funciona | `cmd1; if ($?) { cmd2 }` | `cmd1 && cmd2` |
| Ejecutar si falla | <code>cmd1; if (-not $?) { cmd2 }</code> | <code>cmd1 &#124;&#124; cmd2</code> |

## Declaración explícita

PowerShell y Bash **no tienen sintaxis intercambiable**. Un script de Bash no funciona en PowerShell sin modificaciones, y viceversa.

Las diferencias clave:

| Aspecto | PowerShell | Bash |
|---------|-----------|------|
| Filosofía | Objetos (.NET) | Texto plano |
| Verbos | `Get-ChildItem`, `Set-Location` | `ls`, `cd` |
| Variables | `$variable` (ámbito automático) | `variable=valor` (requiere `export`) |
| Condicionales | `if ($?)` | `if [ $? -eq 0 ]` |
| Bucles | `foreach ($item in $lista)` | `for item in lista` |
| Funciones | `function Nombre { param($x) }` | `nombre() { echo "$1"; }` |

## Resumen

| Concepto | ¿Qué es? |
|----------|---------|
| Terminal | La ventana donde escribís comandos |
| Shell | El intérprete de comandos (PowerShell, Bash) |
| Multiplexor | Organizador de sesiones (tmux, Zellij) |
| PowerShell | Shell nativo de Windows, orientado a objetos |
| Bash | Shell clásico de Unix, basado en texto |
| Git Bash | Entorno Bash emulado para Windows |
| WSL | Linux real dentro de Windows |

## Preguntas

1. ¿Cuál es la diferencia entre terminal, shell y multiplexor?
2. ¿Por qué PowerShell y Bash no son intercambiables?
3. ¿Qué necesitás para tener Bash en Windows?
4. ¿Para qué sirve un multiplexor como tmux o Zellij?
5. Si estás en Windows y solo necesitás Git, ¿usás PowerShell, Git Bash o WSL?

## Ejercicio

1. Abrí PowerShell
2. Ejecutá `Get-ChildItem env:PATH` para ver las carpetas en tu PATH
3. Abrí Git Bash (si lo tenés instalado) y ejecutá `echo $PATH`
4. Compará ambos resultados — son dos shells distintos viendo rutas distintas
5. Identificá en qué carpeta están `git.exe` (PowerShell: `Get-Command git`, Bash: `which git`)

## Fuentes verificadas

- Shell: PowerShell 5.1 en Windows 10/11, Git Bash 2.45
- Ecosistema: gentle-ai 2.1.10
- Fecha: 2026-07-21
- Estado: 🔵 Verificado
