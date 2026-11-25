"use client";

import { useState } from "react";

type Recording = { title: string; videoId: string; start?: number; end?: number; credit: string };
const album = "4W3yBZGNlBg";
const track = (title: string, start: number, end?: number): Recording => ({ title, videoId: album, start, end, credit: "SesMedia — Gulê Dêran albümü" });
const recordings: Record<string, Recording[]> = {
  "seydaye-tirej": [{ title: "Ey Welat — şiir", videoId: "ksKz6Dn_IOM", credit: "KURDNAME editörü tarafından seçilen video" }],
  "nuri-dersimi": [{ title: "Kürt Gençliğine Hitabe — seslendirme", videoId: "rxXXzAY4_Yo", credit: "YouTube'da yayımlanan seslendirme; özgün ses olduğu doğrulanmamıştır." }],
  "sakiro": [
    { title: "Kekê Xiyasedîn", videoId: "CziZhtmpTW4", credit: "Ses Media" },
    track("Gulê Dêran", 0, 425),
    { title: "Emro", videoId: "GyOucJR5wAE", credit: "Ses Media" },
    track("Dîlber", 425, 665), track("Dewranê", 665, 891),
    track("Lo Axayo", 891, 1224), track("Lawiko", 1224, 1445),
    track("Besrayê", 1445, 1890), track("Kewa Gozel", 1890, 2061),
    track("Seîdo", 2061, 2308), track("Ax Dayê", 2308, 2551),
  ],
};

export default function PersonRecordings({ slug }: { slug: string }) {
  const items = recordings[slug] || [];
  const [selected, setSelected] = useState<number | null>(null);
  const item = selected === null ? null : items[selected];
  if (!items.length) return null;
  const query = new URLSearchParams({ autoplay: "1", rel: "0" });
  if (item?.start !== undefined) query.set("start", String(item.start));
  if (item?.end !== undefined) query.set("end", String(item.end));
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20 lg:px-10" aria-label="Arşiv kayıtları">
      <div className="border-t border-white/15 pt-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#a99f8b]">KURDNAME SESLİ VE GÖRSEL ARŞİV</p>
        <h2 className="mt-4 text-3xl font-light text-white">{slug === "sakiro" ? "Kılamlar ve ses kayıtları" : slug === "nuri-dersimi" ? "Kürt Gençliğine Hitabe — dinle" : "Ey Welat — izle"}</h2>
        {slug === "nuri-dersimi" && <p className="mt-4 text-sm leading-7 text-[#bcb5a8]">Tarihsel belgeye ilişkin seslendirme; dönemin siyasi söylemini içerir. Metin biyografi bölümündedir. Sesin yazara ait olduğu doğrulanmamıştır.</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((record, index) => (
            <button key={record.title} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className={`flex items-center gap-4 border p-4 text-left transition ${selected === index ? "border-[#c9a66b] bg-white/10" : "border-white/15 hover:border-white/40"}`}>
              <span aria-hidden="true" className="text-[#c9a66b]">▶</span>
              <span><span className="block text-white">{record.title}</span><span className="mt-1 block text-xs text-white/50">{record.credit}</span></span>
            </button>
          ))}
        </div>
        {item && <div className="mt-6">
          <div className="aspect-video overflow-hidden border border-white/15">
            <iframe key={`${item.videoId}-${item.start ?? 0}`} title={item.title} src={`https://www.youtube-nocookie.com/embed/${item.videoId}?${query.toString()}`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-white/50">Kaynak: {item.credit} · YouTube gömme iznine ve bağlantıya bağlıdır.</p>
            <button type="button" onClick={() => setSelected(null)} className="border border-white/20 px-4 py-2 text-xs text-white">Oynatıcıyı kapat</button>
          </div>
        </div>}
      </div>
    </section>
  );
}
