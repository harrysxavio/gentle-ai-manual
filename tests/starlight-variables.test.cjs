// tests/starlight-variables.test.cjs — Detect invalid Starlight CSS variables
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = ['src/components/curriculum', 'src/styles', 'src/pages', 'src/content/docs'];

// Invalid patterns: --sl-color-gray followed by 2-3 digits that are NOT 1-6
const INVALID = /--sl-color-gray-(?!\d\b)(\d{2,3})\b/g;
const VALID = /--sl-color-gray-[1-6]\b/g;

function collectFiles(dir) {
  const files = [];
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return files;
  for (const entry of fs.readdirSync(fullDir, { recursive: true, withFileTypes: true })) {
    const fp = path.join(entry.parentPath || entry.path, entry.name);
    if (entry.isFile() && /\.(css|astro|mdx|mjs|cjs)$/.test(entry.name)) {
      files.push(fp);
    }
  }
  return files;
}

describe('Starlight CSS variable integrity', () => {
  const allFiles = [];
  for (const dir of SCAN_DIRS) {
    allFiles.push(...collectFiles(dir));
  }

  it('must NOT contain Tailwind-style gray scale variables (gray-50 through gray-950)', () => {
    const violations = [];
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      let match;
      INVALID.lastIndex = 0;
      while ((match = INVALID.exec(content)) !== null) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        violations.push(`${path.relative(ROOT, file)}:${lineNum}: ${match[0]}`);
      }
    }
    assert.deepEqual(violations, [], `Found ${violations.length} invalid Starlight variable(s):\n${violations.join('\n')}`);
  });

  it('should use variables that exist in Starlight (gray-1 through gray-6)', () => {
    // This test is informational; it passes as long as no invalid vars exist
    // The presence of gray-1..6 is expected but not required for every file
    const validUsages = [];
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      let match;
      VALID.lastIndex = 0;
      while ((match = VALID.exec(content)) !== null) {
        validUsages.push(`${path.relative(ROOT, file)}: ${match[0]}`);
      }
    }
    assert.ok(validUsages.length > 0, 'Expected at least one valid --sl-color-gray variable usage in curriculum files');
  });
});
