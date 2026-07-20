---
title: Seguridad, costos y gobierno
description: "Cómo proteger tu proyecto: permisos, presupuestos, auditoría de modelos y políticas de fallback."
level: 2
estimatedTime: 40 min
tags:
  - seguridad
  - costos
  - gobierno
  - permisos
  - presupuestos
  - secretos
  - políticas
prerequisites:
  - "¿Qué es Gentle-AI? (07-01)"
  - "Modelos y enrutamiento (14-01)"
verifiedVersion: "Gentle-AI 2.1.10"
learningOutcomes:
  - "Configurar permisos de agente con allow/deny usando glob patterns"
  - "Estimar costos por sesión y configurar presupuestos"
  - "Auditar qué modelo se usó, cuánto costó y qué produjo"
  - "Proteger secretos con reglas de denegación por patrón"
  - "Configurar políticas de fallback entre modelos"
  - "Ejecutar gentle-ai doctor para verificar seguridad"
  - "Integrar gates de seguridad en CI/CD"
---

# Seguridad, costos y gobierno

## Qué aprenderás

A medida que un equipo adopta asistentes de IA en el flujo de desarrollo, aparecen tres preguntas que no se pueden ignorar: **¿quién puede hacer qué?**, **¿cuánto está costando?** y **¿cómo nos aseguramos de que no se filtran secretos?**

Gentle-AI aborda estas preguntas con un sistema de **permisos** (agent-level allow/deny), **estimación y control de costos** (tokens × precio por modelo), **auditoría de modelos** (qué se usó, cuánto costó, qué produjo) y **políticas de gobierno** (quién instala qué, límites por proyecto).

En este capítulo vas a entender:
- El sistema de permisos: reglas allow/deny con **glob patterns**, rutas sensibles
- Cómo estimar costos: tokens × precio por modelo, presupuesto por sesión, historial de uso
- Auditoría de modelos: registrar qué modelo se usó, cuánto costó y qué produjo
- Protección de secretos: `deny secrets/**`, `deny .env*`, la regla de no commiteo de claves
- Políticas de fallback: modelo A falla → modelo B más barato
- `gentle-ai doctor` para verificaciones de seguridad
- Políticas de gobierno: quién puede instalar qué, límites por proyecto
- Integración con CI: pre-commit hooks, pre-push gates
- Alertas y límites de presupuesto

## Por qué importa

Sin un sistema de seguridad, costos y gobierno, cualquier usuario del asistente puede:
- Leer archivos con secretos (`.env`, `secrets/`, `*.pem`)
- Usar modelos caros sin límite y generar facturas inesperadas
- Instalar componentes sin autorización
- Commiteear claves o tokens accidentalmente
- No tener visibilidad de cuánto se gasta por proyecto o por equipo

El ecosistema Gentle no asume que todo está bien por defecto. Te da las herramientas para definir políticas explícitas. Lo que no configures explícitamente, se rige por valores por defecto conservadores.

## Visión simple

El sistema de seguridad, costos y gobierno tiene tres pilares:

1. **Permisos**: definís qué archivos puede leer y escribir el asistente. Usás reglas `allow` (permitir) y `deny` (denegar) con patrones de glob. Por defecto, todo lo que no está permitido explícitamente está denegado.

2. **Costos**: cada llamada a un modelo consume tokens. Multiplicás tokens por el precio por token de ese modelo y obtenés el costo. Podés definir un presupuesto máximo por sesión y recibir alertas cuando te acercás al límite.

3. **Gobierno**: definís políticas全局 (globales) y por proyecto: quién puede instalar componentes, qué modelos están permitidos, qué umbrales de costo no se pueden superar sin aprobación.

## Analogía

Pensá en tu proyecto como un **edificio de oficinas**:

- **Permisos** son las tarjetas de acceso. Algunas áreas son públicas (el lobby), otras requieren autorización (el servidor), y algunas están directamente prohibidas (la caja fuerte con los secretos). Las reglas `allow`/`deny` son las puertas que se abren o se cierran.

