---
title: Strict TDD Mode
description: Cómo SDD integra Test-Driven Development con el ciclo RED/GREEN/REFACTOR, detección de capacidades de testing y verificación.
level: 2
estimatedTime: 15 min
tags:
  - sdd
  - tdd
  - strict-tdd
  - pruebas
  - red-green-refactor
prerequisites:
  - Las 10 fases de SDD (08-02)
verifiedVersion: "Gentle-AI 2.1.10"
learningOutcomes:
  - Explicar el ciclo RED/GREEN/REFACTOR en SDD
  - Comprender cómo sdd-init detecta capacidades de testing
  - Distinguir Strict TDD Mode del modo estándar
  - Saber qué ocurre si un test falla durante apply
  - Decidir cuándo activar strict mode y cuándo no
---

# Strict TDD Mode

## Qué aprenderás

SDD puede integrar **Test-Driven Development (TDD)** como parte del flujo de implementación. Esto se llama **Strict TDD Mode** y transforma la fase Apply en un ciclo disciplinado de RED → GREEN → REFACTOR.

En este capítulo vas a entender:
- Qué es Strict TDD Mode y cómo funciona
- El ciclo RED/GREEN/REFACTOR aplicado a SDD
- Cómo `sdd-init` detecta si tu proyecto soporta testing
- Cómo `strict-tdd.md` guía al subagente durante Apply
- Cómo se verifica el cumplimiento en `sdd-verify`
- Cuándo conviene usar strict mode y cuándo no

## Por qué importa

El problema más común del desarrollo asistido por IA es que el código generado **parece funcionar pero no está probado**. Los tests se escriben después (si se escriben), y suelen ser tests que pasan porque están diseñados para pasar, no para verificar el comportamiento real.

Strict TDD Mode fuerza al asistente a **escribir el test primero**, ver que falle, recién después implementar, y finalmente refactorizar. Esto garantiza que cada línea de código tenga un test que la respalde.

## Explicación simple

**Strict TDD Mode** es una variante del flujo SDD donde la fase Apply sigue estrictamente el ciclo TDD:

```
RED:   Escribí un test que describa el comportamiento deseado.
       Ejecutalo → FALLA (porque el código no existe aún)

GREEN: Escribí el código MÍNIMO necesario para que el test pase.
       Ejecutalo → PASA

REFACTOR: Mejorá el código sin cambiar su comportamiento.
          Ejecutá los tests de nuevo → SIGUEN PASANDO
```

Cada tarea de implementación pasa por este ciclo antes de pasar a la siguiente. No se puede avanzar mientras un test esté en rojo.

## Analogía

Imaginá que estás enseñando a alguien a hacer una silla. Con el enfoque tradicional, le decís "hacé una silla", la persona la construye, y después revisás si está bien. Con frecuencia, la silla parece linda pero se tambalea.

Con TDD estricto, primero le mostrías **cómo probar** que la silla no se tambalea (el test). Después le pedís que haga la silla más simple que no se tambalee. Después, que la haga más cómoda sin romper la estabilidad.

El test es la **definición de "terminado"**. Sin test, no hay definición objetiva de éxito.

## Cómo funciona realmente

### Detección de capacidades de testing

Durante `sdd-init`, el subagente escanea el proyecto para detectar si tiene un framework de testing instalado. Busca:

- `package.json` → `jest`, `vitest`, `mocha`, `ava`, `tap`
- `go.mod` → `testing` (built-in de Go)
- `Cargo.toml` → `cargo test`
- `requirements.txt` / `pyproject.toml` → `pytest`
- `.csproj` → `xunit`, `nunit`, `mstest`
- `Gemfile` → `rspec`, `minitest`

Si detecta un framework de testing, pregunta al usuario:

```
Se detectó Vitest en este proyecto.
¿Querés activar Strict TDD Mode? [S/N]
```

La respuesta se guarda en la configuración de SDD:

```yaml
# openspec/config.yaml
rules:
  apply:
    tdd: true           # Strict TDD Mode activado
    test_command: "npx vitest run"
```

En modo Engram, se guarda en el estado del proyecto:

