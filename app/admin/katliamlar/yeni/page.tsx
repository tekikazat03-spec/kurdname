"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { get, push, ref } from "firebase/database";
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

function createSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewMassacrePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [region, setRegion] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [people, setPeople] = useState("");

  const [photos, setPhotos] = useState<Photo[]>([]);

  const [biography, setBiography] = useState<
    BiographySection[]
  >([
    {
      title: "",
      content: "",
    },
  ]);

  const [sources, setSources] = useState<string[]>([""]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function addPhoto() {
    setPhotos([
      ...photos,
      {
        imageUrl: "",
        caption: "",
        source: "",
      },
    ]);
  }

  function removePhoto(index: number) {
    setPhotos(
      photos.filter((_, photoIndex) => photoIndex !== index)
    );
  }

  function updatePhoto(
    index: number,
    field: keyof Photo,
    value: string
  ) {
    const updated = [...photos];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setPhotos(updated);
  }

  function addBiographySection() {
    setBiography([
      ...biography,
      {
        title: "",
        content: "",
      },
    ]);
  }

  function removeBiographySection(index: number) {
    setBiography(
      biography.filter(
        (_, sectionIndex) => sectionIndex !== index
      )
    );
  }

  function updateBiography(
    index: number,
    field: keyof BiographySection,
    value: string
  ) {
    const updated = [...biography];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setBiography(updated);
  }

  function addSource() {
    setSources([...sources, ""]);
  }

  function removeSource(index: number) {
    setSources(
      sources.filter((_, sourceIndex) => sourceIndex !== index)
    );
  }

  function updateSource(index: number, value: string) {
    const updated = [...sources];

    updated[index] = value;

    setSources(updated);
  }

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
        "Fotoğraf Cloudinary'ye yüklenemedi."
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

      updatePhoto(index, "imageUrl", imageUrl);

      alert("Fotoğraf başarıyla yüklendi.");
    } catch (error) {
      console.error(error);

      alert(
        "Fotoğraf yüklenirken bir hata oluştu."
      );
    } finally {
      setUploading(false);
    }
  }

  async function saveMassacre() {
    if (!name.trim()) {
      alert("Katliam / olay adı gerekli.");
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const massacreRef = push(
        ref(database, "massacres")
      );

      const cleanPeople = people
        .split(",")
        .map((person) => person.trim())
        .filter(Boolean);

      const cleanPhotos: Photo[] = photos
        .filter((photo) => photo.imageUrl.trim())
        .map((photo) => ({
          imageUrl: photo.imageUrl.trim(),
          caption: photo.caption.trim(),
          source: photo.source.trim(),
        }));

      const cleanBiography: BiographySection[] =
        biography
          .map((section) => ({
            title: section.title.trim(),
            content: section.content.trim(),
          }))
          .filter(
            (section) =>
              section.title || section.content
          );

      const cleanSources = sources
        .map((source) => source.trim())
        .filter(Boolean);

      const massacreData = {
        id: massacreRef.key,
        slug: createSlug(name),

        name: name.trim(),
        date: date.trim(),
        region: region.trim(),
        shortBio: shortBio.trim(),

        people: cleanPeople,

        photos: cleanPhotos,

        biography: cleanBiography,

        sources: cleanSources,

        createdAt: Date.now(),
      };

      if (!massacreRef.key) {
        throw new Error(
          "Firebase kayıt anahtarı oluşturulamadı."
        );
      }

      await import("firebase/database").then(
        async ({ set }) => {
          await set(massacreRef, massacreData);
        }
      );

      alert(
        "Katliam / olay başarıyla kaydedildi."
      );

      router.push("/admin/katliamlar");
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
    <main className="min-h-screen bg-[#0b0b0b] px-6 py-10 text-[#e8e3d8]">
      <div className="mx-auto max-w-5xl">

        <button
          onClick={() =>
            router.push("/admin/katliamlar")
          }
          className="mb-8 text-sm text-gray-400 hover:text-white"
        >
          ← Katliamlar ve kıyımlara dön
        </button>

        <h1 className="text-3xl font-bold">
          Yeni Katliam / Olay Ekle
        </h1>

        <p className="mt-2 text-gray-500">
          Arşive yeni bir kayıt ekle.
        </p>

        <div className="mt-10 space-y-8">

          {/* TEMEL BİLGİLER */}

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">

            <h2 className="mb-6 text-xl font-semibold">
              Temel Bilgiler
            </h2>

            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Katliam / olay adı
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Örn. Dersim 1937–1938"
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Tarih
                  </label>

                  <input
                    value={date}
                    onChange={(e) =>
                      setDate(e.target.value)
                    }
                    placeholder="Örn. 1937–1938"
                    className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Bölge
                  </label>

                  <input
                    value={region}
                    onChange={(e) =>
                      setRegion(e.target.value)
                    }
                    placeholder="Örn. Dersim"
                    className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
                  />
                </div>

              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Kısa açıklama
                </label>

                <textarea
                  value={shortBio}
                  onChange={(e) =>
                    setShortBio(e.target.value)
                  }
                  rows={6}
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  İlgili kişiler
                </label>

                <input
                  value={people}
                  onChange={(e) =>
                    setPeople(e.target.value)
                  }
                  placeholder="Seyit Rıza, Alişer, Nuri Dersimi"
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
                />

                <p className="mt-2 text-xs text-gray-600">
                  İsimleri virgülle ayır.
                </p>
              </div>

            </div>
          </section>

          {/* FOTOĞRAFLAR */}

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold">
                  Fotoğraflar
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Her fotoğraf için açıklama ve kaynak
                  ekleyebilirsin.
                </p>
              </div>

              <button
                type="button"
                onClick={addPhoto}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
              >
                + Fotoğraf ekle
              </button>

            </div>

            <div className="mt-6 space-y-6">

              {photos.length === 0 && (
                <p className="text-sm text-gray-600">
                  Henüz fotoğraf eklenmedi.
                </p>
              )}

              {photos.map((photo, index) => (

                <div
                  key={index}
                  className="rounded-lg border border-white/10 p-5"
                >

                  <div className="mb-5 flex items-center justify-between">

                    <span className="text-sm text-gray-500">
                      Fotoğraf {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removePhoto(index)
                      }
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Fotoğrafı kaldır
                    </button>

                  </div>

                  <div className="space-y-4">

                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => {

                        const file =
                          e.target.files?.[0];

                        if (!file) return;

                        handlePhotoUpload(
                          index,
                          file
                        );
                      }}
                      className="block w-full text-sm text-gray-400"
                    />

                    {photo.imageUrl && (
                      <img
                        src={photo.imageUrl}
                        alt={
                          photo.caption ||
                          `Fotoğraf ${index + 1}`
                        }
                        className="max-h-80 w-full rounded-lg object-contain"
                      />
                    )}

                    <div>
                      <label className="mb-2 block text-sm text-gray-400">
                        Fotoğraf açıklaması
                      </label>

                      <input
                        value={photo.caption}
                        onChange={(e) =>
                          updatePhoto(
                            index,
                            "caption",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-400">
                        Fotoğraf kaynağı
                      </label>

                      <input
                        value={photo.source}
                        onChange={(e) =>
                          updatePhoto(
                            index,
                            "source",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                      />
                    </div>

                  </div>

                </div>

              ))}

            </div>
          </section>

          {/* TARİHÇE */}

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold">
                  Tarihçe / İçerik
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Tarihçeyi bölümlere ayırabilirsin.
                </p>
              </div>

              <button
                type="button"
                onClick={addBiographySection}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
              >
                + Bölüm ekle
              </button>

            </div>

            <div className="mt-6 space-y-6">

              {biography.map(
                (section, index) => (

                  <div
                    key={index}
                    className="rounded-lg border border-white/10 p-5"
                  >

                    <div className="mb-4 flex items-center justify-between">

                      <span className="text-sm text-gray-500">
                        Bölüm {index + 1}
                      </span>

                      {biography.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeBiographySection(
                              index
                            )
                          }
                          className="text-sm text-red-400"
                        >
                          Bölümü sil
                        </button>
                      )}

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
                        rows={10}
                        className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                      />

                    </div>

                  </div>

                )
              )}

            </div>
          </section>

          {/* KAYNAKLAR */}

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold">
                  Kaynaklar
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Kullandığın kaynakları ekle.
                </p>
              </div>

              <button
                type="button"
                onClick={addSource}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
              >
                + Kaynak ekle
              </button>

            </div>

            <div className="mt-6 space-y-3">

              {sources.map(
                (source, index) => (

                  <div
                    key={index}
                    className="flex gap-3"
                  >

                    <input
                      value={source}
                      onChange={(e) =>
                        updateSource(
                          index,
                          e.target.value
                        )
                      }
                      placeholder="Kaynak"
                      className="flex-1 rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                    />

                    {sources.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeSource(index)
                        }
                        className="rounded-lg border border-red-500/20 px-4 text-red-400 hover:bg-red-500/10"
                      >
                        Sil
                      </button>
                    )}

                  </div>

                )
              )}

            </div>
          </section>

          {/* KAYDET */}

          <div className="flex justify-end gap-3 pb-10">

            <button
              type="button"
              onClick={() =>
                router.push("/admin/katliamlar")
              }
              className="rounded-lg border border-white/10 px-6 py-3 hover:bg-white/5"
            >
              Vazgeç
            </button>

            <button
              type="button"
              onClick={saveMassacre}
              disabled={saving || uploading}
              className="rounded-lg bg-white px-6 py-3 font-medium text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Kaydediliyor..."
                : "Katliamı Kaydet"}
            </button>

          </div>

        </div>
      </div>
    </main>
  );
}