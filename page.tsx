const timeline = [
  {
    year: "1893",
    title: "Doğumu",
    text: "Celadet Alî Bedirxan, Bedirxanî ailesinin bir ferdi olarak dünyaya geldi.",
  },
  {
    year: "1910'lar",
    title: "Hukuk ve Osmanlı dönemi",
    text: "Hukuk eğitimi aldı ve Birinci Dünya Savaşı sırasında Osmanlı ordusunda subay olarak görev yaptı.",
  },
  {
    year: "1920'ler",
    title: "Sürgün ve Avrupa",
    text: "Osmanlı İmparatorluğu'nun ardından ailesiyle birlikte sürgün hayatı yaşadı ve eğitimini Avrupa'da sürdürdü.",
  },
  {
    year: "1930",
    title: "Şam",
    text: "Şam'a yerleşerek Kürt dili, edebiyatı ve kültürü üzerine çalışmalarını yoğunlaştırdı.",
  },
  {
    year: "1932",
    title: "Hawar",
    text: "Hawar dergisini yayımlamaya başladı. Dergi, modern Kürt yazı dili ve Latin temelli alfabenin gelişiminde önemli bir rol oynadı.",
  },
  {
    year: "1951",
    title: "Ölümü",
    text: "Celadet Alî Bedirxan, 1951 yılında Şam'da hayatını kaybetti.",
  },
];

const works = [
  "Hawar",
  "Ronahî",
  "Bingehên gramera kurdmancî",
];

