# Glosario — Gentle AI Mega Manual

> **Nivel**: Referencia
> **Versión**: 2026-07-20 (generado desde data/terminology/glossary.yml)

Cada término incluye su primera definición simple (Nivel 1) y una referencia a dónde se explica en profundidad.

---

## A

### Agente
**Simple**: Un programa que usa un modelo de IA, tiene instrucciones, puede usar herramientas y actúa por su cuenta para cumplir una tarea.
**Referencia**: `content/03-fundamentos-de-ia/`

### API
**Simple**: Un contrato que permite que dos programas se comuniquen entre sí.
**Referencia**: `content/01-fundamentos-tecnologicos/`

### Apply (sdd-apply)
**Simple**: Fase de SDD donde se escribe el código según las tareas planificadas.
**Referencia**: `content/08-sdd/`

---

## B

### Backend
**Simple**: La parte de una aplicación que corre en el servidor y gestiona datos, lógica de negocio y autenticación.
**Referencia**: `content/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/`

### Balanceador de carga
**Simple**: Componente que distribuye las solicitudes entrantes entre múltiples servidores para evitar sobrecargar uno solo.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### Base de datos
**Simple**: Un sistema que guarda datos de forma organizada y permite recuperarlos después.
**Referencia**: `content/01-fundamentos-tecnologicos/`

### Binario
**Simple**: Un archivo ejecutable compilado desde código fuente.
**Referencia**: `content/01-fundamentos-tecnologicos/`

### Blob storage
**Simple**: Almacenamiento para archivos binarios grandes (imágenes, videos, backups) accesibles por clave o URL, optimizado para escala masiva.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### Branch (rama)
**Simple**: Una línea independiente de desarrollo en Git.
**Referencia**: `content/02-git-y-github/`

---

## C

### Caché
**Simple**: Copia temporal de datos costosos o lentos de obtener. Acelera lecturas repetidas pero puede servir datos obsoletos.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### capture_prompt
**Simple**: Parámetro opcional de mem_save que desactiva la captura automática del prompt del usuario. Cuando es false, Engram no vincula el prompt actual a la observación guardada.
**Referencia**: `content/09-engram/03-arquitectura-engram/`

### CDN
**Simple**: Red de servidores distribuidos geográficamente que entregan contenido estático (imágenes, CSS, JS) desde el nodo más cercano al usuario.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### CLI (Command Line Interface)
**Simple**: Una interfaz de texto donde se escriben comandos.
**Referencia**: `content/15-terminal/`

### Cliente (contexto red)
**Simple**: El programa o dispositivo que inicia una solicitud a un servidor. Ej: navegador, app móvil.
**Referencia**: `content/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/`

### Codex
**Simple**: El CLI de OpenAI para desarrollo asistido por IA.
**Referencia**: `content/13-codex/`

### Commit
**Simple**: Un punto guardado en el historial de Git con un mensaje que describe el cambio.
**Referencia**: `content/02-git-y-github/`

### Compactación
**Simple**: Proceso de resumir el historial de una conversación cuando excede la ventana de contexto del modelo.
**Referencia**: `content/03-fundamentos-de-ia/`

### Context window
**Simple**: La cantidad máxima de tokens que un modelo puede procesar en una sola solicitud.
**Referencia**: `content/03-fundamentos-de-ia/`

### Costo
**Simple**: El impacto económico de cada decisión técnica, incluyendo infraestructura, operación, mantenimiento y deuda técnica.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### Cuello de botella
**Simple**: El componente más lento de un sistema que limita el rendimiento total.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

---

## D

### Dependencia
**Simple**: Una biblioteca o módulo externo que un proyecto necesita para funcionar.
**Referencia**: `content/01-fundamentos-tecnologicos/`

### Design (sdd-design)
**Simple**: Fase de SDD donde se define la arquitectura técnica de la solución.
**Referencia**: `content/08-sdd/`

### Diff
**Simple**: La diferencia entre dos versiones de un archivo o conjunto de archivos.
**Referencia**: `content/02-git-y-github/`

### Disponibilidad
**Simple**: El porcentaje de tiempo que un sistema está operativo y responde correctamente.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### DNS
**Simple**: Sistema que traduce nombres de dominio legibles (ejemplo.com) a direcciones IP numéricas. Significa Domain Name System.
**Referencia**: `content/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/`

---

## E

### Engram
**Simple**: Sistema de memoria persistente que guarda decisiones, descubrimientos y contexto entre sesiones.
**Referencia**: `content/09-engram/`

