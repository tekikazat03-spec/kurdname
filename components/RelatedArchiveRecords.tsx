import Link from "next/link";

type RelatedRecord = {
  name: string;
  href: string;
  category: string;
};

const collections = [
  { key: "organizations", route: "orgutler", category: "Örgüt" },
  { key: "parties", route: "partiler", category: "Parti" },
];

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
}

function getNames(value: unknown): string[] {
  if (typeof value === "string") {
    return value.split(",").map((name) => name.trim());
  }

  if (Array.isArray(value)) {
    return value.filter(
      (name): name is string => typeof name === "string"
    );
  }

  if (value && typeof value === "object") {
    return Object.values(value).filter(
      (name): name is string => typeof name === "string"
    );
  }

  return [];
}

export default async function RelatedArchiveRecords({
  personName,
}: {
  personName: string;
}) {
  const results = await Promise.all(
    collections.map(async (collection): Promise<RelatedRecord[]> => {
      try {
        const response = await fetch(
          `https://kurdname-7ba60-default-rtdb.firebaseio.com/${collection.key}.json`,
          { cache: "no-store" }
        );

        if (!response.ok) return [];

        const data: unknown = await response.json();

        if (!data || typeof data !== "object") return [];

        return Object.values(data).flatMap((value) => {
          if (!value || typeof value !== "object") return [];

          const record = value as Record<string, unknown>;

          if (
            typeof record.name !== "string" ||
            typeof record.slug !== "string"
          ) {
            return [];
          }

          const isRelated = getNames(record.people).some(
            (name) => normalize(name) === normalize(personName)
          );

          if (!isRelated) return [];

          return [{
            name: record.name,
            category: collection.category,
            href: `/${collection.route}/${record.slug}`,
          }];
        });
      } catch (error) {
        console.error("İlişkili kayıt yüklenemedi:", error);
        return [];
      }
    })
  );

  const related = results.flat();

  if (related.length === 0) return null;

  return (
    <section className="border-t border-[#c9a66b]/20 bg-[#101711]">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-[#c9a66b]">
          KURDNAME ARŞİVİ
        </p>

        <h2 className="mt-5 font-serif text-3xl text-[#f1e6cc]">
          İlişkili Arşiv Kayıtları
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {related.map((record) => (
            <Link
              key={record.href}
              href={record.href}
              className="group border border-[#c9a66b]/25 bg-[#17211a] p-7 transition hover:border-[#c9a66b]"
            >
              <p className="text-xs tracking-[0.2em] text-[#c9a66b]">
                {record.category}
              </p>

              <div className="mt-5 flex items-center justify-between gap-4">
                <h3 className="font-serif text-2xl text-[#f1e6cc]">
                  {record.name}
                </h3>

                <span className="text-2xl text-[#c9a66b]">
                  →
                </span>
              </div>

              <p className="mt-5 text-xs text-[#aaa397]">
                Arşiv kaydını incele
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
