const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#039;": "'",
  "&nbsp;": " ",
  "&ndash;": "–",
  "&mdash;": "—",
  "&lsquo;": "‘",
  "&rsquo;": "’",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&hellip;": "…",
  "&bull;": "•",
};

export function decodeEntities(input: string): string {
  if (!input) return input;

  return input.replace(/&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, (match) => {
    if (match.startsWith("&#x")) {
      const code = parseInt(match.slice(3, -1), 16);
      return Number.isNaN(code) ? match : String.fromCharCode(code);
    }
    if (match.startsWith("&#")) {
      const code = parseInt(match.slice(2, -1), 10);
      return Number.isNaN(code) ? match : String.fromCharCode(code);
    }
    return NAMED_ENTITIES[match] ?? match;
  });
}

interface WpTextField {
  rendered?: string;
}

export function decodeWpText<T>(item: T): T {
  if (!item || typeof item !== "object") return item;

  const obj = item as T & {
    title?: WpTextField;
    excerpt?: WpTextField | null;
  };

  return {
    ...obj,
    title: obj.title ? { ...obj.title, rendered: decodeEntities(obj.title.rendered ?? "") } : obj.title,
    excerpt: obj.excerpt ? { ...obj.excerpt, rendered: decodeEntities(obj.excerpt.rendered ?? "") } : obj.excerpt,
  };
}