### engram doctor
**Simple**: Comando de diagnóstico read-only que verifica el estado de Engram sin modificarlo. Reporta versión, integridad del archivo SQLite, y estado del MCP server. Nunca usa --fix.
**Referencia**: `content/09-engram/04-inspeccionar-y-respaldar/`

### engram export
**Simple**: Respalda toda la base de memoria en un archivo JSON. Incluye sesiones, observaciones y prompts. Se restaura con engram import. No existe engram backup.
**Referencia**: `content/09-engram/04-inspeccionar-y-respaldar/`

### engram import
**Simple**: Restaura una base de memoria desde un archivo JSON generado con engram export. Reemplaza la base actual si se omite --merge. No existe engram restore.
**Referencia**: `content/09-engram/04-inspeccionar-y-respaldar/`

### engram sync
**Simple**: Sincroniza configuración del proyecto vía Git. Usa .engram/manifest.json y .engram/chunks/ para compartir ajustes entre máquinas. No sincroniza engram.db.
**Referencia**: `content/09-engram/03-arquitectura-engram/`

### Escalabilidad
**Simple**: La capacidad de un sistema para manejar más carga agregando recursos (vertical) o más máquinas (horizontal).
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### Explore (sdd-explore)
**Simple**: Fase de SDD para investigar ideas antes de comprometerse a un cambio.
**Referencia**: `content/08-sdd/`

---

## F

### Fallback
**Simple**: Un modelo o estrategia de respaldo que se usa cuando el principal falla.
**Referencia**: `content/14-modelos-y-enrutamiento/`

### Frontend
**Simple**: La parte de una aplicación que corre en el cliente (navegador o app) y gestiona la interfaz de usuario.
**Referencia**: `content/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/`

### Frontmatter
**Simple**: Bloque de metadatos al inicio de un archivo Markdown, entre '---'.
**Referencia**: `content/10-skills/`

### FTS5 (Full-Text Search 5)
**Simple**: Motor de búsqueda de texto completo integrado en SQLite.
**Referencia**: `content/16-arquitectura-tecnica/`

---

## G

### GGA (Gentleman Guardian Angel)
**Simple**: Sistema de hooks de Git que ejecuta revisiones automáticas antes de commits y push.
**Referencia**: `content/11-calidad-y-revision/`

### Git
**Simple**: Sistema de control de versiones distribuido.
**Referencia**: `content/02-git-y-github/`

### GitHub
**Simple**: Plataforma web para alojar repositorios Git y colaborar en código.
**Referencia**: `content/02-git-y-github/`

---

## H

### Hook (Git)
**Simple**: Un script que Git ejecuta automáticamente en respuesta a eventos como commit o push.
**Referencia**: `content/02-git-y-github/`

### HTTP (HyperText Transfer Protocol)
**Simple**: Protocolo de comunicación usado por navegadores y servidores web.
**Referencia**: `content/01-fundamentos-tecnologicos/`

### HTTPS
**Simple**: Protocolo HTTP sobre una capa de cifrado TLS que garantiza confidencialidad, integridad y autenticación. Significa HTTP + TLS.
**Referencia**: `content/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/`

---

## Í

### Índice
**Simple**: Estructura de datos que acelera las búsquedas en una base de datos evitando escanear toda la tabla.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

---

## I

### Init (sdd-init)
**Simple**: Comando que inicializa el contexto SDD para un proyecto.
**Referencia**: `content/08-sdd/`

---

## J

### Judgment Day
**Simple**: Protocolo de revisión de código con dos jueces independientes que evalúan el mismo cambio sin comunicarse entre sí.
**Referencia**: `content/11-calidad-y-revision/`

---

## L

### Latencia
**Simple**: El tiempo que tarda una solicitud individual en completarse, generalmente medido en milisegundos.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### Lens (lente de revisión)
**Simple**: Una perspectiva especializada de revisión de código (riesgo, legibilidad, confiabilidad, resiliencia).
**Referencia**: `content/11-calidad-y-revision/`

### Linaje
**Simple**: Cadena de identidad criptográfica que conecta revisiones, correcciones y recibos.
**Referencia**: `content/11-calidad-y-revision/`

---

## M

### MCP (Model Context Protocol)
**Simple**: Protocolo estándar para que agentes de IA se conecten a herramientas y fuentes de datos externas.
**Referencia**: `content/03-fundamentos-de-ia/`

