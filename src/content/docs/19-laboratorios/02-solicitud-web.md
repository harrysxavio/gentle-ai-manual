---
title: Trazar una solicitud web
description: "Laboratorio de maestría: seguí una solicitud HTTP desde el navegador hasta la respuesta, identificando cada capa del stack."
level: 2
estimatedTime: 45 min
tags:
  - laboratorio-maestría
  - solicitud-web
  - HTTP
  - terminal
  - trazabilidad
prerequisites:
  - Terminal básica
  - Navegador
  - curl o httpie (o PowerShell Invoke-WebRequest)
---

## Contexto

Cuando una aplicación web funciona lento o no responde, el primer reflejo suele ser abrir las herramientas de desarrollo del navegador y mirar la pestaña Network. Eso alcanza para un vistazo rápido, pero no te dice dónde está realmente el problema. El navegador abstrae太多 capas: la resolución DNS, el handshake TCP, la negociación TLS, la latencia de red, el tiempo de procesamiento del servidor, la transferencia del cuerpo.

Si no sabés medir cada etapa por separado, no podés responder preguntas concretas como "¿el DNS está tardando más de lo normal?" o "¿el cuello de botella está en el servidor o en la red?". Sin esas respuestas, cualquier optimización es un tiro al aire.

Este laboratorio te saca del navegador y te pone en la terminal, donde tenés control granular sobre cada fase del viaje de una solicitud HTTP.

## Objetivo observable

Al terminar este laboratorio, vas a poder usar la terminal para ejecutar una solicitud HTTP, inspeccionar cada etapa del viaje (DNS, conexión TCP, negociación TLS, tiempo hasta el primer byte, transferencia del cuerpo), e identificar dónde está el cuello de botella.

Vas a poder responder preguntas como "¿la latencia es de red o de servidor?" y "¿estamos perdiendo tiempo en DNS o en TLS?" con evidencia numérica.

## Escenario

Tu equipo reporta que la aplicación demo `https://httpbin.org/anything` tarda más de 5 segundos en responder. Nadie sabe por qué. Algunos dicen que es el servidor, otros que es la red, otros que es el DNS. Necesitás diagnosticar el problema sin depender del navegador, usando solo la terminal y herramientas de línea de comandos.

La aplicación es un endpoint HTTPbin que devuelve un JSON con los datos de la solicitud que recibe. No hay autenticación ni parámetros especiales. Una solicitud GET simple debería responder en menos de 1 segundo en condiciones normales.

Tu tarea es medir cada etapa del viaje, identificar el cuello de botella, y producir un diagnóstico documentado.

## Restricciones

- Sin navegador: no podés usar las herramientas de desarrollo, Postman, ni ninguna interfaz gráfica.
- Sin herramientas gráficas: no Wireshark, no Fiddler, no Charles Proxy.
- Sin proveedores pagos: no podés usar servicios de monitoreo externos ni APIs de pago.
- Sin `ping` como herramienta única: `ping` mide ICMP, no HTTP. Podés usarlo como complemento, pero no como diagnóstico principal.
- Usá herramientas disponibles en cualquier sistema con terminal: `curl`, `dig` o `nslookup`, `time` (Bash) o `Measure-Command` (PowerShell), `tracert` (Windows) o `traceroute` (macOS/Linux).
- Podés complementar con `Invoke-WebRequest` en PowerShell, pero priorizá `curl` por su soporte de timing por etapa.

## Información disponible

- Documentación de Gentle-AI: módulo `01-fundamentos-tecnologicos/02-la-terminal.md` (comandos básicos), módulo `15-terminal/01-terminal-avanzada.md` (pipes, redirección, medición de tiempo).
- Catálogo de comandos en `gentle-command-catalog.yml` (referencia de comandos del ecosistema Gentle).
- Ayuda integrada de cada herramienta: `curl --help`, `curl -v`, `dig -h` o `man dig`, `nslookup`, `time` (Bash built-in), `Get-Help Measure-Command` (PowerShell).
- Documentación pública de httpbin.org: endpoint `https://httpbin.org/anything` acepta cualquier método y devuelve un JSON descriptivo.

