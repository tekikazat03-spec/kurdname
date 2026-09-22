"use client";

import Link from "next/link";
import { useState } from "react";

import { useLanguage } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const { language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const texts = {
    tr: {
      archive: "Kürdistanın Dijital Arşivi",
      independent: "Bağımsız Dijital Platform",
      intro: "Tarih • Hafıza • Arşiv",
      title1: "Bir hafıza.",
      title2: "Binlerce iz.",
      description:
        "Kürdistan tarihine dair kişi, olay, hareket, örgüt, eser ve belgeleri bir araya getiren dijital arşiv.",
      searchPlaceholder: "Arşivde ara...",
      search: "Ara",
      explore: "Arşivi Keşfet",
      quote:
        "Geçmişi kaydetmek, geleceğe bırakılan en sessiz mirastır.",
      footer: "Kürdistanın dijital arşivi",
    },

    ku: {
      archive: "Arşîva Dîjîtal a Kurdistanê",
      independent: "Platforma Dîjîtal a Serbixwe",
      intro: "Dîrok • Bîranîn • Arşîv",
      title1: "Bîranînek.",
      title2: "Hezaran şop.",
      description:
        "Arşîveke dîjîtal ku kes, bûyer, tevger, rêxistin, berhem û belgeyên di dîroka Kurdistanê de li hev tîne.",
      searchPlaceholder: "Di arşîvê de bigere...",
      search: "Lêgerîn",
      explore: "Arşîvê keşf bike",
      quote:
        "Tomarkirina rabirdûyê, mîrateya herî bêdeng e ku ji bo pêşerojê tê hiştin.",
      footer: "Arşîva dîjîtal a Kurdistanê",
    },

    en: {
      archive: "Kurdistan's Digital Archive",
      independent: "Independent Digital Platform",
      intro: "History • Memory • Archive",
      title1: "One memory.",
      title2: "Thousands of traces.",
      description:
        "A digital archive bringing together people, events, movements, organizations, works and documents related to the history of Kurdistan.",
      searchPlaceholder: "Search the archive...",
      search: "Search",
      explore: "Explore the Archive",
      quote:
        "Recording the past is the quietest legacy left for the future.",
      footer: "Kurdistan's digital archive",
    },
  };

  const t = texts[language];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#10140f] text-[#e8e3d8]">

      {/* TAM SAYFA ARKA PLAN */}

      <div className="fixed inset-0 -z-20">
        <img
          src="/kurdname-bg.png"
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Koyu katman */}

      <div className="fixed inset-0 -z-10 bg-black/45" />

      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/50 via-transparent to-black/75" />

      {/* SOL MENÜ */}

      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* HEADER */}

      <header className="relative z-20 border-b border-white/15 bg-black/20 backdrop-blur-[2px]">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">

          <div className="flex items-center gap-5">

            {/* Menü butonu */}

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Menüyü aç"
              className="flex h-11 w-11 items-center justify-center border border-white/20 bg-black/20 text-white/80 backdrop-blur transition hover:border-white/40 hover:bg-black/40 hover:text-white"
            >
              <div className="space-y-1.5">
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
              </div>
            </button>

            {/* YAZI LOGOSU */}

            <Link href="/" className="group">
              <div className="text-2xl font-semibold tracking-[0.18em] text-white drop-shadow-lg">
                KURDNAME
              </div>

              <div className="mt-1 text-[9px] uppercase tracking-[0.28em] text-[#d0c8b5]">
                {t.archive}
              </div>
            </Link>

          </div>

          {/* Dil seçici */}

          <div className="bg-black/20 backdrop-blur">
            <LanguageSwitcher />
          </div>

        </div>
      </header>

      {/* ANA ALAN */}

      <section className="relative z-10 min-h-[calc(100vh-81px)]">

        <div className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center px-6 py-24 lg:px-10">

          <div className="max-w-4xl">

            {/* Bağımsız platform */}

            <div className="mb-8 inline-flex items-center gap-3 border border-white/20 bg-black/25 px-4 py-2 backdrop-blur-sm">

              <span className="h-1.5 w-1.5 rounded-full bg-[#d2c6a5]" />

              <span className="text-[10px] uppercase tracking-[0.3em] text-[#e1d8c4]">
                {t.independent}
              </span>

            </div>

            {/* Üst başlık */}

            <p className="mb-7 text-xs uppercase tracking-[0.4em] text-[#ddd4c1] drop-shadow-lg">
              {t.intro}
            </p>

            {/* Ana başlık */}

            <h1 className="max-w-4xl text-6xl font-light leading-[0.98] tracking-[-0.045em] text-white drop-shadow-2xl sm:text-7xl lg:text-9xl">

              {t.title1}

              <br />

              <span className="text-[#d2c5a5]">
                {t.title2}
              </span>

            </h1>

            {/* Açıklama */}

            <p className="mt-9 max-w-2xl text-base leading-8 text-[#e0dace] drop-shadow-lg sm:text-lg">
              {t.description}
            </p>

            {/* Arama */}

            <div className="mt-12 max-w-2xl">

              <div className="flex items-center border border-white/25 bg-black/35 backdrop-blur-md transition focus-within:border-white/50">

                <span className="px-5 text-xl text-[#c6bda9]">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="h-16 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-[#c5bdad]"
                />

                <button className="mr-2 hidden h-12 bg-[#e8e3d8] px-7 text-xs font-medium uppercase tracking-widest text-black transition hover:bg-white sm:block">
                  {t.search}
                </button>

              </div>

            </div>

            {/* Arşivi keşfet */}

            <Link
              href="/kisiler"
              className="mt-8 inline-flex items-center gap-4 border border-white/20 bg-black/25 px-6 py-4 text-xs uppercase tracking-[0.25em] text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-black/40"
            >
              {t.explore}

              <span className="text-lg">
                →
              </span>
            </Link>

          </div>

        </div>

        {/* Alt çizgi */}

        <div className="absolute bottom-8 left-0 right-0">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">

            <div className="h-px w-20 bg-white/30" />

            <div className="text-[9px] uppercase tracking-[0.4em] text-white/50">
              KURDNAME
            </div>

            <div className="h-px w-20 bg-white/30" />

          </div>

        </div>

      </section>

      {/* FELSEFE BÖLÜMÜ */}

      <section className="relative z-10 border-t border-white/15 bg-black/65 backdrop-blur-sm">

        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">

          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">

            <div>

              <p className="text-[10px] uppercase tracking-[0.3em] text-[#aaa08c]">
                KURDNAME
              </p>

              <div className="mt-5 h-px w-16 bg-[#aaa08c]/50" />

              <p className="mt-6 max-w-sm text-sm leading-7 text-[#aaa395]">
                {t.footer}.
              </p>

            </div>

            <div>

              <blockquote className="max-w-4xl text-3xl font-light leading-[1.35] tracking-[-0.02em] text-white sm:text-5xl">
                “{t.quote}”
              </blockquote>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="relative z-10 border-t border-white/10 bg-black/80">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-8 lg:px-10">

          <div className="text-xs tracking-[0.2em] text-white/40">
            KURDNAME
          </div>

          <div className="text-right text-xs text-white/30">
            {t.footer}
          </div>

        </div>

      </footer>

    </main>
  );
}