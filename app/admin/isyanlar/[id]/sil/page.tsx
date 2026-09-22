"use client";

import { useEffect, useState } from "react";
import { get, ref, remove } from "firebase/database";
import { database } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function SilIsyanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const resolvedParams = await params;
      setId(resolvedParams.id);

      try {
        const snapshot = await get(
          ref(database, `rebellions/${resolvedParams.id}`)
        );

        if (!snapshot.exists()) {
          setMessage("İsyan bulunamadı.");
          setLoading(false);
          return;
        }

        const data = snapshot.val();
        setName(data.name || "İsimsiz isyan");
      } catch (error) {
        console.error(error);
        setMessage("Kayıt yüklenirken hata oluştu.");
      }

      setLoading(false);
    }

    load();
  }, [params]);

  async function deleteRebellion() {
    if (!id) return;

    const confirmed = window.confirm(
      `"${name}" kaydını silmek istediğine emin misin?\n\nBu işlem geri alınamaz.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage("");

    try {
      await remove(ref(database, `rebellions/${id}`));

      setMessage("İsyan başarıyla silindi.");

      setTimeout(() => {
        router.push("/admin/isyanlar");
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("Silme sırasında hata oluştu.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-white/50">
        Yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <button
            onClick={() => router.push("/admin/isyanlar")}
            className="text-sm text-white/50 transition hover:text-white"
          >
            ← İsyanlar
          </button>
        </div>
      </header>

      <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-20">
        <div className="w-full border border-red-500/20 bg-red-500/[0.03] p-8 md:p-12">
          <div className="text-xs uppercase tracking-[0.3em] text-red-400/60">
            KAYIT SİLME
          </div>

          <h1 className="mt-5 text-4xl font-semibold">
            {name}
          </h1>

          <p className="mt-6 leading-7 text-white/50">
            Bu isyan kaydı ve Firebase üzerindeki bütün bilgileri
            silinecek.
          </p>

          <p className="mt-3 text-sm text-red-400/70">
            Bu işlem geri alınamaz.
          </p>

          {message && (
            <div className="mt-8 border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
              {message}
            </div>
          )}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => router.push("/admin/isyanlar")}
              disabled={deleting}
              className="border border-white/15 px-6 py-4 text-sm text-white/60 transition hover:border-white/40 hover:text-white disabled:opacity-50"
            >
              Vazgeç
            </button>

            <button
              onClick={deleteRebellion}
              disabled={deleting}
              className="bg-red-600 px-6 py-4 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "SİLİNİYOR..." : "İSYANI SİL"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}