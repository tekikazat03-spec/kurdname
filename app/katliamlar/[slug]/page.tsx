"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { useParams } from "next/navigation";
import { database } from "@/lib/firebase";

type Photo = {
  imageUrl: string;
  caption?: string;
  source?: string;
};

type BiographySection = {
  title: string;
  content: string;
};

type Massacre = {
  id: string;
  slug: string;
  name: string;
  date?: string;
  region?: string;
  shortBio?: string;
  people?: string[];
  photos?: Photo[];
  biography?: BiographySection[];
  sources?: string[];
};

export default function KatliamDetayPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [massacre, setMassacre] = useState<Massacre | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const massacresRef = ref(database, "massacres");

    const unsubscribe = onValue(massacresRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setMassacre(null);
        setLoading(false);
        return;
      }

      const found = Object.entries(data)
        .map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }))
        .find((item: Massacre) => item.slug === slug);

      setMassacre(found || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] px-6 py-20 text-[#e8e3d8]">
        <div className="mx-auto max-w-5xl text-center text-white/40">
          Yükleniyor...
        </div>
      </main>
    );
  }

  if (!massacre) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] px-6 py-20 text-[#e8e3d8]">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-semibold">
            Kayıt bulunamadı
          </h1>

          <p className="mt-4 text-white/50">
            Aradığın katliam kaydı mevcut değil.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <div className="mx-auto max-w-5xl px-6 py-16">

        {/* BAŞLIK */}
        <header className="border-b border-white/10 pb-10">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">
            Katliamlar ve Kıyımlar
          </p>

          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            {massacre.name}
          </h1>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
            {massacre.date && (
              <span>{massacre.date}</span>
            )}

            {massacre.region && (
              <span>{massacre.region}</span>
            )}
          </div>
        </header>

        {/* KISA BİLGİ */}
        {massacre.shortBio && (
          <section className="border-b border-white/10 py-10">
            <p className="max-w-4xl text-lg leading-8 text-white/70">
              {massacre.shortBio}
            </p>
          </section>
        )}

        {/* FOTOĞRAFLAR */}
        {massacre.photos && massacre.photos.length > 0 && (
          <section className="py-12">
            <h2 className="mb-8 text-2xl font-medium">
              Fotoğraflar
            </h2>

            <div className="space-y-12">
              {massacre.photos.map((photo, index) => (
                <figure key={index}>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                    <img
                      src={photo.imageUrl}
                      alt={
                        photo.caption ||
                        `${massacre.name} - Fotoğraf ${index + 1}`
                      }
                      className="max-h-[700px] w-full object-contain"
                    />
                  </div>

                  {photo.caption && (
                    <figcaption className="mt-3 text-sm leading-6 text-white/60">
                      {photo.caption}
                    </figcaption>
                  )}

                  {photo.source && (
                    <p className="mt-1 text-xs text-white/35">
                      Kaynak: {photo.source}
                    </p>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* KİŞİLER */}
        {massacre.people && massacre.people.length > 0 && (
          <section className="border-t border-white/10 py-12">
            <h2 className="mb-6 text-2xl font-medium">
              İlgili Kişiler
            </h2>

            <div className="flex flex-wrap gap-2">
              {massacre.people.map((person, index) => (
                <span
                  key={index}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60"
                >
                  {person}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* BİYOGRAFİ / TARİHÇE */}
        {massacre.biography && massacre.biography.length > 0 && (
          <section className="border-t border-white/10 py-12">
            <h2 className="mb-10 text-2xl font-medium">
              Tarihçe
            </h2>

            <div className="space-y-12">
              {massacre.biography.map((section, index) => (
                <article key={index}>
                  <h3 className="mb-4 text-xl font-medium text-white">
                    {section.title}
                  </h3>

                  <div className="max-w-4xl whitespace-pre-line text-base leading-8 text-white/65">
                    {section.content}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* KAYNAKLAR */}
        {massacre.sources && massacre.sources.length > 0 && (
          <section className="border-t border-white/10 py-12">
            <h2 className="mb-6 text-2xl font-medium">
              Kaynaklar
            </h2>

            <ol className="space-y-3">
              {massacre.sources.map((source, index) => (
                <li
                  key={index}
                  className="text-sm leading-6 text-white/50"
                >
                  {index + 1}. {source}
                </li>
              ))}
            </ol>
          </section>
        )}

      </div>
    </main>
  );
}