import Link from "next/link";
import { getParties } from "@/lib/parties";

export default async function AdminPartiesPage() {
  const parties = await getParties();

  return (
    <main className="min-h-screen bg-[#090c0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="text-sm text-[#d9ac57]">
          ← Yönetim Paneli
        </Link>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl">Partiler</h1>
            <p className="mt-3 text-sm text-white/50">
              {parties.length} kayıt
            </p>
          </div>

          <Link
            href="/admin/partiler/yeni"
            className="bg-[#d9ac57] px-6 py-4 font-medium text-black hover:bg-[#e8c27e]"
          >
            + Yeni Parti Ekle
          </Link>
        </div>

        <div className="mt-12 space-y-4">
          {parties.length === 0 ? (
            <div className="border border-white/10 p-12 text-center text-white/50">
              Henüz parti eklenmedi.
            </div>
          ) : (
            parties.map((party) => (
              <article
                key={party.id}
                className="border border-white/10 bg-white/[0.03] p-6"
              >
                <h2 className="text-2xl text-white">
                  {party.name}
                </h2>

                <p className="mt-2 text-sm text-white/50">
                  {party.startDate || "Tarih belirtilmedi"}
                  {party.region ? ` · ${party.region}` : ""}
                </p>

                {party.shortBio && (
                  <p className="mt-4 text-sm leading-7 text-white/60">
                    {party.shortBio}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                  <Link
                    href={`/partiler/${party.slug}`}
                    target="_blank"
                    className="border border-white/20 px-4 py-2 text-sm text-white/70"
                  >
                    Görüntüle
                  </Link>

                  <Link
                    href={`/admin/partiler/${party.id}/duzenle`}
                    className="border border-[#d9ac57]/40 px-4 py-2 text-sm text-[#d9ac57]"
                  >
                    Düzenle
                  </Link>

                  <Link
                    href={`/admin/partiler/${party.id}/sil`}
                    className="border border-red-500/30 px-4 py-2 text-sm text-red-400"
                  >
                    Sil
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
