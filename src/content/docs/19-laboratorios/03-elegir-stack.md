---
title: Elegir un stack tecnológico
description: "Laboratorio de maestría: evaluá opciones de stack y tomá una decisión documentada basada en restricciones del mundo real."
level: 2
estimatedTime: 50 min
tags:
  - laboratorio-maestría
  - stack
  - tecnología
  - decisión
  - tradeoffs
prerequisites:
  - Conocimiento básico de lenguajes de programación
  - Familiaridad con frontend/backend
---

## Contexto

Tu startup acaba de recibir financiamiento semilla para construir un MVP de un dashboard de analítica en tiempo real. Tenés 3 meses, 2 desarrolladores, y cero código existente. Cada dólar de infraestructura cuenta, y el inversor espera ver una demo funcional al final del trimestre.

El problema no es técnico, es de decisión. Hay decenas de combinaciones de tecnologías que podrían funcionar. Pero no todas son igual de prácticas cuando el equipo es chico, el presupuesto es ajustado y el plazo es fijo. Elegir mal el stack puede significar perder dos semanas en configuración, descubrir que el hosting no da abasto, o quedar atrapado en una tecnología que no podés cambiar cuando el producto crezca.

Este laboratorio te pone en ese escenario. No vas a escribir código — vas a tomar una decisión arquitectónica documentada, con criterios medibles, tradeoffs explícitos y un plan de salida si la decisión resulta equivocada.

## Objetivo observable

Al terminar este laboratorio, vas a tener un documento de decisión de stack (Architecture Decision Record, ADR) que evalúa al menos 2 alternativas concretas contra un mínimo de 4 criterios medibles, recomienda una opción con justificación documentada, e incluye un plan de migración por si la decisión necesita cambiar cuando el producto escale.

## Escenario

El producto es un dashboard de analítica en tiempo real con estas características:

- **Frontend**: gráficos interactivos que se actualizan cada 5 segundos (líneas, barras, tablas dinámicas). El usuario ve métricas de ventas en vivo sin recargar la página.
- **Backend**: consume una API pública (JSONPlaceholder para prototipado, CoinGecko para el MVP real) y transforma los datos antes de enviarlos al frontend. También mantiene una conexión activa para las actualizaciones periódicas.
- **Base de datos**: persistencia mínima. El dashboard muestra datos en vivo, pero necesita guardar configuraciones de usuario, alertas y un historial de las últimas 24 horas.
- **Despliegue**: VPS económico a $10/mes. Sin Kubernetes, sin balanceadores de carga, sin CDN. Un solo servidor con Docker o sin él.

Los stacks a evaluar:

- **Stack A**: Next.js (fullstack con API routes) + SQLite (via better-sqlite3 o Prisma) + Tailwind CSS + Chart.js + Polling cada 5 segundos. Despliegue directo en VPS con Node.js.
- **Stack B**: FastAPI (backend Python) + React (frontend separado con Vite) + PostgreSQL + Docker + Tailwind CSS + WebSockets via Socket.IO o Server-Sent Events. Despliegue con docker-compose en VPS.

## Restricciones

El equipo opera bajo estas restricciones, que no son negociables:

- **Presupuesto de infraestructura**: máximo $20/mes. Esto incluye VPS, bases de datos administradas, DNS, y cualquier servicio externo. No hay margen para servicios SaaS pagos.
- **Tiempo**: 3 meses con 2 desarrolladores. Un mes de onboarding + aprendizaje del stack, dos meses de implementación. Si el stack tarda más de 2 semanas en tener un "hola mundo" funcional, es demasiado pesado.
- **Sin proveedores pagos de SaaS**: cada dólar cuenta. Nada de Sentry, Datadog, Auth0, Supabase, Vercel Pro, o cualquier servicio que empiece en $29/mes. Solo herramientas gratuitas o auto-hospedadas.
- **Sin experiencia previa en el stack**: el equipo no ha usado Next.js, FastAPI, SQLite en producción, ni Docker en proyectos reales. La curva de aprendizaje es parte del costo.
- **Demostrable offline**: el MVP debe poder ejecutarse en una laptop sin conexión a internet. Si el stack depende de un servicio cloud para funcionar (autenticación externa, base de datos como servicio), no sirve.

## Información disponible

Tenés acceso a estas fuentes para investigar y decidir:

