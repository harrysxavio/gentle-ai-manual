/* ------------------------------------------------------------------ */
/*  Glossary loader — validates and parses glossary.yml               */
/*  Independent of process.cwd() — import ?raw resolves at build time */
/* ------------------------------------------------------------------ */

export interface GlossaryEntry {
  term: string;
  simple: string;
  reference?: string;
  category: string;
}

export interface GlossaryDocument {
  terms: GlossaryEntry[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Parse and validate a raw YAML glossary source.
 * Throws at build time with a clear message if the structure is invalid.
 */
export function parseGlossary(
  raw: unknown,
  source: string,
): GlossaryDocument {
  if (!isRecord(raw) || !Array.isArray(raw.terms)) {
    throw new Error(
      `Invalid ${source}: expected a top-level "terms" array, ` +
        `got ${typeof raw}`,
    );
  }

  const terms = raw.terms.map((item: unknown, index: number) => {
    if (!isRecord(item)) {
      throw new Error(
        `Invalid ${source} entry ${index}: expected an object, ` +
          `got ${typeof item}`,
      );
    }

    if (
      isString(item.term) &&
      isString(item.simple) &&
      isString(item.category)
    ) {
      const entry: GlossaryEntry = {
        term: item.term,
        simple: item.simple,
        category: item.category,
      };
      if (isString(item.reference)) {
        entry.reference = item.reference;
      }
      return entry;
    }

    throw new Error(
      `Invalid ${source} entry ${index}: ` +
        `"term", "simple" and "category" are required strings`,
    );
  });

  return { terms };
}
