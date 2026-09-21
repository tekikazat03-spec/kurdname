"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const categories = [
  {
    number: "01",
    href: "/isyanlar",
    title: {
      tr: "İsyanlar ve Hareketler",
      ku: "Serhildan û Tevger",
      en: "Rebellions and Movements",
    },
  },
  {
    number: "02",
    href: "/katliamlar",
    title: {
      tr: "Katliamlar ve Kıyımlar",
      ku: "Komkujî û Qirkirin",
      en: "Massacres and Atrocities",
    },
  },
  {
    number: "03",
    href: "/orgutler",
    title: {
      tr: "Örgütler ve Cemiyetler",
      ku: "Rêxistin û Civak",
      en: "Organizations and Societies",
    },
  },
  {
    number: "04",
    href: "/yazarlar",
    title: {
      tr: "Yazarlar ve Şairler",
      ku: "Nivîskar û Helbestvan",
      en: "Writers and Poets",
    },
  },
  {
    number: "05",
    href: "/siyasetciler",
    title: {
      tr: "Siyasetçiler ve Aydınlar",
      ku: "Siyasetmedar û Rewşenbîr",
      en: "Politicians and Intellectuals",
    },
  },
  {
    number: "06",
    href: "/kisiler",
    title: {
      tr: "Kişiler",
      ku: "Kesayetî",
      en: "People",
    },
  },
];

export default function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const { language } = useLanguage();

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Arka plan */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sol menü */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[min(430px,90vw)] border-r border-white/10 bg-[#0b0b0b] transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">

          {/* Menü başlığı */}
          <div className="flex items-center justify-between border-b border-white/10 px-7 py-6">
            <div>
              <div className="text-xl font-semibold tracking-[0.18em] text-white">
                KURDNAME
              </div>

              <div className="mt-1 text-[9px] uppercase tracking-[0.3em] text-[#777064]">
                {language === "tr"
                  ? "Dijital Hafıza Arşivi"
                  : language === "ku"
                    ? "Arşîva Bîranîna Dîjîtal"
                    : "Digital Memory Archive"}
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Menüyü kapat"
              className="flex h-10 w-10 items-center justify-center border border-white/10 text-xl text-white/50 transition hover:border-white/30 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Kategoriler */}
          <div className="flex-1 overflow-y-auto px-5 py-8">

            <div className="mb-8 px-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#625d54]">
                {language === "tr"
                  ? "ARŞİV"
                  : language === "ku"
                    ? "ARŞÎV"
                    : "ARCHIVE"}
              </p>
            </div>

            <nav className="space-y-1">
              {categories.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  onClick={onClose}
                  className="group flex items-center gap-5 border-b border-white/[0.06] px-3 py-5 transition hover:bg-white/[0.035]"
                >
                  <span className="w-8 text-xs text-[#4f4b45]">
                    {category.number}
                  </span>

                  <span className="flex-1 text-lg font-light text-[#aaa397] transition group-hover:text-white">
                    {category.title[language]}
                  </span>

                  <span className="text-[#4f4b45] transition group-hover:translate-x-1 group-hover:text-white">
                    →
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Alt bölüm */}
          <div className="border-t border-white/10 px-7 py-6">
            <p className="text-[9px] uppercase tracking-[0.28em] text-[#4f4b45]">
              KURDNAME
            </p>

            <p className="mt-2 text-xs leading-5 text-[#625d54]">
              {language === "tr"
                ? "Kürdistan tarihine dair dijital arşiv."
                : language === "ku"
                  ? "Arşîva dîjîtal a dîroka Kurdistanê."
                  : "A digital archive of Kurdistan's history."}
            </p>
          </div>

        </div>
      </aside>
    </>
  );
}