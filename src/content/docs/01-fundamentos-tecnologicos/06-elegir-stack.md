---
title: Elegir un stack tecnológico
description: Cómo decidir qué tecnologías usar para tu proyecto según el problema que querés resolver.
level: 1
estimatedTime: 20 min
tags:
  - stack
  - tecnologías
  - frontend
  - backend
  - base de datos
  - decisión
prerequisites:
  - Frontend y backend (01-04)
  - Bases de datos (01-05)
learningOutcomes:
  - Identificar los componentes de un stack tecnológico
  - Elegir tecnologías según el tipo de proyecto
  - Evitar errores frecuentes al armar un stack
---

# Elegir un stack tecnológico

## Respuesta simple

Un **stack** es la combinación de tecnologías que elegís para construir un producto. No existe un stack "mejor" — depende del problema que querés resolver.

## Componentes de un stack

| Componente | ¿Qué es? | Ejemplos |
|------------|----------|----------|
| **Frontend** | Lo que ve el usuario | HTML/CSS/JS, React, Vue, Astro |
| **Backend** | La lógica del servidor | Node.js, Python, Go |
| **Base de datos** | Donde se guarda la información | SQLite, PostgreSQL, MySQL |
| **Runtime** | Donde se ejecuta el código | Node.js, navegador, Python |
| **Framework** | Forma organizada de construir | Next.js, Express, Django |
| **Despliegue** | Dónde vive el producto | GitHub Pages, Vercel, VPS |

## Árbol de decisión

| Tipo de proyecto | Stack recomendado |
|------------------|-------------------|
| Sitio estático (blog, docs, landing) | Astro + GitHub Pages |
| App web interactiva | React/Vue + Node.js + PostgreSQL |
| API | Express (Node.js) o FastAPI (Python) |
| Automatización / scripts | Python o Node.js sin framework |
| Análisis de datos | Python + Pandas + Jupyter |
| App mobile | React Native o Flutter |
| App en tiempo real | Node.js + WebSocket + Redis |

## Ejemplo básico: sitio personal

```
Frontend: Astro (genera HTML estático)
Despliegue: GitHub Pages (gratuito)
Dominio: cualquiera (opcional)

No necesita backend ni base de datos.
```

Es el stack más simple posible. Sirve para blogs, portfolios, documentación.

## Ejemplo avanzado: app con autenticación

```
Frontend: React con Next.js
Backend: Node.js con Express
Base de datos: PostgreSQL
Autenticación: JWT + bcrypt
Despliegue: Vercel (frontend) + Railway (backend + DB)
```

Cada componente tiene una razón de ser:
- Next.js da SSR y routing sin configuración extra
- Express es minimalista y fácil de aprender
- PostgreSQL es confiable y escalable para apps
- Vercel + Railway evitan administrar servidores

## Errores frecuentes

1. **Elegir framework antes de entender el problema**. No necesitás React para un sitio de tres páginas. No necesitás PostgreSQL para una app que guarda cinco configuraciones.

2. **Sobreingeniería**. Agregar Redis, Docker, Kubernetes y microservicios desde el día uno cuando una base SQLite y un solo proceso alcanzan.

3. **Elegir por popularidad**. Que algo sea trending en Hacker News no significa que sea lo correcto para tu proyecto. Evaluá con criterio.

4. **Ignorar el despliegue**. Un stack genial que no podés poner en producción no sirve. Pensá en el deploy antes de empezar.

5. **Mezclar tecnologías sin motivo**. Usar Python para el backend, Go para un microservicio y Rust para otro cuando un solo lenguaje alcanza.

## Cómo el agente propone un stack

Cuando le pedís a un agente que construya algo, suele proponer un stack basado en:

1. El problema que describiste
2. Lo que es estándar en el ecosistema actual
3. Su sesgo de entrenamiento (lo que más vio en sus datos)

**Cómo validar su propuesta**:

- ¿Cada componente resuelve una necesidad concreta?
- ¿Podrías reemplazar algún componente por algo más simple?
- ¿Podés deployarlo sin volverte loco?
- ¿Lo entendería otro developer?

Si la respuesta a todas es sí, el stack es razonable.

## Preguntas

1. ¿Cuáles son los componentes principales de un stack tecnológico?
2. ¿Qué stack elegirías para un blog personal? ¿Y para una red social?
3. ¿Por qué es un error elegir framework antes de entender el problema?
4. ¿Cómo validás si el stack que te propone un agente es adecuado?

## Ejercicio

1. Pensá en un proyecto que te gustaría construir
2. Escribí los componentes que necesitaría (frontend, backend, DB, deploy)
3. Justificá cada elección en una línea
4. Preguntale a un agente qué stack recomendaría para ese proyecto
5. Comparamos ambas propuestas

## Fuentes verificadas

- Documentación: Conceptos de arquitectura de software
- Fecha: 2026-07-21
- Estado: 🔵 Verificado