- **Costos** son los medidores de electricidad por piso. Sabés cuánto consume cada área, quién está usando más, y si un piso se está pasando del presupuesto, recibís una alerta antes de que llegue la factura.

- **Gobierno** es el reglamento del edificio. Establece reglas generales (no instalar equipos sin autorización, no superar cierto consumo, no acceder a ciertas áreas) y define quién puede hacer excepciones.

Sin estos tres pilares, el edificio funciona hasta que alguien deja una puerta abierta, la factura de luz llega y nadie sabe quién instaló un servidor en el sótano.

## Cómo funciona realmente

### Sistema de permisos

El sistema de permisos de Gentle-AI se configura en `opencode.json` (o el archivo de configuración equivalente de tu agente). Usa reglas **allow** y **deny** con **glob patterns** (patrones de coincidencia de archivos).

#### Glob patterns

Un **glob pattern** es un patrón que usa comodines para匹配 (matchear) rutas de archivos:

| Patrón | ¿Qué matchea? |
|--------|--------------|
| `**/*.env` | Cualquier archivo `.env` en cualquier directorio |
| `secrets/**` | Todo lo que esté dentro de `secrets/` y sus subdirectorios |
| `*.pem` | Archivos `.pem` en la raíz del proyecto |
| `src/**` | Todo dentro de `src/` |
| `!src/public/**` | Excluye `src/public/` (para excepciones) |

#### Reglas por defecto

Al instalar Gentle-AI, se configuran estas reglas por defecto:

```json
{
  "permissions": {
    "allow": [
      "src/**",
      "tests/**",
      "docs/**",
      "README.md",
      "package.json",
      "go.mod",
      "*.ts", "*.tsx", "*.js", "*.jsx",
      "*.go", "*.py", "*.rs", "*.rb",
      "*.css", "*.scss", "*.html"
    ],
    "deny": [
      ".env*",
      "secrets/**",
      "**/*.pem",
      "**/*.key",
      "**/credentials*",
      ".git/config",
      ".git/credentials",
      "node_modules/**"
    ]
  }
}
```

**Importante**: el orden de evaluación es: primero se evalúan las reglas `deny`. Si un archivo matchea una regla `deny`, se bloquea aunque también matchee una regla `allow`. Las reglas `deny` tienen prioridad absoluta.

#### Permisos a nivel de agente

Cada agente (orquestador, executor, explorer, reviewer) puede tener permisos distintos:

```json
{
  "agents": {
    "orchestrator": {
      "permissions": {
        "allow": ["openspec/**", ".sdd/**"],
        "deny": ["secrets/**"]
      }
    },
    "executor": {
      "permissions": {
        "allow": ["src/**", "tests/**"],
        "deny": [".env*", "secrets/**"]
      }
    }
  }
}
```

El orquestador solo necesita leer/escribir artefactos SDD. El executor necesita acceso al código fuente pero no a secretos. Cada agente tiene el mínimo necesario para su función.

### Cost estimation

El costo de una sesión de desarrollo con IA se calcula con una fórmula simple:

```
costo = tokens_entrada × precio_input + tokens_salida × precio_output
```

Cada **modelo** tiene precios distintos por token (tanto de entrada como de salida). Los precios los define el proveedor (OpenAI, Anthropic, Google, etc.) y pueden cambiar.

#### Estimación por sesión

Gentle-AI permite configurar un **presupuesto por sesión**:

```json
{
  "cost": {
    "budget_per_session": 0.50,
    "budget_per_day": 5.00,
    "budget_per_month": 50.00,
    "alert_threshold": 0.80,
    "hard_cap": true
  }
}
```

| Parámetro | ¿Qué hace? |
|-----------|-----------|
| `budget_per_session` | Máximo en USD que puede gastar una sesión individual |
| `budget_per_day` | Máximo acumulado en un día |
| `budget_per_month` | Máximo acumulado en un mes calendario |
| `alert_threshold` | Porcentaje del presupuesto que dispara una alerta (0.80 = 80%) |
| `hard_cap` | Si es `true`, bloquea el uso cuando se alcanza el límite. Si es `false`, solo alerta |

