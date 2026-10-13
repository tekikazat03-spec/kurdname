"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { get, ref, remove } from "firebase/database";
import { database } from "@/lib/firebase";

export default function DeletePartyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snapshot = await get(ref(database, `parties/${id}`));

        if (!snapshot.exists()) {
          router.replace("/admin/partiler");
          return;
        }

        setName(snapshot.val().name || "İsimsiz parti");
      } catch (error) {
        console.error(error);
        alert("Kayıt yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id, router]);

  async function handleDelete() {
    if (!window.confirm(`${name} kaydı kalıcı olarak silinsin mi?`)) {
      return;
    }

    setDeleting(true);

    try {
      await remove(ref(database, `parties/${id}`));

      alert("Parti kaydı silindi.");
      router.push("/admin/partiler");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Parti silinemedi.");
      setDeleting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090c0a] px-6 text-white">
      <div className="w-full max-w-xl border border-red-500/30 p-10">
        <Link href="/admin/partiler" className="text-[#d9ac57]">
          ← Partilere Dön
        </Link>

        <h1 className="mt-10 text-3xl">Partiyi Sil</h1>

        {loading ? (
          <p className="mt-6 text-white/50">Kayıt yükleniyor...</p>
        ) : (
          <>
            <p className="mt-6 text-lg text-white/80">
              {name}
            </p>

            <p className="mt-5 text-sm leading-7 text-red-300">
              Bu parti kaydı ve ona bağlı tarihçe bilgileri
              Firebase veritabanından kalıcı olarak silinecek.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/admin/partiler"
                className="border border-white/20 px-6 py-4"
              >
                Vazgeç
              </Link>

              <button
                onClick={handleDelete}
                disabled={deleting || !name}
                className="bg-red-700 px-6 py-4 disabled:opacity-50"
              >
                {deleting ? "Siliniyor..." : "Evet, Partiyi Sil"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
