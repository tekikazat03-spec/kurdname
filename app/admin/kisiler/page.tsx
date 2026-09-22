import Link from "next/link";

type Person = {
  id: string;
  name: string;
  slug: string;
  birth?: string;
  death?: string;
  category?: string;
  imageUrl?: string;
  shortBio?: string;
};

async function getPeople(): Promise<Person[]> {
  try {
    const response = await fetch(
      "https://kurdname-7ba60-default-rtdb.firebaseio.com/people.json",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data) {
      return [];
    }

    return Object.entries(data).map(([key, value]) => ({
      ...(value as Person),
      id: key,
    }));
  } catch (error) {
    console.error("Kişiler alınamadı:", error);
    return [];
  }
}

export default async function AdminPeoplePage() {
  const people = await getPeople();

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <Link
            href="/admin"
            className="text-xs uppercase tracking-[0.25em] text-white/50 transition hover:text-white"
          >
            ← Yönetim Paneli
          </Link>

          <div className="text-xl font-semibold tracking-[0.2em] text-white">
            KURDNAME
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-10 pt-16 lg:px-10">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#a99f8b]">
              YÖNETİM PANELİ
            </div>

            <h1 className="mt-4 text-4xl font-light text-white sm:text-5xl">
              Kişiler
            </h1>

            <p className="mt-3 text-sm text-white/40">
              Arşivdeki kişi kayıtlarını yönet.
            </p>
          </div>

          <Link
            href="/admin/kisiler/yeni"
            className="inline-flex items-center justify-center bg-[#e8e3d8] px-6 py-4 text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:bg-white"
          >
            + Yeni Kişi
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        {people.length === 0 ? (
          <div className="border border-white/10 px-8 py-20 text-center">
            <p className="text-white/40">
              Henüz kayıtlı kişi bulunmuyor.
            </p>

            <Link
              href="/admin/kisiler/yeni"
              className="mt-6 inline-block border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white/60 transition hover:border-white/40 hover:text-white"
            >
              İlk Kişiyi Ekle
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {people.map((person) => (
              <div
                key={person.id}
                className="flex flex-col gap-6 border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20 md:flex-row md:items-center"
              >
                <div className="h-28 w-24 shrink-0 overflow-hidden bg-white/[0.04]">
                  {person.imageUrl ? (
                    <img
                      src={person.imageUrl}
                      alt={person.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-white/20">
                      FOTOĞRAF YOK
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[9px] uppercase tracking-[0.25em] text-[#a99f8b]">
                    {person.category || "Kategori yok"}
                  </div>

                  <h2 className="mt-2 text-2xl font-light text-white">
                    {person.name}
                  </h2>

                  <div className="mt-2 text-sm text-white/40">
                    {person.birth || "—"} — {person.death || "—"}
                  </div>

                  {person.shortBio && (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/35">
                      {person.shortBio}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/kisiler/${person.slug}`}
                    target="_blank"
                    className="border border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-white/50 transition hover:border-white/30 hover:text-white"
                  >
                    Görüntüle
                  </Link>

                  <Link
                    href={`/admin/kisiler/${person.id}/duzenle`}
                    className="border border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-white/50 transition hover:border-white/30 hover:text-white"
                  >
                    Düzenle
                  </Link>

                  <Link
                    href={`/admin/kisiler/${person.id}/sil`}
                    className="border border-red-500/20 px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-red-400/60 transition hover:border-red-500/50 hover:text-red-400"
                  >
                    Sil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}