Cuando `hard_cap` está activo y se alcanza el límite, el asistente no puede hacer más llamadas a modelos hasta que se reinicie la sesión o se resetee el contador.

#### Seguimiento de costos

OpenCode y Codex tienen sus propios paneles de uso. En OpenCode ejecutá `opencode models` para ver los modelos disponibles. Codex muestra información de uso desde su TUI. Gentle-AI no expone comandos de historial de costos — `gentle-ai doctor` verifica permisos y estado del sistema.

### Auditoría de modelos

La **auditoría de modelos** registra, por cada llamada:

1. **Qué modelo se usó**: `claude-sonnet-5`, `openai/gpt-5.6-terra`, `google/gemini-3.1-pro-preview`, etc.
2. **Cuánto costó**: desglose en USD de la llamada
3. **Qué produjo**: resumen del output (no el contenido completo, por privacidad)
4. **Quién lo pidió**: qué agente o usuario inició la llamada
5. **En qué contexto**: qué fase SDD se estaba ejecutando, qué archivo se estaba procesando

```json
{
  "model_audit": {
    "enabled": true,
    "log_level": "summary",
    "retention_days": 90
  }
}
```

Con `log_level: summary` se registra un resumen (tokens, costo, modelo). Con `log_level: verbose` se incluye el prompt truncado y el output, útil para debugging pero consume más espacio.

El log de auditoría se guarda en `~/.config/gentle-ai/audit.log` (rotación automática diaria).

### Protección de secretos

La protección de secretos se basa en tres líneas de defensa:

#### 1. Reglas deny en permisos

Como vimos arriba, las reglas `deny` bloquean el acceso del asistente a archivos con secretos:

```json
"deny": [
  ".env*",
  "secrets/**",
  "**/*.pem",
  "**/*.key",
  "**/credentials*"
]
```

#### 2. Regla de "nunca commitees claves"

GGA (Git Gentle Agent) incluye una verificación pre-commit que escanea el diff en busca de patrones de secretos:

- `-----BEGIN.*KEY-----` — claves privadas
- `AKIA[0-9A-Z]{16}` — claves de AWS
- `gh[ps]_[0-9a-zA-Z]{36}` — tokens de GitHub
- `sk-[0-9a-zA-Z]{32,}` — claves de API de OpenAI
- `xox[abp]-[0-9a-zA-Z]{10,}` — tokens de Slack

Si encuentra un match, **bloquea el commit** con un mensaje como:

```
⚠️  Se detectó un posible secreto en src/config.ts:15
   Patrón: AWS Access Key (AKIA...)
   El commit ha sido bloqueado.
   Revisá el archivo y asegurate de usar variables de entorno.
```

#### 3. Cifrado de archivos sensibles

Para archivos que necesitan estar en el repositorio pero contienen información sensible (como config de staging), se recomienda usar **sops** (Mozilla SOPS) o **git-crypt** y agregar los archivos cifrados a las reglas `allow` (el asistente puede leerlos porque están cifrados, no en texto plano).

### Fallback policies

Las **políticas de fallback** definen qué hacer cuando un modelo no está disponible, da timeout o supera el presupuesto:

```json
{
  "fallback": {
    "policies": [
      {
        "primary": "claude-sonnet-5",
        "fallback": ["claude-haiku-4.5", "openai/gpt-5.6-luna"],
        "conditions": ["timeout", "rate_limit", "budget_exceeded"]
      },
      {
        "primary": "openai/gpt-5.6-terra",
        "fallback": ["openai/gpt-5.6-luna", "google/gemini-3.5-flash"],
        "conditions": ["timeout"]
      }
    ],
    "max_retries": 2,
    "cooldown_seconds": 30
  }
}
```

| Parámetro | ¿Qué hace? |
|-----------|-----------|
| `primary` | El modelo preferido para esta tarea |
| `fallback` | Lista ordenada de modelos alternativos (se prueba el primero, si falla el segundo, etc.) |
| `conditions` | En qué circunstancias se activa el fallback (timeout, rate_limit, budget_exceeded) |
| `max_retries` | Cuántas veces reintentar antes de rendirse |
| `cooldown_seconds` | Tiempo de espera antes de reintentar |

