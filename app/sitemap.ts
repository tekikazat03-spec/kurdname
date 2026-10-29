import type { MetadataRoute } from "next";
import { importedPeople } from "@/lib/imported-biographies";

export const dynamic = "force-dynamic";

const baseUrl = "https://www.kurdnamehistory.com";
const firebaseUrl =
  "https://kurdname-7ba60-default-rtdb.firebaseio.com";

type RecordItem = {
  slug?: string;
};

async function getRecordUrls(
  collection: string,
  route: string
): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await fetch(
      `${firebaseUrl}/${collection}.json`,
      { cache: "no-store" }
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (!data || typeof data !== "object") return [];

    const records = Object.values(data) as RecordItem[];

    const slugs = new Set<string>();

    for (const record of records) {
      if (
        typeof record?.slug === "string" &&
        record.slug.trim()
      ) {
        slugs.add(record.slug.trim());
      }
    }

    return [...slugs].map((slug) => ({
      url: `${baseUrl}/${route}/${encodeURIComponent(slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error(`${collection} sitemap hatası:`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: baseUrl, priority: 1 },
    { url: `${baseUrl}/kisiler`, priority: 0.9 },
    { url: `${baseUrl}/partiler`, priority: 0.9 },
    { url: `${baseUrl}/orgutler`, priority: 0.9 },
  ];

  const [people, parties, organizations] = await Promise.all([
    getRecordUrls("people", "kisiler"),
    getRecordUrls("parties", "partiler"),
    getRecordUrls("organizations", "orgutler"),
  ]);

  const imported = importedPeople.map((person) => ({
    url: `${baseUrl}/kisiler/${encodeURIComponent(person.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  const all = [...pages, ...people, ...imported, ...parties, ...organizations];
  return [...new Map(all.map((item) => [item.url, item])).values()];
}
