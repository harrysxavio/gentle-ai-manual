---
title: Laboratorios
description: "20 laboratorios prácticos: ejercicios acumulativos para ganar confianza real con el ecosistema."
level: 2-3
estimatedTime: 120 min
tags:
  - laboratorios
  - práctica
  - ejercicios
  - diagnóstico
  - verificación
prerequisites:
  - Variable según laboratorio
verifiedVersion: "Gentle-AI 2.1.10, OpenCode 1.17.20, Codex 0.144.0, GGA 2.10.1"
learningOutcomes:
  - Completar 20 laboratorios progresivos que cubren todo el ecosistema
  - Diagnosticar y corregir errores comunes en cada herramienta
  - Demostrar competencia práctica en terminal, Git, agentes, revisión y modelos
  - Saber contribuir nuevos laboratorios al repositorio
---

# Laboratorios

## Qué aprenderás

La teoría sin práctica no se retiene. Este capítulo contiene **20 laboratorios** organizados por módulo y dificultad. Cada laboratorio sigue la misma estructura: objetivo, herramientas, pasos, resultado esperado, y un checklist de autodiagnóstico.

No son ejercicios aislados. Los laboratorios se acumulan: lo que aprendés en el laboratorio 1 lo usás en el laboratorio 5. Al terminar los 20, vas a haber usado cada herramienta del ecosistema Gentle al menos una vez en un contexto real.

## Por qué importa

Leer documentación te da conocimiento declarativo — sabés *qué* hace una herramienta. Los laboratorios te dan conocimiento procedural — sabés *cómo* usarla.

La diferencia es la misma que entre leer un manual de cocina y cocinar. Los laboratorios son donde ocurre el aprendizaje real. Si solo leés los capítulos anteriores pero no hacés estos ejercicios, no vas a recordar nada en una semana.

## Explicación simple

Cada laboratorio es una receta: ingredientes (herramientas), pasos (instrucciones), plato terminado (resultado esperado) y cómo saber si te salió bien (autodiagnóstico).

Los laboratorios 1-8 son obligatorios para cualquiera. Los laboratorios 9-20 los elegís según tu perfil.

## Cómo funciona realmente

### Estructura de un laboratorio

Cada laboratorio tiene 6 secciones:

1. **Objetivo** (2-3 oraciones): qué vas a lograr
2. **Herramientas**: qué necesitás tener instalado
3. **Módulo base**: qué capítulo del manual cubre esta herramienta
4. **Pasos** (5-8 pasos numerados): la secuencia exacta
5. **Resultado esperado**: qué deberías ver al final
6. **Autodiagnóstico**: 4-6 preguntas para verificar que lo hiciste bien

Si un paso falla, la sección **Cómo diagnosticar** al final del capítulo te ayuda a identificar por qué.

### Convenciones de los comandos

Los comandos se muestran en formato neutral. Donde haya diferencias entre PowerShell y Bash, se indica con etiquetas.

### Los 20 laboratorios

#### Nivel 1 — Fundamentos (Laboratorios 1-3)

##### Laboratorio 1: Entorno seguro

**Objetivo**: Configurar un entorno de desarrollo seguro con permisos, variables de entorno y protección de secretos.

**Herramientas**: Terminal (PowerShell 5.1+ o Bash 3.2+)

**Módulo base**: 01-fundamentos-tecnologicos/02-la-terminal.md

**Pasos**:

1. Abrí la terminal. Verificá el directorio actual con `pwd` (PowerShell: `Get-Location`).
2. Creá una carpeta `~/lab-terminal` (PowerShell: `New-Item -ItemType Directory -Path ~/lab-terminal`; Bash: `mkdir -p ~/lab-terminal`).
3. Dentro de `lab-terminal`, creá un archivo vacío `README.md` (PowerShell: `New-Item README.md`; Bash: `touch README.md`).
4. Listá el contenido del directorio y verificá que el archivo esté ahí (`ls` o `Get-ChildItem`).
5. Ejecutá `gentle-ai doctor` y redirigí la salida a un archivo `diagnostico.txt`: `gentle-ai doctor > diagnostico.txt`.
6. Mostrá el contenido del archivo en pantalla (`cat diagnostico.txt` o `Get-Content diagnostico.txt`).

**Resultado esperado**: Un directorio `lab-terminal` con dos archivos: `README.md` (vacío) y `diagnostico.txt` (con el output de `gentle-ai doctor`).

**Autodiagnóstico**:
- ¿El comando `pwd` te muestra la ruta correcta?
- ¿Pudiste crear el directorio sin errores?
- ¿El archivo `diagnostico.txt` tiene contenido, no está vacío?
- ¿El comando `cat` o `Get-Content` te muestra el contenido sin errores de encoding?