El fallback se evalúa por llamada, no por sesión. Si la llamada al modelo primario falla por timeout, el sistema prueba automáticamente el primer fallback sin intervención del usuario.

### gentle-ai doctor

El comando `gentle-ai doctor` ejecuta una serie de verificaciones de seguridad y salud del sistema:

```bash
gentle-ai doctor
```

```
Gentle-AI Doctor — Diagnóstico de salud
=========================================

[✓] Estado de instalación: 8/10 componentes instalados
[✓] Configuración del agente: OpenCode detectado en ~/.config/opencode/
[✓] Permisos: archivo de permisos válido
[✓] Secretos: no se detectaron secretos en rutas allow
[✓] Engram: servidor MCP accesible
[✓] GGA: hooks de Git instalados en .git/hooks/pre-commit
[✓] Git: repositorio detectado
[✓] Presupuesto: 45% del presupuesto mensual utilizado ($22.50/$50.00)

⚠️  Algunas verificaciones opcionales:
  [ ] Test suite: no se detectó framework de testing
  [ ] SDD: no inicializado (ejecutá /sdd-init)

Todo listo. Tu entorno es seguro y está configurado correctamente.
```

Las verificaciones de seguridad incluyen:

1. **Integridad de permisos**: que el archivo de permisos sea válido JSON y no tenga rutas contradictorias
2. **Fugas de secretos**: escanea las rutas permitidas en busca de archivos que parezcan contener secretos
3. **Estado de GGA**: verifica que los hooks de Git estén instalados y tengan permisos de ejecución
4. **Presupuesto**: muestra el consumo actual vs el presupuesto configurado

### Governance policies

Las **políticas de gobierno** definen quién puede hacer qué en el ecosistema Gentle. Se configuran en `~/.config/gentle-ai/governance.yaml`:

```yaml
governance:
  install_policy:
    allowed_users: ["harry", "admin"]
    require_approval: true
  banned_components: ["theme-claude"]
  project_limits:
    "proyecto-critico":
      max_monthly_cost: 100
      allowed_models: ["claude-sonnet-5", "openai/gpt-5.6-terra"]
    "proyecto-experimental":
      max_monthly_cost: 20
      allowed_models: ["claude-haiku-4.5", "openai/gpt-5.6-luna"]
  review_policy:
    require_gga: true
    min_reviewers: 1
```

#### Niveles de gobierno

| Nivel | ¿Qué controla? | ¿Dónde se configura? |
|-------|----------------|---------------------|
| **Global** | Componentes prohibidos, políticas generales | `~/.config/gentle-ai/governance.yaml` |
| **Proyecto** | Modelos permitidos, presupuesto máximo | `governance.yaml` en el proyecto, o `opencode.json` |
| **Usuario** | Permisos del agente, modelo por defecto | `opencode.json` del usuario |

Las políticas de proyecto sobrescriben las globales (un proyecto puede ser más restrictivo, pero no menos). Las políticas de usuario sobrescriben las de proyecto (el usuario puede auto-limitarse más, pero no auto-autorizarse menos).

### Integración con CI

Gentle-AI se integra con CI/CD en tres puntos:

**Pre-commit hooks (GGA):** en cada commit, GGA ejecuta lint, escaneo de secretos y Native Review opcional. En GitHub Actions:

```yaml
jobs:
  gga-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: gentle-ai install --component gga
      - run: gga review --diff
```

**Pre-push gates:** antes de push, GGA verifica que el branch esté actualizado con la base, que no haya secretos en el diff, y que los tests pasen.

**Verificación de presupuesto en CI:** paso opcional que bloquea el deploy si el presupuesto mensual se excedió:

```yaml
- run: opencode models --json
```

### Budget alerts y caps

Las alertas de presupuesto pueden configurarse para notificar por:

- **Terminal**: mensaje en la TUI o en el output del asistente cuando se alcanza el umbral
- **Archivo de log**: registro con timestamp
- **Webhook** (próximamente): POST a una URL configurable cuando se supera un umbral

