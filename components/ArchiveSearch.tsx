"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getArchiveItems,
  searchArchive,
  type ArchiveItem,
} from "@/lib/archive-search";

export default function ArchiveSearch() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    getArchiveItems()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const suggestions = useMemo(
    () => searchArchive(items, query).slice(0, 5),
    [items, query]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = query.trim();
    if (!value) return;

    router.push(`/arama?q=${encodeURIComponent(value)}`);
  }

  return (
    <div className="group relative z-30 mt-10 w-full max-w-xl text-left">
      <form
        onSubmit={handleSubmit}
        role="search"
        className="flex overflow-hidden border border-[#c9a66b]/60 bg-[#0b100e]/90 shadow-2xl backdrop-blur-md transition focus-within:border-[#e0bf80]"
      >
        <label htmlFor="archive-search" className="sr-only">
          Arşivde ara
        </label>

        <input
          id="archive-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Şahsiyet, örgüt veya parti ara..."
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-5 py-5 text-sm text-[#f1e6cc] outline-none placeholder:text-[#aaa397]/70"
        />

        <button
          type="submit"
          disabled={!query.trim()}
          className="border-l border-[#c9a66b]/30 bg-[#c9a66b] px-6 text-xs font-semibold tracking-[0.15em] text-[#0b100e] transition hover:bg-[#e0bf80] disabled:opacity-60"
        >
          ARA →
        </button>
      </form>

      {query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 hidden overflow-hidden border border-[#c9a66b]/40 bg-[#101711] shadow-2xl group-focus-within:block">
          {loading ? (
            <p className="px-5 py-5 text-sm text-[#aaa397]">
              Arşiv taranıyor...
            </p>
          ) : failed ? (
            <p className="px-5 py-5 text-sm text-red-300">
              Arama verileri alınamadı.
            </p>
          ) : suggestions.length === 0 ? (
            <p className="px-5 py-5 text-sm text-[#aaa397]">
              Eşleşen kayıt bulunamadı.
            </p>
          ) : (
            suggestions.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block border-b border-[#c9a66b]/10 px-5 py-4 transition hover:bg-[#c9a66b]/10"
              >
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#c9a66b]">
                  {item.category}
                </span>

                <span className="mt-1 block text-sm text-[#f1e6cc]">
                  {item.title}
                </span>
              </Link>
            ))
          )}

          <button
            type="button"
            onClick={() =>
              router.push(`/arama?q=${encodeURIComponent(query.trim())}`)
            }
            className="w-full px-5 py-4 text-left text-xs uppercase tracking-[0.15em] text-[#c9a66b] hover:bg-[#c9a66b]/10"
          >
            Tüm sonuçları görüntüle →
          </button>
        </div>
      )}

      <p className="mt-3 text-center text-[10px] tracking-[0.12em] text-[#aaa397]/70">
        KURDNAME DİJİTAL ARŞİVİNDE ARA
      </p>
    </div>
  );
}
