import Link from "next/link";
import {
  getArchiveItems,
  searchArchive,
  type ArchiveItem,
} from "@/lib/archive-search";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Arşiv Araması | KURDNAME",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; baslangic?: string; bitis?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const start = Number(params.baslangic) || 0;
  const end = Number(params.bitis) || 0;

  let results: ArchiveItem[] = [];
  let error = false;

  if (query) {
    try {
      const items = await getArchiveItems();
      results = searchArchive(items, query).filter((item) => {
        if (!start && !end) return true;
        if (item.year === null) return false;
        return (!start || item.year >= start) &&
               (!end || item.year <= end);
      });
    } catch {
      error = true;
    }
  }

  return (
    <main className="min-h-screen bg-[#0b100e] text-[#e8e0cb]">
      <header className="border-b border-[#b99a5b]/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
          <Link
            href="/"
            className="text-xl font-semibold tracking-[0.25em] text-[#d6b875]"
          >
            KURDNAME
          </Link>

          <Link href="/" className="text-sm text-[#b8ad94]">
            ← Ana Sayfa
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-[#c2a46a]">
          DİJİTAL ARŞİV
        </p>

        <h1 className="mt-5 font-serif text-4xl text-[#f1e6cc] sm:text-6xl">
          Arşivde Ara
        </h1>

        <form action="/arama" method="get" className="mt-10 flex flex-wrap gap-3">
          <input
            name="q"
            type="search"
            aria-label="Aranacak kelime"
            defaultValue={query}
            placeholder="Aramak istediğin kelime..."
            className="min-w-0 flex-1 bg-[#111a15] px-5 py-4 text-[#f1e6cc] outline-none"
          />

          <input
            name="baslangic"
            type="number"
            min="1000"
            max="2100"
            placeholder="İlk yıl"
            aria-label="Başlangıç yılı"
            defaultValue={params.baslangic || ""}
            className="w-28 border border-[#b99a5b]/50 bg-[#111a15] px-3 py-4 text-[#f1e6cc]"
          />

          <input
            name="bitis"
            type="number"
            min="1000"
            max="2100"
            placeholder="Son yıl"
            aria-label="Bitiş yılı"
            defaultValue={params.bitis || ""}
            className="w-28 border border-[#b99a5b]/50 bg-[#111a15] px-3 py-4 text-[#f1e6cc]"
          />

          <button
            type="submit"
            className="bg-[#c9a66b] px-6 font-semibold text-[#0b100e]"
          >
            ARA
          </button>
        </form>

        {query && !error && (
          <p className="mt-10 border-b border-[#b99a5b]/20 pb-5 text-sm text-[#a89f8b]">
            “{query}” için {results.length} sonuç bulundu.
          </p>
        )}

        {error ? (
          <p className="mt-12 text-red-300">
            Arşiv kayıtları alınamadı. Lütfen daha sonra tekrar dene.
          </p>
        ) : query && results.length === 0 ? (
          <div className="mt-10 border border-[#b99a5b]/20 bg-[#111a15] p-12 text-center">
            <h2 className="font-serif text-2xl text-[#e8d7b3]">
              Sonuç Bulunamadı
            </h2>

            <p className="mt-4 text-sm text-[#a89f8b]">
              Farklı bir isim veya kelimeyle aramayı dene.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {results.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block border border-[#b99a5b]/20 bg-[#111a15] p-7 transition hover:border-[#c9a66b]/70"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a66b]">
                  {item.category}
                </p>

                <h2 className="mt-3 font-serif text-2xl text-[#f1e6cc]">
                  {item.title}
                </h2>

                {item.description && (
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#b8b3a6]">
                    {item.description}
                  </p>
                )}

                <p className="mt-5 text-xs uppercase tracking-[0.15em] text-[#c9a66b]">
                  Kaydı İncele →
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
