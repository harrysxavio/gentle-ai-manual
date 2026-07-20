// validate-mermaid.cjs
// Validates Mermaid diagram syntax in Markdown files
// Usage: node scripts/validate-mermaid.cjs

const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'src', 'content', 'docs');
const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;

let errors = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith('.md')) {
      validateFile(full);
    }
  }
}

function validateFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  let match;
  let lineErrors = 0;
  
  while ((match = mermaidRegex.exec(content)) !== null) {
    const diagram = match[1].trim();
    if (!diagram) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      console.log(`⚠️  ${path.relative(__dirname, filepath)}:${lineNum} - Empty mermaid block`);
      lineErrors++;
    }
    // Basic structural checks
    if (!diagram.startsWith('graph') && !diagram.startsWith('sequenceDiagram') && 
        !diagram.startsWith('classDiagram') && !diagram.startsWith('stateDiagram') &&
        !diagram.startsWith('flowchart') && !diagram.startsWith('erDiagram') &&
        !diagram.startsWith('gantt') && !diagram.startsWith('pie') &&
        !diagram.startsWith('journey') && !diagram.startsWith('mindmap') &&
        !diagram.startsWith('timeline') && !diagram.startsWith('gitgraph') &&
        !diagram.startsWith('quadrantChart') && !diagram.startsWith('requirementDiagram')) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      console.log(`⚠️  ${path.relative(__dirname, filepath)}:${lineNum} - Unknown diagram type`);
      lineErrors++;
    }
  }
  
  if (lineErrors > 0) {
    errors += lineErrors;
  }
}

walk(contentDir);

if (errors > 0) {
  console.log(`\n❌ Found ${errors} potential Mermaid issues`);
  process.exit(1);
} else {
  console.log('✅ All Mermaid diagrams look valid');
}
