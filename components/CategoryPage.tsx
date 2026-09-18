"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

type CategoryContent = {
  label: string;
  title: string;
  description: string;
  empty: string;
};

type CategoryPageProps = {
  content: {
    tr: CategoryContent;
    ku: CategoryContent;
    en: CategoryContent;
  };
};

export default function CategoryPage({
  content,
}: CategoryPageProps) {
  const { language } = useLanguage();
  const t = content[language];

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
          <Link
            href="/"
            className="text-sm text-white/40 transition hover:text-white"
          >
            ← KURDNAME
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <p className="mb-5 text-xs tracking-[0.35em] text-white/30">
          {t.label}
        </p>

        <h1 className="text-4xl font-semibold md:text-6xl">
          {t.title}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/50">
          {t.description}
        </p>

        <div className="mt-16 border border-white/10 bg-[#101010] p-10">
          <p className="text-white/30">
            {t.empty}
          </p>
        </div>
      </section>
    </main>
  );
}