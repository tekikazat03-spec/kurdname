"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import LatestArchiveRecords from "@/components/LatestArchiveRecords";
import ArchiveSearch from "@/components/ArchiveSearch";

const categories = [
  {
    number: "01",
    title: "Şahsiyetler",
    subtitle: "Tarihe iz bırakan insanlar",
    description:
      "Kürdistan tarihindeki şahsiyetlerin yaşamları, eserleri ve faaliyetleri.",
    href: "/kisiler",
    symbol: "✦",
  },
  {
    number: "02",
    title: "Örgütler",
    subtitle: "Tarihsel oluşumlar",
    description:
      "Kürdistan tarihinde faaliyet göstermiş örgütler, cemiyetler ve kuruluşlar.",
    href: "/orgutler",
    symbol: "◈",
  },
  {
    number: "03",
    title: "Partiler",
    subtitle: "Siyasi tarih",
    description:
      "Kürdistan siyasi tarihinde yer alan partiler, kuruluş süreçleri ve faaliyetleri.",
    href: "/partiler",
    symbol: "❖",
  },
];

function KurdistanSun() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-28 w-28 text-[#c9a66b] sm:h-36 sm:w-36"
      role="img"
      aria-label="21 ışınlı güneş"
    >
      {Array.from({ length: 21 }, (_, index) => (
        <line
          key={index}
          x1="100"
          y1="13"
          x2="100"
          y2="43"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          transform={`rotate(${(index * 360) / 21} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="43" fill="currentColor" />
      <circle cx="100" cy="100" r="33" fill="#e0bf80" opacity="0.45" />
    </svg>
  );
}

export default function Home() {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const archiveRef = useRef<HTMLElement>(null);

  function exploreArchive() {
    setArchiveOpen(true);

    requestAnimationFrame(() => {
      setTimeout(() => {
        archiveRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0b0d0b] text-[#e8e1d3]">
      {/* ANA EKRAN */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
        {/* Tarihî arka plan */}
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('/kurdname-bg.png')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d0b]/60 via-[#0b0d0b]/75 to-[#0b0d0b]" />

        {/* Dekoratif çerçeve */}
        <div className="pointer-events-none absolute inset-5 border border-[#c9a66b]/15 sm:inset-10" />

        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
          <p className="mb-10 text-[10px] uppercase tracking-[0.55em] text-[#c9a66b] sm:text-xs">
            DİJİTAL TARİH ARŞİVİ
          </p>

          <KurdistanSun />

          <div className="my-9 h-px w-24 bg-[#c9a66b]/60" />

          <h1 className="text-5xl font-semibold tracking-[0.13em] sm:text-7xl lg:text-8xl">
            KURDNAME
          </h1>

          <p className="mt-5 text-xs uppercase tracking-[0.32em] text-[#c9a66b] sm:text-sm">
            Kürdistan'ın Dijital Arşivi
          </p>

          <p className="mt-12 max-w-2xl font-serif text-xl leading-relaxed text-[#d4cbbd] sm:text-3xl">
            Bir milletin hafızası, geçmişinde saklıdır.
          </p>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[#aaa397]">
            Tarihin izlerini, şahsiyetlerini ve belgelerini gelecek
            nesillere taşıyan bağımsız dijital arşiv.
          </p>

          <ArchiveSearch />

          <button
            type="button"
            onClick={exploreArchive}
            className="group mt-12 flex items-center gap-7 border border-[#c9a66b]/70 bg-[#c9a66b]/10 px-9 py-5 text-xs font-medium uppercase tracking-[0.22em] text-[#e0bf80] transition-all duration-300 hover:border-[#c9a66b] hover:bg-[#c9a66b] hover:text-[#0b0d0b]"
          >
            ARŞİVİ KEŞFET
            <span className="text-lg transition-transform group-hover:translate-y-1">
              ↓
            </span>
          </button>
        </div>

        <div className="absolute bottom-12 text-[10px] uppercase tracking-[0.35em] text-[#aaa397]/60">
          TARİH · HAFIZA · KİMLİK
        </div>
      </section>

      {/* ARŞİV KATEGORİLERİ */}
      {archiveOpen && (
        <section
          ref={archiveRef}
          id="archive"
          className="relative mx-auto min-h-screen max-w-7xl scroll-mt-0 px-6 py-24 sm:py-32"
        >
          <div className="mb-16 text-center">
            <p className="text-xs uppercase tracking-[0.45em] text-[#c9a66b]">
              KURDNAME
            </p>

            <h2 className="mt-6 font-serif text-4xl sm:text-6xl">
              Dijital Arşiv
            </h2>

            <div className="mx-auto my-8 h-px w-20 bg-[#c9a66b]/50" />

            <p className="text-sm text-[#aaa397]">
              Tarihin kapılarını aralayın.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden border border-[#c9a66b]/20 bg-gradient-to-br from-[#19251d] to-[#0d120e] p-9 transition-all duration-500 hover:-translate-y-2 hover:border-[#c9a66b]/70"
              >
                <div className="pointer-events-none absolute -right-10 top-12 font-serif text-[180px] leading-none text-[#c9a66b]/5">
                  {category.symbol}
                </div>

                <div className="relative">
                  <span className="text-xs tracking-[0.3em] text-[#c9a66b]">
                    {category.number} / ARŞİV
                  </span>
                </div>

                <div className="relative">
                  <div className="mb-7 text-5xl text-[#c9a66b]/70">
                    {category.symbol}
                  </div>

                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#c9a66b]/70">
                    {category.subtitle}
                  </p>

                  <h3 className="font-serif text-4xl">
                    {category.title}
                  </h3>

                  <p className="mt-6 max-w-xs text-sm leading-7 text-[#aaa397]">
                    {category.description}
                  </p>
                </div>

                <div className="relative flex items-center justify-between border-t border-[#c9a66b]/15 pt-6">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a66b]">
                    ARŞİVİ AÇ
                  </span>

                  <span className="text-2xl text-[#c9a66b] transition-transform group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-20 text-center">
            <p className="text-xs tracking-[0.2em] text-[#aaa397]/50">
              GEÇMİŞTEN GELECEĞE BİR HAFIZA
            </p>
          </div>
        </section>
      )}

      <LatestArchiveRecords />

      {/* ALT BİLGİ */}
      <footer className="border-t border-[#c9a66b]/10 px-6 py-9 text-center">
        <p className="text-xs tracking-[0.2em] text-[#aaa397]/50">
          © {new Date().getFullYear()} KURDNAME
        </p>
        <p className="mt-3 text-[10px] text-[#aaa397]/40">
          Kürdistan'ın Dijital Arşivi
        </p>
      </footer>
    </main>
  );
}