##### Laboratorio 2: Terminal

**Objetivo**: Navegar la terminal, usar pipes, redirección y comandos básicos del ecosistema Gentle.

**Herramientas**: Terminal, Gentle-AI 2.1.10+

**Módulo base**: 15-terminal/01-terminal-avanzada.md

**Pasos**:

1. Ejecutá `gentle-ai doctor --json` y redirigí a `salida.json`.
2. Usá un pipe para filtrar solo las líneas que contengan `"status"`: PowerShell: `Get-Content salida.json | Select-String "status"`; Bash: `cat salida.json | grep "status"`.
3. Ejecutá `gentle-ai doctor` y verificá el código de salida: PowerShell: `$LASTEXITCODE`; Bash: `echo $?`.
4. Definí una variable de entorno temporal: PowerShell: `$env:MI_VARIABLE = "hola"`; Bash: `export MI_VARIABLE=hola`.
5. Ejecutá `echo $env:MI_VARIABLE` (PowerShell) o `echo $MI_VARIABLE` (Bash) para verificarla.
6. Encadená dos comandos: primero creá un directorio `logs` y después copiá `salida.json` adentro.

**Resultado esperado**: Un archivo `salida.json` con el diagnóstico en JSON, un directorio `logs/` con una copia de `salida.json`, y comprensión de cómo leer `$LASTEXITCODE` o `$?`.

**Autodiagnóstico**:
- ¿`salida.json` contiene JSON válido? Probá con `gentle-ai doctor --json` y verificá que el archivo empiece con `{`.
- ¿El código de salida fue `0` (éxito)?
- ¿Pudiste filtrar por "status" y ver resultados?
- ¿La variable de entorno se mostró correctamente?

##### Laboratorio 3: Git desde cero

**Objetivo**: Inicializar un repositorio Git, hacer commits y entender el flujo básico de trabajo con control de versiones.

**Herramientas**: Terminal, editor de texto, Gentle-AI

**Módulo base**: 15-terminal/01-terminal-avanzada.md

**Pasos**:

1. Creá un archivo `check-gentle.sh` (o `check-gentle.ps1` para PowerShell).
2. El script debe:
   - Ejecutar `gentle-ai doctor --json` y guardar la salida en `backups/diagnostico-$(fecha).json`
   - Ejecutar `gentle-ai doctor` y guardar el resultado en `backups/`
   - Mostrar un mensaje de confirmación
3. En Bash:
   ```bash
   #!/bin/bash
   FECHA=$(date +%Y-%m-%d)
   mkdir -p backups
    gentle-ai doctor --json > "backups/diagnostico-$FECHA.json"
    gentle-ai doctor
    echo "✅ Diagnóstico completado el $FECHA"
   ```
4. En PowerShell:
   ```powershell
   $FECHA = Get-Date -Format "yyyy-MM-dd"
   New-Item -ItemType Directory -Path backups -Force
    gentle-ai doctor --json > "backups/diagnostico-$FECHA.json"
    gentle-ai doctor
    Write-Host "✅ Diagnóstico completado el $FECHA"
   ```
5. Ejecutá el script y verificá que se creen los archivos en `backups/`.

**Resultado esperado**: Un script funcional que ejecuta diagnósticos con timestamp y un directorio `backups/` con al menos dos archivos.

**Autodiagnóstico**:
- ¿El script se ejecuta sin errores?
- ¿Los archivos en `backups/` tienen timestamp en el nombre?
- ¿El archivo JSON contiene diagnóstico válido?
- ¿`gentle-ai doctor` se ejecutó sin errores?

#### Nivel 2 — Git y colaboración (Laboratorios 4-7)

##### Laboratorio 4: Instalar Gentle-AI

**Objetivo**: Instalar Gentle-AI y sus componentes, verificar la instalación y conocer la estructura del ecosistema.

**Herramientas**: Git 2.30+, terminal

**Módulo base**: 02-git-y-github/01-que-es-git.md

**Pasos**:

1. Creá un directorio `~/lab-git` e inicializá un repositorio: `git init`.
2. Configurá tu identidad: `git config user.name "Tu Nombre"` y `git config user.email "tu@email.com"`.
3. Creá un archivo `index.ts` con una función simple: `console.log("Hola, laboratorio");`.
4. Agregá el archivo al stage: `git add index.ts`.
5. Hacé el primer commit: `git commit -m "chore: init proyecto de laboratorio"`.
6. Verificá el log: `git log --oneline`.

**Resultado esperado**: Un repositorio Git con un commit, un archivo `index.ts` en el working tree, y un log que muestra un solo commit.

**Autodiagnóstico**:
- `git log --oneline` muestra exactamente un commit.
- El mensaje del commit sigue el formato convencional (`tipo: descripción`).
- `git status` muestra "nothing to commit, working tree clean".
- No hay errores de configuración de identidad.

