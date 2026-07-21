const MODULES = [
  {
    id: '00', dir: '00-empezar-aqui', title: 'Empezar aquí',
    summary: 'Sin orientación, el manual es abrumador. Este módulo te da el mapa.',
    lessons: [
      { slug: '00-empezar-aqui/01-bienvenida', title: 'Bienvenida', level: 1, minutes: '10 min', outcome: 'Entender qué es el ecosistema Gentle y qué cubre este manual' },
    ],
  },
  {
    id: '01', dir: '01-fundamentos-tecnologicos', title: 'Fundamentos tecnológicos',
    summary: 'No podés entender agentes de IA si no sabés qué es un proceso, un archivo o una variable.',
    lessons: [
      { slug: '01-fundamentos-tecnologicos/01-como-funciona-una-computadora', title: 'Cómo funciona una computadora', level: 1, minutes: '20 min', outcome: 'Identificar las partes principales de una computadora' },
      { slug: '01-fundamentos-tecnologicos/02-la-terminal', title: 'La terminal', level: 1, minutes: '25 min', outcome: 'Explicar qué es una terminal y un shell' },
      { slug: '01-fundamentos-tecnologicos/03-programacion', title: 'Programación', level: 1, minutes: '30 min', outcome: 'Explicar qué es un programa y cómo se crea' },
      { slug: '01-fundamentos-tecnologicos/04-frontend-backend', title: 'Frontend y backend', level: 1, minutes: '30 min', outcome: 'Diferenciar frontend de backend por su responsabilidad' },
      { slug: '01-fundamentos-tecnologicos/05-bases-de-datos', title: 'Bases de datos', level: 1, minutes: '30 min', outcome: 'Explicar qué es la persistencia y por qué es necesaria' },
    ],
  },
  {
    id: '02', dir: '02-git-y-github', title: 'Git y GitHub',
    summary: 'Todo el ecosistema (SDD, GGA, Native Review, Engram) depende de Git. Sin Git no hay trazabilidad.',
    lessons: [
      { slug: '02-git-y-github/01-que-es-git', title: 'Qué es Git', level: 1, minutes: '30 min', outcome: 'Explicar qué problema resuelve el control de versiones' },
      { slug: '02-git-y-github/02-commits-y-ramas', title: 'Commits y Ramas', level: 1, minutes: '35 min', outcome: 'Explicar qué es un commit y cómo se compone' },
      { slug: '02-git-y-github/03-remoto-y-pr', title: 'Remoto y Pull Request', level: 1, minutes: '35 min', outcome: 'Diferenciar push, pull y fetch' },
      { slug: '02-git-y-github/04-hooks-y-worktrees', title: 'Hooks y Worktrees', level: 2, minutes: '30 min', outcome: 'Explicar qué es un hook de Git y los tipos principales' },
    ],
  },
  {
    id: '03', dir: '03-fundamentos-de-ia', title: 'Fundamentos de IA',
    summary: 'Antes de usar agentes, necesitás entender qué es un modelo, un token, un proveedor y cómo se comunican.',
    lessons: [
      { slug: '03-fundamentos-de-ia/01-modelos-proveedores-agentes', title: 'Modelos, proveedores y agentes', level: 1, minutes: '35 min', outcome: 'Diferenciar producto, modelo, proveedor, cliente y agente' },
      { slug: '03-fundamentos-de-ia/02-tokens-contexto', title: 'Tokens y contexto', level: 1, minutes: '30 min', outcome: 'Explicar qué es un token y cómo se relaciona con el costo y la latencia' },
      { slug: '03-fundamentos-de-ia/03-mcp-y-tool-calling', title: 'MCP y tool calling', level: 1, minutes: '30 min', outcome: 'Explicar cómo funciona tool calling y la diferencia con generar texto' },
      { slug: '03-fundamentos-de-ia/04-agentes-orquestadores', title: 'Agentes y orquestadores', level: 1, minutes: '35 min', outcome: 'Explicar qué es un agente como sistema' },
    ],
  },
  {
    id: '04', dir: '04-ecosistema-gentle', title: 'Ecosistema Gentle',
    summary: 'Antes de instalar nada, necesitás el mapa completo: qué hace cada pieza y cómo se conectan.',
    lessons: [
      { slug: '04-ecosistema-gentle/01-vision-general', title: 'Visión general del ecosistema', level: 1, minutes: '20 min', outcome: 'Explicar qué es el ecosistema Gentle' },
      { slug: '04-ecosistema-gentle/02-opencode-vs-codex', title: 'OpenCode vs Codex', level: 2, minutes: '20 min', outcome: 'Comparar OpenCode y Codex en 15+ dimensiones técnicas' },
    ],
  },
  {
    id: '05', dir: '05-instalacion', title: 'Instalación',
    summary: 'Una instalación incorrecta genera errores difíciles de diagnosticar.',
    lessons: [
      { slug: '05-instalacion/01-instalar-gentle-ai', title: 'Instalar Gentle-AI', level: 1, minutes: '30 min', outcome: 'Instalar gentle-ai, OpenCode, Codex y Engram en Windows' },
      { slug: '05-instalacion/02-verificar-instalacion', title: 'Verificar la instalación', level: 1, minutes: '15 min', outcome: 'Ejecutar y entender el output de gentle-ai doctor' },
    ],
  },
  {
    id: '06', dir: '06-primer-proyecto', title: 'Primer proyecto',
    summary: 'La mejor forma de aprender SDD es usándolo. Este módulo te guía en un proyecto real chico.',
    lessons: [
      { slug: '06-primer-proyecto/01-primer-sdd', title: 'Tu primer proyecto con SDD', level: 2, minutes: '60 min', outcome: 'Ejecutar las 9 fases de SDD en un proyecto real' },
    ],
  },
  {
    id: '07', dir: '07-gentle-ai', title: 'Gentle-AI',
    summary: 'Gentle-AI es el orquestador central. Sin entenderlo, usás el ecosistema a ciegas.',
    lessons: [
      { slug: '07-gentle-ai/01-que-es-gentle-ai', title: 'Qué es Gentle-AI', level: 1, minutes: '30 min', outcome: 'Explicar qué hace Gentle-AI y qué no hace' },
      { slug: '07-gentle-ai/02-cli-y-tui', title: 'CLI y TUI de Gentle-AI', level: 2, minutes: '20 min', outcome: 'Ejecutar Gentle-AI en modo CLI con comandos específicos' },
      { slug: '07-gentle-ai/03-componentes-y-agentes', title: 'Componentes y agentes', level: 2, minutes: '25 min', outcome: 'Nombrar los 10 componentes de Gentle-AI y qué hace cada uno' },
      { slug: '07-gentle-ai/04-personas-y-permisos', title: 'Personas y permisos', level: 2, minutes: '15 min', outcome: 'Explicar qué es una persona y cómo afecta las respuestas' },
    ],
  },
  {
    id: '08', dir: '08-sdd', title: 'SDD — Spec-Driven Development',
    summary: 'SDD es la metodología central del ecosistema. Sin SDD, los agentes trabajan sin plan ni verificación.',
    lessons: [
      { slug: '08-sdd/01-que-es-sdd', title: 'Qué es SDD', level: 2, minutes: '35 min', outcome: 'Explicar SDD y cómo reduce incertidumbre' },
      { slug: '08-sdd/02-fases-y-artefactos', title: 'Las 10 fases de SDD', level: 2, minutes: '30 min', outcome: 'Explicar qué produce cada una de las 10 fases de SDD' },
      { slug: '08-sdd/03-strict-tdd', title: 'Strict TDD Mode', level: 2, minutes: '15 min', outcome: 'Explicar el ciclo RED/GREEN/REFACTOR en SDD' },
      { slug: '08-sdd/04-openspec-engram-hybrid', title: 'OpenSpec, Engram e híbrido', level: 2, minutes: '15 min', outcome: 'Diferenciar los tres modos de persistencia de SDD' },
    ],
  },
  {
    id: '09', dir: '09-engram', title: 'Engram — Memoria persistente',
    summary: 'Sin memoria, cada sesión empieza de cero. Engram es lo que hace que los agentes aprendan.',
    lessons: [
      { slug: '09-engram/01-que-es-engram', title: 'Engram — Memoria persistente', level: 2, minutes: '40 min', outcome: 'Explicar qué es Engram y qué problema resuelve' },
      { slug: '09-engram/02-memoria-y-mcp', title: 'Cómo usar la memoria con Engram', level: 2, minutes: '25 min', outcome: 'Dominar las herramientas MCP de Engram' },
      { slug: '09-engram/03-arquitectura-engram', title: 'Arquitectura de Engram', level: 3, minutes: '25 min', outcome: 'Explicar la arquitectura de Engram (Go + SQLite + FTS5)' },
    ],
  },
  {
    id: '10', dir: '10-skills', title: 'Skills',
    summary: 'Las skills son el conocimiento especializado del ecosistema. Crearlas bien es la diferencia entre un agente útil y uno que alucina.',
    lessons: [
      { slug: '10-skills/01-que-son-skills', title: 'Skills — Conocimiento especializado', level: 2, minutes: '25 min', outcome: 'Explicar qué es un skill y para qué sirve' },
      { slug: '10-skills/02-crear-skills', title: 'Crear tus propios skills', level: 2, minutes: '25 min', outcome: 'Escribir un SKILL.md completo con frontmatter YAML válido' },
      { slug: '10-skills/03-registry', title: 'Skill Registry y descubrimiento', level: 2, minutes: '15 min', outcome: 'Explicar qué es el skill registry y para qué sirve' },
    ],
  },
  {
    id: '11', dir: '11-calidad-y-revision', title: 'Calidad y revisión',
    summary: 'El código sin revisión es deuda técnica. GGA, Native Review y Judgment Day son tres herramientas distintas para tres momentos distintos.',
    lessons: [
      { slug: '11-calidad-y-revision/01-gga-native-review-judgment-day', title: 'Calidad y revisión de código', level: 2, minutes: '40 min', outcome: 'Diferenciar GGA, Native Bounded Review y Judgment Day' },
      { slug: '11-calidad-y-revision/02-gga', title: 'GGA — Gentleman Guardian Angel', level: 2, minutes: '20 min', outcome: 'Explicar qué es GGA y cómo funciona como hook pre-commit' },
      { slug: '11-calidad-y-revision/03-native-bounded-review', title: 'Native Bounded Review', level: 2, minutes: '25 min', outcome: 'Explicar qué es Native Bounded Review' },
      { slug: '11-calidad-y-revision/04-judgment-day', title: 'Judgment Day', level: 2, minutes: '20 min', outcome: 'Explicar qué es un sistema de revisión adversarial ciega' },
    ],
  },
  {
    id: '12', dir: '12-opencode', title: 'OpenCode',
    summary: 'OpenCode es el entorno donde los agentes viven. Configurarlo bien es la diferencia entre un asistente útil y uno que rompe cosas.',
    lessons: [
      { slug: '12-opencode/01-configurar-opencode', title: 'Configurar OpenCode', level: 2, minutes: '45 min', outcome: 'Localizar y editar el archivo opencode.json' },
    ],
  },
  {
    id: '13', dir: '13-codex', title: 'Codex',
    summary: 'Codex es la alternativa de OpenAI. Tiene capacidades distintas que OpenCode no ofrece.',
    lessons: [
      { slug: '13-codex/01-configurar-codex', title: 'Configurar Codex', level: 2, minutes: '30 min', outcome: 'Localizar y editar el archivo config.toml de Codex' },
    ],
  },
  {
    id: '14', dir: '14-modelos-y-enrutamiento', title: 'Modelos y enrutamiento',
    summary: 'El modelo incorrecto para la tarea incorrecta = dinero desperdiciado o calidad insuficiente.',
    lessons: [
      { slug: '14-modelos-y-enrutamiento/01-modelos-y-enrutamiento', title: 'Modelos y enrutamiento', level: 2, minutes: '45 min', outcome: 'Seleccionar el modelo adecuado según tarea y riesgo' },
      { slug: '14-modelos-y-enrutamiento/selector-modelos', title: 'Selector de modelos', level: 2, minutes: '10 min', outcome: 'Filtrar y seleccionar modelos por proveedor, clase y nivel de razonamiento' },
    ],
  },
  {
    id: '15', dir: '15-terminal', title: 'Terminal',
    summary: 'La terminal es la interfaz principal del ecosistema. Sin soltura en CLI, todo se vuelve más lento y propenso a errores.',
    lessons: [
      { slug: '15-terminal/01-terminal-avanzada', title: 'Terminal avanzada', level: 1, minutes: '30 min', outcome: 'Usar pipes y redirección para encadenar comandos' },
    ],
  },
  {
    id: '16', dir: '16-arquitectura-tecnica', title: 'Arquitectura técnica',
    summary: 'Para contribuir, diagnosticar bugs profundos o extender el ecosistema, necesitás entender qué hace cada paquete Go.',
    lessons: [
      { slug: '16-arquitectura-tecnica/01-arquitectura-tecnica', title: 'Arquitectura técnica', level: 3, minutes: '60 min', outcome: 'Describir la estructura de paquetes Go de Gentle-AI' },
    ],
  },
  {
    id: '17', dir: '17-seguridad-costos-y-gobierno', title: 'Seguridad, costos y gobierno',
    summary: 'Un agente sin gobierno puede gastar USD 100 en una tarde, exponer secretos o aceptar código inseguro.',
    lessons: [
      { slug: '17-seguridad-costos-y-gobierno/01-seguridad-costos-y-gobierno', title: 'Seguridad, costos y gobierno', level: 2, minutes: '40 min', outcome: 'Configurar permisos de agente con allow/deny' },
    ],
  },
  {
    id: '18', dir: '18-construccion-de-productos', title: 'Construcción de productos',
    summary: 'El objetivo final no es usar herramientas — es construir productos. Este módulo integra todo lo aprendido.',
    lessons: [
      { slug: '18-construccion-de-productos/01-producto-integrador', title: 'Construcción de productos', level: 3, minutes: '90 min', outcome: 'Ejecutar el ciclo completo SDD desde la idea hasta el deploy' },
    ],
  },
  {
    id: '19', dir: '19-laboratorios', title: 'Laboratorios',
    summary: 'La teoría sin práctica no se fija. Los labs son ejercicios acumulativos que construyen confianza real.',
    lessons: [
      { slug: '19-laboratorios/01-laboratorios', title: 'Laboratorios', level: 2, minutes: '120 min', outcome: 'Completar 20 laboratorios progresivos' },
    ],
  },
  {
    id: '20', dir: '20-referencia', title: 'Referencia',
    summary: 'Cuando ya sabés lo que buscás pero necesitás el detalle exacto: sintaxis, parámetros, modelos, comandos.',
    lessons: [
      { slug: '20-referencia/01-referencia-rapida', title: 'Referencia rápida', level: 3, minutes: 'Consulta', outcome: 'Consultar cualquier comando del ecosistema sin buscar en capítulos separados' },
    ],
  },
];

