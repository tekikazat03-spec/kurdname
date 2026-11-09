export type ResolvedSource = {
  label: string;
  href: string;
  direct: boolean;
};

/**
 * Legacy biographies store sources as strings. Keep that format compatible:
 * "Author, Book (year) | https://...", Markdown links, bare URLs, and DOIs.
 * For citations without a verified URL, link to a clearly marked search,
 * never pretend the search is a direct link to the cited work.
 */
export function resolveSource(source: string): ResolvedSource {
  const original = source.trim();
  const markdown = original.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/i);
  const plainUrl = original.match(/https?:\/\/[^\s<>"'`]+/i);
  const rawUrl = markdown?.[2] || plainUrl?.[0] || "";
  const cleanedUrl = rawUrl.replace(/[.,;:!?)}\]]+$/, "");

  let label = markdown
    ? original.replace(markdown[0], markdown[1]).trim()
    : original;

  // A label and URL can be entered as "Title | https://example.org".
  label = label.replace(/\s*\|\s*https?:\/\/\S+\s*$/i, "").trim();

  if (cleanedUrl) {
    try {
      const parsed = new URL(cleanedUrl);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return { label: label || original, href: parsed.href, direct: true };
      }
    } catch {
      // Leave invalid references searchable rather than creating broken links.
    }
  }

  const doi = original.match(/\b(10\.\d{4,9}\/[-._;()/:a-z0-9]+)\b/i);
  if (doi) {
    return {
      label: original,
      href: `https://doi.org/${doi[1]}`,
      direct: true,
    };
  }

  const query = original
    .replace(/^\s*(?:\[\d+\]|\d+[.)])\s*/, "")
    .slice(0, 350);

  return {
    label: original,
    href: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    direct: false,
  };
}
