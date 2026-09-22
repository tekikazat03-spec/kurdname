import Link from "next/link";

type BiographySection = {
  title?: string;
  content?: string;
};

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
  biography?: BiographySection[];
  sources?: string[];
};

async function getPerson(slug: string): Promise<Person | null> {
  try {
    const response = await fetch(
      "https://kurdname-7ba60-default-rtdb.firebaseio.com/people.json",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data) {
      return null;
    }

    const people = Object.values(data) as Person[];

    const person = people.find(
      (item) => item.slug === decodeURIComponent(slug)
    );

    return person || null;
  } catch (error) {
    console.error("Kişi alınamadı:", error);
    return null;
  }
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const person = await getPerson(slug);

  if (!person) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] px-6 py-24 text-[#e8e3d8]">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center text-center">
          <div className="text-7xl font-light text-white/20">404</div>

          <h1 className="mt-6 text-2xl font-light text-white">
            Kişi bulunamadı
          </h1>

          <Link
            href="/kisiler"
            className="mt-10 border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.25em] text-white/70 transition hover:border-white/40 hover:text-white"
          >
            ← Kişilere Dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <Link
            href="/kisiler"
            className="text-xs uppercase tracking-[0.25em] text-white/50 transition hover:text-white"
          >
            ← Kişiler
          </Link>

          <Link
            href="/"
            className="text-xl font-semibold tracking-[0.2em] text-white"
          >
            KURDNAME
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[420px_1fr] lg:px-10 lg:py-24">
          {/* FOTOĞRAF */}
          <div>
            {person.imageUrl ? (
              <img
                src={person.imageUrl}
                alt={person.name}
                className="w-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center border border-white/10 bg-white/[0.03] text-sm text-white/30">
                Fotoğraf yok
              </div>
            )}
          </div>

          {/* BİLGİLER */}
          <div className="flex flex-col justify-center">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#a99f8b]">
              {person.category || "Kişi"}
            </div>

            <h1 className="mt-5 text-5xl font-light leading-tight tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              {person.name}
            </h1>

            {(person.birth || person.death) && (
              <div className="mt-6 text-lg tracking-[0.08em] text-[#bdb4a3]">
                {person.birth || "—"} — {person.death || "—"}
              </div>
            )}

            {person.tags && person.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {person.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-white/15 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {person.shortBio && (
              <p className="mt-10 max-w-2xl text-base leading-8 text-[#bcb5a8]">
                {person.shortBio}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* BİYOGRAFİ */}
      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="mb-14">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#a99f8b]">
            KURDNAME ARŞİVİ
          </div>

          <h2 className="mt-4 text-3xl font-light text-white sm:text-4xl">
            Biyografi
          </h2>
        </div>

        {person.biography && person.biography.length > 0 ? (
          <div className="space-y-16">
            {person.biography.map((section, index) => (
              <article key={index}>
                {section.title && section.title.trim() !== "" && (
                  <h3 className="mb-5 text-2xl font-light text-white">
                    {section.title}
                  </h3>
                )}

                {section.content && (
                  <div className="whitespace-pre-line text-base leading-9 text-[#bcb5a8]">
                    {section.content}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-white/40">
            Bu kişi için henüz biyografi eklenmemiş.
          </p>
        )}
      </section>

      {/* KAYNAKLAR */}
      {person.sources && person.sources.length > 0 && (
        <section className="border-t border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#a99f8b]">
              KAYNAKLAR
            </div>

            <h2 className="mt-4 text-3xl font-light text-white">
              Kaynaklar
            </h2>

            <div className="mt-10 space-y-4">
              {person.sources.map((source, index) => (
                <div
                  key={index}
                  className="border-b border-white/10 pb-4 text-sm leading-7 text-[#aaa395]"
                >
                  {source}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 lg:px-10">
          <div className="text-xs tracking-[0.2em] text-white/30">
            KURDNAME
          </div>

          <Link
            href="/kisiler"
            className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
          >
            Kişilere Dön
          </Link>
        </div>
      </footer>
    </main>
  );
}