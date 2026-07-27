---
title: "Mapa de System Design"
description: "Agrupar los conceptos de system design por el problema que resuelven, conectando cada grupo con su lección correspondiente."
manual_contract: reference-v1
content_level:
  - beginner
  - operator
  - architect
estimated_minutes: 20
learning_outcome: "Agrupar los conceptos de system design por el problema que resuelven."
canonical_concepts:
  - system-design
  - dns
  - http
  - https
  - tcp-ip
  - proxy
  - cliente-servidor
  - frontend
  - backend
  - cdn
  - base-de-datos
  - cache
  - blob-storage
  - indice
  - escalabilidad
  - balanceador
  - latencia
  - throughput
  - cuello-de-botella
  - disponibilidad
  - resiliencia
  - fallo-unico
  - trade-off
  - cap-theorem
source_status: verified
---

# Mapa de System Design

## Qué aprenderás

System Design tiene decenas de conceptos que pueden abrumar. Este mapa los agrupa por el **problema que resuelven**. Usalo como referencia cuando leas otras lecciones o cuando necesites ubicar un concepto en contexto.

<!-- markdownlint-disable MD033 -->

## ¿Cómo viajan los datos?

Estos conceptos describen cómo se mueve la información entre el usuario y la aplicación.

| Concepto | Problema que resuelve | Lección relacionada |
|----------|----------------------|---------------------|
| **DNS** | Traducir nombres (ejemplo.com) a direcciones IP numéricas | [Aplicación moderna](/gentle-ai-manual/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/) |
| **HTTP** | Protocolo para que cliente y servidor intercambien mensajes | [Aplicación moderna](/gentle-ai-manual/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/) |
| **HTTPS** | Cifrar la comunicación HTTP para que nadie intercepte los datos | [Aplicación moderna](/gentle-ai-manual/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/) |
| **TCP/IP** | Protocolo base que fragmenta, envía y reensambla los datos en la red | [Aplicación moderna](/gentle-ai-manual/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/) |
| **API** | Contrato que define cómo dos programas se comunican | [Frontend y backend](/gentle-ai-manual/01-fundamentos-tecnologicos/04-frontend-backend/) |
| **Proxy / Reverse Proxy** | Intermediario que recibe solicitudes y las distribuye | [Aplicación moderna](/gentle-ai-manual/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/) |

## ¿Dónde vive cada cosa?

Estos conceptos definen qué parte del sistema es responsable de cada tarea.

| Concepto | Problema que resuelve | Lección relacionada |
|----------|----------------------|---------------------|
| **Cliente** | Ejecuta la interfaz que el usuario ve e interactúa | [Frontend y backend](/gentle-ai-manual/01-fundamentos-tecnologicos/04-frontend-backend/) |
| **Servidor** | Procesa solicitudes, ejecuta lógica y devuelve respuestas | [Frontend y backend](/gentle-ai-manual/01-fundamentos-tecnologicos/04-frontend-backend/) |
| **Frontend** | Código que corre en el cliente y gestiona la UI | [Frontend y backend](/gentle-ai-manual/01-fundamentos-tecnologicos/04-frontend-backend/) |
| **Backend** | Código que corre en el servidor y gestiona datos y lógica | [Frontend y backend](/gentle-ai-manual/01-fundamentos-tecnologicos/04-frontend-backend/) |
| **CDN** | Red de servidores distribuidos que entrega contenido estático cerca del usuario | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |

## ¿Dónde se guardan los datos?

Estos conceptos resuelven cómo almacenar información de forma permanente, rápida y organizada.

| Concepto | Problema que resuelve | Lección relacionada |
|----------|----------------------|---------------------|
| **Base de datos** | Guardar datos de forma estructurada y consultarlos eficientemente | [Bases de datos](/gentle-ai-manual/01-fundamentos-tecnologicos/05-bases-de-datos/) |
| **Caché** | Guardar copias temporales de datos para acelerar lecturas repetidas | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |
| **Blob storage** | Guardar archivos grandes (imágenes, videos, backups) | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |
| **Índice** | Acelerar búsquedas en una base de datos | [Bases de datos](/gentle-ai-manual/01-fundamentos-tecnologicos/05-bases-de-datos/) |

## ¿Cómo manejo más usuarios?

Cuando una aplicación crece, un solo servidor no alcanza. Estos conceptos describen cómo escalar.

| Concepto | Problema que resuelve | Lección relacionada |
|----------|----------------------|---------------------|
| **Escalabilidad vertical** | Agregar más recursos (CPU, RAM) a una máquina existente | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |
| **Escalabilidad horizontal** | Agregar más máquinas para distribuir la carga | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |
| **Balanceador de carga** | Distribuir solicitudes entre múltiples servidores | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |

## ¿Qué tan rápido responde?

La performance no es un solo número. Estos conceptos la descomponen.

| Concepto | Problema que resuelve | Lección relacionada |
|----------|----------------------|---------------------|
| **Latencia** | Medir cuánto tarda una solicitud individual en completarse | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |
| **Throughput** | Medir cuántas solicitudes puede procesar el sistema por unidad de tiempo | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |
| **Cuello de botella** | Identificar el componente más lento que limita el rendimiento total | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |

## ¿Qué pasa cuando falla?

Ningún sistema es perfecto. Estos conceptos describen cómo manejar fallos.

| Concepto | Problema que resuelve | Lección relacionada |
|----------|----------------------|---------------------|
| **Disponibilidad** | Garantizar que el sistema responda cuando se lo necesita | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |
| **Resiliencia** | Capacidad de seguir funcionando (quizás degradado) cuando algo falla | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |
| **Single point of failure** | Identificar el componente cuya caída detiene todo el sistema | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |
| **Redundancia** | Tener copias de componentes críticos para evitar el punto único de fallo | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |

## ¿Cómo decido?

El diseño de sistemas no es solo técnica: es tomar decisiones con información incompleta.

| Concepto | Problema que resuelve | Lección relacionada |
|----------|----------------------|---------------------|
| **Trade-off** | Evaluar qué gano y qué pierdo con cada decisión técnica | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |
| **Costo** | Cuantificar el impacto económico de cada capa del sistema | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |
| **CAP Theorem** | Entender que en sistemas distribuidos no se puede tener consistencia, disponibilidad y tolerancia a partición al mismo tiempo | [Datos, escala y resiliencia](/gentle-ai-manual/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/) |

<!-- markdownlint-enable MD033 -->

## Cómo usar este mapa

1. Cuando leas una lección nueva, ubicá sus conceptos en este mapa.
2. Cuando diseñes un sistema, recorré los problemas en orden: primero los datos viajan, luego dónde vive cada cosa, luego almacenamiento, luego escala, luego performance, luego fallo, luego decisión.
3. Cuando tengas un problema real, buscá el problema en la columna izquierda y leé los conceptos relacionados.

## Límites de esta referencia

- Este mapa agrupa conceptos por problema, no por profundidad técnica. Cada concepto tiene lecciones dedicadas con más detalle.
- No cubre patrones avanzados (microservicios, sharding, particionamiento, consenso distribuido). Son una etapa posterior.
- La clasificación es orientativa; algunos conceptos podrían estar en más de un grupo.

## Fuentes y alcance

- Fuente conceptual: The Gentleman Programming (2026) — Mapa de conceptos de System Design
- Fuente técnica primaria: documentación de protocolos HTTP, DNS, TLS y arquitecturas de referencia
- Fecha de verificación: 2026-07-22
- Alcance de la comprobación: clasificación pedagógica de conceptos fundamentales de System Design (no cubre implementaciones específicas)