##### Laboratorio 5: Doctor

**Objetivo**: Ejecutar `gentle-ai doctor` para diagnosticar el estado del ecosistema y resolver problemas comunes.

**Herramientas**: Git 2.30+

**Módulo base**: 02-git-y-github/02-commits-y-ramas.md

**Pasos**:

1. Partiendo del repositorio del laboratorio 4, creá una rama `feature/saludo`: `git checkout -b feature/saludo`.
2. Modificá `index.ts` para que salude con un nombre parametrizable.
3. Hacé commit: `git add .` y `git commit -m "feat: saludo parametrizable"`.
4. Volvé a `main`: `git checkout main`.
5. Modificá `index.ts` de forma diferente (cambiá el mensaje).
6. Hacé commit en `main`: `git add .` y `git commit -m "fix: mensaje más claro"`.
7. Fusioná feature/saludo en main: `git merge feature/saludo`.
8. Si hay conflicto, resolvelo editando el archivo, agregalo al stage y completá el merge.

**Resultado esperado**: Un repositorio con al menos 3 commits en dos ramas, fusionadas exitosamente (con o sin conflicto resuelto).

**Autodiagnóstico**:
- `git log --oneline --graph --all` muestra la historia con ramas.
- El código fusionado funciona correctamente (sin errores de sintaxis).
- Si hubo conflicto, no quedaron marcadores `<<<<<<<` en el archivo.

##### Laboratorio 6: Primer SDD

**Objetivo**: Ejecutar el ciclo SDD básico desde init hasta archive en un proyecto simple.

**Herramientas**: Git, GitHub CLI (`gh`), terminal

**Módulo base**: 02-git-y-github/03-remoto-y-pr.md

**Pasos**:

1. Creá un repositorio en GitHub (o usá uno existente de prueba).
2. Cloná el repositorio, creá una rama `feature/mejora`.
3. Hacé cambios, commit y push de la rama.
4. Creá un PR desde la terminal: `gh pr create --title "feat: mejora" --body "Descripción del cambio"`.
5. Revisá el PR con `gh pr review`.
6. Simulá un code review: dejá al menos un comentario en un archivo.
7. Aceptá el PR: `gh pr merge`.

**Resultado esperado**: Un PR creado, revisado y fusionado en GitHub, con al menos un comentario de revisión.

**Autodiagnóstico**:
- El PR existe en GitHub con el título y descripción correctos.
- Hay al menos un comentario de revisión en el PR.
- El PR está mergeado y la rama feature se puede eliminar.
- `gh pr status` muestra el PR como merged.

##### Laboratorio 7: Ramas y merge

**Objetivo**: Crear ramas, fusionar cambios y resolver conflictos de merge.

**Herramientas**: Git 2.30+, GGA 2.10.1+

**Módulo base**: 02-git-y-github/04-hooks-y-worktrees.md

**Pasos**:

1. En el repositorio del laboratorio 4, instalá GGA como hook: `gga install`.
2. Verificá que el hook esté instalado: revisá `.git/hooks/pre-commit`.
3. Configurá un `.gga` mínimo en la raíz:
   ```bash
   PROVIDER=opencode:opencode-go/deepseek-v4-flash
   FILE_PATTERNS=*.ts,*.js,*.md
   STRICT_MODE=false
   ```
4. Creá un archivo con un error deliberado y tratá de committear. Observá el resultado de GGA.
5. Creá un worktree para una rama nueva: `git worktree add ../lab-worktree feature/worktree`.
6. Trabajá en el worktree (modificá archivos, hace commit) sin tocar el working tree original.
7. Limpiá: `git worktree remove ../lab-worktree`.

**Resultado esperado**: GGA activo como hook pre-commit que revisa archivos antes de cada commit, y un worktree funcional donde trabajaste sin interferir con la rama principal.

**Autodiagnóstico**:
- `git commit` ejecuta GGA automáticamente (ves el output de revisión).
- El worktree aparece en `git worktree list`.
- Los cambios en el worktree son independientes del working tree principal.

#### Nivel 3 — Agentes y modelos (Laboratorios 8-13)

##### Laboratorio 8: SDD completo

**Objetivo**: Ejecutar el ciclo SDD completo con todas sus fases en un proyecto real.

**Herramientas**: OpenCode 1.17.20+, terminal

**Módulo base**: 14-modelos-y-enrutamiento/01-modelos-y-enrutamiento.md

**Pasos**:

1. Verificá los modelos disponibles: `opencode models` o consultá el catálogo en `~/.config/opencode/models/`.
2. Creá un archivo `prueba-modelos.ts` con el siguiente prompt:
   ```typescript
   // prompt: "Explicame qué es una closure en JavaScript con un ejemplo"
   ```
