---
title: Inspeccionar y respaldar la memoria
description: Cómo consultar, exportar y respaldar la base de datos local de Engram.
level: 1
estimatedTime: 15 min
---

Engram guarda todo en un archivo SQLite. Podés inspeccionar ese archivo, exportarlo y respaldarlo como cualquier otro archivo importante.

## Ver estadísticas

El comando más rápido para saber el estado de tu memoria:

```bash
engram doctor
```

Devuelve: versión, ruta de la base de datos, cantidad de sesiones, observaciones, prompts, y posibles problemas.

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

# Buscar por tipo
mem_search(type: "decision", project: "mi-proyecto")

# Buscar todo (sin filtro)
mem_search(query: "", project: "mi-proyecto")
```

Desde la terminal (si `engram serve` está corriendo):

```bash
curl http://localhost:7437/api/search?q=autenticación
```

## Interfaz TUI

Engram tiene una interfaz de terminal (TUI) construida con Bubbletea:

```bash
# Terminal 1: iniciar servidor
engram serve

# Terminal 2: abrir TUI
engram tui
```

La TUI muestra:

- **Lista**: observaciones recientes
- **Búsqueda**: resultados de FTS5 en tiempo real
- **Detalle**: contenido completo de una observación
- **Stats**: gráficos ASCII con métricas del proyecto

## Exportar la memoria

Engram usa SQLite estándar. No necesitás herramientas especiales:

```bash
# Backup en caliente (mientras Engram corre)
sqlite3 ~/.engram/engram.db ".backup ~/engram-backup-2026-07-21.db"

# Exportar a SQL (para migrar a otra base)
sqlite3 ~/.engram/engram.db ".dump" > ~/engram-export.sql

# Exportar observaciones como JSON
sqlite3 ~/.engram/engram.db "
  SELECT json_group_array(
    json_object('id', id, 'title', title, 'type', type, 'content', content,
                'project', project, 'scope', scope, 'created_at', created_at)
  )
  FROM observations
  WHERE deleted_at IS NULL;
" > ~/engram-observations.json
```

## Importar / restaurar

```bash
# Restaurar un backup
copy ~/engram-backup-2026-07-21.db ~/.engram/engram.db
# (Linux/macOS: cp ~/engram-backup-2026-07-21.db ~/.engram/engram.db)

# Verificar que el archivo es válido
sqlite3 ~/.engram/engram.db "SELECT count(*) FROM observations;"
```

Importante: Engram debe estar detenido cuando restaurás. Si está corriendo, detenelo primero, reemplazá el archivo, y reinicialo.

## Estrategia de backup

| Frecuencia | Qué respaldar | Cómo |
|-----------|--------------|------|
| Diaria (si trabajás con agentes todo el día) | `~/.engram/engram.db` | `.backup` a un archivo con fecha |
| Semanal | `~/.engram/` completo | Incluye `config.json` |
| Antes de un cambio grande | `~/.engram/engram.db` | Backup manual con `.backup` |

Podés automatizarlo con una tarea programada:

```bash
# Windows (Task Scheduler o script .bat)
sqlite3 %USERPROFILE%\.engram\engram.db ".backup %USERPROFILE%\engram-backup-%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%.db"

# Linux/macOS (cron)
# 0 18 * * * sqlite3 ~/.engram/engram.db ".backup ~/engram-backup-$(date +\%Y-\%m-\%d).db"
```

## Verificación post-backup

```bash
# 1. Verificar que el archivo existe y tiene tamaño razonable
# Windows: dir %USERPROFILE%\engram-backup-*.db
# Linux: ls -lh ~/engram-backup-*.db

# 2. Verificar que es una base SQLite válida
sqlite3 ~/engram-backup-2026-07-21.db "SELECT count(*) FROM observations;"

# 3. Verificar que tiene datos
sqlite3 ~/engram-backup-2026-07-21.db "SELECT type, count(*) FROM observations GROUP BY type;"
```

## Errores frecuentes

| Error | Solución |
|-------|----------|
| "database is locked" al respaldar | Usá `.backup` en lugar de `cp` directo. `.backup` respeta los locks de SQLite. |
| Backup vacío | Verificá el path. Engram usa `~/.engram/engram.db`. |
| El backup se corrompió | Probá con `.backup` en vez de copia directa del archivo mientras Engram corre. |
| No tengo `sqlite3` instalado | Instalalo con tu gestor de paquetes (`apt install sqlite3`, `brew install sqlite3`, o descargalo de sqlite.org). |
