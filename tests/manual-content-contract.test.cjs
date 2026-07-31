"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");

const validator = path.resolve(__dirname, "..", "scripts", "validate-manual-content.cjs");

function runFixture(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "manual-content-"));
  const file = path.join(dir, "lesson.md");
  fs.writeFileSync(file, content, "utf8");
  const result = cp.spawnSync(process.execPath, [validator, file], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

const validLesson = `---
title: "Cache"
manual_contract: lesson-v1
estimated_minutes: 20
learning_outcome: "Explicar cuándo usar una cache."
---

## Resultado de aprendizaje
Explicar.

## Respuesta simple
Texto.

## Modelo mental
Texto.

## Ejemplo continuo
Texto.

## Cómo funciona internamente
Texto.

## Cuándo usarlo
Texto.

## Errores frecuentes
Texto.

## Comprueba lo aprendido
Texto.

## Resumen
Texto.

## Fuentes y alcance
- Fuente técnica primaria: documentación oficial.
`;

test("accepts a complete lesson contract", () => {
  const result = runFixture(validLesson);
  assert.equal(result.status, 0, result.stderr);
});

test("rejects a lesson without sources", () => {
  const result = runFixture(validLesson.replace("## Fuentes y alcance", "## Referencias"));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Fuentes y alcance/);
});

test("rejects remote hotlinked images", () => {
  const result = runFixture(validLesson + "\n![Tool](https://example.com/tool.png)\n");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /hotlink/);
});

test("rejects empty image alt text", () => {
  const result = runFixture(validLesson + "\n![](/images/tool.webp)\n");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /empty alt/);
});

test("rejects unlabeled command blocks", () => {
  const result = runFixture(validLesson + "\n```\ngit status\n```\n");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /labeled bash or powershell/);
});

test("rejects placeholder '(proximamente)' with parentheses", () => {
  const result = runFixture(validLesson + "\n(próximamente)");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /placeholder/);
});

test("rejects standalone 'Proximamente' without parentheses", () => {
  const result = runFixture(validLesson + "\n## Próximamente");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /placeholder/);
});

test("rejects standalone 'Coming soon' without parentheses", () => {
  const result = runFixture(validLesson + "\nComing soon");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /placeholder/);
});

test("rejects unaccented 'Proximamente' (ASCII o)", () => {
  const result = runFixture(validLesson + "\nProximamente");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /placeholder/);
});

test("allows 'coming soon' inside a code fence (legitimate documentation)", () => {
  const result = runFixture(validLesson + "\n```\n# Don't use 'Coming soon' on buttons\n```");
  assert.equal(result.status, 0);
});

test("allows 'coming soon' inside inline code (legitimate documentation)", () => {
  const result = runFixture(validLesson + "\nAvoid `Coming soon` as a label on buttons.");
  assert.equal(result.status, 0);
});

test("rejects 'Coming **soon**' with bold markup (renders visible text)", () => {
  const result = runFixture(validLesson + "\n## Coming **soon**");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /placeholder/);
});

test("rejects '<strong>Próximamente</strong>' with HTML markup (renders visible text)", () => {
  const result = runFixture(validLesson + "\n## <strong>Próximamente</strong>");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /placeholder/);
});

test("allows 'Coming **soon**' inside inline code (legitimate documentation)", () => {
  const result = runFixture(validLesson + "\nAvoid `Coming **soon**` as a label on buttons.");
  assert.equal(result.status, 0);
});

// Engram-specific RED tests — full lesson-v1 contract for 01-que-es-engram.md
const ENGRAM_PAGE = path.resolve(__dirname, "..", "src", "content", "docs", "09-engram", "01-que-es-engram.md");

test("engram page: has full lesson-v1 frontmatter", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Must have lesson-v1 contract
  assert.match(content, /manual_contract:\s*lesson-v1/);
  assert.match(content, /title:/);
  assert.match(content, /description:/);
  assert.match(content, /content_level:/);
  assert.match(content, /estimated_minutes:/);
  assert.match(content, /learning_outcome:/);
  assert.match(content, /canonical_concepts:/);
  assert.match(content, /source_status:\s*verified/);
  assert.match(content, /level:\s*\d+/);
  assert.match(content, /estimatedTime:\s*\d+\s*min/);
});

