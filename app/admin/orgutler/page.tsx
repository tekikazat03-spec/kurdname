"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase";

type Organization = {
  id: string;
  slug: string;
  name: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  shortBio?: string;
  people?: string[];
  photos?: {
    imageUrl: string;
    caption?: string;
    source?: string;
  }[];
};

export default function AdminOrgutlerPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const organizationsRef = ref(database, "organizations");

    const unsubscribe = onValue(
      organizationsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setOrganizations([]);
          setLoading(false);
          return;
        }

        const list: Organization[] = Object.entries(data).map(
          ([id, value]: [string, any]) => ({
            id,
            ...value,
          })
        );

        list.sort((a, b) => {
          const dateA = a.startDate || "";
          const dateB = b.startDate || "";

          return dateB.localeCompare(dateA);
        });

        setOrganizations(list);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 py-12 text-[#e8e3d8]">
      <div className="mx-auto max-w-7xl">

        {/* ÜST */}
        <div className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">

          <div>
            <Link
              href="/admin"
              className="mb-4 inline-block text-sm text-white/40 transition hover:text-white"
            >
              ← Admin Paneli
            </Link>

            <h1 className="text-4xl font-semibold tracking-tight">
              Örgütler ve Cemiyetler
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
              Arşivde bulunan Kürt örgütleri ve cemiyetlerini buradan
              yönetebilirsin.
            </p>
          </div>

          <Link
            href="/admin/orgutler/yeni"
            className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
          >
            + Yeni Örgüt Ekle
          </Link>

        </div>

        {/* YÜKLENİYOR */}
        {loading && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
            Örgütler yükleniyor...
          </div>
        )}

        {/* BOŞ */}
        {!loading && organizations.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">

            <p className="text-lg text-white/60">
              Henüz örgüt veya cemiyet kaydı bulunmuyor.
            </p>

            <Link
              href="/admin/orgutler/yeni"
              className="mt-5 inline-block text-sm text-white underline underline-offset-4"
            >
              İlk kaydı ekle
            </Link>

          </div>
        )}

        {/* KARTLAR */}
        {!loading && organizations.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {organizations.map((organization) => {
              const firstPhoto =
                organization.photos?.[0]?.imageUrl;

              return (
                <article
                  key={organization.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                >

                  {/* FOTOĞRAF */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-black">

                    {firstPhoto ? (
                      <img
                        src={firstPhoto}
                        alt={organization.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/30">
                        Fotoğraf yok
                      </div>
                    )}

                  </div>

                  {/* BİLGİ */}
                  <div className="p-5">

                    <h2 className="text-xl font-medium">
                      {organization.name}
                    </h2>

                    {organization.startDate && (
                      <p className="mt-2 text-sm text-white/50">
                        {organization.startDate}
                        {organization.endDate
                          ? ` — ${organization.endDate}`
                          : ""}
                      </p>
                    )}

                    {organization.region && (
                      <p className="mt-1 text-sm text-white/40">
                        {organization.region}
                      </p>
                    )}

                    {organization.shortBio && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/50">
                        {organization.shortBio}
                      </p>
                    )}

                    {/* İSTATİSTİKLER */}
                    <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/40">

                      {organization.photos && (
                        <span className="rounded-full border border-white/10 px-3 py-1">
                          {organization.photos.length} fotoğraf
                        </span>
                      )}

                      {organization.people && (
                        <span className="rounded-full border border-white/10 px-3 py-1">
                          {organization.people.length} kişi
                        </span>
                      )}

                    </div>

                    {/* BUTONLAR */}
                    <div className="mt-6 flex gap-2">

                      <Link
                        href={`/orgutler/${organization.slug}`}
                        target="_blank"
                        className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-center text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        Görüntüle
                      </Link>

                      <Link
                        href={`/admin/orgutler/${organization.id}/duzenle`}
                        className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-center text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        Düzenle
                      </Link>

                      <Link
                        href={`/admin/orgutler/${organization.id}/sil`}
                        className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                      >
                        Sil
                      </Link>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}