const modules = MODULES.map(m => ({
  ...m,
  stageId: '',
  entry: '/' + m.lessons[0].slug + '/',
  lessons: m.lessons.map(l => ({ ...l, href: '/' + l.slug + '/' })),
}));

const stages = [
  { id: 'orientacion', label: '1. Orientación', question: '¿Por dónde empiezo?', moduleIds: ['00'] },
  { id: 'fundamentos', label: '2. Fundamentos', question: '¿Qué necesito entender antes de usar agentes?', moduleIds: ['01', '02', '03'] },
  { id: 'preparacion', label: '3. Preparación', question: '¿Qué es el ecosistema y cómo lo instalo?', moduleIds: ['04', '05'] },
  { id: 'primera-experiencia', label: '4. Primera experiencia', question: '¿Cómo termino un primer ciclo útil?', moduleIds: ['06'] },
  { id: 'operacion', label: '5. Operación del ecosistema', question: '¿Cómo uso Gentle-AI, SDD, Engram y skills?', moduleIds: ['07', '08', '09', '10'] },
  { id: 'hosts-modelos', label: '6. Hosts y modelos', question: '¿Cómo cambia el trabajo entre OpenCode, Codex y modelos?', moduleIds: ['12', '13', '14'] },
  { id: 'calidad-avanzada', label: '7. Calidad y operación avanzada', question: '¿Cómo reviso, opero terminales y gobierno riesgos?', moduleIds: ['11', '15', '16', '17'] },
  { id: 'practica-consulta', label: '8. Práctica y consulta', question: '¿Cómo construyo, práctico y encuentro referencias?', moduleIds: ['18', '19', '20'] },
];

