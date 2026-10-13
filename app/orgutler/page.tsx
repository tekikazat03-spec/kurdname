import Link from "next/link";

export default function OrgutlerPage() {
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
            ← Ana Sayfa
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#b99a5b]/20 px-6 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,91,48,0.14),transparent_65%)]" />

        <div className="relative mx-auto max-w-4xl">
          <p className="mb-6 text-xs uppercase tracking-[0.45em] text-[#c2a46a]">
            KURDNAME · DİJİTAL ARŞİV
          </p>

          <h1 className="font-serif text-5xl tracking-[0.08em] text-[#f1e6cc] sm:text-7xl">
            ÖRGÜTLER
          </h1>

          <div className="mx-auto my-8 h-px w-24 bg-[#b99a5b]" />

          <p className="mx-auto max-w-2xl text-base leading-8 text-[#b8b3a6]">
            Kürdistan tarihinde yer edinmiş siyasi, kültürel ve askerî
            örgütlerin kuruluşları, faaliyetleri ve tarihsel mirasları.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex items-center justify-between border-b border-[#b99a5b]/20 pb-5">
          <h2 className="font-serif text-2xl text-[#e8d7b3]">
            Arşiv Kayıtları
          </h2>

          <span className="text-xs tracking-[0.2em] text-[#a89b7c]">
            0 KAYIT
          </span>
        </div>

        <div className="flex min-h-80 flex-col items-center justify-center border border-[#b99a5b]/20 bg-[#111a15] px-6 text-center">
          <div className="mb-6 text-4xl text-[#b99a5b]">✦</div>

          <h3 className="font-serif text-2xl text-[#e8d7b3]">
            Arşiv Hazırlanıyor
          </h3>

          <p className="mt-4 max-w-md text-sm leading-7 text-[#a89f8b]">
            Örgütler koleksiyonu henüz oluşturulmadı.
            Yeni kayıtlar eklendikçe burada görüntülenecek.
          </p>
        </div>
      </section>

      <footer className="border-t border-[#b99a5b]/20 px-6 py-8 text-center text-xs tracking-[0.15em] text-[#8c8575]">
        KURDNAME · Kürdistan'ın Dijital Arşivi
      </footer>
    </main>
  );
}
