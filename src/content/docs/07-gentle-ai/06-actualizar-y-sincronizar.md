---
title: Actualizar y sincronizar
description: Cómo mantener el ecosistema actualizado. Diferencias entre update, upgrade, sync, backup y restore. Estrategias para Windows.
level: 2
estimatedTime: 20 min
tags:
  - gentle-ai
  - actualizacion
  - sincronizacion
  - upgrade
  - update
  - sync
  - backup
  - windows
prerequisites:
  - "Comandos del ecosistema (07-05)"
  - "CLI y TUI de Gentle-AI (07-02)"
verifiedVersion: "Gentle-AI 2.2.0"
learningOutcomes:
  - Distinguir entre update, upgrade y sync
  - Explicar qué hace sync y por qué es idempotente
  - Ejecutar upgrade en Windows con go install /v2/
  - Crear y restaurar backups con auto-snapshots
  - Diagnosticar problemas de actualización
---

# Actualizar y sincronizar

## Qué aprenderás

El ecosistema Gentle se actualiza de formas distintas según el componente y la plataforma. No es un solo comando "actualizar todo". Hay comandos específicos para verificar, aplicar, sincronizar y resguardar.

En este capítulo vas a entender:
- La diferencia entre `update`, `upgrade` y `sync`
- Cómo funciona `sync` y por qué es idempotente
- Cómo actualizar `gentle-ai` en Windows con `go install`
- El sistema de auto-snapshots y backup
- Cómo restaurar una configuración anterior
- Estrategias según plataforma (Windows vs macOS/Linux)

## Por qué importa

Usar el comando incorrecto entre `update`, `upgrade` y `sync` puede generar confusión: `update` solo verifica, no aplica nada. `upgrade` aplica cambios. `sync` no tiene nada que ver con versiones, sincroniza configuraciones entre componentes.

Además, la actualización en Windows tiene particularidades: no hay binario oficial distribuido actualmente, se usa `go install` con verificación contra el Go checksum database. Saber esto evita errores de "comando no encontrado" después de una actualización.

## Explicación simple

Tres comandos que parecen similares pero hacen cosas distintas:

- **`gentle-ai update`**: solo VERIFICA si hay versiones nuevas. No descarga ni instala nada. Es de solo lectura.
- **`gentle-ai upgrade`**: APLICA las actualizaciones disponibles. Descarga, verifica e instala las nuevas versiones.
- **`gentle-ai sync`**: SINCRONIZA la configuración entre componentes y skills. No tiene nada que ver con versiones. Es idempotente: ejecutarlo varias veces da el mismo resultado.

Además hay un comando de resguardo:
- **`gentle-ai restore`**: restaura una configuración desde un auto-snapshot.

Los snapshots se crean **automáticamente** al ejecutar `install`, `sync` o `upgrade`. También podés gestionarlos desde la TUI (`gentle-ai` sin argumentos). No existe un comando `gentle-ai backup` separado.

## Analogía

Imaginá que tenés un auto:

- **`update`** es mirar el tablero para ver si hay una luz de "mantenimiento necesario". No hacés nada, solo verificás.
- **`upgrade`** es llevar el auto al taller y cambiarle el aceite, los filtros y las bujías. Se aplican los cambios.
- **`sync`** es asegurarte de que los espejos laterales, el asiento y el volante están en la posición que te gusta después del service. No cambia las piezas, solo las ajusta.
- **Auto-snapshot** es tener una cámara que saca una foto automáticamente cada vez que hacés un cambio importante. No necesitás acordarte de sacar la foto.
- **`restore`** es usar esa foto para devolver el auto al estado anterior.

## Cómo funciona realmente

### update — solo verificar

```bash
gentle-ai update
```

`update` consulta las fuentes de cada herramienta gestionada para ver si hay versiones más recientes:

- `gentle-ai` compara su versión contra el release en GitHub
- `engram` verifica su versión contra el release en GitHub
- `gga` verifica su versión contra el release en GitHub
- `community plugins` compara la versión en `package.json` con GitHub releases

No descarga nada. No modifica ningún archivo. Es seguro ejecutarlo en cualquier momento.

Salida típica:
```
Checking gentle-ai... current 2.1.10, latest 2.2.0 → update available
Checking engram... current 1.18.0, latest 1.19.0 → update available
Checking gga... current 1.0.0, latest 1.0.0 → up to date
```

### upgrade — aplicar actualizaciones

```bash
gentle-ai upgrade [tool...] [--dry-run] [--no-backup]
```

`upgrade` aplica las actualizaciones disponibles. Hace un auto-snapshot antes de aplicar cambios (a menos que uses `--no-backup`).

**En macOS/Linux**: usa descarga binaria autenticada con verificación de firma Minisign.

**En Windows**: usa `go install` verificado contra la base de datos de checksums de Go. En v2.2.0 se corrigió que `go install` escriba donde el usuario realmente ejecuta.