stages.forEach(s => s.moduleIds.forEach(mid => {
  const m = modules.find(mod => mod.id === mid);
  if (m) m.stageId = s.id;
}));

function midToEntry(mid) {
  const m = modules.find(mod => mod.id === mid);
  return m ? m.entry : '';
}

const profiles = [
  { slug: 'principiante-total', title: 'Principiante total', summary: 'Empezás desde cero. No sabés programar ni usar la terminal.', prerequisite: 'Ninguno', outcome: 'Operador', routeIndex: '/00-empezar-aqui/rutas/principiante-total/', lessonHrefs: ['00', '01', '02', '03', '04', '05', '06', '15'].map(midToEntry).filter(Boolean) },
  { slug: 'programador', title: 'Ya sé programar', summary: 'Sabés programar pero no conocés el ecosistema Gentle.', prerequisite: 'Programación básica', outcome: 'Configurador', routeIndex: '/00-empezar-aqui/rutas/programador/', lessonHrefs: ['03', '04', '05', '06', '07', '08', '09', '10'].map(midToEntry).filter(Boolean) },
  { slug: 'opencode', title: 'Uso OpenCode', summary: 'Ya usás OpenCode y querés incorporar Gentle-AI.', prerequisite: 'OpenCode básico', outcome: 'Configurador', routeIndex: '/00-empezar-aqui/rutas/opencode/', lessonHrefs: ['03', '04', '05', '07', '08', '09', '10', '02', '11', '12', '14'].map(midToEntry).filter(Boolean) },
  { slug: 'codex', title: 'Uso Codex', summary: 'Ya usás Codex CLI y querés integrar el ecosistema.', prerequisite: 'Codex básico', outcome: 'Configurador', routeIndex: '/00-empezar-aqui/rutas/codex/', lessonHrefs: ['03', '04', '05', '07', '08', '09', '10', '02', '11', '13', '14'].map(midToEntry).filter(Boolean) },
  { slug: 'engram', title: 'Quiero entender Engram', summary: 'Te interesa profundizar en la memoria persistente.', prerequisite: 'Fundamentos de IA', outcome: 'Arquitecto (Engram)', routeIndex: '/00-empezar-aqui/rutas/engram/', lessonHrefs: ['01', '03', '04', '05', '07', '09', '02', '11', '16'].map(midToEntry).filter(Boolean) },
  { slug: 'modelos', title: 'Quiero configurar modelos', summary: 'Querés dominar la selección y el enrutamiento de modelos.', prerequisite: 'Fundamentos de IA', outcome: 'Configurador', routeIndex: '/00-empezar-aqui/rutas/modelos/', lessonHrefs: ['01', '03', '05', '07', '10', '12', '13', '14', '17'].map(midToEntry).filter(Boolean) },
  { slug: 'producto', title: 'Quiero construir un producto', summary: 'Querés construir un producto completo usando todo el ecosistema.', prerequisite: 'Módulos 06–14', outcome: 'Constructor', routeIndex: '/00-empezar-aqui/rutas/producto/', lessonHrefs: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '14', '18', '19'].map(midToEntry).filter(Boolean) },
  { slug: 'arquitectura', title: 'Quiero entender la arquitectura', summary: 'Querés entender cómo funciona el ecosistema por dentro.', prerequisite: 'Experiencia con el ecosistema', outcome: 'Arquitecto', routeIndex: '/00-empezar-aqui/rutas/arquitectura/', lessonHrefs: ['02', '03', '04', '05', '07', '08', '09', '11', '14', '16', '17'].map(midToEntry).filter(Boolean) },
];

