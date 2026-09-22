import Link from "next/link";

type Photo = {
  imageUrl: string;
  caption?: string;
  source?: string;
};

type Rebellion = {
  id: string;
  slug: string;
  name: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  shortBio?: string;
  leaders?: string[];
  photos?: Photo[];
  createdAt?: string;
};

async function getRebellions(): Promise<Rebellion[]> {
  try {
    const response = await fetch(
      "https://kurdname-7ba60-default-rtdb.firebaseio.com/rebellions.json",
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

    return Object.entries(data)
      .map(([id, value]: [string, any]) => ({
        id,
        ...value,
      }))
      .sort((a, b) => {
        const dateA = a.createdAt || "";
        const dateB = b.createdAt || "";

        return dateB.localeCompare(dateA);
      });
  } catch {
    return [];
  }
}

export default async function AdminIsyanlarPage() {
  const rebellions = await getRebellions();

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      {/* Üst bar */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link
            href="/admin"
            className="text-sm text-white/50 transition hover:text-white"
          >
            ← Admin Panel
          </Link>

          <Link
            href="/admin/isyanlar/yeni"
            className="border border-white/20 px-5 py-3 text-sm transition hover:border-white/50 hover:bg-white hover:text-black"
          >
            + Yeni İsyan
          </Link>
        </div>
      </header>

      {/* Başlık */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-20">
        <div className="text-xs uppercase tracking-[0.35em] text-white/35">
          YÖNETİM
        </div>

        <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight">
              İsyanlar ve Hareketler
            </h1>

            <p className="mt-5 text-white/40">
              Arşivde bulunan isyan ve hareket kayıtlarını yönet.
            </p>
          </div>

          <div className="text-sm text-white/40">
            Toplam{" "}
            <span className="text-white">
              {rebellions.length}
            </span>{" "}
            kayıt
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        {rebellions.length === 0 ? (
          <div className="border border-white/10 bg-white/[0.02] p-10">
            <p className="text-white/40">
              Henüz kayıtlı bir isyan bulunmuyor.
            </p>

            <Link
              href="/admin/isyanlar/yeni"
              className="mt-6 inline-block border border-white/20 px-5 py-3 text-sm transition hover:bg-white hover:text-black"
            >
              İlk İsyanı Ekle
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {rebellions.map((rebellion) => {
              const firstPhoto =
                rebellion.photos && rebellion.photos.length > 0
                  ? rebellion.photos[0]?.imageUrl
                  : null;

              return (
                <article
                  key={rebellion.id}
                  className="border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20"
                >
                  <div className="flex flex-col gap-6 md:flex-row">
                    {/* Fotoğraf */}
                    <div className="h-48 w-full shrink-0 overflow-hidden bg-white/5 md:w-72">
                      {firstPhoto ? (
                        <img
                          src={firstPhoto}
                          alt={rebellion.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-white/30">
                          Fotoğraf yok
                        </div>
                      )}
                    </div>

                    {/* Bilgiler */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/30">
                        {rebellion.region || "Bölge belirtilmemiş"}
                      </div>

                      <h2 className="mt-2 text-2xl font-medium">
                        {rebellion.name}
                      </h2>

                      <div className="mt-3 text-sm text-white/40">
                        {rebellion.startDate || "—"}
                        {" — "}
                        {rebellion.endDate || "—"}
                      </div>

                      {rebellion.shortBio && (
                        <p className="mt-4 line-clamp-2 max-w-3xl text-sm leading-6 text-white/45">
                          {rebellion.shortBio}
                        </p>
                      )}

                      <div className="mt-auto flex flex-wrap gap-3 pt-6">
                        <Link
                          href={`/isyanlar/${rebellion.slug}`}
                          target="_blank"
                          className="border border-white/15 px-4 py-2 text-sm text-white/60 transition hover:border-white/40 hover:text-white"
                        >
                          Görüntüle
                        </Link>

                        <Link
                          href={`/admin/isyanlar/${rebellion.id}/duzenle`}
                          className="border border-white/15 px-4 py-2 text-sm text-white/60 transition hover:border-white/40 hover:text-white"
                        >
                          Düzenle
                        </Link>

                        <Link
                          href={`/admin/isyanlar/${rebellion.id}/sil`}
                          className="border border-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:border-red-500/50 hover:bg-red-500/10"
                        >
                          Sil
                        </Link>
                      </div>
                    </div>

                    {/* Fotoğraf sayısı */}
                    <div className="self-start text-xs text-white/30">
                      {rebellion.photos?.length || 0} fotoğraf
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}