3. Ejecutá el mismo prompt con 3 modelos diferentes. Por ejemplo:
   - Económico: configura `model: "opencode-go/deepseek-v4-flash"`
   - Equilibrado: `model: "opencode-go/deepseek-v4-pro"`
   - Potente: `model: "opencode-go/kimi-k3"`
4. Para cada modelo, anotá:
   - Tiempo de respuesta
   - Calidad de la explicación
   - ¿Incluye ejemplo de código?
   - ¿El ejemplo funciona si lo ejecutás?
5. Cambiá el `reasoningEffort` entre `low` y `high` para el mismo modelo y compará diferencias.

**Resultado esperado**: Una tabla comparativa con 3 modelos, tiempos de respuesta, calidad y ejemplos funcionales. Comprensión práctica de cuándo usar cada modelo.

**Autodiagnóstico**:
- ¿El modelo económico fue más rápido pero menos preciso?
- ¿El modelo potente dio una explicación más completa?
- ¿El `reasoningEffort` alto produjo respuestas más detalladas?
- ¿Los ejemplos de código funcionan sin errores?

##### Laboratorio 9: Engram

**Objetivo**: Configurar Engram, guardar y recuperar memoria del proyecto usando el sistema de persistencia.

**Herramientas**: OpenCode 1.17.20+, terminal

**Módulo base**: 03-fundamentos-de-ia/03-mcp-y-tool-calling.md

**Pasos**:

1. Abrí `opencode.json` (en la raíz del proyecto o en `~/.config/opencode/opencode.json`).
2. Agregá una entrada en `mcpServers` para un servidor de ejemplo. Por ejemplo, un servidor que expone la hora actual:
   ```json
   {
     "mcpServers": {
       "mi-servidor": {
         "command": "node",
         "args": ["path/to/mcp-server.js"],
         "env": {}
       }
     }
   }
   ```
3. Creá un servidor MCP mínimo que exponga una herramienta `saludar`:
   ```javascript
   #!/usr/bin/env node
   import { Server } from '@modelcontextprotocol/sdk/server/index.js';
   import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
   const server = new Server({ name: 'mi-servidor', version: '1.0.0' }, {
     capabilities: { tools: {} }
   });
   server.setRequestHandler('tools/list', async () => ({
     tools: [{ name: 'saludar', inputSchema: { type: 'object', properties: { nombre: { type: 'string' } } } }]
   }));
   server.setRequestHandler('tools/call', async (req) => {
     if (req.params.name === 'saludar') return { content: [{ type: 'text', text: `Hola, ${req.params.arguments.nombre}!` }] };
     throw new Error('Tool not found');
   });
   const transport = new StdioServerTransport();
   await server.connect(transport);
   ```
4. Verificá que el servidor se conecta (OpenCode debe listar la herramienta `saludar`).
5. Ejecutá la herramienta desde el agente: pedile que use `saludar` con tu nombre.

**Resultado esperado**: Un servidor MCP funcional que el agente puede listar y ejecutar, devolviendo un saludo personalizado.

**Autodiagnóstico**:
- El agente lista `mi-servidor` como fuente de herramientas.
- La herramienta `saludar` aparece en la lista de herramientas disponibles.
- La respuesta incluye el nombre que pasaste como argumento.
- No hay errores de conexión MCP en los logs del agente.

##### Laboratorio 10: Crear una skill

**Objetivo**: Crear una skill personalizada para el ecosistema Gentle siguiendo la estructura SKILL.md.

**Herramientas**: OpenCode 1.17.20+, editor de texto

**Módulo base**: 12-opencode/01-configurar-opencode.md

**Pasos**:

1. Localizá `opencode.json`: primero buscá en la raíz del proyecto, después en `~/.config/opencode/opencode.json`.
2. Leé el contenido actual con `cat` o `Get-Content`.
3. Modificá la sección `agents` para asignar modelos específicos:
   ```json
   {
     "agents": {
       "gentle-orchestrator": {
         "model": "opencode-go/kimi-k3",
         "reasoningEffort": "high"
       },
       "sdd-init": {
         "model": "opencode-go/deepseek-v4-flash",
         "reasoningEffort": "low"
       },
       "sdd-apply": {
         "model": "opencode-go/deepseek-v4-pro",
         "reasoningEffort": "medium"
       },
       "sdd-verify": {
         "model": "opencode-go/kimi-k3",
         "reasoningEffort": "high"
       }
     }
   }
   ```
4. Agregá un comando slash personalizado (si la versión lo soporta).
5. Verificá la configuración: `opencode doctor` o reiniciá el agente y confirmá que los cambios se aplicaron.
6. Deshacé los cambios (o mantenélos si son correctos).

