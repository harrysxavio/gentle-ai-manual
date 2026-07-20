---
title: Crear tus propios skills
description: Cómo escribir un SKILL.md con frontmatter, triggers, reglas y ejemplos. Dónde guardarlo, cómo probarlo y mejores prácticas.
level: 2
estimatedTime: 25 min
tags:
  - skills
  - crear-skills
  - skill-md
  - frontmatter
  - triggers
prerequisites:
  - Skills — Conocimiento especializado (10-01)
verifiedVersion: "Gentleman-Skills commit c8036a37"
learningOutcomes:
  - Escribir un SKILL.md completo con frontmatter YAML válido
  - Diseñar triggers que activen el skill en el contexto correcto
  - Redactar reglas efectivas (obligatorias, recomendadas, prohibidas)
  - Decidir dónde guardar un skill (global vs proyecto)
  - Probar y depurar un skill
  - Aplicar el principio de responsabilidad única a cada skill
---

# Crear tus propios skills

## Qué aprenderás

El capítulo anterior explicó **qué son los skills** y cómo se instalan. Este capítulo es práctico: vas a crear tu propio `SKILL.md` desde cero, escribir triggers efectivos, redactar reglas que el agente entienda, probarlo, y evitar los errores más comunes.

## Por qué importa

Los skills preinstalados cubren tecnologías populares (React, Next.js, Angular...), pero tu proyecto tiene **convenciones únicas**: cómo nombramos los archivos, qué patrón de testing usamos, cómo estructuramos los componentes, qué está prohibido. Si no creás un skill para esas convenciones, el asistente las va a ignorar.

Además, crear un skill es la forma más eficiente de **capturar conocimiento del equipo**: una vez que está en el skill, todos los asistentes de todos los desarrolladores aplican las mismas reglas.

## Visión simple

Un skill es un archivo `SKILL.md` con dos partes:

1. **Frontmatter** (metadatos): quién, qué, cuándo se activa
2. **Contenido** (instrucciones): qué debe hacer el agente, ejemplos, anti-ejemplos

Cuando el contexto coincide con el trigger del skill, el agente **inyecta el contenido del skill en su prompt** como si fuera una instrucción adicional. Es como darle un manual de instrucciones justo antes de que empiece a trabajar.

## Analogía

Imaginá que contratás a un chef para que cocine en tu cocina. El chef sabe cocinar en general, pero no sabe **tus reglas**: que los cuchillos van en el bloque magnético, que la tabla verde es para verduras y la roja para carne, que no usás aceite de oliva para freír.

Un skill es una **tarjeta de instrucciones** que le das al chef antes de que empiece. Cuando ve que va a cortar verduras, leé la tarjeta: "tabla verde para verduras, cuchillo de chef, no uses el pelador para todo". El chef ya sabe cocinar — el skill le dice cómo hacerlo **en tu cocina**.

## Cómo funciona realmente

### Anatomía de un SKILL.md

```markdown
---
name: mi-skill
description: >
  Descripción clara de qué hace este skill.
  Trigger: cuándo debe cargarse automáticamente.
metadata:
  author: tu-usuario
  version: "1.0"
  updated: "2026-07-20"
---

# Mi Skill

## Critical Patterns

- REQUIRED: Regla obligatoria que el agente DEBE seguir
- REQUIRED: Otra regla obligatoria
- RECOMMENDED: Regla que debería seguirse si aplica

## Code Examples

```typescript
// Buen ejemplo
function sum(a: number, b: number): number {
  return a + b;
}
```

## Anti-Patterns

- NO uses X en este proyecto
- NO importes de Y directamente

## Resources

- Documentación oficial: https://...
```
```

### Frontmatter YAML

El **frontmatter** es un bloque YAML entre `---` al inicio del archivo. Contiene los metadatos que el agente usa para decidir si cargar el skill.

| Campo | Requerido | Descripción | Ejemplo |
|-------|-----------|-------------|---------|
| `name` | ✅ Sí | Identificador único del skill. Minúsculas, guiones. | `react-19` |
| `description` | ✅ Sí | Descripción de qué hace. **Debe contener "Trigger:"** para activación automática. | Ver abajo |
| `metadata.author` | Recomendado | Usuario de GitHub o nombre del creador | `gentleman-programming` |
| `metadata.version` | Recomendado | Versión semántica | `1.0` |
| `metadata.updated` | Recomendado | Fecha de última actualización | `2026-07-20` |

#### El campo description y el Trigger

El **trigger** es la parte más importante del frontmatter. Define **cuándo** el agente debe cargar el skill. Sin un trigger bien escrito, el skill nunca se activa.

El trigger debe estar dentro del campo `description`, después de la palabra **"Trigger:"**:

```yaml
description: >
  Reglas y convenciones para componentes React con Server Components.
  Trigger: cuando edites archivos .tsx o .jsx, o cuando el usuario
  mencione "componente React" o "Server Component".
  También: extensión de archivo .tsx, contexto JSX/TSX.
