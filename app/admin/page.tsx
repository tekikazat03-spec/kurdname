import Link from "next/link";

const sections = [
  {
    number: "01",
    title: "Kişiler",
    description: "Arşivdeki kişi kayıtlarını ekle, düzenle ve yönet.",
    href: "/admin/kisiler",
  },
  {
    number: "02",
    title: "İsyanlar ve Hareketler",
    description: "İsyan ve tarihsel hareket kayıtlarını yönet.",
    href: "/admin/isyanlar",
  },
  {
    number: "03",
    title: "Katliamlar ve Kıyımlar",
    description: "Tarihsel olay ve katliam kayıtlarını yönet.",
    href: "/admin/katliamlar",
  },
  {
    number: "04",
    title: "Örgütler ve Cemiyetler",
    description: "Örgüt, cemiyet ve kuruluş kayıtlarını yönet.",
    href: "/admin/orgutler",
  },
  {
    number: "05",
    title: "Yazarlar ve Şairler",
    description: "Yazar ve şair kayıtlarını yönet.",
    href: "/admin/yazarlar",
  },
  {
    number: "06",
    title: "Siyasetçiler ve Aydınlar",
    description: "Siyasetçi ve aydın kayıtlarını yönet.",
    href: "/admin/siyasetciler",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
          >
            ← Siteye Dön
          </Link>

          <div className="text-xl font-semibold tracking-[0.2em] text-white">
            KURDNAME
          </div>

          <div className="text-[10px] uppercase tracking-[0.25em] text-white/25">
            Admin
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-10">
        <div className="border-b border-white/10 pb-10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#a99f8b]">
            YÖNETİM PANELİ
          </div>

          <h1 className="mt-4 text-5xl font-light text-white sm:text-6xl">
            Arşiv Yönetimi
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/40">
            KURDNAME dijital arşivindeki kişi, olay, örgüt ve
            diğer tarihsel içerikleri buradan yönet.
          </p>
        </div>

        <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.number}
              href={section.href}
              className="group min-h-[240px] bg-[#0b0b0b] p-8 transition hover:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] tracking-[0.25em] text-white/20">
                  {section.number}
                </span>

                <span className="text-white/20 transition group-hover:translate-x-1 group-hover:text-white/60">
                  →
                </span>
              </div>

              <div className="mt-16">
                <h2 className="text-2xl font-light text-white">
                  {section.title}
                </h2>

                <p className="mt-4 max-w-sm text-sm leading-6 text-white/35">
                  {section.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 border border-white/10 p-8">
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/25">
            DURUM
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-light text-white">
                Arşiv sistemi aktif
              </h2>

              <p className="mt-2 text-sm text-white/35">
                İçerikler Firebase Realtime Database üzerinde
                tutuluyor.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-green-400" />

              <span className="text-xs uppercase tracking-[0.15em] text-white/40">
                Aktif
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl justify-between text-[10px] uppercase tracking-[0.2em] text-white/20">
          <span>KURDNAME</span>
          <span>Dijital Arşiv</span>
        </div>
      </footer>
    </main>
  );
}