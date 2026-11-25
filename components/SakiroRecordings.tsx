"use client";

import { useState } from "react";

type Track = { title: string; id?: string; start?: number; end?: number; source?: string };

const tracks: Track[] = [
  { title: "Kekê Xiyasedîn", id: "CziZhtmpTW4", source: "Şakiro – Topic / Ses Media" },
  { title: "Geliyê Zîlan" },
  { title: "Gulê Dêran", id: "6NC-KTYZ8bQ", source: "SesMedia" },
  { title: "Emro", id: "IVmC_AvJwpA", source: "Şakiro – Topic / Ses Media" },
  { title: "Şerê Mala Nasir" },
  { title: "Eliyê Pûrto", id: "R0q7nh3ggnY", start: 1274, end: 1564, source: "SesMedia / Nemînim (albüm kaydı)" },
  { title: "Nêçîrvano", id: "KYQKCgeep5k", source: "SesMedia" },
  { title: "Esmerê" },
  { title: "Kejê" },
  { title: "Kewê", id: "5YxjbdsZPBk", source: "Şakiro – Topic / Ses Media (1. kısım)" },
  { title: "Sebrê" },
];

export default function SakiroRecordings() {
  const [selected, setSelected] = useState<number | null>(null);
  const track = selected === null ? null : tracks[selected];
  const params = new URLSearchParams({ autoplay: "1", playsinline: "1", rel: "0" });
  if (track?.start !== undefined) params.set("start", String(track.start));
  if (track?.end !== undefined) params.set("end", String(track.end));
  return (
    <div className="mt-8 border border-white/10 bg-white/[0.025] p-4 sm:p-6">
      <p className="mb-5 text-xs leading-6 text-[#bcb5a8]">Dengbêj Şakiro · Kilam arşivi. Kayıtlar kaynak yayıncıların YouTube oynatıcısı üzerinden sunulur.</p>
      <div className="divide-y divide-white/10">
        {tracks.map((item, i) => (
          <div key={item.title} className="py-3">
            <div className="flex items-center gap-3">
              <span className="w-7 shrink-0 text-xs tabular-nums text-white/40">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1 text-sm text-[#e8e3d8]">{item.title}</span>
              {item.id ? (
                <button type="button" aria-pressed={selected === i} onClick={() => setSelected(selected === i ? null : i)} className="shrink-0 border border-[#a99f8b]/40 px-3 py-2 text-xs text-[#e8e3d8] hover:border-[#c9a66b] focus-visible:outline focus-visible:outline-[#c9a66b]">
                  {selected === i ? "■ Kapat" : "▶ Dinle"}
                </button>
              ) : <span className="max-w-28 text-right text-xs text-white/50">Kayıt doğrulanıyor</span>}
            </div>
            {selected === i && track?.id && (
              <div className="mt-4">
                <div className="aspect-video min-h-[200px] overflow-hidden border border-white/10">
                  <iframe key={i} src={"https://www.youtube-nocookie.com/embed/" + track.id + "?" + params.toString()} title={"Şakiro — " + track.title} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#bcb5a8]">
                  <span>Kaynak: {track.source}</span>
                  <a className="text-[#c9a66b] underline underline-offset-4" href={"https://www.youtube.com/watch?v=" + track.id + (track.start !== undefined ? "&t=" + track.start + "s" : "")} target="_blank" rel="noopener noreferrer">YouTube'da dinle ↗</a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <a href="https://dengbejsakirovakfi.org/dengbej-sakiro/biyografi" target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-xs text-[#c9a66b] underline underline-offset-4">Repertuvar kaynağı: Dengbêj Şakiro Vakfı</a>
    </div>
  );
}