**Resultado esperado**: `opencode.json` configurado con al menos 3 agentes con modelos y razonamiento diferentes. El agente usa el modelo asignado para cada tarea.

**Autodiagnóstico**:
- El archivo `opencode.json` tiene sintaxis JSON válida (probá con un validador o `opencode doctor`).
- Los agentes aparecen en la configuración con modelos y reasoningEffort.
- Si ejecutás una tarea SDD, el agente usa el modelo configurado para esa fase.

##### Laboratorio 11: Configurar OpenCode (modelo distinto por agente)

**Objetivo**: Configurar OpenCode asignando modelos específicos a cada agente del sistema.

**Herramientas**: OpenCode 1.17.20+, editor de texto

**Módulo base**: 12-opencode/01-configurar-opencode.md

**Pasos**:

1. Creá una copia de `opencode.json` como `opencode.economico.json`.
2. En el perfil económico, asigná modelos `flash` o `luna` a todos los agentes y `reasoningEffort: "low"`.
3. Creá otro perfil `opencode.potente.json` con modelos `kimi-k3` o `sol` y `reasoningEffort: "high"`.
4. Configurá OpenCode para usar un perfil específico: `opencode --config opencode.economico.json`.
5. Ejecutá una tarea simple y observá la diferencia de velocidad y costo.
6. Alterná entre perfiles y documentá las diferencias.

**Resultado esperado**: Múltiples archivos de configuración que se pueden alternar según la tarea, con diferencias medibles en velocidad y calidad de respuesta.

**Autodiagnóstico**:
- Cada archivo es JSON válido y OpenCode lo acepta.
- El perfil económico responde más rápido que el potente.
- Las respuestas del perfil potente son más detalladas.

##### Laboratorio 12: Perfiles (económico, balanceado, poderoso)

**Objetivo**: Crear perfiles de configuración para distintos escenarios de uso y costo.

**Herramientas**: Codex CLI 0.144.0+, editor de texto

**Módulo base**: 13-codex/01-configurar-codex.md

**Pasos**:

1. Localizá el archivo `config.toml` de Codex (usualmente en `~/.codex/config.toml`).
2. Leé el contenido actual.
3. Creá un perfil `equilibrado` con `model = "opencode-go/deepseek-v4-pro"`.
4. Creá un perfil `rapido` con `model = "opencode-go/deepseek-v4-flash"` y `reasoning_effort = "low"`.
5. Agregá la integración con Engram en el perfil principal:
   ```toml
   [mcp_servers.engram]
   command = "engram"
   args = ["mcp"]
   ```
6. Probá alternar entre perfiles: `codex --profile rapido` y `codex --profile equilibrado`.
7. Verificá que Engram se conecta correctamente: preguntale al agente "¿cuál es el proyecto actual?".

**Resultado esperado**: Codex configurado con al menos 2 perfiles, integración con Engram funcional, y capacidad de alternar perfiles según la tarea.

**Autodiagnóstico**:
- `config.toml` tiene sintaxis TOML válida.
- Al ejecutar `codex --profile rapido`, las respuestas son más rápidas.
- El agente Codex puede acceder a la memoria de Engram.

##### Laboratorio 13: Configurar Codex

**Objetivo**: Configurar Codex CLI con perfiles TOML, modelo y razonamiento.

**Herramientas**: Codex CLI 0.144.0+

**Módulo base**: 13-codex/01-configurar-codex.md

**Pasos**:

1. Verificá que tu versión de Codex soporta multiagente: `codex --version` debe ser 0.144.0+.
2. Activá el modo multiagente en `config.toml`:
   ```toml
   [multi_agent]
   enabled = true
   max_agents = 3
   ```
3. Creá un proyecto pequeño (por ejemplo, un script que lea un archivo CSV y genere un resumen).
4. Ejecutá Codex en modo multiagente: `codex --profile equilibrado`.
5. Observá cómo los subagentes se asignan tareas: uno escribe código, otro revisa, otro prueba.
6. Desactivá el modo multiagente y ejecutá la misma tarea. Compará los resultados.

**Resultado esperado**: Una tarea ejecutada por múltiples subagentes de Codex trabajando en paralelo, con asignación visible de roles.

**Autodiagnóstico**:
- Los logs muestran múltiples agentes activos.
- La tarea se completa más rápido (o con mejor calidad) que en modo mono-agente.
- Cada subagente tiene un rol visible en los logs.

#### Nivel 4 — SDD y calidad (Laboratorios 14-17)

##### Laboratorio 14: Comparar OpenCode y Codex

**Objetivo**: Comparar OpenCode y Codex ejecutando la misma tarea en ambos agentes.

**Herramientas**: Gentle-AI 2.1.10+, terminal

**Módulo base**: 06-primer-proyecto/01-primer-sdd.md