test("engram page: has all 13 required sections", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  const required = [
    "Resultado de aprendizaje",
    "Respuesta simple",
    "Modelo mental",
    "Mapa o recorrido",
    "Ejemplo continuo",
    "Recorrido práctico",
    "Cómo funciona internamente",
    "Cuándo usarlo y cuándo evitarlo",
    "Costos y trade-offs",
    "Errores frecuentes",
    "Comprueba lo aprendido",
    "Resumen",
    "Fuentes y alcance",
  ];
  for (const section of required) {
    const header = new RegExp(`^##\\s+${section}`, "m");
    assert.match(content, header, `Missing section: ${section}`);
  }
});

test("engram page: has canonical_concepts and sources", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  assert.match(content, /canonical_concepts:/);
  // Must not be an empty list
  const fm = content.match(/canonical_concepts:\s*\n((?:\s+- .+\n?)+)/);
  assert.ok(fm, "canonical_concepts list exists");
  assert.ok(fm[1].trim().length > 0, "canonical_concepts is not empty");
  // Fuentes y alcance has content (handle CRLF)
  const sourcesSection = content.match(/## Fuentes y alcance\r?\n([\s\S]+?)(?=\r?\n##|$)/);
  assert.ok(sourcesSection, "Fuentes y alcance section exists");
  assert.ok(sourcesSection[1].trim().length > 10, "Fuentes y alcance has content");
});

test("engram page: no prohibited absolute claims about auto-save", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Must not claim Engram saves automatically in ALL cases without context
  // The claim must be qualified (depends on agent/instructions/config)
  const autoSaveLines = content.match(/[^.]*\b(?:automáticamente|guarda solo|guarda todo|sin intervención)[^.]*\./gi);
  if (autoSaveLines) {
    for (const line of autoSaveLines) {
      // Every auto-save claim must be qualified
      assert.ok(
        !line.includes('automáticamente') ||
        line.includes('configuración') ||
        line.includes('instrucciones') ||
        line.includes('agente') ||
        line.includes('puede') ||
        line.includes('depende'),
        `Unqualified auto-save claim found: "${line.trim()}"`
      );
    }
  }
});

test("engram page: does not claim everything works without internet", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Engram storage is local, but model execution may be remote
  assert.doesNotMatch(content, /todo funciona sin internet/i, "Must not claim everything works offline");
  // Find full sentences containing "sin internet" — match from start of sentence
  const sinInternetSentences = content.match(/[^.!?]*sin\s+internet[^.!?]*[.!?]/gi);
  if (sinInternetSentences) {
    for (const sentence of sinInternetSentences) {
      const s = sentence.toLowerCase();
      assert.ok(
        s.includes('engram') ||
        s.includes('almacen') ||
        s.includes('local') ||
        s.includes('archivo') ||
        s.includes('base de datos') ||
        s.includes('persistente') ||
        s.includes('disco') ||
        s.includes('storage') ||
        s.includes('modelo'),
        `Must qualify "sin internet" scope: "${sentence.trim()}"`
      );
    }
  }
});

test("engram page: does not contain hardcoded unverified absolute file paths", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Allow ~/.engram/engram.db (verified from README), but no other invented paths
  // No C:\Users\ paths or invented paths
  const lines = content.split('\n');
  for (const line of lines) {
    const pathMatch = line.match(/[A-Za-z]:\\[^\s"]+/);
    if (pathMatch) {
      assert.ok(
        pathMatch[0].includes('engram') || pathMatch[0].includes('.git') || pathMatch[0].includes('node_modules'),
        `Hardcoded Windows path found: "${pathMatch[0]}"`
      );
    }
  }
});

test("engram page: route context preserved (no ?ruta= in content links)", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Curriculum links must not have hardcoded ?ruta= (route-context.js appends it)
  const matches = content.match(/\?ruta=/g);
  assert.equal(matches, null, "No ?ruta= hardcoded in content links");
});

test("engram page: has accessible Mermaid diagram with alt text", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Check that if there's an image, it has alt text
  const imgMatches = content.match(/!\[([^\]]*)\]/g);
  if (imgMatches) {
    for (const img of imgMatches) {
      const alt = img.match(/!\[([^\]]*)\]/);
      assert.ok(alt[1] && alt[1].length > 0, `Image missing alt text: ${img}`);
    }
  }
});

