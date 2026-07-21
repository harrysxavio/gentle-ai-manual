const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

function walkHtmlFiles(root, current = root) {
  const files = [];

  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const target = path.join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(root, target));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(target);
    }
  }

  return files.sort();
}

function isInside(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function inspectTarget(distDir, relativeTarget) {
  const target = path.resolve(distDir, ...relativeTarget.split('/'));

  if (!isInside(distDir, target)) {
    return 'outside';
  }

  if (fs.existsSync(target) && fs.statSync(target).isFile()) {
    return isInside(distDir, fs.realpathSync(target)) ? 'exists' : 'outside';
  }

  const index = path.join(target, 'index.html');
  if (fs.existsSync(index) && fs.statSync(index).isFile()) {
    return isInside(distDir, fs.realpathSync(index)) ? 'exists' : 'outside';
  }

  return 'missing';
}

function validateBuiltSite({ distDir, base }) {
  const canonicalDistDir = fs.realpathSync(path.resolve(distDir));
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const errors = [];
  let renderedMermaidFound = false;

  for (const htmlFile of walkHtmlFiles(distDir)) {
    const page = path.relative(distDir, htmlFile).split(path.sep).join('/');
    const content = fs.readFileSync(htmlFile, 'utf8');
    const document = JSDOM.fragment(content);
    const generatedMermaidSvg = [...document.querySelectorAll('svg')].some((svg) => {
      const hasGeneratedIdentity = /^mermaid-\d+$/.test(svg.getAttribute('id') || '')
        && svg.hasAttribute('aria-roledescription');
      return svg.classList.contains('mermaid') || hasGeneratedIdentity;
    });

    if (generatedMermaidSvg) {
      renderedMermaidFound = true;
    }

    for (const _element of document.querySelectorAll('code.language-mermaid')) {
      errors.push(`${page}: unrendered Mermaid code fence`);
    }

    const attributes = content.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi);

    for (const match of attributes) {
      const url = match[2];
      if (/^(?:https?:|mailto:|tel:|data:)/i.test(url) || url.startsWith('#')) {
        continue;
      }

      const cleanUrl = url.split(/[?#]/, 1)[0];
      let relativeTarget;

      if (cleanUrl === '') {
        relativeTarget = page;
      } else if (cleanUrl.startsWith('/')) {
        if (!cleanUrl.startsWith(normalizedBase)) {
          errors.push(`${page}: ${url}: outside configured base`);
          continue;
        }
        relativeTarget = cleanUrl.slice(normalizedBase.length);
      } else {
        relativeTarget = path.posix.normalize(path.posix.join(path.posix.dirname(page), cleanUrl));
      }

      const targetStatus = inspectTarget(canonicalDistDir, relativeTarget);
      if (targetStatus === 'outside') {
        errors.push(`${page}: ${url}: outside generated site`);
      } else if (targetStatus === 'missing') {
        errors.push(`${page}: ${url}: target does not exist`);
      }
    }
  }

  if (!renderedMermaidFound) {
    errors.push('generated site: rendered Mermaid SVG not found');
  }

  return errors.sort();
}

module.exports = { validateBuiltSite };
