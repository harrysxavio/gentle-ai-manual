// src/plugins/mermaid-zoom.js — Accessible zoom for Mermaid diagrams.
// Runs AFTER rehype-mermaid (inline-svg strategy): every rendered Mermaid
// <svg> is wrapped in a <figure> with an "Ampliar diagrama" button and a
// <dialog> containing a STATIC CLONE of the diagram. Opening the dialog shows
// the full-size clone (no re-render needed); the no-JS fallback is the
// original diagram inside a horizontally scrollable .mermaid-zoom__stage.
// Focus management and Escape handling live in public/scripts/mermaid-zoom.js;
// the native <dialog> element already handles Escape and focus trapping.
import { visit, SKIP } from 'unist-util-visit';

const MERMAID_ID_PREFIX = 'mermaid-';

function isMermaidSvg(node) {
  const props = node.properties || {};
  const role = String(props.ariaRoledescription || props['aria-roledescription'] || '').toLowerCase();
  const id = String(props.id || '');
  return (
    // Exact 'graph' only: a prefix match would also catch valid ARIA roles
    // like graphics-document/graphics-symbol/graphics-object.
    (role.startsWith('flowchart') || role === 'graph') ||
    id.startsWith(MERMAID_ID_PREFIX)
  );
}

// Rebase every occurrence of the original diagram id inside the cloned tree so
// the clone is self-consistent: root id, descendant ids (e.g.
// `mermaid-0_flowchart-v2-pointEnd`), url(#...) references and the internal
// <style> text (scoped to `#mermaid-0`) all move to the `mz-` namespace.
function rebaseHastStrings(node, rawId, zoomId) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'text') {
    node.value = String(node.value).split(rawId).join(zoomId);
    return;
  }
  if (node.type === 'element') {
    for (const key of Object.keys(node.properties || {})) {
      const value = node.properties[key];
      if (typeof value === 'string') node.properties[key] = value.split(rawId).join(zoomId);
    }
    for (const child of node.children || []) rebaseHastStrings(child, rawId, zoomId);
  }
}

function cloneHast(node, rawId, cloneId) {
  const clone = JSON.parse(JSON.stringify(node));
  // The clone lives in the same document as the original: it must keep a
  // UNIQUE id (never the original's nor the dialog's) while its internal
  // <style> rules stay scoped to it, so the popup renders with full Mermaid
  // styling and no duplicate DOM ids.
  if (rawId) {
    rebaseHastStrings(clone, rawId, cloneId);
  } else if (clone.properties) {
    clone.properties.id = cloneId;
  }
  return clone;
}

function h(name, properties, children) {
  return { type: 'element', tagName: name, properties: properties || {}, children: children || [] };
}

function text(value) {
  return { type: 'text', value: String(value) };
}

export default function rehypeMermaidZoom() {
  let counter = 0;

  return (tree) => {
    visit(tree, (node) => node.tagName === 'svg', (node, index, parent) => {
      if (!isMermaidSvg(node)) return undefined;

      const rawId = String((node.properties && node.properties.id) || '');
      const zoomId = rawId ? 'mz-' + rawId : 'mz-' + ++counter;
      // The dialog (id = zoomId, targeted by the button's aria-controls) and
      // the cloned <svg> share the document: the clone root gets its own id so
      // the rebased <style> rules scope to the clone alone.
      const cloneId = zoomId + '-clone';

      const figure = h('figure', { class: ['mermaid-zoom'], dataMermaidZoom: '' }, [
        h('div', { class: ['mermaid-zoom__stage'] }, [node]),
        h('figcaption', { class: ['mermaid-zoom__actions'] }, [
          h('button', { type: 'button', class: ['mermaid-zoom__btn'], ariaHaspopup: 'dialog', ariaControls: zoomId, ariaExpanded: 'false' }, [
            text('Ampliar diagrama'),
          ]),
        ]),
        h('dialog', { id: zoomId, class: ['mermaid-zoom__dialog'], ariaLabel: 'Diagrama ampliado', dataPagefindIgnore: '' }, [
          h('div', { class: ['mermaid-zoom__dialog-body'] }, [cloneHast(node, rawId, cloneId)]),
          h('button', { type: 'button', class: ['mermaid-zoom__close'] }, [text('Cerrar diagrama')]),
        ]),
      ]);

      parent.children[index] = figure;
      // Do not descend into the wrapper: the original svg (now inside the
      // stage) and its clone (inside the dialog) must never be re-wrapped.
      return SKIP;
    });
  };
}
