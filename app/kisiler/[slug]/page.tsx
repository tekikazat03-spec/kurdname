import Link from "next/link";
import { notFound } from "next/navigation";
import { getPeople, getPersonBySlug } from "@/lib/people";
import { getBiography } from "@/lib/biographies";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  const people = getPeople();

  return people.map((person) => ({
    slug: person.slug
  }));
}

export default async function PersonPage({ params }: Props) {
  const { slug } = await params;

  const person = getPersonBySlug(slug);

  if (!person) {
    notFound();
  }

  const biography = getBiography(person.qid);

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link
            href="/kisiler"
            className="text-sm text-white/40 hover:text-white transition"
          >
            ← TÜM KİŞİLER
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12">

          <div>
            <div className="aspect-[3/4] bg-[#151515] overflow-hidden border border-white/10">
              <img
                src={person.image}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-5 border border-white/10 bg-[#101010] p-5">
              <div className="text-xs tracking-[0.25em] text-white/30 mb-4">
                BİLGİLER
              </div>

              <div className="space-y-4 text-sm">

                <div>
                  <div className="text-white/30">YAŞAM</div>
                  <div className="mt-1">
                    {person.birth}—{person.death}
                  </div>
                </div>

                <div>
                  <div className="text-white/30">MESLEK</div>
                  <div className="mt-1">
                    {person.profession}
                  </div>
                </div>

                <div>
                  <div className="text-white/30">YERLER</div>
                  <div className="mt-1">
                    {person.places}
                  </div>
                </div>

                <div>
                  <div className="text-white/30">KATEGORİ</div>
                  <div className="mt-1">
                    {person.category}
                  </div>
                </div>

                {person.tags && person.tags.length > 0 && (
                  <div>
                    <div className="text-white/30">BAĞLANTILAR</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {person.tags.map((tag) => (
                        <span key={tag} className="border border-white/10 px-2 py-1 text-xs text-white/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          <article>
            <div className="mb-10">
              <p className="text-xs tracking-[0.35em] text-white/30 mb-4">
                KURDNAME ARŞİVİ
              </p>

              <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
                {person.name}
              </h1>

              <p className="text-white/40 mt-5">
                {person.profession}
              </p>
            </div>

            <div className="border-t border-white/10 pt-8">
              <div className="text-xs tracking-[0.3em] text-white/30 mb-6">
                KURDNAME BİYOGRAFİSİ
              </div>

              {biography ? (
                <div className="text-[17px] leading-8 text-white/75 whitespace-pre-wrap">
                  {biography}
                </div>
              ) : (
                <div className="border border-white/10 bg-[#101010] p-8 text-white/40">
                  Bu kişi için KURDNAME biyografisi henüz hazırlanmadı.
                </div>
              )}
            </div>

          </article>

        </div>
      </section>
    </main>
  );
}