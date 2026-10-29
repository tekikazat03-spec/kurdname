import type { Metadata } from "next";
import Link from "next/link";
import { mergeImportedPeople } from "@/lib/imported-biographies";

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
      { cache: "no-store" }
    );

    if (!response.ok) return mergeImportedPeople([]);

    const data = await response.json();
    if (!data) return mergeImportedPeople([]);

    return mergeImportedPeople(Object.entries(data).map(([id, value]) => ({
      ...(value as Omit<Person, "id">),
      id,
    })));
  } catch {
    return mergeImportedPeople([]);
  }
}

export default async function PeoplePage() {
  const people = await getPeople();

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

          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-[#b8ad94] transition hover:text-[#e2c582]"
          >
            ← Ana Sayfa
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#b99a5b]/20 px-6 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,91,48,0.14),transparent_65%)]" />

        <div className="relative mx-auto max-w-4xl">
          <p className="mb-6 text-xs uppercase tracking-[0.45em] text-[#c2a46a]">
            KURDNAME · DİJİTAL ARŞİV
          </p>

          <h1 className="font-serif text-5xl tracking-[0.08em] text-[#f1e6cc] sm:text-7xl">
            ŞAHSİYETLER
          </h1>

          <div className="mx-auto my-8 h-px w-24 bg-[#b99a5b]" />

          <p className="mx-auto max-w-2xl text-base leading-8 text-[#b8b3a6]">
            Kürdistan tarihine iz bırakmış şahsiyetlerin yaşamları,
            mücadeleleri ve tarihsel mirasları.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex items-center justify-between border-b border-[#b99a5b]/20 pb-5">
          <h2 className="font-serif text-2xl text-[#e8d7b3]">
            Arşiv Kayıtları
          </h2>

          <span className="text-xs tracking-[0.2em] text-[#a89b7c]">
            {people.length} KAYIT
          </span>
        </div>

        {people.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center border border-[#b99a5b]/20 bg-[#111a15] px-6 text-center">
            <div className="mb-6 text-4xl text-[#b99a5b]">✦</div>

            <h3 className="font-serif text-2xl text-[#e8d7b3]">
              Arşiv Hazırlanıyor
            </h3>

            <p className="mt-4 max-w-md text-sm leading-7 text-[#a89f8b]">
              Şahsiyetler koleksiyonu henüz oluşturulmadı.
              Yeni kayıtlar eklendikçe burada görüntülenecek.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <Link
                key={person.id}
                href={`/kisiler/${person.slug}`}
                className="group overflow-hidden border border-[#b99a5b]/20 bg-[#111a15] transition duration-300 hover:-translate-y-1 hover:border-[#c6a568]/60"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#1b261e]">
                  {person.imageUrl ? (
                    <img
                      src={person.imageUrl}
                      alt={person.name}
                      className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-serif text-6xl text-[#b99a5b]/30">
                      K
                    </div>
                  )}
                </div>

                <div className="p-7">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#b99a5b]">
                    {person.category || "Şahsiyet"}
                  </p>

                  <h3 className="mt-3 font-serif text-2xl text-[#f1e6cc]">
                    {person.name}
                  </h3>

                  {(person.birth || person.death) && (
                    <p className="mt-2 text-xs text-[#a89f8b]">
                      {person.birth || "?"} — {person.death || "?"}
                    </p>
                  )}

                  {person.shortBio && (
                    <p className="mt-5 line-clamp-3 text-sm leading-7 text-[#b8b3a6]">
                      {person.shortBio}
                    </p>
                  )}

                  <div className="mt-7 border-t border-[#b99a5b]/20 pt-5 text-xs uppercase tracking-[0.2em] text-[#c6a568]">
                    Kaydı İncele →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-[#b99a5b]/20 px-6 py-8 text-center text-xs tracking-[0.15em] text-[#8c8575]">
        KURDNAME · Kürdistan'ın Dijital Arşivi
      </footer>
    </main>
  );
}

export const metadata: Metadata = {
  title: "Şahsiyetler",
  description: "Kürdistan tarihinde iz bırakmış şahsiyetlerin kaynaklı biyografileri, yaşamları, eserleri ve tarihsel faaliyetleri.",
  alternates: { canonical: "/kisiler" },
  openGraph: { title: "Şahsiyetler | KURDNAME", description: "Kürdistan tarihinde iz bırakmış şahsiyetlerin kaynaklı biyografileri, yaşamları, eserleri ve tarihsel faaliyetleri.", url: "/kisiler" },
};
