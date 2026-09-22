"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onValue, ref, update } from "firebase/database";
import { database } from "@/lib/firebase";

type Photo = {
  imageUrl: string;
  caption: string;
  source: string;
};

type BiographySection = {
  title: string;
  content: string;
};

type Organization = {
  id: string;
  slug: string;
  name: string;
  startDate: string;
  endDate: string;
  region: string;
  shortBio: string;
  people: string[];
  photos: Photo[];
  biography: BiographySection[];
  sources: string[];
};

export default function EditOrganizationPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const organizationRef = ref(database, `organizations/${id}`);

    const unsubscribe = onValue(organizationRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setOrganization(null);
        setLoading(false);
        return;
      }

      setOrganization({
        ...data,
        people: Array.isArray(data.people) ? data.people : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        biography: Array.isArray(data.biography) ? data.biography : [],
        sources: Array.isArray(data.sources) ? data.sources : [],
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  function updateField(field: keyof Organization, value: any) {
    if (!organization) return;

    setOrganization({
      ...organization,
      [field]: value,
    });
  }

  function updateArrayItem(
    field: "people" | "sources",
    index: number,
    value: string
  ) {
    if (!organization) return;

    const updated = [...organization[field]];
    updated[index] = value;

    setOrganization({
      ...organization,
      [field]: updated,
    });
  }

  function addArrayItem(field: "people" | "sources") {
    if (!organization) return;

    setOrganization({
      ...organization,
      [field]: [...organization[field], ""],
    });
  }

  function removeArrayItem(field: "people" | "sources", index: number) {
    if (!organization) return;

    setOrganization({
      ...organization,
      [field]: organization[field].filter((_, i) => i !== index),
    });
  }

  function updateBiography(
    index: number,
    field: "title" | "content",
    value: string
  ) {
    if (!organization) return;

    const updated = [...organization.biography];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setOrganization({
      ...organization,
      biography: updated,
    });
  }

  function addBiography() {
    if (!organization) return;

    setOrganization({
      ...organization,
      biography: [
        ...organization.biography,
        {
          title: "",
          content: "",
        },
      ],
    });
  }

  function removeBiography(index: number) {
    if (!organization) return;

    setOrganization({
      ...organization,
      biography: organization.biography.filter((_, i) => i !== index),
    });
  }

  async function saveChanges() {
    if (!organization) return;

    setSaving(true);

    try {
      const cleanPeople = organization.people
        .map((item) => item.trim())
        .filter(Boolean);

      const cleanSources = organization.sources
        .map((item) => item.trim())
        .filter(Boolean);

      const cleanBiography = organization.biography
        .map((item) => ({
          title: item.title.trim(),
          content: item.content.trim(),
        }))
        .filter((item) => item.title || item.content);

      const cleanPhotos = organization.photos.map((photo) => ({
        imageUrl: photo.imageUrl || "",
        caption: photo.caption || "",
        source: photo.source || "",
      }));

      await update(ref(database, `organizations/${id}`), {
        name: organization.name.trim(),
        startDate: organization.startDate.trim(),
        endDate: organization.endDate.trim(),
        region: organization.region.trim(),
        shortBio: organization.shortBio.trim(),
        people: cleanPeople,
        photos: cleanPhotos,
        biography: cleanBiography,
        sources: cleanSources,
      });

      alert("Örgüt başarıyla güncellendi.");
      router.push("/admin/orgutler");
    } catch (error) {
      console.error(error);
      alert("Güncelleme sırasında bir hata oluştu.");
    } finally {
      setSaving(false);
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
        <h1 className="text-2xl font-bold">Örgüt bulunamadı.</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8] p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/admin/orgutler")}
          className="mb-8 text-sm text-gray-400 hover:text-white"
        >
          ← Örgütlere dön
        </button>

        <h1 className="mb-2 text-3xl font-bold">
          Örgütü Düzenle
        </h1>

        <p className="mb-8 text-gray-500">
          {organization.name}
        </p>

        <div className="space-y-8">

          {/* TEMEL BİLGİLER */}
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-6 text-xl font-semibold">
              Temel Bilgiler
            </h2>

            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Örgüt / Cemiyet adı
                </label>

                <input
                  value={organization.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Başlangıç tarihi
                  </label>

                  <input
                    value={organization.startDate}
                    onChange={(e) =>
                      updateField("startDate", e.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Bitiş tarihi
                  </label>

                  <input
                    value={organization.endDate}
                    onChange={(e) =>
                      updateField("endDate", e.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
                  />
                </div>

              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Bölge
                </label>

                <input
                  value={organization.region}
                  onChange={(e) =>
                    updateField("region", e.target.value)
                  }
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Kısa açıklama
                </label>

                <textarea
                  value={organization.shortBio}
                  onChange={(e) =>
                    updateField("shortBio", e.target.value)
                  }
                  rows={5}
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

            </div>
          </section>

          {/* KİŞİLER */}
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-6 text-xl font-semibold">
              İlişkili Kişiler
            </h2>

            <div className="space-y-3">
              {organization.people.map((person, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    value={person}
                    onChange={(e) =>
                      updateArrayItem(
                        "people",
                        index,
                        e.target.value
                      )
                    }
                    className="flex-1 rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                  />

                  <button
                    onClick={() =>
                      removeArrayItem("people", index)
                    }
                    className="rounded-lg border border-red-500/20 px-4 text-red-400 hover:bg-red-500/10"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addArrayItem("people")}
              className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
            >
              + Kişi ekle
            </button>
          </section>

          {/* FOTOĞRAFLAR */}
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-2 text-xl font-semibold">
              Fotoğraflar
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Fotoğraf ekleme işlemini daha sonra yapabilirsin.
              Mevcut fotoğrafların açıklama ve kaynaklarını buradan
              düzenleyebilirsin.
            </p>

            {organization.photos.length === 0 ? (
              <p className="text-sm text-gray-500">
                Henüz fotoğraf eklenmemiş.
              </p>
            ) : (
              <div className="space-y-6">
                {organization.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-white/10 p-4"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || organization.name}
                      className="mb-4 max-h-80 w-full rounded-lg object-contain"
                    />

                    <div className="space-y-4">

                      <div>
                        <label className="mb-2 block text-sm text-gray-400">
                          Fotoğraf açıklaması
                        </label>

                        <input
                          value={photo.caption}
                          onChange={(e) => {
                            const photos = [...organization.photos];

                            photos[index] = {
                              ...photos[index],
                              caption: e.target.value,
                            };

                            setOrganization({
                              ...organization,
                              photos,
                            });
                          }}
                          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-gray-400">
                          Fotoğraf kaynağı
                        </label>

                        <input
                          value={photo.source}
                          onChange={(e) => {
                            const photos = [...organization.photos];

                            photos[index] = {
                              ...photos[index],
                              source: e.target.value,
                            };

                            setOrganization({
                              ...organization,
                              photos,
                            });
                          }}
                          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                        />
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* BİYOGRAFİ / TARİHÇE */}
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-6 text-xl font-semibold">
              Tarihçe / İçerik
            </h2>

            <div className="space-y-6">

              {organization.biography.map((section, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Bölüm {index + 1}
                    </span>

                    <button
                      onClick={() => removeBiography(index)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Bölümü sil
                    </button>
                  </div>

                  <div className="space-y-4">

                    <input
                      value={section.title}
                      onChange={(e) =>
                        updateBiography(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Bölüm başlığı"
                      className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                    />

                    <textarea
                      value={section.content}
                      onChange={(e) =>
                        updateBiography(
                          index,
                          "content",
                          e.target.value
                        )
                      }
                      placeholder="Bölüm içeriği"
                      rows={8}
                      className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                    />

                  </div>
                </div>
              ))}

            </div>

            <button
              onClick={addBiography}
              className="mt-5 rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
            >
              + Bölüm ekle
            </button>
          </section>

          {/* KAYNAKLAR */}
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-6 text-xl font-semibold">
              Kaynaklar
            </h2>

            <div className="space-y-3">
              {organization.sources.map((source, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    value={source}
                    onChange={(e) =>
                      updateArrayItem(
                        "sources",
                        index,
                        e.target.value
                      )
                    }
                    className="flex-1 rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                  />

                  <button
                    onClick={() =>
                      removeArrayItem("sources", index)
                    }
                    className="rounded-lg border border-red-500/20 px-4 text-red-400 hover:bg-red-500/10"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addArrayItem("sources")}
              className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
            >
              + Kaynak ekle
            </button>
          </section>

          {/* KAYDET */}
          <div className="flex justify-end gap-3 pb-10">

            <button
              onClick={() => router.push("/admin/orgutler")}
              className="rounded-lg border border-white/10 px-6 py-3 hover:bg-white/5"
            >
              Vazgeç
            </button>

            <button
              onClick={saveChanges}
              disabled={saving}
              className="rounded-lg bg-white px-6 py-3 font-medium text-black hover:bg-gray-200 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>

          </div>

        </div>
      </div>
    </main>
  );
}