// ─────────────────────────────────────────────
// RED tests — System Design Foundations (phase 3)
// These MUST fail before implementation.
// ─────────────────────────────────────────────

const SD_PAGE_07 = path.resolve(__dirname, "..", "src", "content", "docs", "01-fundamentos-tecnologicos", "07-como-funciona-una-aplicacion-moderna.md");
const SD_PAGE_MAPA = path.resolve(__dirname, "..", "src", "content", "docs", "16-arquitectura-tecnica", "03-mapa-de-system-design.md");
const SD_PAGE_DATOS = path.resolve(__dirname, "..", "src", "content", "docs", "16-arquitectura-tecnica", "04-datos-escala-y-resiliencia.md");

test("RED: 07-como-funciona-una-aplicacion-moderna exists and has lesson-v1 frontmatter", () => {
  assert.ok(fs.existsSync(SD_PAGE_07), "Page 07 does not exist yet — RED expected");
  const content = fs.readFileSync(SD_PAGE_07, "utf8");
  assert.match(content, /manual_contract:\s*lesson-v1/);
  assert.match(content, /title:/);
  assert.match(content, /learning_outcome:/);
  assert.match(content, /estimated_minutes:/);
});

test("RED: 03-mapa-de-system-design exists and has reference-v1 frontmatter", () => {
  assert.ok(fs.existsSync(SD_PAGE_MAPA), "Page 03-mapa does not exist yet — RED expected");
  const content = fs.readFileSync(SD_PAGE_MAPA, "utf8");
  assert.match(content, /manual_contract:\s*reference-v1/);
  assert.match(content, /title:/);
  assert.match(content, /description:/);
});

test("RED: 04-datos-escala-y-resiliencia exists and has lesson-v1 frontmatter", () => {
  assert.ok(fs.existsSync(SD_PAGE_DATOS), "Page 04-datos does not exist yet — RED expected");
  const content = fs.readFileSync(SD_PAGE_DATOS, "utf8");
  assert.match(content, /manual_contract:\s*lesson-v1/);
  assert.match(content, /title:/);
  assert.match(content, /learning_outcome:/);
  assert.match(content, /estimated_minutes:/);
});

test("RED: new lessons are registered in curriculum.mjs", () => {
  const curriculumPath = path.resolve(__dirname, "..", "src", "data", "curriculum.mjs");
  const content = fs.readFileSync(curriculumPath, "utf8");
  assert.match(content, /07-como-funciona-una-aplicacion-moderna/);
  assert.match(content, /03-mapa-de-system-design/);
  assert.match(content, /04-datos-escala-y-resiliencia/);
});

test("RED: new terms exist in glossary.yml", () => {
  const glossaryPath = path.resolve(__dirname, "..", "data", "terminology", "glossary.yml");
  const content = fs.readFileSync(glossaryPath, "utf8");
  const requiredTerms = [
    "System Design",
    "DNS",
    "HTTPS",
    "Caché",
    "Latencia",
    "Disponibilidad",
    "Escalabilidad",
    "Resiliencia",
    "Cuello de botella",
    "Trade-off",
    "Frontend",
    "Backend",
    "Proxy / Reverse Proxy",
    "Teorema CAP",
  ];
  for (const term of requiredTerms) {
    assert.match(content, new RegExp(`\\n  - term: "${term}"`), `Missing glossary term: ${term}`);
  }
});

test("RED: Mermaid diagrams in new pages are valid", () => {
  const { execSync } = require("child_process");
  // validate-mermaid.cjs always scans src/content/docs (ignores positional args),
  // so run it once globally instead of per-block with wasted temp files
  try {
    execSync(`node "${path.resolve(__dirname, "..", "scripts", "validate-mermaid.cjs")}"`, { encoding: "utf8", timeout: 30000, stdio: "pipe" });
  } catch (e) {
    assert.fail(`Mermaid validation failed:\n${e.stderr || e.message}`);
  }
});

// ─────────────────────────────────────────────
// RED tests — Glossary canonical references
// All new terms must point to a specific page (not a module directory),
// and each referenced page must exist on disk.
// ─────────────────────────────────────────────

