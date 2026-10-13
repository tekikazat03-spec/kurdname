"use client";

import Link from "next/link";

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

export default function CategoryPage({ content }: CategoryPageProps) {
  const t = content.tr;

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <header className="border-b border-white/10 px-6 py-6">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← Ana Sayfa
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-sm uppercase tracking-widest text-amber-500">
          {t.label}
        </p>

        <h1 className="mt-5 text-5xl font-semibold">
          {t.title}
        </h1>

        <p className="mt-6 text-lg text-white/60">
          {t.description}
        </p>

        <div className="mt-16 border-t border-white/10 pt-10 text-white/40">
          {t.empty}
        </div>
      </section>
    </main>
  );
}
