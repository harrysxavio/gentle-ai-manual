function extractMermaidBlocks(content, source) {
  const blocks = [];
  const fencePattern = /^```mermaid[\t ]*\r?\n([\s\S]*?)^```[\t ]*(?:\r?\n|$)/gm;

  for (const match of content.matchAll(fencePattern)) {
    blocks.push({
      source,
      line: content.slice(0, match.index).split(/\r?\n/).length,
      diagram: match[1].trim(),
    });
  }

  return blocks;
}

async function validateMermaidBlocks(blocks, parse) {
  const errors = [];

  for (const block of blocks) {
    if (!block.diagram) {
      errors.push(`${block.source}:${block.line}: Empty Mermaid block`);
      continue;
    }

    try {
      await parse(block.diagram);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${block.source}:${block.line}: ${message}`);
    }
  }

  return errors;
}

module.exports = { extractMermaidBlocks, validateMermaidBlocks };