const YAML = require("js-yaml");

// Terms added by this PR that must use page-level references
const SD_NEW_TERMS = [
  "System Design", "TCP/IP", "Proxy / Reverse Proxy",
  "CDN", "Blob storage", "Índice", "Frontend", "Backend", "Costo",
];

test("RED: new System Design glossary terms have page-level references (not module dirs)", () => {
  const glossaryPath = path.resolve(__dirname, "..", "data", "terminology", "glossary.yml");
  const raw = fs.readFileSync(glossaryPath, "utf8");
  const parsed = YAML.load(raw);
  assert.ok(parsed && Array.isArray(parsed.terms), "glossary.yml must have a terms array");

  const issues = [];
  for (const entry of parsed.terms) {
    if (!SD_NEW_TERMS.includes(entry.term)) continue;
    if (!entry.reference) {
      issues.push(`"${entry.term}" has no reference`);
      continue;
    }
    // Page-level refs have 2+ segments after "content/"
    const stripped = entry.reference.replace(/^content\//, "").replace(/\/$/, "");
    const segments = stripped.split("/");
    if (segments.length < 2) {
      issues.push(`"${entry.term}" → ${entry.reference} (${segments.length} segment(s); need a specific page)`);
    }
    // Verify the target file exists
    const mdPath = entry.reference
      .replace(/^content\//, "src/content/docs/")
      .replace(/\/$/, ".md");
    if (!fs.existsSync(mdPath)) {
      issues.push(`"${entry.term}" → ${entry.reference} — file not found at ${mdPath}`);
    }
  }

  if (issues.length > 0) {
    assert.fail(`New glossary term reference issues:\n${issues.map(i => "  " + i).join("\n")}`);
  }
});

// ─────────────────────────────────────────────
// RED tests — Agent Theory Foundations (PR 2.2)
// These MUST fail before implementation.
// ─────────────────────────────────────────────

const AGENT_PAGE_04 = path.resolve(__dirname, "..", "src", "content", "docs", "03-fundamentos-de-ia", "04-de-modelo-a-agente.md");
const AGENT_PAGE_05 = path.resolve(__dirname, "..", "src", "content", "docs", "03-fundamentos-de-ia", "05-contexto-herramientas-y-memoria.md");
const AGENT_PAGE_PATTERNS = path.resolve(__dirname, "..", "src", "content", "docs", "16-arquitectura-tecnica", "05-patrones-de-agentes-y-mcp.md");
const AGENT_PAGE_TRUST = path.resolve(__dirname, "..", "src", "content", "docs", "17-gobierno", "02-confianza-verificable.md");

const AGENT_NEW_PAGES = [
  ["04-de-modelo-a-agente", AGENT_PAGE_04],
  ["05-contexto-herramientas-y-memoria", AGENT_PAGE_05],
  ["05-patrones-de-agentes-y-mcp", AGENT_PAGE_PATTERNS],
  ["02-confianza-verificable", AGENT_PAGE_TRUST],
];

for (const [name, filePath] of AGENT_NEW_PAGES) {
  test(`RED (PR 2.2): ${name} exists and has lesson-v1 frontmatter`, () => {
    assert.ok(fs.existsSync(filePath), `Page ${name} does not exist yet — RED expected`);
    const content = fs.readFileSync(filePath, "utf8");
    assert.match(content, /manual_contract:\s*lesson-v1/);
    assert.match(content, /title:/);
    assert.match(content, /learning_outcome:/);
    assert.match(content, /estimated_minutes:/);
    assert.match(content, /canonical_concepts:/);
    assert.match(content, /source_status:\s*verified/);
  });
}

// Agent pages must have Fuentes y alcance with date
for (const [name, filePath] of AGENT_NEW_PAGES) {
  test(`RED (PR 2.2): ${name} has sources section`, () => {
    const content = fs.readFileSync(filePath, "utf8");
    assert.match(content, /## Fuentes y alcance/);
  });
}

// Agent pages must have all 13 required sections (lesson-v1 contract)
const AGENT_SECTIONS = [
  "Resultado de aprendizaje",
  "Respuesta simple",
  "Modelo mental",
  "Mapa o recorrido",
  "Ejemplo continuo",
  "Recorrido práctico",
  "Cómo funciona internamente",
  "Cuándo usarlo y cuándo evitarlo",
  "Costos y trade-offs",
  "Errores frecuentes",
  "Comprueba lo aprendido",
  "Resumen",
  "Fuentes y alcance",
];

for (const [name, filePath] of AGENT_NEW_PAGES) {
  test(`RED (PR 2.2): ${name} has all 13 required sections`, () => {
    const content = fs.readFileSync(filePath, "utf8");
    for (const section of AGENT_SECTIONS) {
      const header = new RegExp(`^##\\s+${section}`, "m");
      assert.match(content, header, `Missing section: ${section}`);
    }
  });
}

test("RED (PR 2.2): old 04-agentes-orquestadores is removed", () => {
  const oldPath = path.resolve(__dirname, "..", "src", "content", "docs", "03-fundamentos-de-ia", "04-agentes-orquestadores.md");
  assert.ok(!fs.existsSync(oldPath), "Old agents-orquestadores page should be removed");
});

test("RED (PR 2.2): new lessons are registered in curriculum.mjs", () => {
  const curriculumPath = path.resolve(__dirname, "..", "src", "data", "curriculum.mjs");
  const content = fs.readFileSync(curriculumPath, "utf8");
  assert.match(content, /04-de-modelo-a-agente/);
  assert.match(content, /05-contexto-herramientas-y-memoria/);
  assert.match(content, /05-patrones-de-agentes-y-mcp/);
  assert.match(content, /02-confianza-verificable/);
  // Old slug must NOT be registered
  assert.doesNotMatch(content, /04-agentes-orquestadores/);
});

test("RED (PR 2.2): forbidden phrases are rejected", () => {
  // These 4 phrases must NOT appear in any PR 2.2 page
  const forbidden = [
    "el agente siempre recuerda",
    "MCP almacena memoria",
    "un check verde prueba producción",
    "un reviewer y un implementador deben ser el mismo agente",
  ];
  const allPages = [AGENT_PAGE_04, AGENT_PAGE_05, AGENT_PAGE_PATTERNS, AGENT_PAGE_TRUST];
  for (const filePath of allPages) {
    const content = fs.readFileSync(filePath, "utf8");
    for (const phrase of forbidden) {
      // Match whole phrase, not substrings of longer phrases
      assert.doesNotMatch(content, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        `Forbidden phrase found in ${path.basename(filePath)}: "${phrase}"`);
    }
  }
});

test("RED (PR 2.2): glossary has new agent terms", () => {
  const glossaryPath = path.resolve(__dirname, "..", "data", "terminology", "glossary.yml");
  const content = fs.readFileSync(glossaryPath, "utf8");
  const requiredTerms = [
    "Agente",
    "Modelo (de IA)",
    "Contexto (de agente)",
    "Herramienta (tool)",
    "Skill",
    "MCP (Model Context Protocol)",
    "ReAct",
    "Orquestación",
    "Autonomía",
    "Evidencia",
    "Trazabilidad",
    "Confianza verificable",
  ];
  for (const term of requiredTerms) {
    assert.ok(content.includes(`  - term: "${term}"`), `Missing glossary term: ${term}`);
  }
});

test("RED (PR 2.2): each page has at least one exercise", () => {
  for (const [name, filePath] of AGENT_NEW_PAGES) {
    const content = fs.readFileSync(filePath, "utf8");
    assert.match(content, /## Comprueba lo aprendido/);
    // Has at least one numbered exercise
    const exercises = content.match(/^\d+\.\s/gm);
    assert.ok(exercises && exercises.length >= 1, `${name}: needs at least 1 exercise item`);
  }
});

test("RED (PR 2.2): Mermaid validation passes for all pages", () => {
  const { execSync } = require("child_process");
  try {
    execSync(`node "${path.resolve(__dirname, "..", "scripts", "validate-mermaid.cjs")}"`, { encoding: "utf8", timeout: 30000, stdio: "pipe" });
  } catch (e) {
    assert.fail(`Mermaid validation failed:\n${e.stderr || e.message}`);
  }
});

test("RED (PR 2.2): legacy agents-orquestadores URL redirect exists and is correct", () => {
  const redirectPath = path.resolve(__dirname, "..", "public", "03-fundamentos-de-ia", "04-agentes-orquestadores", "index.html");
  const oldMarkdown = path.resolve(__dirname, "..", "src", "content", "docs", "03-fundamentos-de-ia", "04-agentes-orquestadores.md");
  const distRedirect = path.resolve(__dirname, "..", "dist", "03-fundamentos-de-ia", "04-agentes-orquestadores", "index.html");
  const canonicalDest = path.resolve(__dirname, "..", "dist", "03-fundamentos-de-ia", "04-de-modelo-a-agente", "index.html");

  // 1. Redirect source file exists in public/
  assert.ok(fs.existsSync(redirectPath), "Redirect file must exist in public/");

  // 2. Old Markdown lesson is removed
  assert.ok(!fs.existsSync(oldMarkdown), "Old agents-orquestadores.md must remain deleted");

  // 3. The redirect href is relative (works under any base path)
  const html = fs.readFileSync(redirectPath, "utf8");
  assert.match(html, /url=\.\.\/04-de-modelo-a-agente\/"/, "meta refresh target must be relative");
  assert.match(html, /window\.location\.replace\("\.\.\/04-de-modelo-a-agente\/"\)/, "JS redirect must use relative URL");

  // 4. Canonical link points to the new page's full public URL
  assert.match(html, /rel="canonical"/, "must have canonical link");
  assert.match(html, /04-de-modelo-a-agente/, "canonical must reference the new page");
  assert.match(html, /noindex/, "must have noindex");

  // Only check dist/ after a build exists
  if (fs.existsSync(distRedirect)) {
    // 5. Built dist/ has the redirect
    const builtHtml = fs.readFileSync(distRedirect, "utf8");
    assert.match(builtHtml, /url=\.\.\/04-de-modelo-a-agente\//, "built redirect must contain correct target");
    assert.match(builtHtml, /noindex/, "built redirect must have noindex");

    // 6. The new canonical page exists in dist/
    assert.ok(fs.existsSync(canonicalDest), "Canonical destination page must exist in dist/");
  }
});

// ─────────────────────────────────────────────
// RED tests — PR 3: Gentle ecosystem operations + Organic RDD
// These MUST fail before implementation.
// ─────────────────────────────────────────────

const PR3_PAGES = [
  ['07-gentle-ai/05-comandos-del-ecosistema', path.resolve(__dirname, '..', 'src', 'content', 'docs', '07-gentle-ai', '05-comandos-del-ecosistema.md')],
  ['07-gentle-ai/06-actualizar-y-sincronizar', path.resolve(__dirname, '..', 'src', 'content', 'docs', '07-gentle-ai', '06-actualizar-y-sincronizar.md')],
  ['07-gentle-ai/07-flujo-organico-y-rdd', path.resolve(__dirname, '..', 'src', 'content', 'docs', '07-gentle-ai', '07-flujo-organico-y-rdd.md')],
  ['14-modelos-y-enrutamiento/02-asignar-modelos', path.resolve(__dirname, '..', 'src', 'content', 'docs', '14-modelos-y-enrutamiento', '02-asignar-modelos.md')],
  ['16-arquitectura-tecnica/02-arquitectura-gentle-y-hosts', path.resolve(__dirname, '..', 'src', 'content', 'docs', '16-arquitectura-tecnica', '02-arquitectura-gentle-y-hosts.md')],
];

test("RED (PR 3): all 5 new pages exist", () => {
  for (const [name, filePath] of PR3_PAGES) {
    assert.ok(fs.existsSync(filePath), `Page ${name} does not exist yet — RED expected`);
  }
});

test("RED (PR 3): curriculum has all 5 new lessons", () => {
  const { modules } = require('../src/data/curriculum.mjs');
  const slugs = new Set();
  modules.forEach(m => m.lessons.forEach(l => slugs.add(l.slug)));
  const expected = [
    '07-gentle-ai/05-comandos-del-ecosistema',
    '07-gentle-ai/06-actualizar-y-sincronizar',
    '07-gentle-ai/07-flujo-organico-y-rdd',
    '14-modelos-y-enrutamiento/02-asignar-modelos',
    '16-arquitectura-tecnica/02-arquitectura-gentle-y-hosts',
  ];
  for (const slug of expected) {
    assert.ok(slugs.has(slug), `Curriculum missing slug: ${slug}`);
  }
});

test("RED (PR 3): profiles reference new lesson slugs", () => {
  const { profiles } = require('../src/data/curriculum.mjs');
  const allHrefs = profiles.flatMap(p => p.lessonHrefs);
  const expected = [
    '/07-gentle-ai/05-comandos-del-ecosistema/',
    '/07-gentle-ai/06-actualizar-y-sincronizar/',
    '/07-gentle-ai/07-flujo-organico-y-rdd/',
    '/14-modelos-y-enrutamiento/02-asignar-modelos/',
    '/16-arquitectura-tecnica/02-arquitectura-gentle-y-hosts/',
  ];
  for (const href of expected) {
    assert.ok(allHrefs.includes(href), `No profile references ${href}`);
  }
});

test("RED (PR 3): catalog parses", () => {
  const YAML = require('js-yaml');
  const catalogPath = path.resolve(__dirname, '..', 'data', 'evidence', 'gentle-command-catalog.yml');
  const raw = fs.readFileSync(catalogPath, 'utf8');
  const parsed = YAML.load(raw);
  assert.ok(Array.isArray(parsed), 'Catalog must be an array');
  assert.ok(parsed.length >= 40, `Expected 40+ entries, got ${parsed.length}`);
  const ids = new Set();
  for (const entry of parsed) {
    assert.ok(!ids.has(entry.id), `Duplicate catalog id: ${entry.id}`);
    ids.add(entry.id);
  }
});

test("RED (PR 3): no internal phase listed as slash command", () => {
  const YAML = require('js-yaml');
  const catalogPath = path.resolve(__dirname, '..', 'data', 'evidence', 'gentle-command-catalog.yml');
  const raw = fs.readFileSync(catalogPath, 'utf8');
  const parsed = YAML.load(raw);
  const internalSlash = parsed.filter(e => e.surface === 'slash-command' && e.status === 'internal');
  assert.equal(internalSlash.length, 0, `Internal phases should not be slash commands: ${internalSlash.map(e => e.id).join(', ')}`);
});

test("RED (PR 3): review finalize --result is not a current command", () => {
  const YAML = require('js-yaml');
  const catalogPath = path.resolve(__dirname, '..', 'data', 'evidence', 'gentle-command-catalog.yml');
  const raw = fs.readFileSync(catalogPath, 'utf8');
  const parsed = YAML.load(raw);
  const currentResult = parsed.filter(e =>
    e.status === 'current' &&
    e.syntax && e.syntax.includes('review finalize') &&
    /\b--result\b(?!-)/.test(e.syntax)
  );
  assert.equal(currentResult.length, 0, 'review finalize --result must not be current');
});

test("RED (PR 3): sync not described as upgrade", () => {
  const YAML = require('js-yaml');
  const catalogPath = path.resolve(__dirname, '..', 'data', 'evidence', 'gentle-command-catalog.yml');
  const raw = fs.readFileSync(catalogPath, 'utf8');
  const parsed = YAML.load(raw);
  const sync = parsed.find(e => e.id === 'cli-sync');
  assert.ok(sync, 'cli-sync entry exists');
  assert.doesNotMatch(sync.result || '', /upgrade|update.*binary|reinstall/i, 'sync result must not claim to upgrade binary');
});

test("RED (PR 3): doctor not described as repair", () => {
  const YAML = require('js-yaml');
  const catalogPath = path.resolve(__dirname, '..', 'data', 'evidence', 'gentle-command-catalog.yml');
  const raw = fs.readFileSync(catalogPath, 'utf8');
  const parsed = YAML.load(raw);
  const doctor = parsed.find(e => e.id === 'cli-doctor');
  assert.ok(doctor, 'cli-doctor entry exists');
  assert.doesNotMatch(doctor.result || '', /repair|fix|recover|repara/i, 'doctor result must not claim to repair');
});

test("RED (PR 3): glossary has new PR 3 terms", () => {
  const glossaryPath = path.resolve(__dirname, '..', 'data', 'terminology', 'glossary.yml');
  const content = fs.readFileSync(glossaryPath, 'utf8');
  const requiredTerms = [
    'flujo orgánico',
    'trabajo directo',
    'delegación focalizada',
    'SDD opcional',
    'candidato',
    'candidato congelado',
    'bytes exactos',
    'proyección',
    'tier de revisión',
    'lens',
    'refuter',
    'autoridad de review',
    'lineage',
    'receipt ligado al contenido',
    'gate de entrega',
    'review mode',
    'kill switch',
    'consentimiento por candidato',
    'recovery',
    'reconciliación',
    'deferencia',
    'configurador de ecosistema',
    'host',
    'runtime',
    'asset administrado',
    'install',
    'update',
    'upgrade',
    'sync',
    'state',
    'backup',
    'restore',
    'doctor',
    'catálogo de comandos',
    'slash command',
    'fase interna',
    'perfil de modelos',
    'fallback',
    'degradación de capacidad',
    'herencia de modelo',
    'sync',
    'upgrade',
    'fallback',
    'configurador de ecosistema',
  ];
  for (const term of [...new Set(requiredTerms)]) {
    assert.ok(content.includes(`  - term: "${term}"`), `Missing glossary term: "${term}"`);
  }
});

test("RED (PR 3): Go v2 uses /v2", () => {
  const content0706 = path.resolve(__dirname, '..', 'src', 'content', 'docs', '07-gentle-ai', '06-actualizar-y-sincronizar.md');
  if (fs.existsSync(content0706)) {
    const text = fs.readFileSync(content0706, 'utf8');
    assert.match(text, /\/v2\//, 'Go install path must use /v2');
  }
});

test("RED (PR 3): 02-confianza-verificable links to new pages", () => {
  const trustPage = path.resolve(__dirname, '..', 'src', 'content', 'docs', '17-gobierno', '02-confianza-verificable.md');
  const content = fs.readFileSync(trustPage, 'utf8');
  const expectedLinks = [
    '/07-gentle-ai/05-comandos-del-ecosistema/',
    '/07-gentle-ai/07-flujo-organico-y-rdd/',
    '/16-arquitectura-tecnica/02-arquitectura-gentle-y-hosts/',
    '/14-modelos-y-enrutamiento/02-asignar-modelos/',
  ];
  for (const link of expectedLinks) {
    assert.match(content, new RegExp(link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Missing link: ${link}`);
  }
});

test("RED (PR 3): all glossary terms reference existent pages", () => {
  const YAML = require('js-yaml');
  const glossaryPath = path.resolve(__dirname, '..', 'data', 'terminology', 'glossary.yml');
  const raw = fs.readFileSync(glossaryPath, 'utf8');
  const parsed = YAML.load(raw);
  const issues = [];
  for (const entry of parsed.terms) {
    if (!entry.reference) continue;
    const mdPath = path.resolve(__dirname, '..', 'src', 'content', 'docs', entry.reference.replace(/^content\//, '').replace(/\/$/, '.md'));
    if (!fs.existsSync(mdPath)) {
      // Allow directory-level refs to existing dirs
      const dirPath = path.resolve(__dirname, '..', 'src', 'content', 'docs', entry.reference.replace(/^content\//, '').replace(/\/$/, ''));
      if (!fs.existsSync(dirPath)) {
        issues.push(`"${entry.term}" → ${entry.reference} — not found at ${mdPath} or ${dirPath}`);
      }
    }
  }
  if (issues.length > 0) {
    assert.fail(`Glossary reference issues:\n${issues.map(i => '  ' + i).join('\n')}`);
  }
});

test("RED (PR 3): actualizar-y-sincronizar page does not present backup as CLI command", () => {
  const pagePath = path.resolve(__dirname, '..', 'src', 'content', 'docs', '07-gentle-ai', '06-actualizar-y-sincronizar.md');
  const content = fs.readFileSync(pagePath, 'utf8');
  // "gentle-ai backup" may appear in explanatory text ("no existe comando...") but NOT as a runnable command example
  const runnableBackup = content.match(/```[\s\S]*?```/g);
  if (runnableBackup) {
    for (const block of runnableBackup) {
      assert.doesNotMatch(block, /gentle-ai backup\b/, 'gentle-ai backup must not appear in a code block as a runnable command');
    }
  }
});