```
mem_save(
  title: "sdd-init/{proyecto}",
  topic_key: "sdd-init/{proyecto}",
  content: "testing: vitest\ntdd: true\ntest_command: npx vitest run"
)
```

### Cómo strict-tdd.md guía al subagente

Cuando `tdd: true` está configurado, el subagente `sdd-apply` recibe instrucciones adicionales del archivo `strict-tdd.md` (incluido como skill). Las instrucciones son:

```
## Strict TDD — Instrucciones obligatorias

Por cada tarea de implementación, SEGUÍ ESTE ORDEN EXACTO:

### 1. RED (escribir test primero)
- Escribí el test que describe el comportamiento deseado
- Incluí casos normales, casos borde y casos de error
- Ejecutá el comando de test configurado
- VERIFICÁ que los tests nuevos FALLEN
- Si no fallan, el test no está bien escrito (está probando algo que ya funciona)

### 2. GREEN (implementación mínima)
- Escribí el código MÍNIMO necesario para que los tests pasen
- No optimices, no refactorices, no agregues funcionalidad extra
- Ejecutá los tests
- VERIFICÁ que TODOS los tests (nuevos y existentes) PASEN
- Si algún test existente falla, tu implementación rompió algo

### 3. REFACTOR (mejora sin cambiar comportamiento)
- Mejorá el código: nombrá mejor las variables, extraé funciones, eliminá duplicación
- NO cambiés el comportamiento
- Ejecutá los tests
- VERIFICÁ que SIGAN PASANDO
- Si un test falla, refactorizaste demasiado: revertí y hacé cambios más pequeños
```

Estas instrucciones NO son opcionales. Si el subagente intenta saltarse un paso, el ciclo se rompe.

### Cómo se aplica el ciclo en SDD

Supongamos que estás implementando la tarea "Crear función `filtrarPorNombre`" para un buscador.

```
TAREA: Crear función filtrarPorNombre(usuarios, query)

RED:
  1. El subagente escribe el test:
     test('filtrarPorNombre filtra por nombre exacto', () => {
       const usuarios = [
         { nombre: 'Ana', edad: 30 },
         { nombre: 'Carlos', edad: 25 },
         { nombre: 'Beatriz', edad: 35 }
       ];
       expect(filtrarPorNombre(usuarios, 'Carlos')).toEqual([
         { nombre: 'Carlos', edad: 25 }
       ]);
     });
  
  2. Ejecuta: npx vitest run → FALLA (filtrarPorNombre no existe)

GREEN:
  1. Escribe la función mínima:
     function filtrarPorNombre(usuarios, query) {
       return usuarios.filter(u => u.nombre === query);
     }
  
  2. Ejecuta: npx vitest run → PASA

REFACTOR:
  1. Mejora: hace la búsqueda case-insensitive
     function filtrarPorNombre(usuarios, query) {
       return usuarios.filter(u =>
         u.nombre.toLowerCase() === query.toLowerCase()
       );
     }
  
  2. Ejecuta: npx vitest run → SIGUE PASANDO
```

Cada tarea completa un ciclo como este antes de avanzar a la siguiente.

### Cómo se verifica en sdd-verify

Cuando `sdd-verify` se ejecuta en Strict TDD Mode, verifica:

1. **Que existan tests** para cada requisito de la spec. Si un requisito no tiene test, es un hallazgo CRITICAL.
2. **Que los tests pasen** actualmente. Si algún test falla, es un hallazgo CRITICAL.
3. **Que la cobertura sea aceptable** (si se configuró un umbral). Por debajo del umbral, es un WARNING.
4. **Que no haya tests que pasen sin aserciones** (tests falsos positivos). Si los hay, es un WARNING.

El reporte de verificación en strict mode incluye una sección adicional:

```yaml
strict_tdd:
  task_count: 5
  red_green_cycles: 5
  tests_written: 12
  tests_passing: 12
  coverage: 87%
  missing_tests_for_requirements: []
```

Si hay requisitos sin tests, se listan en `missing_tests_for_requirements` y se bloquea el archive hasta que se cubran.

### Strict vs Standard: cuadro comparativo