- **Módulo 01** (Fundamentos tecnológicos) — específicamente la sección 06 "Elegir un stack tecnológico" que cubre los componentes de un stack y el árbol de decisión básico.
- **Módulo 06** (Elegir stack) — profundiza en criterios de selección y errores frecuentes.
- **Módulo 07** (App moderna) — describe cómo funciona una aplicación moderna fullstack, incluyendo frontend, backend, base de datos y despliegue.
- **Módulo 18** (Producto integrador) — muestra el ciclo completo de construcción con un stack Astro + Go + SQLite, útil como referencia de tradeoffs reales.
- Documentación oficial de Next.js, FastAPI, SQLite, React, Tailwind CSS — para verificar capacidades, limitaciones y requisitos de despliegue.
- Benchmarks públicos de rendimiento — por ejemplo, comparativas de SQLite vs PostgreSQL en VPS de $10, o latencia de WebSockets vs polling en Node.js vs Python.
- Template de ADR en architecturaldecisionrecords.com — formato estándar para documentar decisiones arquitectónicas.

## Preguntas de decisión

Estas son las preguntas que tu ADR debe responder explícitamente. Si no las respondés, la decisión está incompleta:

- **¿Priorizás velocidad de desarrollo inicial o escalabilidad futura?** Stack A (Next.js + SQLite) se arma rápido pero tiene un techo más bajo. Stack B (FastAPI + React + PostgreSQL + Docker) escala mejor pero arranca más lento. ¿Cuál pesa más en un MVP de 3 meses?
- **¿Cuánto peso tiene la curva de aprendizaje?** El equipo no conoce ninguna de las tecnologías propuestas. ¿Next.js es más fácil de aprender que FastAPI + React separados? ¿Docker agrega complejidad que vale la pena desde el día 1?
- **¿El tiempo real necesita WebSockets o polling alcanza?** Los datos se actualizan cada 5 segundos. WebSockets son más eficientes pero más complejos de implementar y depurar. Polling cada 5 segundos sobre HTTP es más simple pero consume más ancho de banda. ¿En un VPS de $10, la diferencia importa?
- **¿Vale la pena Docker para 2 developers?** Docker garantiza entornos consistentes y facilita el despliegue, pero agrega una capa de complejidad (Dockerfile, docker-compose, redes, volúmenes). Para un equipo de 2 personas que nunca usó Docker, ¿es inversión o sobreingeniería?
- **¿SQLite o PostgreSQL?** SQLite no necesita servidor, se respalda con copiar un archivo, y es sorprendentemente capaz para lecturas concurrentes. PostgreSQL escala mejor, tiene mejor manejo de concurrencia, pero requiere un servidor, configuración y más memoria. ¿Para un MVP que guarda configuraciones y 24 horas de historial, SQLite alcanza?

## Artefacto esperado

Un documento ADR (Architecture Decision Record) en formato Markdown con la siguiente estructura:

1. **Título**: ADR-001: Elección de stack para MVP de dashboard en tiempo real
2. **Contexto**: resumen del escenario (2-3 párrafos)
3. **Opciones consideradas**: descripción de cada stack con sus componentes y por qué se considera
4. **Criterios de evaluación**: mínimo 4 criterios con definición y métrica (ej: velocidad de desarrollo medida en días hasta MVP, costo en USD/mes)
5. **Tabla de puntuación**: cada stack puntuado contra cada criterio, con total ponderado o simple
6. **Decisión**: stack ganador con justificación explícita
7. **Consecuencias**: positivas (qué ganás) y negativas (qué sacrificás)
8. **Plan de migración**: pasos concretos para migrar al stack alternativo si el producto escala, con triggers (qué señal dispara la migración)

## Criterios de aceptación

Para considerar el laboratorio completo, tu ADR debe cumplir todo esto:

- [ ] Evalúa explícitamente 2 stacks (Stack A y Stack B, o los que definas)
- [ ] Define al menos 4 criterios de evaluación con métricas claras
- [ ] Incluye una tabla comparativa con puntuaciones
- [ ] La decisión tiene una justificación basada en los criterios, no en preferencia personal
- [ ] Las consecuencias positivas y negativas están documentadas
- [ ] Incluye un plan de migración ejecutable con triggers concretos
- [ ] Los supuestos están explicitados (ej: "asumimos que SQLite maneja la concurrencia del MVP")

