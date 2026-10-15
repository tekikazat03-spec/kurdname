import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

type Person = {
  slug?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.kurdnamehistory.com";

  const pages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/kisiler`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const response = await fetch(
      "https://kurdname-7ba60-default-rtdb.firebaseio.com/people.json",
      { cache: "no-store" }
    );

    if (!response.ok) return pages;

    const data = await response.json();
    if (!data || typeof data !== "object") return pages;

    const people = Object.values(data) as Person[];

    const seen = new Set<string>();

    for (const person of people) {
      if (typeof person.slug !== "string" || !person.slug.trim()) continue;

      const slug = person.slug.trim();
      if (seen.has(slug)) continue;
      seen.add(slug);

      pages.push({
        url: `${baseUrl}/kisiler/${encodeURIComponent(slug)}`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Sitemap oluşturulamadı:", error);
  }

  return pages;
}
