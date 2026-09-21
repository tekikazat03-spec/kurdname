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
      archive: "Dijital Hafıza Arşivi",
      independent: "Bağımsız Dijital Platform",
      intro: "Kürdistan'ın tarihi ve hafızası",
      title1: "Bir hafıza.",
      title2: "Binlerce iz.",
      description:
        "Kürdistan tarihine dair kişileri, isyanları, örgütleri, olayları, yazarları ve eserleri kaynaklarıyla birlikte arşivleyen dijital hafıza platformu.",
      searchPlaceholder:
        "Kişi, isyan, örgüt, olay veya eser ara...",
      search: "Ara",
      philosophyTitle: "KURDNAME",
      philosophy:
        "Tarihi kaydetmek, unutulmaması gerekenleri gelecek kuşaklara aktarmaktır.",
      quote:
        "Bir milletin hafızası, yalnızca geçmişini değil, geleceğini de taşır.",
      footer:
        "Kürdistan tarihine dair bağımsız dijital arşiv.",
    },

    ku: {
      archive: "Arşîva Bîranîna Dîjîtal",
      independent: "Platforma Dîjîtal a Serbixwe",
      intro: "Dîrok û bîranîna Kurdistanê",
      title1: "Bîranînek.",
      title2: "Hezaran şop.",
      description:
        "Platformeke dîjîtal e ku kesayetî, serhildan, rêxistin, bûyer, nivîskar û berhemên di dîroka Kurdistanê de bi çavkaniyên wan re arşîv dike.",
      searchPlaceholder:
        "Li kesayetî, serhildan, rêxistin, bûyer an berhemê bigere...",
      search: "Lêgerîn",
      philosophyTitle: "KURDNAME",
      philosophy:
        "Tomarkirina dîrokê, veguhastina tiştên ku divê neyên jibîrkirin bo nifşên pêşerojê ye.",
      quote:
        "Bîranîna miletekî tenê rabirdûya wî nagire, pêşeroja wî jî digire.",
      footer:
        "Arşîva dîjîtal a serbixwe ya dîroka Kurdistanê.",
    },

    en: {
      archive: "Digital Memory Archive",
      independent: "Independent Digital Platform",
      intro: "The history and memory of Kurdistan",
      title1: "One memory.",
      title2: "Thousands of traces.",
      description:
        "An independent digital platform archiving people, rebellions, organizations, events, writers and works related to the history of Kurdistan, together with their sources.",
      searchPlaceholder:
        "Search for a person, rebellion, organization, event or work...",
      search: "Search",
      philosophyTitle: "KURDNAME",
      philosophy:
        "Recording history means carrying what must not be forgotten to future generations.",
      quote:
        "The memory of a people carries not only its past, but also its future.",
      footer:
        "An independent digital archive of Kurdistan's history.",
    },
  };

  const t = texts[language];

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">

      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">

          <div className="flex items-center gap-5">

            {/* MENU BUTTON */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Menüyü aç"
              className="flex h-11 w-11 items-center justify-center border border-white/10 text-white/60 transition hover:border-white/30 hover:bg-white/[0.04] hover:text-white"
            >
              <div className="space-y-1.5">
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
              </div>
            </button>

            {/* LOGO */}
            <Link href="/" className="group">
              <div className="text-2xl font-semibold tracking-[0.18em] text-white">
                KURDNAME
              </div>

              <div className="mt-1 text-[9px] uppercase tracking-[0.32em] text-[#9d9688]">
                {t.archive}
              </div>
            </Link>

          </div>

          {/* LANGUAGE */}
          <LanguageSwitcher />

        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(130,115,85,0.12),transparent_45%)]" />

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl flex-col justify-center px-6 py-24 lg:px-10">

          <div className="max-w-4xl">

            {/* INDEPENDENT PLATFORM */}
            <div className="mb-8 inline-flex items-center gap-3 border border-white/10 bg-white/[0.025] px-4 py-2">

              <span className="h-1.5 w-1.5 rounded-full bg-[#8e8779]" />

              <span className="text-[10px] uppercase tracking-[0.3em] text-[#938b7c]">
                {t.independent}
              </span>

            </div>

            <p className="mb-7 text-xs uppercase tracking-[0.35em] text-[#938b7c]">
              {t.intro}
            </p>

            <h1 className="max-w-4xl text-5xl font-light leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl">
              {t.title1}
              <br />

              <span className="text-[#a69d8d]">
                {t.title2}
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-[#938d82] sm:text-lg">
              {t.description}
            </p>

          </div>

          {/* SEARCH */}
          <div className="mt-14 max-w-3xl">

            <div className="flex items-center border border-white/15 bg-white/[0.025] transition focus-within:border-white/35">

              <span className="px-5 text-[#777166]">
                ⌕
              </span>

              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="h-16 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-[#666057]"
              />

              <button className="mr-2 hidden h-12 bg-[#e8e3d8] px-6 text-xs font-medium uppercase tracking-widest text-black transition hover:bg-white sm:block">
                {t.search}
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="border-b border-white/10 bg-[#10100f]">

        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">

          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">

            <div>

              <p className="text-[10px] uppercase tracking-[0.3em] text-[#777064]">
                {t.philosophyTitle}
              </p>

              <p className="mt-4 max-w-sm text-sm leading-7 text-[#625d54]">
                {t.philosophy}
              </p>

            </div>

            <div>

              <blockquote className="text-3xl font-light leading-[1.35] tracking-[-0.02em] text-white sm:text-5xl">
                “{t.quote}”
              </blockquote>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 lg:px-10">

          <div className="text-xs tracking-[0.2em] text-white/30">
            KURDNAME
          </div>

          <div className="text-xs text-white/25">
            {t.footer}
          </div>

        </div>

      </footer>

    </main>
  );
}