**Pasos**:

1. Inicializá un proyecto: `mkdir lab-sdd && cd lab-sdd && gentle-ai sdd init`.
2. Ejecutá cada fase en orden:
   ```bash
   gentle-ai sdd explore --title "Exploración del laboratorio SDD"
   gentle-ai sdd propose --title "Enfoque del laboratorio SDD"
   gentle-ai sdd spec --title "Especificación"
   gentle-ai sdd design --title "Diseño"
   gentle-ai sdd tasks --title "Tareas"
   gentle-ai sdd apply
   ```
3. Marcá cada tarea como completada después de implementarla: `gentle-ai sdd task T001 --done`.
4. Verificá la implementación: `gentle-ai sdd verify`.
5. Archivá: `gentle-ai sdd archive`.
6. Revisá el changelog: `cat .sdd/changelog.md`.

**Resultado esperado**: Un proyecto SDD completo con las 9 fases ejecutadas, artefactos en `.sdd/changes/`, y un changelog con el cambio archivado.

**Autodiagnóstico**:
- `gentle-ai sdd status` muestra "Phase: archive" y "Tasks: X/X completed".
- `.sdd/changelog.md` tiene al menos una entrada con estado "Archivado".
- Cada fase generó su artefacto en `.sdd/changes/change_001/`.
- La verificación pasó sin errores.

##### Laboratorio 15: GGA

**Objetivo**: Instalar GGA, configurarlo con un proveedor y experimentar con commits aprobados y rechazados.

**Herramientas**: GGA 2.10.1+, Git, terminal

**Módulo base**: 11-calidad-y-revision/02-gga.md

**Pasos**:

1. Instalá GGA en el repositorio del laboratorio 4: `gga install`.
2. Configurá `.gga` con un proveedor:
   ```bash
   PROVIDER=opencode:opencode-go/deepseek-v4-flash
   FILE_PATTERNS=*.ts,*.js,*.md
   STRICT_MODE=true
   TIMEOUT=120
   ```
3. Creá un archivo `buen-codigo.ts` con código correcto y committealo. Observá que GGA lo aprueba.
4. Creá un archivo `mal-codigo.ts` con un error deliberado (variable sin usar, función sin return, etc.) y tratá de committearlo. Observá que GGA lo rechaza.
5. Revisá el caché de GGA: `ls ~/.cache/gga/`.
6. Ejecutá `gga run --ci` y `gga run --pr-mode` para ver los otros modos.

**Resultado esperado**: GGA instalado como hook pre-commit, que aprueba código correcto y rechaza código con errores. Comprensión del ciclo caché → revisión → decisión.

**Autodiagnóstico**:
- `gga --version` muestra la versión instalada.
- El hook `pre-commit` está presente en `.git/hooks/`.
- El commit con código correcto pasa (exit 0).
- El commit con error es bloqueado (exit 1) y muestra hallazgos.
- El caché tiene entradas SHA256.

##### Laboratorio 16: Native Review

**Objetivo**: Ejecutar una revisión Native Bounded Review post-implementación, interpretar lentes y receipt.

**Herramientas**: Gentle-AI 2.1.10+, terminal

**Módulo base**: 11-calidad-y-revision/03-native-bounded-review.md

**Pasos**:

1. Tomá el proyecto del laboratorio 14 (el SDD completo).
2. Ejecutá la revisión: `gentle-ai review start`.
3. Revisá los lentes disponibles: Risk, Readability, Reliability, Resilience.
4. Seleccioná al menos 2 lentes para la revisión.
5. Esperá que la revisión genere el receipt.
6. Validá el receipt: `gentle-ai review validate`.
7. Finalizá la revisión: `gentle-ai review finalize`.

**Resultado esperado**: Una revisión post-implementación con al menos 2 lentes, receipt generado y validado, y comprensión del flujo start → lenses → evidence → finalize → validate.

**Autodiagnóstico**:
- El comando `start` crea una sesión de revisión.
- Los lentes seleccionados produjeron hallazgos concretos.
- El receipt se generó y `validate` lo confirma como válido.
- `review finalize` cierra la sesión sin errores.

##### Laboratorio 17: Judgment Day

**Objetivo**: Ejecutar una revisión adversarial ciega con dos jueces independientes y evaluar los resultados.

**Herramientas**: Gentle-AI 2.1.10+, terminal

**Módulo base**: 11-calidad-y-revision/04-judgment-day.md

**Pasos**:

1. Configurá dos jueces con modelos diferentes en `opencode.json`:
   ```json
   {
     "agents": {
       "jd-judge-a": { "model": "opencode-go/kimi-k3", "reasoningEffort": "high" },
       "jd-judge-b": { "model": "opencode-go/deepseek-v4-pro", "reasoningEffort": "high" }
     }
   }
   ```