const lessonsByHref = new Map();
modules.forEach(m => m.lessons.forEach(l => lessonsByHref.set(l.href, l)));

function getProfile(slug) {
  const p = profiles.find(pr => pr.slug === slug);
  if (!p) throw new Error(`Profile not found: ${slug}`);
  return p;
}

function normalizeHref(p) {
  let h = p;
  h = h.replace(/^\/gentle-ai-manual/, '');
  h = h.replace(/[?#].*$/, '');
  if (!h.startsWith('/')) h = '/' + h;
  if (!h.endsWith('/')) h = h + '/';
  return h;
}

function getLesson(pathname) {
  return lessonsByHref.get(normalizeHref(pathname)) || null;
}

function getRouteProgress(profileSlug, pathname) {
  const profile = profiles.find(p => p.slug === profileSlug);
  if (!profile) return null;
  const normalized = normalizeHref(pathname);
  const idx = profile.lessonHrefs.indexOf(normalized);
  if (idx === -1) return null;
  return {
    profile,
    currentIndex: idx,
    total: profile.lessonHrefs.length,
    prev: idx > 0 ? profile.lessonHrefs[idx - 1] : null,
    next: idx < profile.lessonHrefs.length - 1 ? profile.lessonHrefs[idx + 1] : null,
  };
}

function buildSidebar() {
  return stages.map(stage => {
    const moduleGroups = stage.moduleIds
      .map(mid => {
        const m = modules.find(mod => mod.id === mid);
        if (!m) return null;
        return {
          label: m.id + '. ' + m.title,
          items: m.lessons.map(l => ({ label: l.title, slug: l.slug })),
        };
      })
      .filter(Boolean);
    return {
      label: `${stage.label} — ${stage.question}`,
      collapsed: false,
      items: moduleGroups,
    };
  });
}

export { stages, modules, profiles, lessonsByHref, getProfile, getLesson, getRouteProgress, buildSidebar, normalizeHref };
