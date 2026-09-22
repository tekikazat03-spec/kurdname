"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onValue, ref, remove } from "firebase/database";
import { database } from "@/lib/firebase";

type Organization = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  shortBio?: string;
  people?: string[];
  photos?: {
    imageUrl: string;
    caption: string;
    source: string;
  }[];
};

export default function DeleteOrganizationPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const organizationRef = ref(
      database,
      `organizations/${id}`
    );

    const unsubscribe = onValue(
      organizationRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setOrganization(null);
        } else {
          setOrganization({
            ...data,
            id,
          });
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  async function deleteOrganization() {
    if (!organization) return;

    const confirmed = window.confirm(
      `"${organization.name}" adlı örgütü silmek istediğine emin misin? Bu işlem geri alınamaz.`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await remove(
        ref(database, `organizations/${id}`)
      );

      alert("Örgüt başarıyla silindi.");

      router.push("/admin/orgutler");
    } catch (error) {
      console.error(error);

      alert(
        "Örgüt silinirken bir hata oluştu."
      );

      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8] p-8">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  if (!organization) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8] p-8">
        <div className="mx-auto max-w-3xl">

          <button
            onClick={() =>
              router.push("/admin/orgutler")
            }
            className="mb-8 text-sm text-gray-400 hover:text-white"
          >
            ← Örgütlere dön
          </button>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8">
            <h1 className="text-2xl font-bold">
              Örgüt bulunamadı
            </h1>

            <p className="mt-2 text-gray-500">
              Bu kayıt Firebase veritabanında bulunamadı.
            </p>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8] p-6 md:p-10">
      <div className="mx-auto max-w-3xl">

        <button
          onClick={() =>
            router.push("/admin/orgutler")
          }
          className="mb-8 text-sm text-gray-400 hover:text-white"
        >
          ← Örgütlere dön
        </button>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-8">

          <div className="mb-8">

            <div className="mb-3 text-sm uppercase tracking-widest text-red-400">
              Dikkat
            </div>

            <h1 className="text-3xl font-bold">
              Örgütü Sil
            </h1>

            <p className="mt-3 leading-7 text-gray-400">
              Aşağıdaki örgütü silmek üzeresin.
              Bu işlem Firebase veritabanındaki kaydı
              tamamen kaldıracaktır.
            </p>

          </div>

          <div className="mb-8 rounded-xl border border-white/10 bg-black/30 p-6">

            <h2 className="text-2xl font-semibold">
              {organization.name}
            </h2>

            {organization.startDate && (
              <p className="mt-3 text-sm text-gray-500">
                {organization.startDate}
                {organization.endDate
                  ? ` — ${organization.endDate}`
                  : ""}
              </p>
            )}

            {organization.region && (
              <p className="mt-2 text-sm text-gray-500">
                {organization.region}
              </p>
            )}

            {organization.shortBio && (
              <p className="mt-5 leading-7 text-gray-400">
                {organization.shortBio}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-500">

              {organization.people &&
                organization.people.length > 0 && (
                  <span className="rounded-full border border-white/10 px-3 py-1">
                    {organization.people.length} kişi
                  </span>
                )}

              {organization.photos &&
                organization.photos.length > 0 && (
                  <span className="rounded-full border border-white/10 px-3 py-1">
                    {organization.photos.length} fotoğraf
                  </span>
                )}

            </div>

          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

            <button
              onClick={() =>
                router.push("/admin/orgutler")
              }
              disabled={deleting}
              className="rounded-lg border border-white/10 px-6 py-3 hover:bg-white/5 disabled:opacity-50"
            >
              Vazgeç
            </button>

            <button
              onClick={deleteOrganization}
              disabled={deleting}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-6 py-3 font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
            >
              {deleting
                ? "Siliniyor..."
                : "Örgütü Sil"}
            </button>

          </div>

        </div>
      </div>
    </main>
  );
}