2. Tomá un cambio reciente del laboratorio 14.
3. Ejecutá Judgment Day: `gentle-ai jd` o el comando que active la revisión dual.
4. Observá los hallazgos del Juez A y del Juez B.
5. Revisá el ledger de hallazgos: qué encontró cada juez y en qué coinciden.
6. Ejecutá el fix agent si hay hallazgos que corregir.
7. Hasta 2 rounds de corrección máximo.

**Resultado esperado**: Una revisión adversarial con dos jueces independientes, hallazgos comparados, y correcciones aplicadas si fueron necesarias.

**Autodiagnóstico**:
- Cada juez produjo una lista de hallazgos independiente.
- Los hallazgos coincidentes entre jueces tienen alta prioridad.
- Si hubo correcciones, no excedieron 2 rounds.
- El ledger muestra trazabilidad de cada hallazgo.

#### Nivel 5 — Routing, benchmarking e integración (Laboratorios 18-20)

##### Laboratorio 18: Model routing

**Objetivo**: Configurar enrutamiento de modelos con cadenas de fallback y escalamiento automático.

**Herramientas**: OpenCode 1.17.20+, Gentle-AI 2.1.10+

**Módulo base**: 14-modelos-y-enrutamiento/01-modelos-y-enrutamiento.md

**Pasos**:

1. Configurá una cadena de fallback en `opencode.json` para el agente `sdd-apply`:
   ```json
   {
     "agents": {
       "sdd-apply": {
         "model": "opencode-go/deepseek-v4-flash",
         "reasoningEffort": "low",
         "fallbacks": [
           { "model": "opencode-go/deepseek-v4-pro", "reasoningEffort": "medium" },
           { "model": "opencode-go/kimi-k3", "reasoningEffort": "high" }
         ],
         "escalation": {
           "consecutiveFailures": 2,
           "timeoutMs": 30000
         }
       }
     }
   }
   ```
2. Forzá un fallo de herramienta (por ejemplo, pedile al modelo económico que haga algo complejo que no pueda resolver).
3. Observá cómo el enrutador escala al siguiente modelo en la cadena.
4. Verificá en los logs del agente que el fallback se activó.
5. Documentá el comportamiento observado.

**Resultado esperado**: Un sistema de enrutamiento que escala automáticamente cuando un modelo falla, con logs que muestran la cadena de fallback.

**Autodiagnóstico**:
- El modelo económico falla y el sistema escala automáticamente.
- Los logs muestran el escalamiento: "fallback to deepseek-v4-pro".
- No hay errores no manejados durante el fallback.
- La tarea se completa (aunque más lenta) después del escalamiento.

##### Laboratorio 19: Benchmarking

**Objetivo**: Crear un benchmark local para comparar modelos en una tarea específica y documentar resultados.

**Herramientas**: OpenCode 1.17.20+, terminal, hoja de cálculo o archivo Markdown

**Módulo base**: 14-modelos-y-enrutamiento/01-modelos-y-enrutamiento.md

**Pasos**:

1. Definí una tarea de prueba: por ejemplo, "generar una función que valide un email con regex y devuelva un mensaje de error descriptivo".
2. Ejecutá la misma tarea con 4 modelos diferentes (económico, equilibrado, potente, frontier).
3. Para cada modelo, medí con un cronómetro o script:
   - Tiempo hasta el primer token
   - Tiempo total de respuesta
   - Cantidad de intentos (si requiere correcciones)
   - Calidad del código generado (¿funciona al ejecutarlo?)
4. Creá una tabla de resultados en Markdown:
   ```markdown
   | Modelo | Tiempo | Intentos | Calidad | Costo estimado |
   |--------|--------|----------|---------|----------------|
   | flash  | 8s     | 3        | Regular | Bajo           |
   | pro    | 15s    | 1        | Buena   | Medio          |
   | kimi-k3| 22s    | 1        | Excelente| Alto          |
   ```
5. Ejecutá el benchmark 3 veces con cada modelo y promediá los resultados.
6. Documentá conclusiones: ¿qué modelo recomendarías para esta tarea?

**Resultado esperado**: Un benchmark reproducible con 4 modelos, métricas cuantitativas, y una recomendación basada en datos.

**Autodiagnóstico**:
- Cada modelo se probó al menos 3 veces (resultados consistentes).
- La tabla de resultados tiene datos completos y comparables.
- La recomendación final está justificada con datos, no con opiniones.
- El benchmark es reproducible por otra persona.

##### Laboratorio 20: Producto integrador

**Objetivo**: Construir un producto funcional desde cero usando todas las herramientas del ecosistema: SDD, OpenCode/Codex, Engram, GGA, Native Review, y modelos enrutados.