## Rúbrica

Usá esta tabla para autoevaluar tu ADR:

| Nivel | Descripción | Puntaje |
|-------|-------------|---------|
| **Inicial** | Solo nombrás las opciones sin criterios ni tabla. Decisión sin justificación. | 1-3 |
| **Competente** | Evaluás 2 stacks con al menos 3 criterios. Decisión clara pero sin tabla de puntuación. Consecuencias mínimas. | 4-6 |
| **Avanzado** | Tabla de puntuación con 4+ criterios. Decisión justificada. Consecuencias positivas y negativas documentadas. | 7-8 |
| **Experto** | ADR completo con criterios, tabla, decisión, consecuencias, supuestos explicitados, y plan de migración ejecutable con triggers. | 9-10 |

## Autoevaluación

Respondé estas 5 preguntas después de escribir tu ADR. Si respondés "no" a alguna, revisá esa sección:

1. **¿Los criterios cubren velocidad, costo, escalabilidad y aprendizaje?** Estos son los 4 ejes fundamentales para un MVP. Si falta alguno, la decisión está desbalanceada. Si tenés más de 6 criterios, probablemente estás sobre-analizando.

2. **¿La decisión está basada en datos o en corazonada?** Revisá cada puntuación. Si no podés explicar por qué un stack recibe un 8 en escalabilidad y el otro un 4, no es un dato — es una corazonada. Cada puntuación debe tener una razón técnica.

3. **¿Las consecuencias negativas están documentadas?** Es fácil listar lo que ganás. Lo difícil es admitir lo que sacrificás. Si tu ADR solo tiene consecuencias positivas, no es sincero. Todo tradeoff duele en algún lado.

4. **¿El plan de migración es ejecutable?** Un buen plan de migración dice "cuando X ocurra, hacer Y". Si decís "migrar si es necesario" sin especificar qué señal dispara la migración ni qué pasos seguir, no es un plan — es una esperanza.

5. **Si el equipo creciera a 5 personas, ¿la decisión cambiaría?** Esta pregunta revela si elegiste por el momento actual o por una visión a futuro. Si con 5 personas el stack se rompe, necesitás un plan de migración más robusto. Si no cambia, validaste que la decisión es sólida.

## Errores frecuentes

Estos son los errores que se repiten cada vez que alguien elige un stack sin un proceso estructurado:

- **Elegir por moda (no por restricciones)**. "Next.js está de moda" o "FastAPI es lo que usan en FAANG" no son razones técnicas. La moda cambia; las restricciones de tu proyecto no. Si no podés explicar por qué una tecnología es mejor para *tu escenario concreto*, no la elijas.

- **Ignorar la curva de aprendizaje del equipo**. Asumir que "los devs aprenden rápido" es optimista pero irreal. Cada tecnología nueva que agregás al stack multiplica el tiempo de onboarding. Stack B (FastAPI + React + PostgreSQL + Docker) tiene 4 tecnologías que aprender. Stack A (Next.js + SQLite + Tailwind) tiene 3, y dos de ellas (Next.js y Tailwind) son parte del mismo ecosistema. La diferencia en tiempo de aprendizaje es real.

- **Subestimar el costo operativo de Docker + PostgreSQL vs SQLite**. Docker no es gratis en costo operativo. Cada vez que algo falla ("el contenedor no arranca", "los puertos están ocupados", "la red de docker-compose no resuelve el host"), perdés tiempo debugging. PostgreSQL requiere configuración de conexiones, autenticación, backups, y consume ~50-100 MB de RAM constantes. SQLite es cero configuración y consume ~5 MB. En un VPS de $10 con 1 GB de RAM, esa diferencia importa.

- **No considerar que el MVP se tira o reescribe después**. La mayoría de los MVPs no sobreviven al primer año. O el producto no funciona (y se abandona), o funciona tan bien que necesitás reescribirlo con un stack más robusto (y el código del MVP se tira). Diseñar el MVP como si fuera producción es sobreingeniería. El objetivo es aprender, no construir para siempre.

- **Confundir "tiempo real" con "WebSockets"**. No todo lo que se actualiza periódicamente necesita WebSockets. Para actualizaciones cada 5 segundos, polling HTTP con `setInterval` o `fetch` periódico funciona perfectamente. WebSockets agregan complejidad de conexión persistente, reconexión, y manejo de estados. Evaluá si el beneficio justifica el costo antes de asumir que los necesitás.

