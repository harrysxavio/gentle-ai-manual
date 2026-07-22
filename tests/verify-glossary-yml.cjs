#!/usr/bin/env node
/**
 * Verifies glossary.yml loads correctly independent of process.cwd().
 * This script resolves its path relative to __filename, not cwd.
 */

const path = require('node:path');
const fs = require('node:fs');
const { load } = require('js-yaml');

// Resolve glossary.yml relative to THIS script's location, not process.cwd()
const scriptDir = path.dirname(__filename);
const glossaryPath = path.resolve(scriptDir, '..', 'data', 'terminology', 'glossary.yml');

if (!fs.existsSync(glossaryPath)) {
  console.error(`ENOENT: glossary.yml not found at ${glossaryPath}`);
  console.error(`process.cwd() = ${process.cwd()}`);
  process.exit(1);
}

const source = fs.readFileSync(glossaryPath, 'utf8');
const parsed = load(source);

if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.terms)) {
  console.error('Invalid glossary.yml: missing top-level "terms" array');
  process.exit(1);
}

// Validate every entry
parsed.terms.forEach((item, index) => {
  if (!item || typeof item.term !== 'string') {
    console.error(`Invalid glossary.yml entry ${index}: missing "term"`);
    process.exit(1);
  }
  if (typeof item.simple !== 'string') {
    console.error(`Invalid glossary.yml entry ${index} (${item.term}): missing "simple"`);
    process.exit(1);
  }
  if (typeof item.category !== 'string') {
    console.error(`Invalid glossary.yml entry ${index} (${item.term}): missing "category"`);
    process.exit(1);
  }
});

const count = parsed.terms.length;
console.log(`OK: ${count} terms loaded`);
console.log(`TERMS=${count}`);
console.log(`CWD=${process.cwd()}`);

process.exit(0);