**Herramientas**: Todas las anteriores

**Módulo base**: 18-construccion-de-productos/ — todos los conceptos de producto

**Pasos**:

1. Elegí una idea de producto mínimo: un CLI para llevar un diario personal, un gestor de tareas, un generador de informes, etc.
2. Inicializá el proyecto con SDD: `gentle-ai sdd init`.
3. Ejecutá todas las fases SDD (explore → propose → spec → design → tasks).
4. Implementá con OpenCode o Codex, usando modelos enrutados (económico para init/archive, potente para design/verify).
5. Instalá GGA como hook pre-commit y verificá que revisa cada commit.
6. Al terminar la implementación, ejecutá Native Bounded Review con lentes 4R.
7. Archivá el cambio: `gentle-ai sdd archive`.
8. Verificá que Engram guardó las decisiones clave del proyecto.

**Resultado esperado**: Un producto funcional construido con el ciclo completo del ecosistema Gentle: planificación SDD, implementación con modelos enrutados, calidad con GGA y Native Review, memoria con Engram.

**Autodiagnóstico**:
- El producto es funcional (se puede ejecutar y hace lo que promete).
- El changelog SDD tiene al menos un cambio archivado.
- GGA revisó y aprobó todos los commits.
- Native Bounded Review produjo un receipt válido.
- Engram tiene observaciones del proyecto.

### Cómo diagnosticar fallos en los laboratorios

Cada laboratorio puede fallar. La causa más común no es que el laboratorio esté mal — es que falta un prerequisito o la configuración no es la esperada.

| Síntoma | Causa probable | Solución |
|---------|---------------|----------|
| "command not found" | La herramienta no está instalada o no está en el PATH | Verificá con `--version`. Instalá la herramienta o agregala al PATH. |
| "Permission denied" | El archivo no tiene permisos de ejecución | En Bash: `chmod +x archivo`. En PowerShell: `Set-ExecutionPolicy`. |
| Error de sintaxis JSON en `opencode.json` | Falta una coma, llave o corchete | Usá un validador JSON en línea o `opencode doctor`. |
| GGA no se activa | El hook no está instalado | Ejecutá `gga install` en la raíz del proyecto. |
| SDD no avanza de fase | Faltan artefactos de la fase anterior | Ejecutá `gentle-ai sdd status` para ver en qué fase estás. |
| Engram no detecta el proyecto | No hay `.engram/config.json` ni git remote | Creá `.engram/config.json` con `{ "project_name": "lab" }`. |
| El modelo no responde | API key vencida, saldo insuficiente, o servidor caído | Verificá la API key y el estado del proveedor. |
| El MCP server no conecta | Path incorrecto o faltan dependencias | Verificá la ruta en `mcpServers` y ejecutá el servidor manualmente. |

### Cómo contribuir nuevos laboratorios

Los laboratorios son archivos Markdown dentro de `src/content/docs/19-laboratorios/`. Cada laboratorio puede ser un archivo independiente o parte de `01-laboratorios.md` si es un bloque pequeño.

Para contribuir:

1. Elegí un módulo del manual que no tenga laboratorio o que necesite más práctica.
2. Seguí la estructura exacta: objetivo, herramientas, módulo base, pasos, resultado esperado, autodiagnóstico.
3. Cada paso debe ser ejecutable por un lector con las herramientas instaladas.
4. El autodiagnóstico debe tener preguntas que el lector pueda responder observando su terminal.
5. Probá el laboratorio vos mismo antes de contribuirlo: si un paso falla, el lector se va a frustrar.
6. Incluí el laboratorio en la tabla de contenidos del capítulo si es extenso, o agregalo como bloque adicional si es corto.
7. Enviá un PR con el nuevo laboratorio y referenciá este capítulo como base.

Buenos candidatos para nuevos laboratorios:
- Laboratorio de seguridad: configurar permisos y restricciones en OpenCode
- Laboratorio de Engram cloud: sincronizar memoria entre dos máquinas
- Laboratorio de frontend: integrar un skill de diseño
- Laboratorio de CI/CD: configurar GGA en GitHub Actions
- Laboratorio de equipo: flujo multi-persona con SDD compartido

## Fuentes verificadas

- Laboratorios 1-3: fundamentos de terminal (verificado en PowerShell 5.1, Bash 5.2)
- Laboratorios 4-7: Git 2.30+, GGA 2.10.1
- Laboratorios 8-13: OpenCode 1.17.20, Codex 0.144.0
- Laboratorios 14-17: Gentle-AI 2.1.10 (SDD, review, GGA, Judgment Day)
- Laboratorios 18-20: modelos enrutados, benchmark local, producto integrador
- Repositorio: gentle-ai, archivos `internal/sdd/`, `internal/review/`, `bin/gga`
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
