#!/usr/bin/env node

const path = require('node:path');
const { validateBuiltSite } = require('./lib/site-contract.cjs');

const args = process.argv.slice(2);
const baseIndex = args.indexOf('--base');
const base = baseIndex === -1 ? undefined : args[baseIndex + 1];
const dist = args.find((argument, index) => argument !== '--base' && index !== baseIndex + 1);

if (!base || !dist) {
  console.error('Usage: node scripts/validate-built-site.cjs --base <base> <dist>');
  process.exit(1);
}

const errors = validateBuiltSite({ distDir: path.resolve(dist), base });
for (const error of errors) {
  console.error(error);
}

if (errors.length > 0) {
  process.exit(1);
}