### Comandos clave

| Comando | Para qué sirve |
|---------|---------------|
| `curl -v <url>` | Muestra toda la conversación: DNS, handshake, headers, respuesta |
| `curl -w "<formato>" <url>` | Muestra tiempos por etapa (namelookup, connect, appconnect, starttransfer, total) |
| `dig <dominio>` | Resolución DNS manual con tiempos detallados |
| `nslookup <dominio>` | Resolución DNS manual (alternativa multiplataforma) |
| `time <comando>` | Mide tiempo total de ejecución del comando (Bash) |
| `Measure-Command { <comando> }` | Mide tiempo total de ejecución (PowerShell) |
| `tracert <dominio>` / `traceroute <dominio>` | Rastreo de ruta de red, salto por salto |

## Preguntas de decisión

Antes de ejecutar los comandos, respondé estas preguntas:

1. **¿Usás HEAD o GET para medir latencia?** HEAD evita descargar el cuerpo de la respuesta, lo que aísla el tiempo de latencia de red y servidor sin el peso de la transferencia. GET te da el tiempo completo. La decisión depende de qué querés medir: si el problema está en el servidor o en la transferencia. Una estrategia posible es medir primero con HEAD, y si el servidor responde rápido, hacer GET para medir la transferencia.

2. **¿Medís desde la misma red o desde distintas ubicaciones?** Una sola medición no distingue entre un problema local (tu ISP, tu router) y un problema global (el servidor, el DNS público). Si medís desde dos redes distintas (casa, VPN, red móvil) y los resultados son similares, el problema es del servidor o del camino compartido. Si solo una red es lenta, el problema es local.

3. **¿Qué herramienta te da tiempo total vs tiempo por etapa?** `time` y `Measure-Command` te dan solo el tiempo total del comando. `curl -w` te da el desglose por etapa: resolución DNS (`time_namelookup`), conexión TCP (`time_connect`), handshake TLS (`time_appconnect`), tiempo hasta el primer byte (`time_starttransfer`), y tiempo total (`time_total`). Para un diagnóstico real, necesitás `curl -w`.

4. **¿Cuántas mediciones hacés?** Una sola medición puede ser engañosa por variación de red. Hacé al menos 3 mediciones consecutivas y tomá el promedio o la mediana.

## Artefacto esperado

Un archivo `diagnostico-web.md` que documente:

- URL objetivo y fecha/hora de la medición.
- Herramientas utilizadas (con versiones).
- Tabla de tiempos por etapa: DNS, TCP, TLS, TTFB (time to first byte), transferencia total.
- Conclusión sobre dónde está el cuello de botella.
- Al menos una recomendación de mejora basada en los datos.

El archivo debe ser legible y estar formateado en Markdown. Puede incluir fragmentos de la salida de terminal como evidencia.

## Criterios de aceptación

- [ ] Se ejecutó al menos una solicitud con `curl -v` o equivalente, y se observó la salida completa (DNS, handshake, headers, respuesta).
- [ ] Se midió el tiempo total con `time` (Bash) o `Measure-Command` (PowerShell), o con `curl -w`.
- [ ] Se resolvió el DNS manualmente con `dig` o `nslookup`, y se documentó el resultado.
- [ ] El diagnóstico identifica al menos 2 fases del viaje de la solicitud (por ejemplo, "TLS fue la fase más lenta" o "la resolución DNS superó los 200ms").
- [ ] El archivo `diagnostico-web.md` existe y es legible.
- [ ] La tabla de tiempos incluye al menos 3 mediciones o una fila por etapa.
- [ ] La recomendación de mejora está basada en los datos, no en suposiciones.

## Rúbrica