export default function CeladetPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">

      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">

          <a href="/" className="group">
            <div className="text-2xl font-semibold tracking-[0.18em] text-white">
              KURDNAME
            </div>

            <div className="mt-1 text-[9px] uppercase tracking-[0.35em] text-[#706b61]">
              Dijital Hafıza Arşivi
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.18em] md:flex">
            <a
              href="/kisiler"
              className="text-white"
            >
              Kişiler
            </a>

            <a
              href="#"
              className="text-[#777168] hover:text-white"
            >
              Olaylar
            </a>

            <a
              href="#"
              className="text-[#777168] hover:text-white"
            >
              Eserler
            </a>

            <a
              href="#"
              className="text-[#777168] hover:text-white"
            >
              Arşiv
            </a>
          </nav>

          <div className="border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#777168]">
            KU
          </div>

        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10">

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#625d54]">
          <a href="/kisiler" className="hover:text-white">
            Kişiler
          </a>

          <span>/</span>

          <span className="text-[#91897b]">
            Celadet Alî Bedirxan
          </span>
        </div>

      </div>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">

        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">

          {/* PORTRAIT */}
          <div className="aspect-[4/5] bg-[#151513]">

            <div className="flex h-full items-center justify-center">

              <div className="text-center">

                <div className="text-[120px] font-light tracking-[-0.08em] text-[#292823]">
                  CA
                </div>

                <div className="mt-4 text-[9px] uppercase tracking-[0.3em] text-[#514d46]">
                  Portre arşivi
                </div>

              </div>

            </div>

          </div>

          {/* INTRO */}
          <div className="flex flex-col justify-end">

            <div className="text-[10px] uppercase tracking-[0.3em] text-[#625d54]">
              1893 — 1951
            </div>

            <h1 className="mt-6 text-5xl font-light leading-[0.95] tracking-[-0.05em] text-white sm:text-7xl">
              Celadet Alî
              <br />
              <span className="text-[#91897b]">
                Bedirxan.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-base leading-8 text-[#777168]">
              Kürt dilbilimci, yazar, gazeteci ve kültürel
              çalışmaların öncü isimlerinden biri.
            </p>

            <div className="mt-12 grid grid-cols-2 border-t border-white/10 pt-6 sm:grid-cols-3">

              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#514d46]">
                  Doğum
                </div>

                <div className="mt-2 text-sm text-[#aaa397]">
                  1893
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#514d46]">
                  Ölüm
                </div>

                <div className="mt-2 text-sm text-[#aaa397]">
                  1951
                </div>
              </div>

              <div className="mt-6 sm:mt-0">
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#514d46]">
                  Alan
                </div>

                <div className="mt-2 text-sm text-[#aaa397]">
                  Dil · Edebiyat
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="border-t border-white/10">

        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1fr_320px] lg:px-10">

          {/* BIOGRAPHY */}
          <article>

            <div className="mb-10 text-[10px] uppercase tracking-[0.3em] text-[#625d54]">
              Biyografi
            </div>

            <h2 className="max-w-3xl text-3xl font-light leading-tight text-white sm:text-4xl">
              Dil, yazı ve kültür üzerinden bir hafıza inşası.
            </h2>

            <div className="mt-10 max-w-3xl space-y-7 text-sm leading-8 text-[#777168]">

              <p>
                Celadet Alî Bedirxan, Bedirxan ailesinin önemli
                isimlerinden biri olarak 20. yüzyıl Kürt kültür
                tarihinde özellikle dil çalışmalarıyla öne çıktı.
              </p>

              <p>
                Eğitim hayatının ardından hukuk alanında çalışmalar
                yürüttü. Birinci Dünya Savaşı sırasında Osmanlı
                ordusunda subay olarak görev yaptı. İmparatorluğun
                çözülüşünden sonraki dönemde ise sürgün hayatı
                yaşadı ve Kürt siyasi ve kültürel hareketleriyle
                ilişkisini sürdürdü.
              </p>

              <p>
                1930'lu yıllarda çalışmalarının merkezine Kürtçeyi
                aldı. Şam'da yayımladığı Hawar dergisi aracılığıyla
                Kürt dili, edebiyatı ve kültürü üzerine yazılar
                yayımladı.
              </p>

              <p>
                Celadet'in en kalıcı çalışmalarından biri,
                Kurmancî için Latin temelli yazı sisteminin
                geliştirilmesi ve yaygınlaştırılmasıdır. Hawar,
                bu çalışmaların yayıldığı en önemli yayın
                platformlarından biri oldu.
              </p>

            </div>

          </article>

          {/* INFO */}
          <aside>

            <div className="border-t border-white/10 pt-6">

              <div className="text-[9px] uppercase tracking-[0.25em] text-[#514d46]">
                Bilgi
              </div>

              <dl className="mt-6 space-y-6">

                <div>
                  <dt className="text-[9px] uppercase tracking-[0.2em] text-[#514d46]">
                    Tam adı
                  </dt>

                  <dd className="mt-2 text-sm text-[#aaa397]">
                    Celadet Alî Bedirxan
                  </dd>
                </div>

                <div>
                  <dt className="text-[9px] uppercase tracking-[0.2em] text-[#514d46]">
                    Meslek
                  </dt>

                  <dd className="mt-2 text-sm text-[#aaa397]">
                    Dilbilimci · Yazar · Gazeteci
                  </dd>
                </div>

                <div>
                  <dt className="text-[9px] uppercase tracking-[0.2em] text-[#514d46]">
                    Çalışma alanı
                  </dt>

                  <dd className="mt-2 text-sm text-[#aaa397]">
                    Kürt dili ve edebiyatı
                  </dd>
                </div>

              </dl>

            </div>

          </aside>

        </div>

      </section>

      {/* TIMELINE */}
      <section className="border-t border-white/10 bg-[#10100f]">

        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">

          <div className="mb-14">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#625d54]">
              Zaman çizelgesi
            </div>

            <h2 className="mt-4 text-3xl font-light text-white">
              Hayatından izler.
            </h2>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">

            {timeline.map((item) => (
              <div
                key={item.year}
                className="grid gap-5 py-8 md:grid-cols-[140px_220px_1fr]"
              >

                <div className="text-sm text-[#91897b]">
                  {item.year}
                </div>

                <div className="text-sm text-white">
                  {item.title}
                </div>

                <p className="max-w-2xl text-sm leading-7 text-[#625d54]">
                  {item.text}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* WORKS */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">

        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">

          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#625d54]">
              Eserler
            </div>

            <h2 className="mt-4 text-3xl font-light text-white">
              Ardında bıraktıkları.
            </h2>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">

            {works.map((work, index) => (
              <div
                key={work}
                className="flex items-center justify-between py-6"
              >

                <div className="flex items-center gap-6">

                  <span className="text-[10px] text-[#514d46]">
                    0{index + 1}
                  </span>

                  <span className="text-lg font-light text-[#aaa397]">
                    {work}
                  </span>

                </div>

                <span className="text-[#514d46]">
                  →
                </span>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* SOURCES */}
      <section className="border-t border-white/10 bg-[#10100f]">

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">

          <div className="text-[10px] uppercase tracking-[0.3em] text-[#625d54]">
            Kaynak notu
          </div>

          <p className="mt-5 max-w-3xl text-xs leading-7 text-[#625d54]">
            KURDNAME biyografileri farklı kaynaklar karşılaştırılarak
            hazırlanacaktır. Tarihler, yerler ve tartışmalı bilgiler
            mümkün olduğunca kaynak belirtilerek sunulacaktır.
          </p>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-xs text-[#514d46] sm:flex-row sm:items-center sm:justify-between lg:px-10">

          <span>© 2026 KURDNAME</span>

          <a
            href="/kisiler"
            className="transition hover:text-white"
          >
            ← Kişiler arşivine dön
          </a>

        </div>

      </footer>

    </main>
  );
}