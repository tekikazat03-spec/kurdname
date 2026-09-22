"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { get, ref, remove } from "firebase/database";
import { database } from "@/lib/firebase";

type Person = {
  name?: string;
  birth?: string;
  death?: string;
  imageUrl?: string;
};

export default function DeletePersonPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadPerson() {
      try {
        const snapshot = await get(ref(database, `people/${id}`));

        if (!snapshot.exists()) {
          alert("Kişi bulunamadı.");
          router.push("/admin/kisiler");
          return;
        }

        setPerson(snapshot.val());
      } catch (error) {
        console.error(error);
        alert("Kişi bilgileri alınamadı.");
        router.push("/admin/kisiler");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPerson();
    }
  }, [id, router]);

  async function handleDelete() {
    setDeleting(true);

    try {
      await remove(ref(database, `people/${id}`));

      alert("Kişi başarıyla silindi.");

      router.push("/admin/kisiler");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Kişi silinirken bir hata oluştu.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-white">
        <p className="text-sm text-white/40">
          Kişi yükleniyor...
        </p>
      </main>
    );
  }

  if (!person) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link
            href="/admin/kisiler"
            className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
          >
            ← Kişilere Dön
          </Link>

          <div className="text-xl font-semibold tracking-[0.2em] text-white">
            KURDNAME
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-xl px-6 pb-24 pt-20">
        <div className="border border-red-500/20 bg-red-500/[0.03] p-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-red-400/60">
            DİKKAT
          </div>

          <h1 className="mt-5 text-3xl font-light text-white">
            Kişiyi Sil
          </h1>

          <p className="mt-5 text-sm leading-7 text-white/50">
            Aşağıdaki kişi arşivden tamamen silinecek. Bu işlem geri
            alınamaz.
          </p>

          <div className="mt-8 flex gap-5 border-t border-white/10 pt-8">
            {person.imageUrl && (
              <img
                src={person.imageUrl}
                alt={person.name || ""}
                className="h-24 w-20 object-cover"
              />
            )}

            <div>
              <h2 className="text-xl text-white">
                {person.name}
              </h2>

              <p className="mt-2 text-sm text-white/30">
                {person.birth || "—"} — {person.death || "—"}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/kisiler"
              className="flex-1 border border-white/10 px-6 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/50 transition hover:border-white/30 hover:text-white"
            >
              Vazgeç
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-500/10 px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Siliniyor..." : "Evet, Kişiyi Sil"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}