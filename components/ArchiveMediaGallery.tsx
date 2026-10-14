"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Collection = "people" | "organizations" | "parties";

type Media = {
  id: string;
  kind: "photo" | "document";
  format: "image" | "pdf";
  url: string;
  title: string;
  date?: string;
  source?: string;
};

function readMedia(value: unknown): Media[] {
  if (!value || typeof value !== "object") return [];

  return Object.entries(value).flatMap(([id, entry]) => {
    if (!entry || typeof entry !== "object") return [];

    const item = entry as Record<string, unknown>;

    if (
      typeof item.url !== "string" ||
      !item.url.startsWith("https://") ||
      typeof item.title !== "string"
    ) {
      return [];
    }

    return [{
      id,
      kind: item.kind === "document" ? "document" as const : "photo" as const,
      format: item.format === "pdf" ? "pdf" as const : "image" as const,
      url: item.url,
      title: item.title,
      date: typeof item.date === "string" ? item.date : "",
      source: typeof item.source === "string" ? item.source : "",
    }];
  });
}

export default function ArchiveMediaGallery({
  collection,
}: {
  collection: Collection;
}) {
  const params = useParams();
  const rawSlug = params.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || "";

  const [media, setMedia] = useState<Media[]>([]);
  const [selected, setSelected] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    async function load() {
      try {
        const response = await fetch(
          `https://kurdname-7ba60-default-rtdb.firebaseio.com/${collection}.json`,
          { cache: "no-store" }
        );

        if (!response.ok) throw new Error("Galeri yüklenemedi");

        const data = await response.json();

        const records =
          data && typeof data === "object"
            ? Object.values(data)
            : [];

        const found = records.find((record) => {
          if (!record || typeof record !== "object") return false;
          return (record as { slug?: string }).slug === slug;
        });

        const items = found && typeof found === "object"
          ? readMedia((found as { media?: unknown }).media)
          : [];

        if (active) setMedia(items);
      } catch (error) {
        console.error("KURDNAME galeri:", error);
        if (active) setMedia([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => { active = false; };
  }, [collection, slug]);

  useEffect(() => {
    if (!selected) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  if (loading || media.length === 0) return null;

  return (
    <section className="border-t border-[#c9a66b]/20 bg-[#101711] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.3em] text-[#c9a66b]">
          KURDNAME KOLEKSİYONU
        </p>

        <h2 className="mt-5 font-serif text-4xl text-[#f1e6cc]">
          Tarihî Belgeler ve Fotoğraflar
        </h2>

        <p className="mt-4 text-sm text-[#aaa397]">
          Arşive ait fotoğraflar, belgeler ve tarihî materyaller.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden border border-[#c9a66b]/20 bg-[#17211a]"
            >
              {item.format === "image" ? (
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  aria-label={`${item.title} görselini büyüt`}
                  className="block w-full cursor-zoom-in"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-contain bg-[#0b100e]"
                  />
                </button>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex aspect-[4/3] flex-col items-center justify-center bg-[#0b100e] text-[#c9a66b]"
                >
                  <span className="text-5xl">▤</span>
                  <span className="mt-4 text-xs tracking-widest">
                    PDF BELGESİNİ AÇ →
                  </span>
                </a>
              )}

              <div className="p-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a66b]">
                  {item.kind === "document" ? "TARİHÎ BELGE" : "FOTOĞRAF"}
                </p>

                <h3 className="mt-3 font-serif text-xl text-[#f1e6cc]">
                  {item.title}
                </h3>

                {item.date && (
                  <p className="mt-3 text-sm text-[#aaa397]">
                    Tarih: {item.date}
                  </p>
                )}

                {item.source && (
                  <p className="mt-2 break-words text-sm leading-6 text-[#aaa397]">
                    Kaynak: {item.source}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-5"
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Görseli kapat"
            className="absolute right-6 top-6 border border-white/30 px-5 py-3 text-white"
          >
            KAPAT ×
          </button>

          <img
            src={selected.url}
            alt={selected.title}
            className="max-h-[75vh] max-w-full object-contain"
          />

          <p className="mt-5 text-center font-serif text-xl text-white">
            {selected.title}
          </p>

          {selected.source && (
            <p className="mt-2 text-center text-sm text-white/60">
              Kaynak: {selected.source}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