| Nivel | Descripción | Evidencia |
|-------|-------------|-----------|
| Inicial | Ejecutaste curl pero no mediste tiempos | Salida de curl sin flags de timing |
| Competente | Mediste tiempos totales con `time` o `curl -w` | Al menos 2 mediciones con timestamps y valores numéricos |
| Avanzado | Mediste tiempos por etapa (DNS, TCP, TLS, TTFB) y los documentaste en una tabla | Tabla con 4 o más etapas medidas, valores en milisegundos |
| Experto | Correlacionaste las etapas medidas con un diagnóstico concreto y una recomendación de mejora basada en datos | Diagnóstico completo con tabla, identificación del cuello de botella, y al menos una mejora sugerida |

## Autoevaluación

Respondé estas preguntas después de completar el laboratorio:

1. **¿El DNS se resolvió en menos de 100ms?** Si no, ¿fue un problema del resolver local o del servidor DNS autoritativo?

2. **¿El TTFB (time to first byte) fue mayor que el tiempo de transferencia del cuerpo?** Si es así, el cuello de botella está en el servidor o en la red, no en el tamaño de la respuesta.

3. **¿Pudiste medir cada etapa por separado (DNS, TCP, TLS, TTFB, transferencia)?** Si alguna etapa no aparece, ¿sabés por qué? (Por ejemplo, HTTPS sin TLS no existe; `time_appconnect` solo aparece con URLs HTTPS.)

4. **¿Identificaste al menos un cuello de botella concreto?** No vale decir "la red es lenta". Identificá si es la resolución DNS, el handshake TLS, la latencia de red, el procesamiento del servidor, o la transferencia.

5. **¿La recomendación de mejora está basada en los datos de la medición?** Si recomendaste cambiar de DNS, ¿los datos muestran que el DNS era lento? Si recomendaste optimizar el servidor, ¿el TTFB era alto?

6. **¿Ejecutaste al menos 3 mediciones para cada prueba?** Los resultados individuales pueden tener ruido. Múltiples mediciones dan confianza.

## Errores frecuentes

- **Usar solo `ping` para diagnosticar una aplicación web.** `ping` mide ICMP, no HTTP. Un servidor puede responder ICMP rápido pero tener el servidor web colapsado, o al revés. ICMP y HTTP viajan por protocolos diferentes y pueden tener prioridades de QoS distintas en la red.

- **No diferenciar entre timeouts de conexión, timeouts de respuesta, y transferencias parciales.** Un timeout de conexión (curl exit 28: `Connection timed out`) significa que el servidor no aceptó la conexión TCP — suele ser red o firewall. Una transferencia parcial (curl exit 18: `transfer closed with bytes remaining`) significa que la conexión se estableció pero el servidor cerró la conexión antes de completar la respuesta — suele ser servidor sobrecargado o respuesta truncada. Un timeout de respuesta (también exit 28: `Operation timed out after ...`) significa que la conexión se estableció pero el servidor no terminó de enviar dentro del tiempo límite. La causa y la solución son diferentes en cada caso.

- **Confundir latencia de red con latencia de servidor.** `time_connect` mide el tiempo de ida y vuelta de red (handshake TCP). `time_starttransfer` menos `time_appconnect` mide cuánto tardó el servidor en generar la respuesta. Si la red es rápida pero el TTFB es alto, el problema es del servidor.

- **Olvidar que TLS agrega round trips.** Cada handshake TLS 1.3 agrega 1 round trip (RTT) al tiempo de conexión. TLS 1.2 agrega 2. Si medís `time_connect` contra `time_appconnect`, la diferencia debería ser aproximadamente 1-2 RTT. Si es mucho más, puede haber pérdida de paquetes o una negociación TLS problemática.

- **Medir una sola vez y sacar conclusiones.** La latencia de red varía naturalmente. Una medición aislada puede ser atípica. Siempre medí al menos 3 veces.

