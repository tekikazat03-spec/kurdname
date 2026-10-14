import Link from "next/link";

const sections = [
  {
    number: "01",
    title: "Şahsiyetler",
    description: "Tarihî şahsiyetlerin biyografilerini, fotoğraflarını ve kaynaklarını yönet.",
    href: "/admin/kisiler",
  },
  {
    number: "02",
    title: "Örgütler",
    description: "Kürdistan tarihindeki örgütlerin ve cemiyetlerin arşiv kayıtlarını yönet.",
    href: "/admin/orgutler",
  },
  {
    number: "03",
    title: "Partiler",
    description: "Siyasi partilerin kuruluşlarını, faaliyetlerini ve tarihsel kayıtlarını yönet.",
    href: "/admin/partiler",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#0b100e] text-[#e8e0cb]">
      <header className="border-b border-[#b99a5b]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
          <Link
            href="/"
            className="text-xl font-semibold tracking-[0.25em] text-[#d6b875]"
          >
            KURDNAME
          </Link>

          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-[#b8ad94] transition hover:text-[#e2c582]"
          >
            ← Siteye Dön
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#b99a5b]/20 px-6 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,91,48,0.14),transparent_65%)]" />

        <div className="relative mx-auto max-w-4xl">
          <p className="mb-6 text-xs uppercase tracking-[0.4em] text-[#c2a46a]">
            KURDNAME · ARŞİV YÖNETİMİ
          </p>

          <h1 className="font-serif text-5xl text-[#f1e6cc] sm:text-6xl">
            Yönetim Paneli
          </h1>

          <div className="mx-auto my-8 h-px w-24 bg-[#b99a5b]" />

          <p className="text-base leading-8 text-[#b8b3a6]">
            Kürdistan'ın dijital hafızasını buradan yönet.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex items-center justify-between border-b border-[#b99a5b]/20 pb-5">
          <h2 className="font-serif text-2xl text-[#e8d7b3]">
            Arşiv Bölümleri
          </h2>

          <span className="text-xs tracking-[0.2em] text-[#a89b7c]">
            3 BÖLÜM
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex min-h-80 flex-col justify-between border border-[#b99a5b]/20 bg-[#111a15] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#c6a568]/70 hover:bg-[#17231b]"
            >
              <div>
                <span className="font-serif text-4xl text-[#b99a5b]/40">
                  {section.number}
                </span>

                <div className="mt-10 h-px w-12 bg-[#b99a5b]" />

                <h3 className="mt-6 font-serif text-3xl text-[#f1e6cc]">
                  {section.title}
                </h3>

                <p className="mt-5 text-sm leading-7 text-[#a89f8b]">
                  {section.description}
                </p>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-[#b99a5b]/20 pt-5 text-xs uppercase tracking-[0.15em] text-[#c6a568]">
                <span>Bölümü Yönet</span>
                <span className="text-lg transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-16">
        <Link
          href="/admin/galeri"
          className="block border border-[#b99a5b]/30 bg-[#111a15] p-7 text-center transition hover:border-[#d6b875]"
        >
          <span className="font-serif text-2xl text-[#f1e6cc]">
            Tarihî Belge ve Fotoğraf Yönetimi
          </span>
          <span className="mt-3 block text-sm text-[#c9a66b]">
            Galerileri Yönet →
          </span>
        </Link>
      </div>
      <footer className="border-t border-[#b99a5b]/20 px-6 py-8 text-center text-xs tracking-[0.15em] text-[#8c8575]">
        KURDNAME · Kürdistan'ın Dijital Arşivi
      </footer>
    </main>
  );
}
