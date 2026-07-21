const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const {
  extractMermaidBlocks,
  validateMermaidBlocks,
} = require('./lib/mermaid-contract.cjs');

const rootDir = path.join(__dirname, '..');
const contentDir = path.join(rootDir, 'src', 'content', 'docs');

function collectContentFiles(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectContentFiles(fullPath));
    } else if (entry.isFile() && ['.md', '.mdx'].includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const dom = new JSDOM('<!doctype html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  const mermaid = await import('mermaid');
  const blocks = collectContentFiles(contentDir).flatMap((file) => {
    const source = path.relative(rootDir, file).replaceAll(path.sep, '/');
    return extractMermaidBlocks(fs.readFileSync(file, 'utf8'), source);
  });
  const errors = await validateMermaidBlocks(
    blocks,
    (diagram) => mermaid.default.parse(diagram),
  );

  if (errors.length > 0) {
    console.error(errors.join('\n'));
    dom.window.close();
    process.exitCode = 1;
    return;
  }

  console.log(`Parsed ${blocks.length} Mermaid diagrams.`);
  dom.window.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
