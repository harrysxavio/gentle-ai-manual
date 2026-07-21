const test = require('node:test');
const assert = require('node:assert/strict');
const { extractMermaidBlocks, validateMermaidBlocks } = require('../scripts/lib/mermaid-contract.cjs');

test('extracts Mermaid fences and records the opening line', () => {
  const blocks = extractMermaidBlocks('# Title\n\n```mermaid\ngraph TD\nA --> B\n```\n', 'lesson.md');
  assert.deepEqual(blocks, [{ source: 'lesson.md', line: 3, diagram: 'graph TD\nA --> B' }]);
});

test('reports parser failures with source and line', async () => {
  const blocks = [{ source: 'lesson.md', line: 7, diagram: 'not a diagram' }];
  const errors = await validateMermaidBlocks(blocks, async () => { throw new Error('Parse error'); });
  assert.deepEqual(errors, ['lesson.md:7: Parse error']);
});
