export type Section = { title: string; content: string };
export type TextLine = { text: string; size: number; bold: boolean; x: number; y: number; page: number; fontName?: string };

const normalize = (s: string) => s.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").trim();
const clean = (s: string) => s.replace(/^#{1,6}\s*/, "").replace(/^\*\*(.*?)\*\*$/, "$1").trim();
export const isSources = (s: string) => /^(kaynakca|kaynaklar|kaynakca ve notlar|kaynaklar ve notlar|bibliyografya|references|bibliography)$/.test(normalize(clean(s).replace(/^\d+[.)]\s*/, "").replace(/:$/, "")));

/** Preserve layout evidence before converting to editable text. No fixed list of section names. */
export function structuredText(pages: TextLine[][]): string {
  const all = pages.flat();
  const weights = new Map<number, number>();
  for (const line of all) weights.set(Math.round(line.size), (weights.get(Math.round(line.size)) || 0) + line.text.length);
  const bodySize = [...weights].sort((a, b) => b[1] - a[1])[0]?.[0] || 12;
  const edges = new Map<string, Set<number>>();
  for (const lines of pages) {
    for (const line of [...lines.slice(0, 1), ...lines.slice(-1)]) {
      const key = normalize(line.text);
      if (!edges.has(key)) edges.set(key, new Set());
      edges.get(key)!.add(line.page);
    }
  }
  return pages.map(lines => lines.map((line, index) => {
    const text = line.text.trim();
    if (/^(?:sayfa\s*)?\d+(?:\s*[/–-]\s*\d+)?$/i.test(text)) return "";
    if (pages.length >= 3 && (index === 0 || index === lines.length - 1) && (edges.get(normalize(text))?.size || 0) >= Math.ceil(pages.length * 0.6)) return "";
    const short = text.length <= 140 && text.split(/\s+/).length <= 16;
    const heading = short && !/[.!?;,]$/.test(text) && !/^https?:|^\d{4}\b/.test(text) &&
      (line.size > bodySize * 1.14 || (line.bold && !text.includes(":")) || isSources(text));
    const previous = lines[index - 1];
    const gap = previous && Math.abs(previous.y - line.y) > Math.max(previous.size, line.size) * 1.7;
    return `${gap ? "\n" : ""}${heading ? "## " : ""}${text}`;
  }).filter(Boolean).join("\n")).join("\n\n");
}

export function parseText(text: string) {
  const lines = text.replace(/\r/g, "").split("\n");
  const first = lines.findIndex(line => line.trim());
  const title = clean(lines[first] || "");
  // A long first paragraph is not a person's name. Keep it in the biography.
  const hasName = title.length > 0 && title.length <= 100 && !/[.!?;:]$/.test(title) && title.split(/\s+/).length <= 10 && !isSources(title);
  const biography: Section[] = [];
  let current: Section = { title: "Biyografi", content: "" };
  let sources = "", inSources = false, birth = "", death = "";
  const flush = () => {
    if (current.content.trim() || current.title !== "Biyografi") biography.push({ title: current.title, content: current.content.trim() });
  };
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (index === first && hasName) return;
    if (isSources(line)) { if (!inSources) flush(); inSources = true; return; }
    const explicit = /^#{1,6}\s+\S|^\*\*[^*]+\*\*$/.test(line);
    if (inSources && !explicit) { sources += raw + "\n"; return; }
    if (inSources) { inSources = false; current = { title: "Biyografi", content: "" }; }
    const field = line.match(/^(?:\*\*)?(Doğum(?: tarihi)?|Ölüm(?: tarihi)?)(?:\*\*)?\s*:\s*(.+)$/i);
    if (field) {
      if (normalize(field[1]).startsWith("dogum")) birth = field[2]; else death = field[2];
      return;
    }
    const numbered = /^\d{1,2}(?:\.\d{1,2})*[.)]?\s+\p{L}/u.test(line);
    const isolated = index > 0 && !lines[index - 1].trim() && index + 1 < lines.length && !lines[index + 1].trim();
    const short = line.length > 1 && line.length <= 110 && line.split(/\s+/).length <= 12 && !/[.!?;:,]$/.test(line) && !/^[-•–]|https?:/.test(line);
    if (explicit || (short && (numbered || isolated))) {
      flush(); current = { title: clean(line), content: "" };
    } else current.content += raw + "\n";
  });
  if (!inSources) flush();
  return { name: hasName ? title : "", birth, death, biography, sources: sources.trim() };
}
