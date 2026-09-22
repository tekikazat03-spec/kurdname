"use client";

import { useState } from "react";
import { push, ref, set } from "firebase/database";
import { database } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type Photo = {
  imageUrl: string;
  caption: string;
  source: string;
};

type BiographySection = {
  title: string;
  content: string;
};

function createSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function YeniOrgutPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [region, setRegion] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [people, setPeople] = useState("");

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [biography, setBiography] = useState<BiographySection[]>([]);
  const [sources, setSources] = useState<string[]>([""]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function uploadImage(file: File) {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary ayarları bulunamadı."
      );
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(
        "Fotoğraf yüklenemedi."
      );
    }

    const data = await response.json();

    return data.secure_url as string;
  }

  async function handlePhotoUpload(
    index: number,
    file: File
  ) {
    try {
      setUploading(true);

      const imageUrl = await uploadImage(file);

      setPhotos((current) =>
        current.map((photo, i) =>
          i === index
            ? {
                ...photo,
                imageUrl,
              }
            : photo
        )
      );
    } catch (error) {
      console.error(error);
      alert("Fotoğraf yüklenirken hata oluştu.");
    } finally {
      setUploading(false);
    }
  }

  function updatePhoto(
    index: number,
    field: keyof Photo,
    value: string
  ) {
    setPhotos((current) =>
      current.map((photo, i) =>
        i === index
          ? {
              ...photo,
              [field]: value,
            }
          : photo
      )
    );
  }

  function updateBiography(
    index: number,
    field: keyof BiographySection,
    value: string
  ) {
    setBiography((current) =>
      current.map((section, i) =>
        i === index
          ? {
              ...section,
              [field]: value,
            }
          : section
      )
    );
  }

  async function handleSave(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Örgüt adını gir.");
      return;
    }

    setSaving(true);

    try {
      const newRef = push(
        ref(database, "organizations")
      );

      const cleanPeople = people
        .split(",")
        .map((person) => person.trim())
        .filter(Boolean);

      const cleanPhotos = photos
        .filter((photo) => photo.imageUrl.trim())
        .map((photo) => ({
          imageUrl: photo.imageUrl.trim(),
          caption: photo.caption.trim(),
          source: photo.source.trim(),
        }));

      const cleanBiography = biography
        .filter(
          (section) =>
            section.title.trim() ||
            section.content.trim()
        )
        .map((section) => ({
          title: section.title.trim(),
          content: section.content.trim(),
        }));

      const cleanSources = sources
        .map((source) => source.trim())
        .filter(Boolean);

      await set(newRef, {
        id: newRef.key,
        slug: createSlug(name),
        name: name.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        region: region.trim(),
        shortBio: shortBio.trim(),
        people: cleanPeople,
        photos: cleanPhotos,
        biography: cleanBiography,
        sources: cleanSources,
        createdAt: Date.now(),
      });

      alert("Örgüt kaydı başarıyla oluşturuldu.");

      router.push("/admin/orgutler");
    } catch (error) {
      console.error(error);

      alert(
        "Kayıt sırasında bir hata oluştu."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 py-12 text-[#e8e3d8]">
      <div className="mx-auto max-w-4xl">

        <button
          type="button"
          onClick={() =>
            router.push("/admin/orgutler")
          }
          className="mb-6 text-sm text-white/40 hover:text-white"
        >
          ← Örgütler ve Cemiyetler
        </button>

        <h1 className="text-4xl font-semibold">
          Yeni Örgüt / Cemiyet Ekle
        </h1>

        <p className="mt-3 text-sm text-white/40">
          Arşive yeni bir örgüt veya cemiyet kaydı ekle.
        </p>

        <form
          onSubmit={handleSave}
          className="mt-10 space-y-8"
        >

          {/* TEMEL BİLGİLER */}
          <section className="space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-6">

            <h2 className="text-xl font-medium">
              Temel Bilgiler
            </h2>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Örgüt / cemiyet adı"
              required
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
            />

            <div className="grid gap-4 md:grid-cols-2">

              <input
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                placeholder="Kuruluş tarihi"
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
              />

              <input
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                placeholder="Kapanış / sona eriş tarihi"
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
              />

            </div>

            <input
              value={region}
              onChange={(e) =>
                setRegion(e.target.value)
              }
              placeholder="Merkez / faaliyet bölgesi"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
            />

            <textarea
              value={shortBio}
              onChange={(e) =>
                setShortBio(e.target.value)
              }
              placeholder="Kısa açıklama"
              rows={6}
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
            />

            <input
              value={people}
              onChange={(e) =>
                setPeople(e.target.value)
              }
              placeholder="Önemli kişiler: Seyid Abdülkadir, ... "
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
            />

            <p className="text-xs text-white/30">
              Birden fazla kişiyi virgülle ayır.
            </p>

          </section>

          {/* FOTOĞRAFLAR */}
          <section className="space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">
                Fotoğraflar
              </h2>

              <button
                type="button"
                onClick={() =>
                  setPhotos([
                    ...photos,
                    {
                      imageUrl: "",
                      caption: "",
                      source: "",
                    },
                  ])
                }
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
              >
                + Fotoğraf
              </button>
            </div>

            {photos.map((photo, index) => (
              <div
                key={index}
                className="space-y-4 rounded-lg border border-white/10 p-4"
              >

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">
                    Fotoğraf {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPhotos(
                        photos.filter(
                          (_, i) => i !== index
                        )
                      )
                    }
                    className="text-sm text-red-400"
                  >
                    Kaldır
                  </button>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (file) {
                      handlePhotoUpload(
                        index,
                        file
                      );
                    }
                  }}
                  className="block w-full text-sm text-white/50"
                />

                {photo.imageUrl && (
                  <img
                    src={photo.imageUrl}
                    alt=""
                    className="max-h-64 rounded-lg object-contain"
                  />
                )}

                <input
                  value={photo.caption}
                  onChange={(e) =>
                    updatePhoto(
                      index,
                      "caption",
                      e.target.value
                    )
                  }
                  placeholder="Fotoğraf açıklaması"
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                />

                <input
                  value={photo.source}
                  onChange={(e) =>
                    updatePhoto(
                      index,
                      "source",
                      e.target.value
                    )
                  }
                  placeholder="Fotoğraf kaynağı"
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                />

              </div>
            ))}

          </section>

          {/* TARİHÇE */}
          <section className="space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-medium">
                Tarihçe
              </h2>

              <button
                type="button"
                onClick={() =>
                  setBiography([
                    ...biography,
                    {
                      title: "",
                      content: "",
                    },
                  ])
                }
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
              >
                + Bölüm
              </button>

            </div>

            {biography.map((section, index) => (
              <div
                key={index}
                className="space-y-4 rounded-lg border border-white/10 p-4"
              >

                <div className="flex justify-between">
                  <span className="text-sm text-white/40">
                    Bölüm {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setBiography(
                        biography.filter(
                          (_, i) => i !== index
                        )
                      )
                    }
                    className="text-sm text-red-400"
                  >
                    Kaldır
                  </button>
                </div>

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
            ))}

          </section>

          {/* KAYNAKLAR */}
          <section className="space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-medium">
                Kaynaklar
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSources([
                    ...sources,
                    "",
                  ])
                }
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
              >
                + Kaynak
              </button>

            </div>

            {sources.map((source, index) => (
              <div
                key={index}
                className="flex gap-2"
              >

                <input
                  value={source}
                  onChange={(e) =>
                    setSources(
                      sources.map(
                        (item, i) =>
                          i === index
                            ? e.target.value
                            : item
                      )
                    )
                  }
                  placeholder={`Kaynak ${index + 1}`}
                  className="flex-1 rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setSources(
                      sources.filter(
                        (_, i) => i !== index
                      )
                    )
                  }
                  className="rounded-lg border border-red-500/20 px-4 text-red-400"
                >
                  ×
                </button>

              </div>
            ))}

          </section>

          {/* KAYDET */}
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full rounded-lg bg-white px-5 py-4 font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {saving
              ? "Kaydediliyor..."
              : "Örgütü Kaydet"}
          </button>

        </form>

      </div>
    </main>
  );
}