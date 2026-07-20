---
title: Programación
description: Qué es un programa, código fuente, compilar vs interpretar, lenguajes, runtime, dependencias y variables de entorno.
level: 1
estimatedTime: 30 min
tags:
  - programación
  - código-fuente
  - compilar
  - runtime
  - librería
  - framework
  - gestor-paquetes
  - dependencia
prerequisites:
  - La terminal (01-02)
verifiedVersion: "Node.js 22, Go 1.22, PowerShell 5.1"
learningOutcomes:
  - Explicar qué es un programa y cómo se crea
  - Diferenciar código fuente de binario, y compilar de interpretar
  - Identificar los lenguajes del ecosistema Gentle y para qué sirve cada uno
  - Comprender qué es un runtime, una librería, un framework y una dependencia
  - Usar variables de entorno para configurar programas
---

# Programación

## Qué aprenderás

Cuando escribís `gentle-ai` en la terminal y ves aparecer una interfaz, estás ejecutando un **programa**. Alguien escribió ese programa usando un **lenguaje de programación**. Ese lenguaje pasó por un proceso para convertirse en algo que la computadora pueda entender.

En este capítulo vas a entender qué es un programa, cómo se crea, qué lenguajes se usan en el ecosistema Gentle, y cómo los programas se organizan, comparten y configuran.

## Por qué importa

El ecosistema Gentle está construido con varios lenguajes: Go, TypeScript, Bash, SQL, y más. Cuando leas la documentación, veas el código de una herramienta, o tengas que instalar una dependencia, vas a encontrarte con estos conceptos.

Si no entendés qué significa "compilar", "runtime" o "dependencia", la falta de contexto te va a frenar. Pero si los entendés, podés diagnosticar errores, leer configuraciones y entender cómo funciona cada pieza.

## Visión simple

Un **programa** es una serie de instrucciones que le decís a la computadora que ejecute en orden. Es como una receta de cocina: primero hacé esto, luego esto otro, si pasa X hacé Y, y al final mostrá el resultado.

La computadora no entiende español ni inglés. Solo entiende unos y ceros: **código binario**. Pero los humanos escribimos en lenguajes que podemos leer y entender. Esos lenguajes después se convierten a binario para que la computadora los ejecute.

## Analogía

Imaginá que querés que alguien prepare una torta. Tenés dos opciones:

**Opción A — Traducir antes**: le escribís la receta completa en un papel, alguien la lleva a un cocinero profesional que la traduce a instrucciones exactas de cocina, y le pasás esas instrucciones al que va a cocinar. Eso es **compilar**: el programa se traduce completo antes de ejecutarse.

**Opción B — Traducir sobre la marcha**: te parás al lado del cocinero y le vas leyendo la receta paso a paso, traduciendo cada instrucción justo cuando la necesita. Eso es **interpretar**: un intérprete lee el programa línea por línea y lo ejecuta en el momento.

En la Opción A, el cocinero solo necesita las instrucciones finales (el binario). En la Opción B, el cocinero necesita tener al intérprete al lado todo el tiempo (el runtime).

## Cómo funciona realmente

### Código fuente vs binario

**Código fuente**: el texto que escribe un programador. Se lee en un editor de texto (VS Code, Vim). Por ejemplo, este archivo `main.go`:

```go
package main

import "fmt"

func main() {
    fmt.Println("Hola, Gentle!")
}
```

**Binario** (o **ejecutable**): el archivo que la computadora puede ejecutar directamente. Contiene los unos y ceros que el procesador entiende. En Windows termina en `.exe`. Por ejemplo, `gentle-ai.exe`.

El paso de código fuente a binario se llama **compilación**.

### Compilar vs interpretar

| | Compilar | Interpretar |
|--|----------|------------|
| Proceso | Traduce todo de una vez | Traduce línea por línea |
| Resultado | Archivo binario (`.exe`) | Se ejecuta sobre la marcha |
| Errores | Se detectan antes de ejecutar | Se detectan durante la ejecución |
| Velocidad | Más rápido al ejecutar | Más lento (traduce mientras corre) |
| Lenguajes | Go, C, Rust | JavaScript, Python, Bash |
| Ejemplo | `go build` produce `programa.exe` | `node programa.js` ejecuta directo |

**Lenguajes compilados**: escribís, compilás una vez, y obtenés un ejecutable que podés compartir. Eso hace Go: producís un solo archivo `.exe` que no necesita nada más para correr.

**Lenguajes interpretados**: escribís y ejecutás directamente con un **intérprete**. Eso hace JavaScript/TypeScript: necesitás Node.js instalado para correr el programa.

### Lenguajes relevantes al ecosistema

El ecosistema Gentle usa estos lenguajes:

| Lenguaje | Tipo | ¿Para qué se usa? | Archivos típicos |
|----------|------|-------------------|------------------|
| **Go** | Compilado | Gentle-AI, GGA, Engram (las herramientas principales) | `.go` |
| **TypeScript** | Interpretado (compila a JS) | Extensiones, configuraciones, agentes | `.ts`, `.tsx` |
| **JavaScript** | Interpretado | Node.js, plugins, scripts de configuración | `.js`, `.mjs` |
| **Bash** | Interpretado (shell) | Scripts de automatización, hooks de Git | `.sh` |
| **SQL** | Interpretado (BD) | Consultas a bases de datos, Engram | `.sql` |
| **Markdown** | Lenguaje de marcado | Documentación, README | `.md` |
| **YAML** | Lenguaje de marcado | Configuración (`.opencode/`, `gentle-ai`) | `.yaml`, `.yml` |
| **JSON** | Formato de datos | Configuración, comunicación entre programas | `.json` |
| **TOML** | Formato de datos | Configuración (Cargo, algunas herramientas) | `.toml` |

No hace falta que sepas todos estos lenguajes. Pero es útil saber cuál es cuándo ves un archivo:

- Si ves `.go`, sabés que es código compilado (Go)
- Si ves `.ts` o `.js`, sabés que necesita Node.js
- Si ves `.sh`, sabés que es un script de Bash
- Si ves `.yaml` o `.json`, sabés que es configuración

### Runtime

**Runtime** (entorno de ejecución) es el programa que permite que un lenguaje interpretado se ejecute.

Node.js es el runtime de JavaScript/TypeScript. Cuando ejecutás `node archivo.js`, Node.js lee el archivo, lo interpreta y lo ejecuta. Sin Node.js, el archivo `.js` no sirve para nada.

El runtime incluye:
- El **intérprete** del lenguaje
- **Bibliotecas base** (funciones incorporadas para leer archivos, conectarse a internet, etc.)
- El **recolector de basura** (libera memoria que ya no se usa automáticamente)

Para lenguajes compilados como Go, el runtime está "empaquetado" dentro del binario. No necesitás instalar nada aparte para ejecutar un programa de Go.

### Librería vs Framework

**Librería** (o **biblioteca**): un conjunto de funciones reutilizables que tu programa puede llamar. Vos decidís cuándo y cómo usarlas.

Por ejemplo, `chalk` es una librería de Node.js para dar color al texto en la terminal. En tu código la importás y la usás cuando querés:

```javascript
import chalk from 'chalk';
console.log(chalk.green('Todo ok!'));  // usás chalk cuando querés
```

**Framework**: una estructura que define cómo organizar tu código. El framework te llama a vos, no al revés.

Por ejemplo, Bubbletea es un framework para construir TUI en Go. Bubbletea define un modelo con funciones específicas (`Init`, `Update`, `View`) y vos completás esas funciones. El framework decide cuándo llamarlas.

| | Librería | Framework |
|--|----------|-----------|
| Quién controla | Vos llamás a la librería | El framework te llama a vos |
| Flexibilidad | Alta (usás solo lo que necesitás) | Baja (seguís su estructura) |
| Dependencia | Podés cambiarla fácilmente | Cambiar cuesta más |
| Ejemplo en Go | `encoding/json` | Bubbletea |
| Ejemplo en JS | `chalk`, `date-fns` | React, Vue |

### Dependencia y gestor de paquetes

**Dependencia**: cualquier librería o framework que tu programa necesita para funcionar. Si tu programa usa `chalk`, entonces `chalk` es una dependencia.

**Gestor de paquetes**: programa que instala, actualiza y administra dependencias automáticamente.

| Ecosistema | Gestor de paquetes | Archivo de configuración |
|------------|-------------------|-------------------------|
| Node.js/JS/TS | `npm` (Node Package Manager) | `package.json` |
| Go | El compilador (`go mod`) | `go.mod` |
| Python | `pip` | `requirements.txt` |
| Rust | `cargo` | `Cargo.toml` |

En el ecosistema Gentle:
- **Engram** está escrito en Go. Su `go.mod` lista las dependencias que necesita.
- **GGA** también está en Go. Depende de librerías HTTP, parsing y análisis de código.
- **Gentle-AI** usa Node.js y TypeScript. Su `package.json` lista dependencias como Bubbletea (TUI), Zod (validación) y otras.

Cuando ejecutás `npm install` en un proyecto con `package.json`, npm lee ese archivo, descarga cada dependencia de internet y las guarda en una carpeta `node_modules/`.

Cuando ejecutás `go mod tidy` en un proyecto Go, Go descarga las dependencias listadas en `go.mod` y las guarda en el caché local.

### Código de salida de un programa

Viste en el capítulo de la terminal que todo programa devuelve un **código de salida**. Recordá:

| Código | Significado |
|--------|------------|
| `0` | Éxito |
| `1` | Error genérico |
| Otros | Error específico (define cada programa) |