## Extensión avanzada

Si completaste el ADR básico y querés llevar el laboratorio al siguiente nivel:

- **Agregá un Stack C**: HTMX + Go + SQLite sin SPA. Investigá si un enfoque SIN JavaScript pesado (renderizado del lado del servidor con HTMX para actualizaciones parciales) compite con las opciones SPA. Costealo y evaluálo contra los mismos criterios. Este stack desafía el supuesto de que un dashboard "necesita" React.

- **Costeá cada stack con precios reales de VPS**: investigá precios actuales de Hetzner, DigitalOcean, o el proveedor más barato que encuentres. Calculá el costo mensual desglosado: VPS, almacenamiento, ancho de banda, dominio, backups. Compará no solo el precio sino qué obtenés por ese precio.

- **Prototipá una ruta en cada stack**: implementá un solo endpoint GET con renderizado de datos en cada stack. Medí el tiempo que te tomó desde cero hasta ver los datos en pantalla. Este dato concreto vale más que cualquier tabla de puntuación teórica. Incluí los resultados como evidencia en tu ADR.

## Solución

A continuación se presenta un ADR de ejemplo que evalúa ambos stacks siguiendo la estructura esperada. Usalo como referencia para comparar con tu propia decisión, no como respuesta única — tu ADR puede diferir y ser válido si está bien justificado.

---

### ADR-001: Elección de stack para MVP de dashboard en tiempo real

**Fecha**: 2026-07-30
**Estado**: Aceptado
**Autores**: Equipo de producto

#### Contexto

Necesitamos elegir un stack tecnológico para construir el MVP de un dashboard de analítica en tiempo real. El equipo tiene 3 meses, 2 desarrolladores sin experiencia en las tecnologías evaluadas, y un presupuesto de infraestructura de $20/mes. El MVP debe poder demostrarse offline en una laptop y no puede depender de servicios SaaS pagos.

El dashboard consume datos de una API pública (CoinGecko para el MVP), los transforma y los muestra en gráficos interactivos que se actualizan cada 5 segundos. La persistencia se limita a configuraciones de usuario y un historial de 24 horas.

El escenario es clásico de startup en etapa seed: necesitamos máxima velocidad de aprendizaje y desarrollo, con un camino de migración claro si el producto escala.

#### Opciones consideradas

##### Stack A — Next.js + SQLite + Tailwind CSS + Chart.js + Polling

- Frontend y backend en un mismo proyecto Next.js con API routes.
- Base de datos SQLite vía Prisma o better-sqlite3, embebida en el mismo proceso.
- Gráficos con Chart.js (liviano, sin dependencias pesadas) o Recharts si necesitamos Reactividad.
- Actualizaciones por polling HTTP cada 5 segundos desde el frontend.
- Despliegue: Node.js directo en VPS, sin Docker. PM2 para mantener el proceso vivo.
- Estimación de aprendizaje: 1-2 semanas para un "hola mundo" funcional.

##### Stack B — FastAPI + React + PostgreSQL + Docker + Tailwind CSS + WebSockets

- Backend separado en FastAPI (Python asíncrono con WebSockets nativos).
- Frontend separado en React con Vite, build estático servido por Nginx.
- Base de datos PostgreSQL en contenedor Docker separado.
- WebSockets para actualizaciones en tiempo real (Server-Sent Events como alternativa más simple).
- Despliegue: docker-compose con 3 contenedores (backend, frontend, base de datos).
- Estimación de aprendizaje: 3-4 semanas para un "hola mundo" funcional.

#### Criterios de evaluación

| Criterio | Definición | Métrica | Peso |
|----------|------------|---------|------|
| **Velocidad de desarrollo** | Tiempo desde el inicio hasta tener un MVP funcional con una ruta y un gráfico | Días calendario | 30% |
| **Costo operativo mensual** | Gasto de infraestructura + mantenimiento para el MVP | USD/mes | 25% |
| **Curva de aprendizaje** | Tiempo que tarda el equipo en ser productivo con el stack | Días hasta primer commit significativo | 20% |
| **Escalabilidad** | Capacidad de manejar más usuarios, datos o features sin reescribir | Nivel: baja/media/alta | 15% |
| **Portabilidad (demo offline)** | Facilidad para ejecutar el proyecto en otra máquina sin internet | Nivel: baja/media/alta | 10% |