| Aspecto | Standard Mode | Strict TDD Mode |
|---------|--------------|-----------------|
| Orden de implementación | Código primero, tests después (opcional) | Test primero, código después (obligatorio) |
| Tests | Se escriben si el desarrollador quiere | Se escriben SIEMPRE antes del código |
| Ciclo por tarea | Una sola pasada de implementación | RED → GREEN → REFACTOR por tarea |
| Fallo de test | Se reporta pero no bloquea | BLOQUEA el avance hasta que el test pase |
| Refactor | Opcional, puede omitirse | Obligatorio después de cada GREEN |
| Tiempo por tarea | Menor (sin tests) | Mayor (cada tarea son 3 pasos) |
| Confianza en el resultado | Media | Alta |
| Cobertura | Variable, sin garantía | Mínima garantizada por requisito |

### Cuándo usar Strict TDD Mode

| Situación | Modo recomendado |
|-----------|-----------------|
| Proyecto nuevo con testing desde el inicio | ✅ Strict TDD |
| Feature crítica (pagos, auth, datos sensibles) | ✅ Strict TDD |
| Refactor con efectos secundarios | ✅ Strict TDD |
| Bugfix simple y acotado | ❌ Standard |
| Prototipo / spike | ❌ Standard |
| Proyecto sin framework de testing | ❌ Standard (no aplica) |
| Equipo con cultura de testing establecida | ✅ Strict TDD |

### Qué pasa si los tests fallan durante Apply

Si después de implementar GREEN los tests no pasan, el subagente:

1. **Detecta el fallo**: identifica qué test falló y por qué
2. **Corrige el código**: ajusta la implementación hasta que el test pase
3. **Reintenta**: ejecuta los tests de nuevo
4. **Si persiste**: reporta un error al orquestador con el detalle del fallo

El orquestador puede:
- Pedir al subagente que reintente (si el error parece menor)
- Reportar al usuario y esperar instrucciones
- Marcar la tarea como `blocked` y pasar a la siguiente (con permiso del usuario)

Nunca se marca una tarea como completa si sus tests no pasan.

## Errores frecuentes

1. **Test que pasa en RED**: si escribís un test y ya pasa sin implementar nada, el test está mal. Probablemente está probando algo que no existe o la aserción es incorrecta.
2. **Implementar más de lo necesario en GREEN**: la tentación es escribir código "completo" en GREEN. Resistila. GREEN debe ser el código MÍNIMO que haga pasar el test.
3. **Saltar REFACTOR**: "ya funciona, para qué tocarlo". El refactor es lo que mantiene el código limpio a largo plazo. Saltarlo acumula deuda técnica.
4. **No ejecutar tests existentes**: después de GREEN y REFACTOR, ejecutá SIEMPRE todos los tests, no solo los nuevos. Podés haber roto algo sin querer.
5. **Strict mode sin framework de testing**: si el proyecto no tiene testing configurado, strict mode no puede funcionar. No lo actives artificialmente.

## Resumen

| Paso | Qué hacés | Estado de los tests |
|------|----------|-------------------|
| **RED** | Escribís el test primero | Fallan (esperado) |
| **GREEN** | Escribís el código mínimo | Pasan |
| **REFACTOR** | Mejorás el código sin cambiar comportamiento | Siguen pasando |
| **VERIFY** | Verificás que todo requisito tenga test | Todos pasan, cobertura ≥ umbral |

Strict TDD Mode garantiza que cada línea de código tenga un test que la respalde, pero cuesta más tiempo por tarea. Usalo cuando la calidad y la confianza sean prioritarias.

## Preguntas

1. ¿Cuál es la diferencia clave entre Standard Mode y Strict TDD Mode?
2. ¿Qué hace `sdd-init` si detecta Vitest en el proyecto?
3. ¿Qué debería pasar si ejecutás los tests después de escribir el test pero antes de implementar?
4. ¿Por qué no deberías saltar la fase REFACTOR?
5. ¿En qué situaciones NO conviene usar Strict TDD Mode?

## Fuentes verificadas

- Repositorio: gentle-ai, commit `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d`
- Archivos: `internal/assets/skills/sdd-apply/strict-tdd.md`, `internal/assets/skills/sdd-verify/SKILL.md`
- Archivo: `internal/assets/skills/sdd-init/SKILL.md` (detección de testing)
- Versión verificada: gentle-ai 2.1.10
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
