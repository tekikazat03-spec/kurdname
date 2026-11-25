"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LatestArchiveRecords from "@/components/LatestArchiveRecords";
import ArchiveSearch from "@/components/ArchiveSearch";

const collections = [
  { number: "01", title: "Şahsiyetler", subtitle: "İnsanlar ve yaşam öyküleri", description: "Yazarlar, sanatçılar, düşünürler ve tarihsel şahsiyetler.", href: "/kisiler", symbol: "✦" },
  { number: "02", title: "Örgütler", subtitle: "Cemiyetler ve tarihsel oluşumlar", description: "Kuruluş süreçleri, faaliyetler ve tarihsel bağlam.", href: "/orgutler", symbol: "◈" },
  { number: "03", title: "Partiler", subtitle: "Siyasi tarih", description: "Siyasi hareketler, partiler ve tarihsel gelişmeler.", href: "/partiler", symbol: "❖" },
];

const videoId = "rC4n6H7AkpY";

function SunMark() {
  return (
    <svg viewBox="0 0 64 64" className="h-11 w-11 shrink-0 text-[#d8b474]" aria-hidden="true">
      {Array.from({ length: 21 }, (_, i) => (
        <line key={i} x1="32" y1="3" x2="32" y2="15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" transform={`rotate(${i * 360 / 21} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="13" fill="currentColor" />
    </svg>
  );
}

function OpeningMusic() {
  const playerArea = useRef<HTMLDivElement>(null);
  const [loadPlayer, setLoadPlayer] = useState(false);

  useEffect(() => {
    const element = playerArea.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setLoadPlayer(true);
      return;
    }
    // YouTube permits automatic playback only when the player is sufficiently visible.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.intersectionRatio >= 0.5) {
        setLoadPlayer(true);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="relative min-w-0 self-center border border-[#d8b474]/25 bg-[#111b16] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 px-1 pb-3">
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8b474]">
          <span aria-hidden="true" className="text-lg leading-none">♫</span> Arşivin sesi
        </span>
        <span className="text-[10px] text-[#b7b3a6]">Kültür &amp; müzik</span>
      </div>
      <div ref={playerArea} className="relative aspect-video min-h-[200px] w-full bg-[#080e0b]">
        {loadPlayer ? (
          <iframe
            title="KURDNAME açılış müziği"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&controls=1&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button type="button" onClick={() => setLoadPlayer(true)} className="absolute inset-0 grid h-full w-full place-content-center text-center text-[#d8b474]" aria-label="Müzik oynatıcısını aç">
            <span className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-[#d8b474]/50 text-xl">▶</span>
            <span className="text-xs">Müziği aç</span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-3 text-[11px] leading-5 text-[#b7b3a6]">
        <span>Otomatik başlamazsa oynat tuşuna dokunun.</span>
        <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" className="text-[#d8b474] hover:underline">YouTube ↗</a>
      </div>
    </aside>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d1511] text-[#eee8db]">
      <header className="border-b border-[#d8b474]/20 bg-[#101914]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3" aria-label="KURDNAME ana sayfa">
            <SunMark />
            <div>
              <p className="font-serif text-2xl font-bold tracking-[0.12em] text-[#f3e8d1]">KURDNAME</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-[#d8b474]">Dijital tarih arşivi</p>
            </div>
          </Link>
          <nav aria-label="Ana menü" className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#d8b474]/10 pt-3 text-xs font-medium text-[#d0c8b8] sm:w-auto sm:gap-x-6 sm:border-0 sm:pt-0 sm:text-sm">
            {collections.map((collection) => (
              <Link key={collection.href} href={collection.href} className="transition hover:text-[#e3c68f] focus-visible:outline focus-visible:outline-[#d8b474]">{collection.title}</Link>
            ))}
            <a href="#son-eklenenler" className="transition hover:text-[#e3c68f]">Son eklenenler</a>
          </nav>
        </div>
      </header>

      <section className="relative isolate border-b border-[#d8b474]/20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-[0.16]" style={{ backgroundImage: "url('/kurdname-bg.png')" }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#0d1511]/95 via-[#0d1511]/65 to-[#0d1511]/85" />
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-14 lg:px-10 lg:py-16">
          <div className="min-w-0">
            <p className="mb-4 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.24em] text-[#d8b474]">
              <span className="h-px w-8 bg-[#d8b474]" /> Tarih · Kültür · Hafıza
            </p>
            <h1 className="max-w-2xl font-serif text-[clamp(2.35rem,5vw,4.9rem)] leading-[1.06] tracking-[-0.035em] text-[#f4ead8]">
              Kürdistan’ın <span className="text-[#d8b474]">dijital arşivi.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#c6c1b3] sm:text-base">
              Kürt tarihini, edebiyatını, kültürünü ve toplumsal hafızasını kaynaklı kayıtlarla keşfedin.
            </p>
            <div className="relative z-20 [&>div]:mt-5">
              <ArchiveSearch />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <a href="#koleksiyonlar" className="inline-flex items-center gap-3 bg-[#d8b474] px-5 py-3 text-xs font-semibold text-[#121c15] transition hover:bg-[#efd39c]">Arşivi keşfet <span aria-hidden="true">↓</span></a>
              <a href="#son-eklenenler" className="border-b border-[#d8b474]/40 py-2 text-xs text-[#e4d5b8] hover:text-white">Yeni kayıtlar →</a>
            </div>
          </div>
          <OpeningMusic />
        </div>
      </section>

      <section id="koleksiyonlar" className="mx-auto max-w-7xl scroll-mt-6 px-5 py-9 sm:px-8 sm:py-12 lg:px-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#d8b474]/20 pb-4">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[#d8b474]">Arşiv / Koleksiyonlar</p>
            <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">Tarihi keşfedin</h2>
          </div>
          <p className="text-xs text-[#b7b3a6]">03 koleksiyon</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {collections.map((collection) => (
            <Link key={collection.href} href={collection.href} className="group relative flex min-h-[190px] flex-col justify-between border border-[#d8b474]/20 bg-[#17231b] p-5 transition duration-200 hover:border-[#d8b474]/75 hover:bg-[#1d2c22] focus-visible:outline focus-visible:outline-[#d8b474] sm:p-6">
              <div className="flex items-center justify-between text-[#d8b474]">
                <span className="text-[10px] tracking-[0.18em]">{collection.number} / KOLEKSİYON</span>
                <span aria-hidden="true" className="text-2xl">{collection.symbol}</span>
              </div>
              <div className="my-4">
                <h3 className="font-serif text-3xl text-[#f3e8d1]">{collection.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#b7b3a6]">{collection.description}</p>
              </div>
              <div className="flex items-center justify-between border-t border-[#d8b474]/15 pt-3 text-xs text-[#d8b474]">
                <span>{collection.subtitle}</span>
                <span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-1">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div id="son-eklenenler" className="scroll-mt-5 [&>section]:py-12 [&>section>div>div:first-child]:mb-8 [&>section>div>div:first-child]:text-left [&>section>div>div:first-child>div]:ml-0 [&>section>div>div:first-child>h2]:mt-3">
        <LatestArchiveRecords />
      </div>

      <footer className="border-t border-[#d8b474]/20 bg-[#101914]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-7 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <SunMark />
            <div>
              <p className="font-serif text-lg tracking-[0.15em] text-[#f3e8d1]">KURDNAME</p>
              <p className="mt-1 text-[11px] text-[#b7b3a6]">Kürdistan’ın dijital tarih arşivi</p>
            </div>
          </Link>
          <p className="text-xs text-[#b7b3a6]">© {new Date().getFullYear()} KURDNAME</p>
        </div>
      </footer>
    </main>
  );
}