### mem_context
**Simple**: Función de Engram que recupera el historial reciente de sesiones de un proyecto. Acepta filtros por project y scope. Es el primer paso al iniciar una sesión para retomar contexto.
**Referencia**: `content/09-engram/01-que-es-engram/`

### mem_get_observation
**Simple**: Función de Engram que recupera el contenido completo de una observación por su ID numérico. Usada cuando un resultado de mem_search está truncado y se necesita el texto completo.
**Referencia**: `content/09-engram/02-memoria-y-mcp/`

### mem_save
**Simple**: Función principal de Engram para guardar una observación. Parámetros: title (obligatorio), type (decision|bugfix|discovery|pattern|preference|config), scope (project|personal), topic_key (para upserts), capture_prompt (true por defecto). El agente la invoca automáticamente.
**Referencia**: `content/09-engram/02-memoria-y-mcp/`

### mem_search
**Simple**: Función de Engram que busca observaciones usando FTS5 con BM25. Acepta filtros por query (obligatorio), type, project, scope. Los resultados incluyen fragmentos truncados que se expanden con mem_get_observation.
**Referencia**: `content/09-engram/02-memoria-y-mcp/`

### mem_session_summary
**Simple**: Función de Engram que guarda un resumen estructurado al cerrar una sesión. Campos: goal, instructions, discoveries, accomplishments, nextSteps, relevantFiles. Es obligatorio llamarla antes de finalizar una sesión.
**Referencia**: `content/09-engram/01-que-es-engram/`

### Modelo (de IA)
**Simple**: Un sistema entrenado para procesar instrucciones y generar respuestas.
**Referencia**: `content/03-fundamentos-de-ia/`

---

## N

### Native Bounded Review
**Simple**: Sistema determinístico de revisión de código con presupuesto, linaje y recibo verificable.
**Referencia**: `content/11-calidad-y-revision/`

---

## O

### OpenCode
**Simple**: Entorno de desarrollo con agentes de IA, extensible con MCP, skills y plugins.
**Referencia**: `content/12-opencode/`

### OpenSpec
**Simple**: Formato de archivos para artefactos SDD (propuesta, especificación, diseño, tareas).
**Referencia**: `content/08-sdd/`

### Orquestador
**Simple**: Un agente especial que distribuye trabajo a otros agentes y controla el flujo.
**Referencia**: `content/03-fundamentos-de-ia/`

---

## P

### Persona
**Simple**: Una personalidad predefinida que el orquestador adopta al responder al usuario.
**Referencia**: `content/07-gentle-ai/`

### Plugin
**Simple**: Extensión de código que agrega funcionalidad a OpenCode o Codex.
**Referencia**: `content/12-opencode/`

### PR (Pull Request)
**Simple**: Una solicitud para fusionar cambios de una rama a otra en GitHub.
**Referencia**: `content/02-git-y-github/`

### Prompt
**Simple**: El texto de instrucción que se envía al modelo de IA.
**Referencia**: `content/03-fundamentos-de-ia/`

### Proposal (sdd-propose)
**Simple**: Fase de SDD donde se define el alcance, objetivo y enfoque de un cambio.
**Referencia**: `content/08-sdd/`

### Proveedor
**Simple**: La empresa o servicio que ofrece acceso a modelos de IA (OpenAI, Google, Anthropic).
**Referencia**: `content/03-fundamentos-de-ia/`

### Proxy / Reverse Proxy
**Simple**: Un intermediario entre el cliente y el servidor: el forward proxy oculta al cliente, el reverse proxy oculta al servidor y distribuye tráfico.
**Referencia**: `content/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/`

---

## R

### Razonamiento
**Simple**: Control de cuánto 'piensa' un modelo antes de responder.
**Referencia**: `content/14-modelos-y-enrutamiento/`

### Receipt (recibo)
**Simple**: Registro verificable de que una revisión de código se completó para un conjunto específico de cambios.
**Referencia**: `content/11-calidad-y-revision/`

### Redundancia
**Simple**: Tener copias de componentes críticos para que el sistema siga funcionando si uno falla.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### Resiliencia
**Simple**: La capacidad de un sistema de seguir funcionando (quizás degradado) cuando uno o más componentes fallan.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### Review
**Simple**: Proceso de examinar código para encontrar errores, riesgos o mejoras.
**Referencia**: `content/11-calidad-y-revision/`

### Runtime
**Simple**: El entorno donde se ejecuta un programa (Node.js, Go, navegador).
**Referencia**: `content/01-fundamentos-tecnologicos/`