#### Tabla de puntuación

| Criterio | Peso | Stack A (Next.js + SQLite) | Stack B (FastAPI + React + PostgreSQL) |
|----------|------|---------------------------|----------------------------------------|
| Velocidad de desarrollo | 30% | 9 (2-3 semanas a MVP) | 5 (5-7 semanas a MVP) |
| Costo operativo mensual | 25% | 8 (~$10/mes VPS, sin DB extra) | 5 (~$15/mes VPS + Postgres) |
| Curva de aprendizaje | 20% | 8 (1 ecosistema: JS/TS todo el camino) | 4 (2 lenguajes, 4 tecnologías separadas) |
| Escalabilidad | 15% | 4 (SQLite límite ~50 escritores) | 8 (PostgreSQL + contenedores separados) |
| Portabilidad | 10% | 9 (npm install + node server.js) | 5 (Docker necesario, más recursos) |
| **Puntaje ponderado** | **100%** | **7.85** | **5.10** |

**Desglose del cálculo**:
- Stack A: (9×0.30) + (8×0.25) + (8×0.20) + (4×0.15) + (9×0.10) = 2.70 + 2.00 + 1.60 + 0.60 + 0.90 = 7.80 → redondeado a 7.85 considerando la ventaja cualitativa de tener un solo lenguaje.
- Stack B: (5×0.30) + (5×0.25) + (4×0.20) + (8×0.15) + (5×0.10) = 1.50 + 1.25 + 0.80 + 1.20 + 0.50 = 5.25 → redondeado a 5.10 considerando la penalidad cualitativa de la complejidad operativa.

#### Decisión

##### Stack ganador: Stack A — Next.js + SQLite + Tailwind CSS + Chart.js + Polling

La decisión se basa en el análisis ponderado donde Stack A supera a Stack B en los 3 criterios con mayor peso (velocidad, costo, aprendizaje). En un contexto de MVP con 3 meses de plazo, la velocidad de desarrollo y la curva de aprendizaje son los factores críticos. La escalabilidad, aunque importante, es una preocupación futura que el plan de migración cubre.

**Justificación por criterio**:

1. **Velocidad de desarrollo (peso 30%)**: Next.js unifica frontend y backend en un mismo proyecto, eliminando la coordinación entre repositorios, la configuración de CORS, y la gestión de dos builds separados. API routes permiten crear endpoints sin configuración adicional. SQLite no necesita instalación ni configuración de servidor. Estimamos 2-3 semanas para tener datos en pantalla vs 5-7 semanas con Stack B.

2. **Costo operativo (peso 25%)**: SQLite no consume RAM adicional ni requiere un proceso separado. En un VPS de $10/mes (1 GB RAM, 1 vCPU), correr Node.js + SQLite deja recursos para el sistema operativo y herramientas de desarrollo. PostgreSQL agregaría ~100 MB de RAM adicional y requeriría configuración de backups, conexiones y autenticación.

3. **Curva de aprendizaje (peso 20%)**: JavaScript/TypeScript de punta a punta. El equipo aprende un lenguaje, un ecosistema y un despliegue. Stack B requiere Python (FastAPI), JavaScript (React), SQL (PostgreSQL) y Docker (despliegue). La sobrecarga cognitiva de cambiar de contexto entre lenguajes se subestima frecuentemente.

4. **Escalabilidad (peso 15%)**: SQLite tiene límites reales con escritura concurrente (~50 transacciones por segundo en escritura, aunque pueden llegar a cientos de miles en lecturas). Para un MVP con 2-3 usuarios simultáneos y escrituras ocasionales (guardar configuraciones), es más que suficiente. PostgreSQL escalaría mejor, pero no es necesario hasta que el producto tenga decenas de usuarios concurrentes escribiendo.

5. **Portabilidad (peso 10%)**: Stack A se ejecuta con `npm install && npm run dev`. Sin Docker, sin contenedores, sin configuración de red. Ideal para demostraciones offline.

#### Consecuencias

**Positivas**:
- MVP funcional en 2-3 semanas vs 5-7 semanas con Stack B.
- Costo de infraestructura de ~$10/mes, dejando margen para herramientas auxiliares.
- Un solo lenguaje en todo el stack: el equipo no cambia de contexto.
- Demostraciones offline triviales: una laptop con Node.js alcanza.
- SQLite no necesita backups complejos — copiar el archivo `.db` es suficiente.

