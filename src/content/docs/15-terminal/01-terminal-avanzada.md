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

En el capítulo anterior entendiste qué son la terminal, el shell y los multiplexores. Ahora vas a usarlos en serio.

## Pipes y redirección

Cada comando tiene tres canales estándar:

| Canal | Número | Propósito |
|-------|--------|-----------|
| **stdin** | 0 | Entrada (teclado o pipe) |
| **stdout** | 1 | Salida normal (pantalla o pipe) |
| **stderr** | 2 | Errores (pantalla, por defecto) |

Un **pipe** (`|`) conecta el stdout de un comando al stdin del siguiente. Una **redirección** (`>`, `<`) manda la salida a un archivo o lee la entrada desde uno.

### Pipes

```powershell
# PowerShell: archivos .config, contarlos
Get-ChildItem -Recurse -Filter *.config | Measure-Object
```

```bash
# Bash: archivos .config, contarlos
find . -name "*.config" | wc -l
```

Los pipes permiten construir cadenas de procesamiento sin crear archivos temporales.

### Redirección

| Operador | Efecto |
|----------|--------|
| `>` | stdout a archivo (sobrescribe) |
| `>>` | stdout a archivo (agrega) |
| `<` | stdin desde archivo |
| `2>` | stderr a archivo |
| `2>&1` | stderr al mismo destino que stdout |

```powershell
Get-ChildItem C:\Windows > archivos.txt 2> errores.log
```

```bash
ls /windows > archivos.txt 2> errores.log
ls /windows &> todo.log    # ambos canales juntos
```

## Procesos foreground y background

Cuando ejecutás un comando, la terminal queda bloqueada hasta que termina. Eso es **foreground**.

En Bash podés mandar un proceso a **background** con `&`:

```bash
gentle-ai install &    # no bloquea la terminal
jobs                   # ver procesos en background
fg %1                  # traer al foreground
```

En PowerShell no hay `&` para background. Usá `Start-Job`:

```powershell
Start-Job -ScriptBlock { gentle-ai install }
Get-Job
Receive-Job -Id 1
```

Para interrumpir un proceso: `Ctrl+C` (funciona en ambos).

## Códigos de salida

Todo comando devuelve un número al terminar:

| Código | Significado |
|--------|-------------|
| `0` | Éxito |
| `1` | Error genérico |
| `2` | Error de uso |
| Otros | Error específico del programa |

```powershell
# PowerShell
gentle-ai doctor
$?                # True/False
$LASTEXITCODE     # número
```

```bash
# Bash
gentle-ai doctor
echo $?            # número
```

Los códigos permiten ejecución condicional:

```bash
# Bash: ejecutar comando2 solo si comando1 funciona
comando1 && comando2

# Bash: ejecutar comando2 solo si comando1 falla
comando1 || comando2
```

PowerShell 5.1 no tiene `&&` nativo. Usá `; if ($?) { }`:

```powershell
gentle-ai sync; if ($?) { Write-Output "OK" }
```

## Scripts simples

Un script es un archivo con comandos secuenciales.

```powershell
# diagnosticar.ps1
Write-Output "=== Diagnostico Gentle-AI ==="
gentle-ai doctor
Get-ChildItem Env: | Where-Object Name -like "OPENCODE*"

# Ejecutar: .\diagnosticar.ps1
```

```bash
#!/bin/bash
# diagnosticar.sh
echo "=== Diagnostico Gentle-AI ==="
gentle-ai doctor
env | grep OPENCODE

# Ejecutar: bash diagnosticar.sh
```

## Variables de entorno

Las variables de entorno son configuración global que los programas leen.

```powershell
# PowerShell
$env:OPENCODE_LLM_PROVIDER          # leer
$env:OPENCODE_LLM_PROVIDER = "ant"  # asignar (sesion actual)
$env:Path += ";C:\tools\bin"        # agregar al PATH
```

```bash
# Bash
echo $OPENCODE_LLM_PROVIDER          # leer
export OPENCODE_LLM_PROVIDER=ant     # asignar (sesion actual)
export PATH="$PATH:/tools/bin"       # agregar al PATH
```

Para cambios permanentes, editá el perfil del shell:
- PowerShell: `$PROFILE` (notepad `$PROFILE`)
- Bash: `~/.bashrc` (nano `~/.bashrc`)
- Zsh: `~/.zshrc` (nano `~/.zshrc`)

## Troubleshooting común

| Síntoma | Causa probable | Solución |
|---------|---------------|----------|
| "comando no encontrado" | No está en el PATH | Verificar con `Get-Command comando` (PowerShell) o `which comando` (Bash) |
| Pipe sin salida | La salida va por stderr | Agregar `2>&1` antes del pipe |
| Redirección borró mi archivo | `>` sobrescribe sin avisar | Usar `>>` para agregar |
| `$?` da False en PowerShell aunque funcionó | PowerShell evalúa distinto comandos externos | Usar `$LASTEXITCODE` en vez de `$?` |
| Alias no persiste al cerrar terminal | Se definió en la sesión, no en el perfil | Agregarlo a `$PROFILE` (PowerShell) o `~/.bashrc` (Bash) |
| Script .ps1 no ejecuta | Política de ejecución bloquea scripts | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |

## Preguntas

1. ¿Qué diferencia hay entre `>` y `>>`?
2. ¿Qué código de salida indica éxito?
3. ¿Cómo ejecutás un proceso en background en Bash? ¿En PowerShell?
4. ¿Qué hace `Ctrl+R` en la terminal?
5. ¿Dónde definís un alias permanente en PowerShell? ¿En Bash?

## Ejercicio

1. Ejecutá `gentle-ai doctor` y redirigí la salida a `diagnostico.txt`
2. Ejecutá `gentle-ai doctor` y redirigí errores a `errores.log`
3. Verificá el código de salida con `$LASTEXITCODE` (PowerShell) o `echo $?` (Bash)
4. Creá un script que ejecute `gentle-ai doctor` y muestre "OK" o "ERROR" según el código de salida

## Fuentes verificadas

- Shell: PowerShell 5.1, Bash 5.2 (Git Bash), Zsh 5.9 (WSL)
- Ecosistema: gentle-ai 2.1.10
- Fecha: 2026-07-21
- Estado: 🔵 Verificado
