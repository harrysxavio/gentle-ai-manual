/**
 * Vite plugin: Auto-import pedagogical components into MDX content files.
 * This allows using components like <Definicion>, <Nota>, <Ejercicio>, etc.
 * in MDX files without explicit imports.
 */
const COMPONENT_NAMES = [
  'Definicion',
  'Analogia',
  'ExplicacionTecnica',
  'EjemploBasico',
  'EjemploAvanzado',
  'Advertencia',
  'Peligro',
  'Nota',
  'Consejo',
  'ErrorFrecuente',
  'ResultadoEsperado',
  'ComoVerificar',
  'ComoRevertir',
  'Ejercicio',
  'Pregunta',
  'Fuente',
  'Experimental',
  'DiferenciaVersion',
  'CasoOpenCode',
  'CasoCodex',
  'CasoTerminal',
  'RecomendacionModelo',
  'AlternativaEconomica',
  'EscalamientoModelo',
  'Diagrama',
];

const IMPORT_PATH = '/src/components/pedagogicos';

export function autoImportComponents() {
  const importBlock = COMPONENT_NAMES.map(
    (name) => `import ${name} from '${IMPORT_PATH}/${name}.astro';`
  ).join('\n');

  return {
    name: 'auto-import-mdx-components',
    enforce: 'pre',
    transform(code, id) {
      // Only transform MDX content files, not component files themselves
      if (
        !id.includes('/content/docs/') ||
        !(id.endsWith('.mdx') || id.endsWith('.md'))
      ) {
        return null;
      }

      // Skip files inside the components directory
      if (id.includes('/components/')) {
        return null;
      }

      // Insert imports after frontmatter (---...---) or at the beginning
      // Supports LF / CRLF and closing --- at EOF
      const fmMatch = code.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);

      if (fmMatch) {
        const fmEnd = fmMatch.index + fmMatch[0].length;
        return (
          code.slice(0, fmEnd) + '\n' + importBlock + '\n' + code.slice(fmEnd)
        );
      }

      // File starts with --- but block is malformed — error instead of silent injection
      if (code.startsWith('---')) {
        throw new Error(
          `auto-import-components: malformed frontmatter in ${id} — file starts with --- but closing delimiter is missing or invalid`
        );
      }

      return importBlock + '\n\n' + code;
    },
  };
}