- **No descartar el cuerpo de la respuesta.** Si el objetivo es medir latencia y no transferencia, usá `-o /dev/null` (Bash) o `-o $null` (PowerShell) para no escribir el cuerpo en pantalla ni en disco. Esto evita que el tiempo de escritura afecte la medición.

## Extensión avanzada

Si querés ir más allá de los criterios de aceptación:

1. **Repetir el diagnóstico contra 3 URLs diferentes.** Por ejemplo: `https://httpbin.org/anything`, `https://example.com`, `https://www.google.com`. Compará los perfiles de cada una ¿Cuál tiene el DNS más rápido? ¿Cuál tiene el TTFB más bajo?

2. **Medir desde 2 redes distintas.** Ejecutá las mismas mediciones desde tu red de casa, una VPN, o un hotspot móvil. ¿Los resultados cambian? ¿El cuello de botella es el mismo?

3. **Medir solo headers con `-I`.** `curl -I` envía una solicitud HEAD y descarta el cuerpo. Esto aísla la latencia de red y servidor de la transferencia. Compará los tiempos de HEAD vs GET para la misma URL.

4. **Usar `-o /dev/null` (o `-o $null` en PowerShell) para descartar el cuerpo.** Así evitás que la escritura del cuerpo afecte la medición de tiempo. En Bash: `curl -o /dev/null -w "..." https://...`. En PowerShell: `curl -o $null -w "..." https://...` (el curl nativo de Windows también usa `-o`).

5. **Script automatizado.** Escribí un script (Bash o PowerShell) que ejecute las 5 mediciones y genere el archivo `diagnostico-web.md` automáticamente. El script debe:
   - Ejecutar `curl -w` con formato de timing.
   - Ejecutar `dig` o `nslookup`.
   - Ejecutar `time` o `Measure-Command` con `curl`.
   - Parsear las salidas y generar la tabla de tiempos.
   - Escribir el archivo Markdown con los resultados.

## Solución

### Comando principal: `curl -w` con todas las variables de timing

En Bash (macOS, Linux, WSL):

```bash
time curl -v -o /dev/null -w "\n\n=== TIMING ===\ntime_namelookup: %{time_namelookup}s\ntime_connect: %{time_connect}s\ntime_appconnect: %{time_appconnect}s\ntime_starttransfer: %{time_starttransfer}s\ntime_total: %{time_total}s\n" https://httpbin.org/anything
```

En PowerShell (Windows con curl nativo o con `curl.exe` para evitar el alias de `Invoke-WebRequest`):

```powershell
Measure-Command { curl.exe -v -o NUL -w "`n`n=== TIMING ===`ntime_namelookup: %{time_namelookup}s`ntime_connect: %{time_connect}s`ntime_appconnect: %{time_appconnect}s`ntime_starttransfer: %{time_starttransfer}s`ntime_total: %{time_total}s`n" https://httpbin.org/anything }
```

O usando `Invoke-WebRequest` para medir tiempo total (sin desglose por etapa):

```powershell
Measure-Command { Invoke-WebRequest -Uri "https://httpbin.org/anything" -Method Get }
```

### Explicación de cada etapa de timing

| Variable curl | Etapa | Qué mide |
|--------------|-------|----------|
| `time_namelookup` | DNS | Tiempo de resolución DNS: desde que curl inicia hasta que obtiene la dirección IP. |
| `time_connect` | TCP | Tiempo hasta que se establece la conexión TCP (incluye DNS si no está cacheado). |
| `time_appconnect` | TLS | Tiempo hasta que se completa el handshake TLS/SSL. Solo presente con HTTPS. |
| `time_starttransfer` | TTFB | Tiempo hasta que curl comienza a recibir el primer byte de la respuesta (incluye todo lo anterior). |
| `time_total` | Total | Tiempo total de la operación completa, hasta el último byte recibido. |

Para calcular tiempos puros por etapa:

