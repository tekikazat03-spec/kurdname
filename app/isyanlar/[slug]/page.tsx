import Link from "next/link";
import { notFound } from "next/navigation";

type Photo = {
  imageUrl: string;
  caption?: string;
  source?: string;
};

type BiographySection = {
  title?: string;
  content?: string;
};

type Rebellion = {
  id: string;
  slug: string;
  name: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  shortBio?: string;
  leaders?: string[];
  photos?: Photo[];
  biography?: BiographySection[];
  sources?: string[];
};

async function getRebellion(slug: string): Promise<Rebellion | null> {
  try {
    const response = await fetch(
      "https://kurdname-7ba60-default-rtdb.firebaseio.com/rebellions.json",
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

    const rebellion = Object.entries(data).find(
      ([, value]: [string, any]) => value?.slug === slug
    );

    if (!rebellion) {
      return null;
    }

    const [id, value] = rebellion;

    return {
      id,
      ...(value as Omit<Rebellion, "id">),
    };
  } catch {
    return null;
  }
}

export default async function IsyanDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const rebellion = await getRebellion(slug);

  if (!rebellion) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      {/* Üst bar */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-6">
          <Link
            href="/isyanlar"
            className="text-sm text-white/50 transition hover:text-white"
          >
            ← Serhildan û Tevger
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-6 pb-32">
        {/* Başlık */}
        <section className="pt-24">
          <div className="mb-5 text-xs uppercase tracking-[0.35em] text-white/40">
            {rebellion.region || "Kurdistan"}
          </div>

          <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
            {rebellion.name}
          </h1>

          {(rebellion.startDate || rebellion.endDate) && (
            <div className="mt-6 text-lg text-white/40">
              {rebellion.startDate || "—"}
              {" — "}
              {rebellion.endDate || "—"}
            </div>
          )}

          {rebellion.shortBio && (
            <p className="mt-8 max-w-3xl text-lg leading-8 text-white/60">
              {rebellion.shortBio}
            </p>
          )}
        </section>

        {/* Fotoğraflar */}
        {rebellion.photos && rebellion.photos.length > 0 && (
          <section className="mt-20">
            <div className="mb-8">
              <div className="text-xs uppercase tracking-[0.3em] text-white/35">
                Arşiv
              </div>

              <h2 className="mt-3 text-3xl font-medium">
                Fotoğraflar
              </h2>
            </div>

            <div className="space-y-16">
              {rebellion.photos.map((photo, index) => (
                <figure key={`${photo.imageUrl}-${index}`}>
                  <div className="overflow-hidden border border-white/10 bg-white/[0.02]">
                    <img
                      src={photo.imageUrl}
                      alt={
                        photo.caption ||
                        `${rebellion.name} - Fotoğraf ${index + 1}`
                      }
                      className="max-h-[750px] w-full object-contain"
                    />
                  </div>

                  {(photo.caption || photo.source) && (
                    <figcaption className="mt-4 border-l border-white/20 pl-5">
                      {photo.caption && (
                        <p className="text-sm leading-7 text-white/60">
                          {photo.caption}
                        </p>
                      )}

                      {photo.source && (
                        <p className="mt-2 text-xs leading-6 text-white/35">
                          Kaynak: {photo.source}
                        </p>
                      )}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Önemli kişiler */}
        {rebellion.leaders && rebellion.leaders.length > 0 && (
          <section className="mt-24 border-t border-white/10 pt-16">
            <div className="text-xs uppercase tracking-[0.3em] text-white/35">
              Önemli kişiler
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {rebellion.leaders.map((leader, index) => (
                <span
                  key={`${leader}-${index}`}
                  className="border border-white/10 px-4 py-2 text-sm text-white/60"
                >
                  {leader}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Ayrıntılı tarihçe */}
        {rebellion.biography && rebellion.biography.length > 0 && (
          <section className="mt-24 border-t border-white/10 pt-16">
            <div className="text-xs uppercase tracking-[0.3em] text-white/35">
              Tarihçe
            </div>

            <h2 className="mt-3 text-3xl font-medium">
              Ayrıntılı Tarihçe
            </h2>

            <div className="mt-12 space-y-14">
              {rebellion.biography.map((section, index) => (
                <section key={index}>
                  {section.title && (
                    <h3 className="text-2xl font-medium">
                      {section.title}
                    </h3>
                  )}

                  {section.content && (
                    <div className="mt-5 whitespace-pre-line text-base leading-8 text-white/60">
                      {section.content}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </section>
        )}

        {/* Kaynaklar */}
        {rebellion.sources && rebellion.sources.length > 0 && (
          <section className="mt-24 border-t border-white/10 pt-16">
            <div className="text-xs uppercase tracking-[0.3em] text-white/35">
              Kaynakça
            </div>

            <h2 className="mt-3 text-3xl font-medium">
              Kaynaklar
            </h2>

            <div className="mt-8 space-y-4">
              {rebellion.sources.map((source, index) => (
                <div
                  key={`${source}-${index}`}
                  className="border-l border-white/10 pl-5 text-sm leading-7 text-white/50"
                >
                  {source}
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}