```bash
# En Windows, go install usa la ruta /v2/
go install github.com/Gentleman-Programming/gentle-ai/v2@latest
```

El path `/v2/` en el módulo Go es importante porque el módulo Go de gentle-ai v2.x usa este sufijo semántico. La versión v1.x no lo usaba.

### sync — sincronizar configuración

```bash
gentle-ai sync [flags]
```

`sync` proyecta reglas de ruteo canónicas en cada adaptador soportado. Sincroniza skills, configuraciones de agentes y reglas de permisos.

Es **idempotente**: ejecutarlo múltiples veces produce el mismo resultado. No descarga ni instala versiones nuevas, no actualiza el binario.

Flags útiles:
- `--dry-run`: muestra lo que haría sin ejecutarlo
- `--include-permissions`: incluye reglas de permisos en la sincronización
- `--agent <nombre>`: sincroniza solo un agente específico
- `--profile <nombre>`: crea un perfil SDD en OpenCode durante el sync
- `--profile-phase <fase>`: asigna un modelo a una fase específica del perfil

Cuándo ejecutar `sync`:
- Después de `upgrade` para asegurar que las configuraciones están alineadas
- Cuando skills nuevos no aparecen en el asistente
- Cuando cambios manuales en la configuración dejaron inconsistencias

### Auto-snapshots y restore

Cada vez que ejecutás `install`, `sync` o `upgrade`, Gentle-AI crea automáticamente un **auto-snapshot** de tu configuración actual. Los snapshots son:

- Comprimidos en tar.gz
- Deducplicados (no guarda dos copias idénticas)
- Auto-podados (mantiene los 5 más recientes)

No existe un comando `gentle-ai backup` separado — los snapshots se crean solos al modificar configuración.

```bash
# Listar snapshots disponibles (vía TUI, con tecla p para pinar)
gentle-ai

# Restaurar un snapshot
gentle-ai restore

# Restaurar el snapshot más reciente
gentle-ai restore latest
```

Para pinar un snapshot importante (evita que el auto-prune lo borre): en la TUI, seleccioná el snapshot y presioná la tecla `p`.

### Comandos relacionados

| Comando | Mutabilidad | ¿Requiere red? | ¿Crea snapshot? |
|---------|-------------|----------------|-----------------|
| `update` | Solo lectura | Sí | No |
| `upgrade` | Mutates | Sí | Sí (automático) |
| `sync` | Mutates | No | Sí (automático) |
| `restore` | Mutates | No | No |

Los snapshots se crean automáticamente al ejecutar `install`, `sync` o `upgrade`. No existe un comando `backup` separado.

## Errores frecuentes

1. **Ejecutar `update` esperando que actualice**: `update` solo verifica. Usá `upgrade` para aplicar los cambios.
2. **`gentle-ai sync` no encuentra skills nuevos**: `sync` no descarga skills nuevos, solo sincroniza los existentes. Ejecutá `upgrade` primero.
3. **"command not found" después de `upgrade` en Windows**: en v2.2.0 se corrigió que `go install` escriba en la ubicación correcta. Asegurate de que la ruta de `go install` esté en tu PATH.
4. **Auto-snapshot perdido**: los snapshots se auto-podan a 5. Si necesitás conservar uno, pinalo en la TUI con la tecla `p`.
5. **`restore` restaura la configuración incorrecta**: verificá la fecha del snapshot antes de restaurar. Usá la TUI para ver los detalles de cada snapshot.

## Resumen

| Comando | ¿Qué hace? | ¿Modifica archivos? |
|---------|-----------|-------------------|
| `update` | Verifica actualizaciones disponibles | No |
| `upgrade` | Aplica actualizaciones a herramientas | Sí |
| `sync` | Sincroniza configs y skills (idempotente) | Sí |
| `restore` | Restaura configuración desde snapshot | Sí |
| Auto-snapshot | Se crea automáticamente al hacer install/sync/upgrade | — |
| Ruta Go v2 | `github.com/Gentleman-Programming/gentle-ai/v2@latest` | — |

## Preguntas

1. ¿Cuál es la diferencia entre `update` y `upgrade`?
2. ¿Por qué `sync` es idempotente?
3. ¿Qué comando ejecutás después de un `upgrade` para asegurar que las configuraciones están alineadas?
4. ¿Cómo se actualiza `gentle-ai` en Windows?
5. ¿Qué hace la tecla `p` en la TUI de snapshots?
6. ¿Cuántos auto-snapshots se conservan por defecto?

## Fuentes verificadas

- Repositorio: gentle-ai, commit `ee83e83d56f0d149c52f93fd13b3296858f5147f`
- Archivos: README.md, `docs/architecture/organic-rdd.md`
- Versión verificada: Gentle-AI 2.2.0
- Windows: `go install github.com/Gentleman-Programming/gentle-ai/v2@latest` (ruta `/v2/` verificada en módulo Go v2.x)
- Fecha: 2026-07-28
- Estado: 🟢 Verificado