- **Solo DNS**: `time_namelookup`
- **Solo TCP**: `time_connect - time_namelookup`
- **Solo TLS**: `time_appconnect - time_connect`
- **Procesamiento del servidor**: `time_starttransfer - time_appconnect`
- **Transferencia del cuerpo**: `time_total - time_starttransfer`

### Resolución DNS manual

En Bash:

```bash
dig httpbin.org
```

En PowerShell (Windows):

```powershell
nslookup httpbin.org
```

O en Bash:

```bash
nslookup httpbin.org
```

La salida de `dig` incluye el tiempo de resolución (`Query time: X msec`) y qué servidor DNS respondió (`SERVER:`). Si el tiempo de query es alto, el problema puede estar en el resolver local configurado.

### Diagnóstico de ejemplo

Ejecutando los comandos anteriores, una salida típica de `curl -w` podría verse así:

```
=== TIMING ===
time_namelookup: 0.045s
time_connect: 0.112s
time_appconnect: 0.208s
time_starttransfer: 0.415s
time_total: 0.421s
```

Cálculos por etapa:

| Etapa | Tiempo | Porcentaje del total |
|-------|--------|---------------------|
| DNS | 45ms | 10.7% |
| TCP | 67ms | 15.9% |
| TLS | 96ms | 22.8% |
| Servidor (TTFB - appconnect) | 207ms | 49.2% |
| Transferencia | 6ms | 1.4% |
| **Total** | **421ms** | **100%** |

**Diagnóstico**: el cuello de botella está en el servidor: 207ms (49.2% del tiempo total) se fueron en procesar la solicitud antes de devolver el primer byte. DNS, TCP y TLS están dentro de rangos normales para una conexión a un servidor externo.

**Recomendación**: optimizar el endpoint del servidor. Las causas posibles incluyen: consultas lentas a base de datos, middleware pesado, falta de caché, o un servidor bajo recursos (CPU/memoria). La transferencia del cuerpo (6ms) es casi instantánea, lo que descarta problemas de ancho de banda.

Si el cuello de botella hubiera sido DNS (ej: 350ms), la recomendación sería cambiar a un resolver DNS más rápido como Cloudflare (1.1.1.1) o Google (8.8.8.8). Si hubiera sido TLS (ej: 400ms), la recomendación sería verificar si el servidor soporta TLS 1.3 y OCSP stapling.

### Nota sobre mediciones en Windows

En Windows, `curl` puede ser un alias de `Invoke-WebRequest`, no el curl nativo. Para usar el curl nativo, ejecutá `curl.exe` en lugar de `curl`. Para verificar: `Get-Command curl` muestra si es un alias o el ejecutable.

`Invoke-WebRequest` no expone tiempos por etapa como curl. Si necesitás el desglose, instalá curl (incluido en Windows 10/11 como `curl.exe`) o usá WSL con Bash.

## Fuentes

- `man curl`, `curl --help`, `curl --version` (verificado en curl 8.x).
- Documentación de curl: sección `--write-out` con variables de timing (`time_namelookup`, `time_connect`, `time_appconnect`, `time_starttransfer`, `time_total`).
- Documentación pública de HTTPbin: `https://httpbin.org/anything`.
- Módulo `01-fundamentos-tecnologicos/02-la-terminal.md` del manual Gentle-AI: comandos básicos de terminal, pipes, redirección.
- Módulo `15-terminal/01-terminal-avanzada.md` del manual Gentle-AI: medición de tiempo, herramientas de red, diagnóstico.
- `gentle-command-catalog.yml`: catálogo de comandos del ecosistema Gentle (verificado en v2.2.0).
- Servidores DNS públicos de referencia: Cloudflare (1.1.1.1), Google (8.8.8.8), Quad9 (9.9.9.9).
- Fecha de verificación de timing de ejemplo: 2026-07-30.
- Estado de fuentes externas: las URLs de httpbin.org y los comandos curl son componentes estándar de la web; los comandos se verifican contra la documentación oficial de curl.
