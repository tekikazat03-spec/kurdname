"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase";

type Massacre = {
  id: string;
  slug: string;
  name: string;
  date?: string;
  region?: string;
  shortBio?: string;
  photos?: {
    imageUrl: string;
    caption?: string;
    source?: string;
  }[];
};

export default function KatliamlarPage() {
  const [massacres, setMassacres] = useState<Massacre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const massacresRef = ref(database, "massacres");

    const unsubscribe = onValue(massacresRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setMassacres([]);
        setLoading(false);
        return;
      }

      const list: Massacre[] = Object.entries(data).map(
        ([id, value]: [string, any]) => ({
          id,
          ...value,
        })
      );

      setMassacres(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* BAŞLIK */}
        <header className="mb-12 border-b border-white/10 pb-10">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">
            KURDNAME ARŞİVİ
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Katliamlar ve Kıyımlar
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/50">
            Kürt tarihindeki katliam, kıyım, zorunlu göç ve kitlesel
            şiddet olaylarına ilişkin tarihî kayıtlar, belgeler,
            fotoğraflar ve kaynaklar.
          </p>
        </header>

        {/* YÜKLENİYOR */}
        {loading && (
          <div className="py-20 text-center text-white/40">
            Arşiv yükleniyor...
          </div>
        )}

        {/* KAYIT YOK */}
        {!loading && massacres.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 py-20 text-center">
            <p className="text-lg text-white/50">
              Henüz bu bölümde kayıt bulunmuyor.
            </p>
          </div>
        )}

        {/* KARTLAR */}
        {!loading && massacres.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {massacres.map((massacre) => {
              const firstPhoto = massacre.photos?.[0]?.imageUrl;

              return (
                <Link
                  key={massacre.id}
                  href={`/katliamlar/${massacre.slug}`}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  {/* FOTOĞRAF */}
                  <div className="aspect-[16/10] overflow-hidden bg-black">
                    {firstPhoto ? (
                      <img
                        src={firstPhoto}
                        alt={massacre.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/30">
                        Fotoğraf yok
                      </div>
                    )}
                  </div>

                  {/* BİLGİ */}
                  <div className="p-6">

                    {massacre.date && (
                      <p className="text-xs uppercase tracking-[0.15em] text-white/35">
                        {massacre.date}
                      </p>
                    )}

                    <h2 className="mt-3 text-2xl font-medium leading-tight">
                      {massacre.name}
                    </h2>

                    {massacre.region && (
                      <p className="mt-3 text-sm text-white/40">
                        {massacre.region}
                      </p>
                    )}

                    {massacre.shortBio && (
                      <p className="mt-5 line-clamp-4 text-sm leading-6 text-white/50">
                        {massacre.shortBio}
                      </p>
                    )}

                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm text-white/40">
                        {massacre.photos?.length || 0} fotoğraf
                      </span>

                      <span className="text-sm text-white/60 transition group-hover:text-white">
                        İncele →
                      </span>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}