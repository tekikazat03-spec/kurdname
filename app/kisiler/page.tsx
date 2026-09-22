import Link from "next/link";

type Person = {
  id: string;
  name: string;
  slug: string;
  birth?: string;
  death?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  shortBio?: string;
};

async function getPeople(): Promise<Person[]> {
  try {
    const response = await fetch(
      "https://kurdname-7ba60-default-rtdb.firebaseio.com/people.json",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data) {
      return [];
    }

    return Object.values(data) as Person[];
  } catch (error) {
    console.error("Kişiler alınamadı:", error);
    return [];
  }
}

export default async function PeoplePage() {
  const people = await getPeople();

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.25em] text-white/50 transition hover:text-white"
          >
            ← Ana Sayfa
          </Link>

          <Link
            href="/"
            className="text-xl font-semibold tracking-[0.2em] text-white"
          >
            KURDNAME
          </Link>
        </div>
      </header>

      {/* BAŞLIK */}
      <section className="mx-auto max-w-7xl px-6 pb-14 pt-20 lg:px-10">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#a99f8b]">
          ARŞİV
        </div>

        <div className="mt-4 flex items-end justify-between gap-6 border-b border-white/10 pb-8">
          <h1 className="text-5xl font-light tracking-[-0.04em] text-white sm:text-6xl">
            Kayıtlı Kişiler
          </h1>

          <div className="text-xs text-white/30">
            {people.length} kayıt
          </div>
        </div>
      </section>

      {/* KİŞİLER */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        {people.length === 0 ? (
          <div className="border border-white/10 px-8 py-20 text-center">
            <p className="text-white/40">
              Henüz kayıtlı kişi bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <Link
                key={person.id}
                href={`/kisiler/${person.slug}`}
                className="group block"
              >
                <article className="overflow-hidden border border-white/10 bg-white/[0.02] transition hover:border-white/25">
                  {/* FOTOĞRAF */}
                  <div className="aspect-[4/5] overflow-hidden bg-white/[0.04]">
                    {person.imageUrl ? (
                      <img
                        src={person.imageUrl}
                        alt={person.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/20">
                        Fotoğraf yok
                      </div>
                    )}
                  </div>

                  {/* BİLGİ */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-[#a99f8b]">
                        {person.category || "Kişi"}
                      </div>

                      <div className="text-white/30 transition group-hover:text-white">
                        →
                      </div>
                    </div>

                    <h2 className="mt-4 text-2xl font-light text-white">
                      {person.name}
                    </h2>

                    {(person.birth || person.death) && (
                      <div className="mt-2 text-sm tracking-[0.08em] text-white/40">
                        {person.birth || "—"} — {person.death || "—"}
                      </div>
                    )}

                    {person.shortBio && (
                      <p className="mt-5 line-clamp-3 text-sm leading-7 text-white/45">
                        {person.shortBio}
                      </p>
                    )}

                    {person.tags && person.tags.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {person.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-white/35"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 lg:px-10">
          <div className="text-xs tracking-[0.2em] text-white/30">
            KURDNAME
          </div>

          <div className="text-xs text-white/30">
            Kürdistanın dijital arşivi
          </div>
        </div>
      </footer>
    </main>
  );
}