Los caps pueden ser:

| Tipo | ¿Qué hace? |
|------|-----------|
| **Soft cap** | Alerta pero no bloquea. El usuario puede continuar si confirma manualmente. |
| **Hard cap** | Bloquea automáticamente. No se pueden hacer más llamadas a modelos. |
| **Per-session** | Se resetea al iniciar una nueva sesión. |
| **Per-day** | Se resetea cada día a las 00:00 hora local. |
| **Per-month** | Se resetea el primer día de cada mes. |

Los caps por sesión se resetean automáticamente al iniciar una nueva sesión. Los caps diarios y mensuales se resetean según su ciclo (00:00 local y primer día del mes, respectivamente).

## Errores frecuentes

1. **Permiso denegado inesperadamente**: el asistente no puede leer un archivo que debería poder leer. Revisá las reglas `allow` y `deny`. Recordá que `deny` tiene prioridad.

2. **Presupuesto agotado sin saber por qué**: activá `log_level: verbose` en la auditoría para ver el detalle de cada llamada. Buscá patrones de uso inusual.

3. **Fallback no funciona**: el fallback solo se activa para las `conditions` configuradas. Si el modelo falla por una razón no listada, no hay fallback.

4. **Secretos commiteados**: GGA bloquea en pre-commit, pero si alguien usa `--no-verify`, los secretos pueden pasar. Agregá un paso en CI que escanee secretos en el PR.

5. **Políticas de gobierno inconsistentes**: si tenés conflicto entre política global y de proyecto, la más restrictiva gana. Revisá ambas si esperabas un comportamiento distinto.

6. **Auditoría ocupando espacio**: con `log_level: verbose`, el archivo de auditoría puede crecer rápido. Configurá `retention_days` para limpieza automática.

## Resumen

| Concepto | ¿Qué es? |
|----------|---------|
| **Allow/Deny** | Reglas de permiso con glob patterns. Deny tiene prioridad. |
| **Glob pattern** | Patrón de匹配 (coincidencia) de archivos con `*`, `**`, `?` |
| **Presupuesto por sesión** | Límite de gasto en USD para una sesión de trabajo |
| **Hard cap** | Bloquea el uso cuando se alcanza el límite |
| **Soft cap** | Alerta pero no bloquea |
| **Fallback policy** | Lista ordenada de modelos alternativos |
| **Auditoría de modelo** | Registro de qué modelo, cuánto costó, qué produjo |
| **GGA pre-commit** | Escaneo de secretos antes de cada commit |
| **Governance policy** | Reglas de quién puede instalar qué y con qué límites |
| **gentle-ai doctor** | Diagnóstico de seguridad y salud del sistema |

## Preguntas

1. ¿Qué prioridad tienen las reglas deny sobre las reglas allow?
2. ¿Cómo se calcula el costo de una llamada a un modelo?
3. ¿Cuál es la diferencia entre hard cap y soft cap en el presupuesto?
4. ¿Qué hace GGA si detecta un secreto en el diff de un commit?
5. ¿En qué condiciones se activa una política de fallback?
6. ¿Cómo se resuelven conflictos entre políticas globales y de proyecto?
7. ¿Qué verificaciones de seguridad ejecuta `gentle-ai doctor`?

## Ejercicio

1. Inspeccioná tu archivo `opencode.json` y listá las reglas allow/deny actuales.
2. Ejecutá `gentle-ai doctor` y revisá las verificaciones de seguridad.
3. Simulá un commit con un secreto: `echo "AKIA1234567890123456" > test.txt && git add test.txt && git commit -m "test"` (después revertí con `git reset HEAD~1`).
4. Configurá un presupuesto por sesión de $0.10 en tu `opencode.json`.
5. Ejecutá `gentle-ai doctor` para verificar el estado del sistema y permisos.

## Fuentes verificadas

- Repositorio: gentle-ai, commit `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d`
- Archivos: `internal/assets/skills/gentle-permissions/`, `internal/cli/doctor.go`
- Documentación: OpenCode MCP permissions spec (permissions.md)
- Versión verificada: Gentle-AI 2.1.10
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