---

## S

### SDD (Spec-Driven Development)
**Simple**: Metodología de desarrollo donde se planifica y especifica antes de implementar.
**Referencia**: `content/08-sdd/`

### Servidor (contexto red)
**Simple**: La computadora o programa que recibe solicitudes de clientes, las procesa y devuelve respuestas.
**Referencia**: `content/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/`

### Shell
**Simple**: El programa que interpreta comandos en la terminal (PowerShell, Bash, Zsh).
**Referencia**: `content/15-terminal/`

### Single point of failure
**Simple**: Un componente cuya caída detiene todo el sistema, por ser el único capaz de cumplir esa función.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### Skill
**Simple**: Un archivo de conocimiento especializado que se carga cuando el contexto coincide.
**Referencia**: `content/10-skills/`

### Spec (sdd-spec)
**Simple**: Fase de SDD donde se escriben los requisitos detallados y escenarios.
**Referencia**: `content/08-sdd/`

### SQL (Structured Query Language)
**Simple**: Lenguaje para consultar y manipular bases de datos relacionales.
**Referencia**: `content/01-fundamentos-tecnologicos/`

### SQLite
**Simple**: Base de datos liviana que guarda todo en un solo archivo, sin servidor.
**Referencia**: `content/01-fundamentos-tecnologicos/`

### Staging (Git)
**Simple**: Área intermedia donde se preparan los archivos antes de hacer commit.
**Referencia**: `content/02-git-y-github/`

### Subagente
**Simple**: Un agente especializado, con instrucciones y herramientas limitadas, que recibe tareas del orquestador.
**Referencia**: `content/03-fundamentos-de-ia/`

### System Design
**Simple**: La disciplina de diseñar la arquitectura de un sistema: qué componentes tiene, cómo se comunican, cómo escalan y cómo manejan fallos.
**Referencia**: `content/16-arquitectura-tecnica/03-mapa-de-system-design/`

### System prompt
**Simple**: Las instrucciones base que definen cómo debe comportarse un agente.
**Referencia**: `content/03-fundamentos-de-ia/`

---

## T

### Tasks (sdd-tasks)
**Simple**: Fase de SDD donde se desglosa la implementación en tareas concretas.
**Referencia**: `content/08-sdd/`

### TCP/IP
**Simple**: El conjunto de protocolos que define cómo los datos se fragmentan, envían y reensamblan a través de una red.
**Referencia**: `content/01-fundamentos-tecnologicos/07-como-funciona-una-aplicacion-moderna/`

### TDD (Test-Driven Development)
**Simple**: Metodología donde se escribe el test antes del código.
**Referencia**: `content/08-sdd/`

### Teorema CAP
**Simple**: En sistemas distribuidos no se pueden garantizar simultáneamente consistencia fuerte, disponibilidad total y tolerancia a partición de red.
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### Throughput / capacidad
**Simple**: La cantidad de solicitudes que un sistema puede procesar por unidad de tiempo (ej: requests por segundo).
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### Token
**Simple**: La unidad mínima de texto que un modelo de IA procesa (aproximadamente ¾ de palabra en inglés).
**Referencia**: `content/03-fundamentos-de-ia/`

### Tool calling
**Simple**: Capacidad de un modelo de solicitar ejecutar una herramienta externa.
**Referencia**: `content/03-fundamentos-de-ia/`

### topic_key
**Simple**: Clave estable para upserts en Engram. Cuando se usa el mismo topic_key en mem_save, Engram actualiza la observación existente en lugar de crear una nueva. Útil para temas evolutivos como architecture/database-choice.
**Referencia**: `content/09-engram/02-memoria-y-mcp/`

### Trade-off
**Simple**: La decisión de sacrificar un atributo (ej: consistencia) para ganar otro (ej: disponibilidad).
**Referencia**: `content/16-arquitectura-tecnica/04-datos-escala-y-resiliencia/`

### TUI (Text User Interface)
**Simple**: Interfaz de usuario basada en texto con elementos visuales como paneles y menús.
**Referencia**: `content/15-terminal/`

---

## V

### Verify (sdd-verify)
**Simple**: Fase de SDD donde se comprueba que la implementación cumple las especificaciones.
**Referencia**: `content/08-sdd/`

---

## W

### Worktree (Git)
**Simple**: Una copia de trabajo adicional de un repositorio Git, útil para trabajar en múltiples ramas simultáneamente.
**Referencia**: `content/02-git-y-github/`

