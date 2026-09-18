"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const categories = [
  {
    number: "01",
    href: "/isyanlar",
    title: {
      tr: "İsyanlar ve Hareketler",
      ku: "Serhildan û Tevger",
      en: "Rebellions and Movements",
    },
    description: {
      tr: "Kürdistan tarihindeki isyanlar, ayaklanmalar ve siyasi hareketler.",
      ku: "Serhildan, tevger û bûyerên siyasî di dîroka Kurdistanê de.",
      en: "Rebellions, uprisings and political movements in Kurdish history.",
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
    description: {
      tr: "Toplu şiddet, katliam, sürgün ve kıyım olaylarının arşivi.",
      ku: "Arşîva komkujî, qirkirin, sirgûn û bûyerên tundûtûjiyê.",
      en: "An archive of massacres, forced displacement and mass violence.",
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
    description: {
      tr: "Siyasi, kültürel ve askerî örgütler ile cemiyetlerin arşivi.",
      ku: "Arşîva rêxistin û civakên siyasî, çandî û leşkerî.",
      en: "An archive of political, cultural and military organizations.",
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
    description: {
      tr: "Kürt edebiyatının yazarları, şairleri ve yayıncılarının arşivi.",
      ku: "Arşîva nivîskar, helbestvan û weşangerên edebiyata Kurdî.",
      en: "An archive of Kurdish writers, poets and publishers.",
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
    description: {
      tr: "Siyasi ve entelektüel yaşamda yer alan kişilerin arşivi.",
      ku: "Arşîva kesayetiyên siyasî û rewşenbîrî.",
      en: "An archive of people involved in political and intellectual life.",
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
    description: {
      tr: "KURDNAME kişi arşivi.",
      ku: "Arşîva kesayetiyên KURDNAME.",
      en: "The KURDNAME people archive.",
    },
  },
];

export default function Home() {
  const { language } = useLanguage();

  const texts = {
    tr: {
      archive: "Dijital Hafıza Arşivi",
      intro: "Kürdistan'ın tarihi ve hafızası",
      title1: "Bir hafıza.",
      title2: "Binlerce iz.",
      description:
        "Kürdistan tarihine dair kişileri, isyanları, örgütleri, katliamları, yazarları ve eserleri kaynaklarıyla birlikte arşivleyen dijital hafıza platformu.",
      searchPlaceholder:
        "Kişi, isyan, örgüt, olay veya eser ara...",
      search: "Ara",
      archiveTitle: "KURDNAME ARŞİVİ",
      categories: "Kategoriler",
      categoriesDescription:
        "Tarihi kişilerden siyasi örgütlere, isyanlardan edebiyata kadar arşivin farklı bölümlerini keşfet.",
      philosophy:
        "Tarihi kaydetmek, unutulmaması gerekenleri gelecek kuşaklara aktarmaktır.",
      quote:
        "Bir milletin hafızası, yalnızca geçmişini değil, geleceğini de taşır.",
      people: "Kişiler",
    },

    ku: {
      archive: "Arşîva Bîranîna Dîjîtal",
      intro: "Dîrok û bîranîna Kurdistanê",
      title1: "Bîranînek.",
      title2: "Hezaran şop.",
      description:
        "Platformeke bîranîna dîjîtal e ku kesayetî, serhildan, rêxistin, komkujî, nivîskar û berhemên di dîroka Kurdistanê de bi çavkaniyên wan re arşîv dike.",
      searchPlaceholder:
        "Li kesayetî, serhildan, rêxistin, bûyer an berhemê bigere...",
      search: "Lêgerîn",
      archiveTitle: "ARŞÎVA KURDNAME",
      categories: "Kategorî",
      categoriesDescription:
        "Ji kesayetiyên dîrokî û rêxistinên siyasî heta serhildan û edebiyatê, beşên cuda yên arşîvê keşf bike.",
      philosophy:
        "Tomarkirina dîrokê, veguhastina tiştên ku divê neyên jibîrkirin bo nifşên pêşerojê ye.",
      quote:
        "Bîranîna miletekî tenê rabirdûya wî nagire, pêşeroja wî jî digire.",
      people: "Kesayetî",
    },

    en: {
      archive: "Digital Memory Archive",
      intro: "The history and memory of Kurdistan",
      title1: "One memory.",
      title2: "Thousands of traces.",
      description:
        "A digital memory platform archiving people, rebellions, organizations, massacres, writers and works related to the history of Kurdistan, together with their sources.",
      searchPlaceholder:
        "Search for a person, rebellion, organization, event or work...",
      search: "Search",
      archiveTitle: "KURDNAME ARCHIVE",
      categories: "Categories",
      categoriesDescription:
        "Explore different sections of the archive, from historical figures and political organizations to rebellions and literature.",
      philosophy:
        "Recording history means carrying what must not be forgotten to future generations.",
      quote:
        "The memory of a people carries not only its past, but also its future.",
      people: "People",
    },
  };

  const t = texts[language];

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <Link href="/" className="group">
            <div className="text-2xl font-semibold tracking-[0.18em] text-white">
              KURDNAME
            </div>

            <div className="mt-1 text-[9px] uppercase tracking-[0.32em] text-[#9d9688]">
              {t.archive}
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-8 text-sm text-[#aaa397] md:flex">
              <Link
                href="/isyanlar"
                className="transition hover:text-white"
              >
                {t.archiveTitle === "ARŞÎVA KURDNAME"
                  ? "Serhildan"
                  : t.archiveTitle === "KURDNAME ARCHIVE"
                    ? "Rebellions"
                    : "İsyanlar"}
              </Link>

              <Link
                href="/katliamlar"
                className="transition hover:text-white"
              >
                {t.archiveTitle === "ARŞÎVA KURDNAME"
                  ? "Komkujî"
                  : t.archiveTitle === "KURDNAME ARCHIVE"
                    ? "Massacres"
                    : "Katliamlar"}
              </Link>

              <Link
                href="/orgutler"
                className="transition hover:text-white"
              >
                {t.archiveTitle === "ARŞÎVA KURDNAME"
                  ? "Rêxistin"
                  : t.archiveTitle === "KURDNAME ARCHIVE"
                    ? "Organizations"
                    : "Örgütler"}
              </Link>

              <Link
                href="/kisiler"
                className="transition hover:text-white"
              >
                {t.people}
              </Link>
            </nav>

            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(130,115,85,0.12),transparent_45%)]" />

        <div className="relative mx-auto flex min-h-[650px] max-w-7xl flex-col justify-center px-6 py-24 lg:px-10">
          <div className="max-w-4xl">
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

          <div className="mt-14 max-w-3xl">
            <div className="flex items-center border border-white/15 bg-white/[0.025] transition focus-within:border-white/35">
              <span className="px-5 text-[#777166]">⌕</span>

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

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-12 border-b border-white/10 pb-5">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#777064]">
            {t.archiveTitle}
          </p>

          <h2 className="text-3xl font-light text-white sm:text-4xl">
            {t.categories}
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#777168]">
            {t.categoriesDescription}
          </p>
        </div>

        <div className="grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.number}
              href={category.href}
              className="group min-h-[260px] border-b border-r border-white/10 p-7 transition hover:bg-white/[0.035]"
            >
              <div className="flex justify-between">
                <span className="text-xs text-[#625d54]">
                  {category.number}
                </span>

                <span className="text-[#625d54] transition group-hover:translate-x-1 group-hover:text-white">
                  →
                </span>
              </div>

              <div className="mt-20">
                <h3 className="text-2xl font-light text-white">
                  {category.title[language]}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#777168]">
                  {category.description[language]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#10100f]">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#777064]">
                KURDNAME
              </p>

              <p className="mt-4 text-sm leading-7 text-[#625d54]">
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
    </main>
  );
}