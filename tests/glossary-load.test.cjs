/**
 * Glossary loading test — verifies that glossary.yml loads correctly
 * regardless of the current working directory.
 *
 * Test 1: Run from the normal project root.
 * Test 2: Spawn a Node subprocess from a temporary cwd to prove the
 *         loader does not depend on process.cwd().
 */

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert');
const os = require('node:os');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const GLOSSARY_YML = path.join(
  PROJECT_ROOT,
  'data',
  'terminology',
  'glossary.yml',
);

/* ------------------------------------------------------------------ */
/*  Helper: run a script from a given cwd                             */
/* ------------------------------------------------------------------ */
function runVerifyScript(cwd, label) {
  const verifyScript = path.join(PROJECT_ROOT, 'tests', 'verify-glossary-yml.cjs');

  const result = spawnSync(process.execPath, [verifyScript], {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
  });

  const status = result.status;
  const ok = status === 0;

  console.log(`  cwd: ${cwd}`);
  console.log(`  status: ${status}`);
  console.log(`  stdout: ${(result.stdout || '').slice(0, 500)}`);
  console.log(`  stderr: ${(result.stderr || '').slice(0, 500)}`);

  assert.strictEqual(
    ok,
    true,
    `${label} — expected status 0, got ${status}. stderr: ${result.stderr}`,
  );

  // Verify all expected terms are present
  const lines = (result.stdout || '').split('\n').filter(Boolean);
  const termCount = lines.find((l) => l.startsWith('TERMS='));
  const count = termCount ? parseInt(termCount.replace('TERMS=', ''), 10) : 0;

  assert.ok(count > 50, `${label} — expected >50 terms, got ${count}`);

  // Verify no ENOENT in stderr
  assert.doesNotMatch(
    result.stderr || '',
    /ENOENT/i,
    `${label} — should not contain ENOENT`,
  );
}

/* ------------------------------------------------------------------ */
/*  Tests                                                             */
/* ------------------------------------------------------------------ */

// Test 1: Run from the normal project root
{
  console.log('\n# Test 1 — from project root');
  runVerifyScript(PROJECT_ROOT, 'from project root');
}

// Test 2: Run from a temporary directory (different cwd)
{
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'glossary-test-'));
  console.log(`\n# Test 2 — from temp dir: ${tmpDir}`);
  try {
    runVerifyScript(tmpDir, 'from temp dir');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