```

#### Tipos de trigger

| Tipo de trigger | Ejemplo | ¿Cuándo se activa? |
|-----------------|---------|-------------------|
| **Extensión de archivo** | `Trigger: archivos .tsx` | Cuando abrís/editás un `.tsx` |
| **Patrón de ruta** | `Trigger: rutas src/components/` | Cuando trabajás en esa carpeta |
| **Contexto de tarea** | `Trigger: tarea de testing` | Cuando el usuario pide escribir tests |
| **Tecnología** | `Trigger: React 19, JSX` | Cuando detecta JSX en el contexto |
| **Palabra clave** | `Trigger: "migración", "refactor"` | Cuando el usuario usa esas palabras |

**Regla**: cuantos más triggers específicos, mejor. Un trigger demasiado genérico ("Trigger: código") hace que el skill se cargue siempre, saturando el prompt.

### Cómo escribir reglas efectivas

Las reglas son el **contenido real** del skill. Deben ser accionables, específicas y verificables.

#### Formato de reglas

```markdown
## Critical Patterns

- REQUIRED: Usá `ref` como prop en lugar de `forwardRef`.
  React 19 elimina forwardRef.
- REQUIRED: Los tests unitarios van en `__tests__/` con sufijo `.spec.ts`.
- RECOMMENDED: Preferí `await` sobre `.then()`.
  Mejora legibilidad y stack traces.
- AVOID: No uses `useMemo` ni `useCallback`.
  React Compiler maneja la memoización automáticamente.
```

| Prefijo | Significado | ¿Qué hace el agente? |
|---------|-------------|---------------------|
| `REQUIRED:` | Regla obligatoria | Debe cumplirse siempre. Si no, el agente corrige. |
| `RECOMMENDED:` | Regla recomendada | Se aplica si no hay razón para no hacerlo. |
| `AVOID:` | Prohibición | El agente debe evitar este patrón. |
| `NOTE:` | Información contextual | El agente la considera pero no es regla. |

#### Cómo escribir ejemplos

Los ejemplos son **código real** que el agente puede imitar. Un buen ejemplo:

```markdown
## Code Examples

### Bien

```typescript
// Componente Server Component en React 19
async function UserList() {
  const users = await db.users.findAll();
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Mal (sin Server Components)

```typescript
// ❌ Este patrón es innecesario con React 19
function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch('/api/users').then(setUsers);
  }, []);
  // ...
}
```
```
```

#### Reglas para escribir buenas reglas

1. **Una regla = un concepto**: no mezclés "usar async y tests en `__tests__/`" en la misma línea.
2. **Sé específico**: "no uses any" es mejor que "escribe buen TypeScript".
3. **Incluí el por qué**: "no uses `forwardRef` porque React 19 lo elimina". El agente entiende el razonamiento.
4. **Verificable**: "los tests deben pasar" no es verificable por el agente. "Los tests van en `__tests__/`" sí lo es.
5. **Priorizá REQUIRED sobre RECOMMENDED**: si algo es importante, que sea REQUIRED. Si es opinión, RECOMMENDED.

### Dónde guardar un skill

Los skills pueden vivir en dos lugares:

#### Skills globales (para todos los proyectos)

```
~/.config/opencode/skills/    # OpenCode
~/.codex/skills/              # Codex
~/.claude/skills/             # Claude Code
```

Útiles para:
- Tecnologías que usás en todos los proyectos (React, TypeScript, Go)
- Preferencias personales ("usar comillas simples")
- Convenciones transversales ("conventional commits")

#### Skills de proyecto (solo para un proyecto)

```
<proyecto>/.opencode/skills/    # OpenCode
<proyecto>/.codex/skills/       # Codex
```

Útiles para:
- Convenciones específicas del proyecto
- Patrones de arquitectura del proyecto
- Reglas de naming del proyecto
- Dependencias y versiones específicas

#### Orden de carga

Cuando un agente busca skills, primero carga los **skills de proyecto** y después los **globales**. Si hay conflictos (dos skills con reglas contradictorias), el skill de proyecto tiene prioridad.

### Cómo probar un skill

Después de crear un skill, necesitás verificar que se carga correctamente:

```text
# 1. Creá un archivo que active el trigger
touch src/components/Test.tsx   # si el trigger es .tsx

# 2. Preguntale al agente si cargó el skill
"Decime qué skills tenés cargados para este contexto"