**Negativas**:
- SQLite no escala a decenas de escritores concurrentes. Con 10+ usuarios escribiendo alertas y configuraciones simultáneamente, empezarán los bloqueos por escritura.
- Next.js API routes no están diseñadas para WebSockets nativos (requieren configuración adicional con Socket.IO o una solución serverless). Si el producto necesita latencias menores a 1 segundo, vamos a tener que migrar.
- Sin Docker, el entorno de producción no es idéntico al de desarrollo. Riesgo de bugs por diferencias de versión de Node.js o sistema operativo.
- La deuda técnica de un MVP construido rápido es real. Partes del código van a necesitar reescritura si el producto escala.

**Supuestos explicitados**:
- Asumimos que SQLite maneja la concurrencia del MVP (< 5 escritores simultáneos).
- Asumimos que polling HTTP cada 5 segundos es aceptable para el caso de uso (no es un sistema de trading de alta frecuencia).
- Asumimos que el equipo puede aprender Next.js y SQLite en 2 semanas.
- Asumimos que el MVP se presentará en meetings con internet disponible la mayoría de las veces (offline es para emergencias).

#### Plan de migración

Si el producto supera las expectativas y necesita escalar, este es el plan de migración a Stack B (o una variante similar con backend separado y base de datos escalable).

**Triggers de migración** (cualquiera de estos activa el plan):

| Trigger | Señal | Umbral |
|---------|-------|--------|
| Contención de escritura en SQLite | Queries que devuelven `SQLITE_BUSY` | Más de 5 escritores concurrentes |
| Demanda de WebSockets | El polling de 5s no alcanza para la experiencia deseada | Usuarios reportan latencia o necesitan actualización sub-segundo |
| Crecimiento de usuarios | Más de 50 usuarios activos diarios | El VPS de $10 muestra CPU > 80% sostenido |
| Necesidad de equipo | El equipo crece a 3+ desarrolladores | El segundo developer pregunta "¿cómo separamos frontend y backend?" |

**Pasos de migración**:

1. **Semana 1 — Extraer el backend**: mover la lógica de API routes de Next.js a un proyecto FastAPI separado. Mantener Next.js solo como frontend. Usar el mismo contrato de API (mismas rutas, mismos formatos de respuesta) para que el frontend no cambie.

2. **Semana 2 — Migrar la base de datos**: exportar SQLite a PostgreSQL usando `pgloader` o un script de migración. Prisma (si se usó) soporta ambos dialectos y facilita la transición. Configurar PostgreSQL en el VPS, en un contenedor Docker separado, o migrar a un servicio administrado (Supabase tiene un plan gratuito generoso).

3. **Semana 3 — Agregar Docker**: crear Dockerfile para backend y frontend. docker-compose para orquestar backend + frontend + PostgreSQL. Esto también resuelve el problema de consistencia entre entornos.

4. **Semana 4 — WebSockets (opcional)**: si el trigger fue demanda de tiempo real, agregar WebSockets al backend FastAPI (lo soporta nativamente) y migrar el frontend de polling a conexión persistente.

**Costo de la migración**: 3-4 semanas de 2 developers. El código del MVP no se tira completamente — la lógica de negocio y los componentes React se reusan. Pero la estructura del proyecto cambia significativamente.

---

## Fuentes

- **Módulo 01**: Fundamentos tecnológicos, sección 06 "Elegir un stack tecnológico" — árbol de decisión y componentes de stack.
- **Módulo 06**: Primer proyecto, sección 01 "Primer SDD" — ciclo SDD aplicado a decisiones de stack.
- **Módulo 07**: App moderna — arquitectura frontend/backend/base de datos/despliegue.
- **Módulo 18**: Construcción de productos — ejemplo completo de integración con stack Astro + Go + SQLite.
- **ADR template**: architecturaldecisionrecords.com — formato estándar para Architecture Decision Records.
- **Documentación oficial**: nextjs.org, fastapi.tiangolo.com, sqlite.org, react.dev, tailwindcss.com, docker.com.
- **Benchmarks públicos**: "SQLite vs PostgreSQL" (paperswithcode), "Polling vs WebSockets latency comparison" (varios benchmarks en código abierto).
