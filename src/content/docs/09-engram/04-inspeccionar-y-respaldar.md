---
title: Inspeccionar y respaldar la memoria
description: Cómo consultar, exportar e importar la base de datos local de Engram.
level: 1
estimatedTime: 15 min
---

Engram guarda todo en un archivo SQLite. Podés inspeccionarlo, exportarlo a un archivo portable e importarlo después.

![Vista de inspección de Engram](/gentle-ai-manual/screenshots/engram-inspeccionar.png)
*Pantalla de `engram doctor` y verificación de la base de memoria.*

## Ver estadísticas

El comando más rápido para saber el estado de tu memoria:

```bash
engram doctor
```

Devuelve: versión, ruta de la base de datos, cantidad de sesiones, observaciones, prompts, y problemas detectados (solo diagnóstico, no modifica nada).

Para estadísticas más detalladas desde el agente:

```text
mem_stats(project: "tu-proyecto")
# → Cantidad de observaciones por tipo, sesiones activas, pinned, etc.
```

## Buscar en la memoria

Desde el agente:

```text
# Buscar por texto
mem_search(query: "autenticación JWT", project: "mi-proyecto")

# Buscar por tipo (query vacío para no filtrar por texto)
mem_search(query: "", type: "decision", project: "mi-proyecto")

# Buscar todo (sin filtro)
mem_search(query: "", project: "mi-proyecto")
```

Desde la terminal (el servidor HTTP corre cuando iniciás una sesión):

```bash
curl http://localhost:7437/api/search?q=autenticación
```

## Interfaz TUI

Engram tiene una interfaz de terminal (TUI) construida con Bubbletea que se abre directamente:

```bash
engram tui
```

No necesitás un servidor separado — la TUI accede directo a la base SQLite local.

La TUI muestra:

- **Lista**: observaciones recientes
- **Búsqueda**: resultados de FTS5 en tiempo real
- **Detalle**: contenido completo de una observación
- **Stats**: métricas del proyecto

## Exportar la memoria

Engram tiene un comando específico para exportar:

```bash
engram export respaldo.json
```

Esto genera un archivo JSON con todas las observaciones, configuraciones y metadatos. Es portátil entre sistemas y versiones.

Para exportar a otro formato desde SQLite directamente (uso avanzado):

```bash
# Exportar observaciones como JSON plano
sqlite3 ~/.engram/engram.db "
  SELECT json_group_array(
    json_object('id', id, 'title', title, 'type', type, 'content', content,
                'project', project, 'scope', scope, 'created_at', created_at)
  )
  FROM observations
  WHERE deleted_at IS NULL;
" > ~/engram-observations.json

# Exportar la base completa a SQL
sqlite3 ~/.engram/engram.db ".dump" > ~/engram-export.sql
```

## Importar / restaurar

Para restaurar una exportación previa:

```bash
engram import respaldo.json
```

Esto carga las observaciones del archivo JSON a la base local. Engram maneja la deduplicación automáticamente.

Importante: la importación agrega datos a la base existente. Si querés una restauración limpia, exportá primero lo actual, luego cerrá Engram, reemplazá el archivo de base de datos, y reiniciá la sesión.

## Estrategia de respaldo

| Frecuencia | Qué respaldar | Cómo |
|-----------|--------------|------|
| Diaria (si trabajás con agentes todo el día) | Memoria completa | `engram export ~/engram-$(date +%Y-%m-%d).json` |
| Semanal | Directorio `~/.engram/` completo | Incluye `config.json` |
| Antes de un cambio grande | Memoria completa | `engram export ~/engram-pre-cambio.json` |

Podés automatizarlo con una tarea programada:

```bash
# Linux/macOS (cron) — export diario a las 18:00
# 0 18 * * * cd $HOME && engram export ~/engram-$(date +\%Y-\%m-\%d).json
```

## Verificar una exportación

```bash
# Verificar que el archivo existe y tiene tamaño razonable
ls -lh ~/engram-*.json

# Si el archivo es válido JSON, Engram lo va a importar sin error
engram import ~/engram-*.json --dry-run
```

## Errores frecuentes

| Error | Solución |
|-------|----------|
| "database is locked" al exportar | Usá `engram export` que respeta los locks de SQLite. |
| Exportación vacía | Verificá el path. Engram usa `~/.engram/engram.db`. |
| El archivo de importación se corrompió | Verificá que sea JSON válido antes de importar. |
| No tengo `sqlite3` instalado | Solo es necesario para acceso avanzado. `engram export` no lo requiere. |