# 3. Si cargó, preguntale por las reglas del skill
"¿Qué reglas debo seguir para componentes React?"
"¿Cómo debería estructurar mis imports?"
```

### Debugging: por qué un skill no se carga

Si el skill no se carga, estos son los problemas más comunes:

| Problema | Causa más probable | Solución |
|----------|-------------------|----------|
| El agente no menciona las reglas | Trigger incorrecto o ausente | Verificá que `description` contenga "Trigger:" |
| El skill nunca se activa | Extensión de archivo incorrecta | Probá con un trigger más específico |
| El skill se activa siempre | Trigger demasiado genérico ("Trigger: código") | Hacé el trigger más específico |
| Error de parseo del YAML | YAML inválido en frontmatter | Usá un validador YAML online |
| El nombre del directorio no coincide | `name:` en frontmatter ≠ nombre del directorio | Asegurate que coincidan |

#### Cómo verificar el YAML

```bash
# Verificar que el YAML del frontmatter es válido
python -c "import yaml; yaml.safe_load(open('SKILL.md').read().split('---')[1])"
```

O más simple: abrí el archivo en VS Code. Si el YAML no es válido, el resaltado de sintaxis se rompe.

### Las 24 skills de Gentleman-Skills

El repositorio [Gentleman-Skills](https://github.com/Gentleman-Programming/Gentleman-Skills) contiene **24 skills** en total:

#### Curadas (18)

| Skill | Trigger principal |
|-------|------------------|
| `react-19` | Archivos .tsx, .jsx, mención React 19 |
| `nextjs-15` | Archivos en app/, pages/ |
| `typescript` | Archivos .ts, .tsx |
| `tailwind-4` | Archivos .tsx, mención Tailwind |
| `zod-4` | Import de zod |
| `zustand-5` | Import de zustand |
| `angular-core` | Archivos .ts en proyecto Angular |
| `angular-forms` | Import de ReactiveForms o mención forms |
| `angular-architecture` | Archivos en src/app/ |
| `angular-performance` | Mención de performance en Angular |
| `playwright` | Archivos .spec.ts, mención E2E |
| `pytest` | Archivos test_*.py |
| `django-drf` | Archivos views.py, serializers.py |
| `github-pr` | Comando "crear PR" |
| `jira-epic` / `jira-task` | Mención de Jira |
| `ai-sdk-5` | Import de ai-sdk |
| `skill-creator` | Comando "crear skill" |

#### Comunitarias (6)

| Skill | Trigger |
|-------|---------|
| `electron` | Archivos electron/ o mención Electron |
| `elixir-antipatterns` | Archivos .ex, .exs |
| `hexagonal-architecture-layers-java` | Archivos .java en proyecto hexagonal |
| `java-21` | Archivos .java |
| `react-native` | Archivos .tsx, mención React Native |
| `spring-boot-3` | Archivos .java, mención Spring Boot |

### Mejores prácticas

1. **Responsabilidad única**: un skill = una tecnología o un patrón. No crees "mi-skill-gigante" que cubra todo.
2. **Triggers precisos**: "archivos `.tsx`" es mejor que "código React". "Ruta `src/features/`" es mejor que "archivos del proyecto".
3. **Reglas verificables**: el agente debe poder determinar si la regla se cumple o no mirando el código.
4. **Ejemplos sí o sí**: cada regla debería tener al menos un ejemplo de código que la ilustre.
5. **Anti-ejemplos**: muestran lo que NO se debe hacer, que suele ser más instructivo que lo que sí.
6. **Versión actualizada**: si la tecnología avanza (React 18 → React 19), actualizá el skill. Un skill desactualizado es peor que no tener skill.
7. **Probá antes de compartir**: creá un archivo que active el trigger y verificá que el agente aplique las reglas.

### Errores frecuentes

1. **Olvidar "Trigger:"**: el campo `description` debe contener la palabra exacta "Trigger:". Sin eso, el agente no sabe cuándo cargar el skill.
2. **YAML inválido**: tabuladores en lugar de espacios, comillas mal cerradas, caracteres especiales sin escapar. Usá un linter YAML.
3. **Reglas aspiracionales**: "escribe código limpio" no es una regla, es un deseo. "Usá nombres descriptivos de 2-3 palabras" es una regla.
4. **Skills demasiado grandes**: 50 reglas en un solo skill hacen que el agente ignore las menos importantes. Dividí en skills más pequeños.
5. **No incluir el por qué**: "no uses `any`" sin explicación. El agente lo va a hacer igual porque no entiende por qué es malo.
6. **Nombre de directorio incorrecto**: el nombre del directorio debe coincidir con `name:` en el frontmatter.

### Preguntas

1. ¿Qué campo del frontmatter determina cuándo se activa un skill?
2. ¿Cuál es la diferencia entre `REQUIRED` y `RECOMMENDED` en una regla?
3. ¿Dónde deberías guardar un skill que aplica a todos tus proyectos (global) vs uno que aplica solo al proyecto actual?
4. ¿Qué pasa si dos skills tienen reglas contradictorias?
5. ¿Por qué es importante incluir ejemplos de código en un skill?

### Ejercicio

1. Creá un skill para tu proyecto actual con al menos 3 reglas REQUIRED
2. Incluí un ejemplo de código bueno y uno malo (anti-patrón)
3. Guardalo en la carpeta de skills de tu proyecto
4. Verificá que el agente lo carga preguntando: "¿Qué skills tenés activos?"
5. Si el agente no lo carga, debuggeá el trigger

## Fuentes verificadas

- Repositorio: Gentleman-Skills, commit `c8036a37893679dc5e942484975405d39689c63b`
- Archivos: `SKILL_TEMPLATE.md`, `curated/*/SKILL.md`, `community/*/SKILL.md`
- Repositorio: gentle-ai, commit `b0a88faf1296ec4f524b8c9bbb90d39af9c42d0d`
- Archivos: `internal/assets/skills/` en gentle-ai
- Fecha: 2026-07-20
- Estado: 🟢 Verificado
