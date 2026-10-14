export type ArchiveItem = {
  id: string;
  title: string;
  category: string;
  href: string;
  description: string;
  year: number | null;
  searchable: string;
};

const collections = [
  { key: "people", category: "Şahsiyetler", route: "kisiler" },
  { key: "organizations", category: "Örgütler", route: "orgutler" },
  { key: "parties", category: "Partiler", route: "partiler" },
];

function toText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(toText).join(" ");
  }

  if (value && typeof value === "object") {
    return Object.values(value).map(toText).join(" ");
  }

  return "";
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function getArchiveItems(): Promise<ArchiveItem[]> {
  const results = await Promise.all(
    collections.map(async (collection) => {
      const response = await fetch(
        `https://kurdname-7ba60-default-rtdb.firebaseio.com/${collection.key}.json`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(`${collection.category} kayıtları alınamadı.`);
      }

      const data = await response.json();

      if (!data || typeof data !== "object") {
        return [] as ArchiveItem[];
      }

      return Object.entries(data).flatMap(([id, value]) => {
        if (!value || typeof value !== "object") return [];

        const record = value as Record<string, unknown>;
        const title = toText(record.name).trim();
        const slug = toText(record.slug).trim();

        if (!title || !slug) return [];

        const description = toText(record.shortBio).trim();

        const dateValue = toText(
          collection.key === "people"
            ? record.birth
            : record.startDate
        );

        const yearMatch = dateValue.match(/\b\d{4}\b/);
        const year = yearMatch ? Number(yearMatch[0]) : null;

        const searchable = [
          title,
          description,
          year,
          toText(record.tags),
          toText(record.people),
          toText(record.region),
          toText(record.birth),
          toText(record.death),
          toText(record.startDate),
          toText(record.endDate),
          toText(record.biography),
          toText(record.sources),
        ].join(" ");

        return [{
          id: `${collection.key}-${id}`,
          title,
          category: collection.category,
          href: `/${collection.route}/${slug}`,
          description,
          year,
          searchable,
        }];
      });
    })
  );

  return results.flat();
}

export function searchArchive(
  items: ArchiveItem[],
  query: string
): ArchiveItem[] {
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);

  if (terms.length === 0) return [];

  return items
    .filter((item) => {
      const content = normalize(item.searchable);
      return terms.every((term) => content.includes(term));
    })
    .sort((a, b) => {
      const aTitle = normalize(a.title);
      const bTitle = normalize(b.title);
      const first = terms[0];

      const aScore = aTitle === first ? 0 : aTitle.startsWith(first) ? 1 : 2;
      const bScore = bTitle === first ? 0 : bTitle.startsWith(first) ? 1 : 2;

      return aScore - bScore || a.title.localeCompare(b.title, "tr");
    });
}
