"use client";

import { useEffect, useState } from "react";
import { onValue, ref, remove } from "firebase/database";
import { database } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";

export default function SilKatliamPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const massacreRef = ref(
      database,
      `massacres/${id}`
    );

    const unsubscribe = onValue(
      massacreRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          router.push("/admin/katliamlar");
          return;
        }

        setName(data.name || "Bu kayıt");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, router]);

  async function handleDelete() {
    const confirmed = window.confirm(
      `"${name}" kaydını silmek istediğine emin misin?\n\nBu işlem geri alınamaz.`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const massacreRef = ref(
        database,
        `massacres/${id}`
      );

      await remove(massacreRef);

      alert("Katliam kaydı silindi.");

      router.push("/admin/katliamlar");
    } catch (error) {
      console.error(error);

      alert(
        "Silme sırasında bir hata oluştu."
      );

      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] p-10 text-[#e8e3d8]">
        <p className="text-white/50">
          Kayıt yükleniyor...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-6 text-[#e8e3d8]">
      <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-white/[0.03] p-8 text-center">

        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 text-2xl text-red-400">
          !
        </div>

        <h1 className="text-2xl font-semibold">
          Katliam Kaydını Sil
        </h1>

        <p className="mt-4 leading-7 text-white/50">
          Aşağıdaki kayıt kalıcı olarak silinecek:
        </p>

        <p className="mt-4 text-lg font-medium text-white">
          {name}
        </p>

        <p className="mt-4 text-sm text-red-400/80">
          Bu işlem geri alınamaz.
        </p>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() =>
              router.push("/admin/katliamlar")
            }
            disabled={deleting}
            className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm text-white/70 hover:bg-white/10"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {deleting
              ? "Siliniyor..."
              : "Kalıcı Olarak Sil"}
          </button>
        </div>

      </div>
    </main>
  );
}