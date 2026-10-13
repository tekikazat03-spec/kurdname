import Link from "next/link";
import { asList, getParties, type Photo } from "@/lib/parties";

export default async function PartiesPage() {
  const parties = await getParties();

  return (
    <main className="min-h-screen bg-[#0b100e] text-[#e8e0cb]">
      <header className="border-b border-[#b99a5b]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
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

      <section className="border-b border-[#b99a5b]/20 px-6 py-24 text-center">
        <p className="mb-6 text-xs tracking-[0.4em] text-[#c2a46a]">
          KURDNAME · DİJİTAL ARŞİV
        </p>

        <h1 className="font-serif text-5xl text-[#f1e6cc] sm:text-7xl">
          PARTİLER
        </h1>

        <div className="mx-auto my-8 h-px w-24 bg-[#b99a5b]" />

        <p className="mx-auto max-w-2xl leading-8 text-[#b8b3a6]">
          Kürdistan tarihinde faaliyet göstermiş siyasi partilerin
          kuruluşları, gelişimleri ve tarihsel mirasları.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex justify-between border-b border-[#b99a5b]/20 pb-5">
          <h2 className="font-serif text-2xl text-[#e8d7b3]">
            Arşiv Kayıtları
          </h2>

          <span className="text-sm text-[#a89b7c]">
            {parties.length} KAYIT
          </span>
        </div>

        {parties.length === 0 ? (
          <div className="border border-[#b99a5b]/20 bg-[#111a15] px-6 py-24 text-center">
            <h3 className="font-serif text-2xl text-[#e8d7b3]">
              Arşiv Hazırlanıyor
            </h3>

            <p className="mt-4 text-sm text-[#a89f8b]">
              Henüz parti kaydı eklenmedi.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {parties.map((party) => {
              const photos = asList<Photo>(party.photos);
              const image = photos[0]?.imageUrl;

              return (
                <Link
                  key={party.id}
                  href={`/partiler/${party.slug}`}
                  className="group overflow-hidden border border-[#b99a5b]/20 bg-[#111a15] transition hover:border-[#c6a568]/70"
                >
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#1b261e]">
                    {image ? (
                      <img
                        src={image}
                        alt={party.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="font-serif text-5xl text-[#b99a5b]/30">
                        K
                      </span>
                    )}
                  </div>

                  <div className="p-7">
                    <h3 className="font-serif text-2xl text-[#f1e6cc]">
                      {party.name}
                    </h3>

                    <p className="mt-3 text-sm text-[#a89f8b]">
                      {party.startDate || "Kuruluş tarihi belirtilmedi"}
                    </p>

                    {party.shortBio && (
                      <p className="mt-5 line-clamp-3 text-sm leading-7 text-[#b8b3a6]">
                        {party.shortBio}
                      </p>
                    )}

                    <p className="mt-7 border-t border-[#b99a5b]/20 pt-5 text-xs tracking-[0.15em] text-[#c6a568]">
                      KAYDI İNCELE →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
