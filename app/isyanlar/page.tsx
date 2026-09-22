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

    return Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value,
    }));
  } catch {
    return [];
  }
}

export default async function IsyanlarPage() {
  const rebellions = await getRebellions();

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      {/* Üst bar */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6">
          <Link
            href="/"
            className="text-sm text-white/50 transition hover:text-white"
          >
            ← KURDNAME
          </Link>
        </div>
      </header>

      {/* Başlık */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-24">
        <div className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">
          KATEGORİ
        </div>

        <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
          Serhildan û Tevger
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-white/50">
          Arşiva serhildan, tevger û bûyerên siyasî di dîroka Kurdistanê de.
        </p>
      </section>

      {/* İçerik */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        {rebellions.length === 0 ? (
          <div className="border border-white/10 bg-white/[0.02] p-10 text-white/40">
            Ji bo vê kategoriyê hîn tomar nehatine zêdekirin.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rebellions.map((rebellion) => {
              const firstPhoto =
                rebellion.photos && rebellion.photos.length > 0
                  ? rebellion.photos[0]?.imageUrl
                  : null;

              return (
                <Link
                  key={rebellion.id}
                  href={`/isyanlar/${rebellion.slug}`}
                  className="group block overflow-hidden border border-white/10 bg-white/[0.02] transition duration-300 hover:border-white/25 hover:bg-white/[0.04]"
                >
                  {/* Fotoğraf */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                    {firstPhoto ? (
                      <img
                        src={firstPhoto}
                        alt={rebellion.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/30">
                        Fotoğraf yok
                      </div>
                    )}

                    {/* Fotoğraf sayısı */}
                    {rebellion.photos &&
                      rebellion.photos.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/75 px-3 py-1 text-xs text-white/80 backdrop-blur">
                          {rebellion.photos.length} fotoğraf
                        </div>
                      )}
                  </div>

                  {/* Bilgiler */}
                  <div className="p-6">
                    <div className="mb-3 text-xs uppercase tracking-[0.2em] text-white/35">
                      {rebellion.region || "Kurdistan"}
                    </div>

                    <h2 className="text-2xl font-medium transition group-hover:text-white">
                      {rebellion.name}
                    </h2>

                    {(rebellion.startDate || rebellion.endDate) && (
                      <div className="mt-3 text-sm text-white/40">
                        {rebellion.startDate || "—"}
                        {" — "}
                        {rebellion.endDate || "—"}
                      </div>
                    )}

                    {rebellion.shortBio && (
                      <p className="mt-5 line-clamp-4 text-sm leading-7 text-white/50">
                        {rebellion.shortBio}
                      </p>
                    )}

                    <div className="mt-6 text-sm text-white/60 transition group-hover:text-white">
                      Dîtina hûrgilî → 
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}