En código, el programador decide qué código devolver. En Go:

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    if archivoNoExiste {
        fmt.Println("Error: archivo no encontrado")
        os.Exit(1)  // código de error
    }
    os.Exit(0)  // todo bien
}
```

En JavaScript/Node.js:

```javascript
const fs = require('fs');
if (!fs.existsSync('config.json')) {
    console.error('Error: no se encuentra config.json');
    process.exit(1);
}
```

Esto permite encadenar programas. Si GGA devuelve `1`, sabés que el código no pasó la revisión. Si devuelve `0`, el código está aprobado.

### Variables de entorno

Las **variables de entorno** son valores que el sistema operativo guarda y que los programas pueden leer. Funcionan como "configuración global" que no está escrita en el código.

El ecosistema Gentle usa muchas variables `OPENCODE_*`:

| Variable | ¿Qué hace? | ¿Qué programa la usa? |
|----------|-----------|----------------------|
| `OPENCODE_LLM_PROVIDER` | Define qué proveedor de IA usar | gentle-ai |
| `OPENCODE_AGENT_CONFIG` | Ruta al archivo de configuración del agente | gentle-ai |
| `OPENCODE_PROJECT` | Nombre del proyecto actual | engram |

Cada programa decide qué variables leer en su código:

```javascript
// Ejemplo simplificado de cómo gentle-ai lee variables
const provider = process.env.OPENCODE_LLM_PROVIDER || 'anthropic';
// Si la variable no existe, usa 'anthropic' como valor por defecto
```

Podés ver todas las variables de entorno desde la terminal:
- PowerShell: `Get-ChildItem Env: | Where-Object Name -like "OPENCODE*"`
- Bash: `env | grep OPENCODE`

Podés definir una variable temporalmente al ejecutar un comando:

```powershell
# PowerShell
$env:OPENCODE_LLM_PROVIDER = "anthropic"; gentle-ai
```

```bash
# Bash
OPENCODE_LLM_PROVIDER=anthropic gentle-ai
```

## Errores frecuentes

1. **"module not found"** o **"cannot find package"**: falta una dependencia. Ejecutá `npm install` o `go mod tidy` según corresponda.
2. **"command not found"** (ej. `node no se reconoce`): el runtime no está instalado o no está en el PATH. Instalalo desde su página oficial.
3. **El programa compila pero no funciona como esperaba**: el error es lógico, no de sintaxis. El código se ejecuta pero hace algo distinto a lo que querías. Revisá la lógica.
4. **Error de sintaxis**: escribiste algo que el lenguaje no entiende. Por ejemplo, falta una coma, un paréntesis, o usaste una palabra clave incorrecta. El compilador o intérprete te dice la línea exacta.
5. **Versión incorrecta**: un programa necesita Node.js 18+ y tenés Node.js 16. Verificá con `node --version`.

## Resumen

| Concepto | ¿Qué es? | Ejemplo |
|----------|---------|---------|
| Código fuente | Texto que escribe el programador | `main.go`, `index.ts` |
| Binario | Archivo ejecutable (unos y ceros) | `gentle-ai.exe` |
| Compilar | Traducir código fuente a binario | `go build` |
| Interpretar | Ejecutar código fuente línea por línea | `node archivo.js` |
| Runtime | Programa que ejecuta código interpretado | Node.js |
| Librería | Funciones que vos llamás | `chalk`, `encoding/json` |
| Framework | Estructura que te llama a vos | Bubbletea, React |
| Dependencia | Algo que tu programa necesita | `package.json` lo lista |
| Gestor de paquetes | Programa que maneja dependencias | `npm`, `go mod` |
| Código de salida | Número que devuelve un programa al terminar | `0` = bien, `1` = mal |
| Variable de entorno | Configuración global del sistema | `OPENCODE_LLM_PROVIDER` |

## Preguntas

1. ¿Cuál es la diferencia entre un lenguaje compilado y uno interpretado?
2. ¿Por qué un binario de Go se puede ejecutar en cualquier computadora sin instalar nada, pero un archivo de JavaScript necesita Node.js?
3. ¿Qué diferencia hay entre una librería y un framework?
4. Si ves que un programa devuelve código de salida `1`, ¿qué significa?
5. ¿Para qué sirven las variables de entorno en el ecosistema Gentle?

## Ejercicio

1. Abrí PowerShell y ejecutá `Get-ChildItem Env: | Where-Object Name -like "OPENCODE*"` para ver si tenés variables de entorno de Gentle definidas.
2. Sin Node.js instalado, no podrías ejecutar código JavaScript. Verificá si tenés Node.js con `node --version`.
3. Verificá si tenés Go instalado con `go version`.
4. Elegí una carpeta vacía y ejecutá `npm init -y` para generar un `package.json`. Abrí el archivo con `Get-Content package.json`. Ahí es donde se escribirían las dependencias.

## Fuentes verificadas

- Runtime: Node.js 22, Go 1.22 (documentación oficial)
- Gestores: npm 10, go 1.22
- Ecosistema: gentle-ai 2.x, engram 1.x
- Fecha: 2026-07-20
- Estado: 🟢 Verificado (conocimiento fundamental, no depende de versión específica)
