"use client";

import { useState } from "react";
import { push, ref } from "firebase/database";
import { database } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type PhotoItem = {
  file: File;
  preview: string;
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
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function YeniKatliamPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [region, setRegion] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [people, setPeople] = useState("");

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [biography, setBiography] = useState<BiographySection[]>([]);
  const [sources, setSources] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handlePhotos(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    const newPhotos: PhotoItem[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: "",
      source: "",
    }));

    setPhotos((current) => [...current, ...newPhotos]);

    event.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((current) => {
      const photo = current[index];

      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }

      return current.filter((_, i) => i !== index);
    });
  }

  function updatePhoto(
    index: number,
    field: "caption" | "source",
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

  function addBiographySection() {
    setBiography((current) => [
      ...current,
      {
        title: "",
        content: "",
      },
    ]);
  }

  function updateBiography(
    index: number,
    field: "title" | "content",
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

  function removeBiographySection(index: number) {
    setBiography((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function uploadPhoto(file: File) {
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

  async function save() {
    if (!name.trim()) {
      setMessage("Katliam adı boş bırakılamaz.");
      return;
    }

    if (photos.length === 0) {
      setMessage("En az bir fotoğraf eklemelisin.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      // Fotoğrafları Cloudinary'ye yükle
      const uploadedPhotos = [];

      for (const photo of photos) {
        const imageUrl = await uploadPhoto(photo.file);

        uploadedPhotos.push({
          imageUrl,
          caption: photo.caption.trim(),
          source: photo.source.trim(),
        });
      }

      const cleanBiography = biography
        .map((section) => ({
          title: section.title.trim(),
          content: section.content.trim(),
        }))
        .filter(
          (section) =>
            section.title || section.content
        );

      const cleanSources = sources
        .split("\n")
        .map((source) => source.trim())
        .filter(Boolean);

      const cleanPeople = people
        .split(",")
        .map((person) => person.trim())
        .filter(Boolean);

      const newRef = push(
        ref(database, "massacres")
      );

      await import("firebase/database").then(
        async ({ set }) => {
          await set(newRef, {
            id: newRef.key,
            slug: createSlug(name),
            name: name.trim(),
            date: date.trim(),
            region: region.trim(),
            shortBio: shortBio.trim(),
            people: cleanPeople,
            photos: uploadedPhotos,
            biography: cleanBiography,
            sources: cleanSources,
            createdAt: new Date().toISOString(),
          });
        }
      );

      setMessage(
        "Katliam başarıyla kaydedildi."
      );

      setTimeout(() => {
        router.push("/admin/katliamlar");
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Kayıt sırasında hata oluştu."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <button
            onClick={() =>
              router.push("/admin/katliamlar")
            }
            className="text-sm text-white/50 transition hover:text-white"
          >
            ← Katliamlar
          </button>

          <div className="text-xs uppercase tracking-[0.3em] text-white/30">
            Yeni Kayıt
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-32 pt-16">
        <div className="text-xs uppercase tracking-[0.3em] text-white/35">
          YÖNETİM
        </div>

        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          Yeni Katliam
        </h1>

        <p className="mt-5 text-white/40">
          Katliam veya kıyım kaydını arşive ekle.
        </p>

        {message && (
          <div className="mt-8 border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
            {message}
          </div>
        )}

        {/* Temel bilgiler */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl font-medium">
            Temel Bilgiler
          </h2>

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Katliam adı"
            className="w-full border border-white/10 bg-white/[0.03] px-5 py-4 outline-none transition focus:border-white/30"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <input
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              placeholder="Tarih"
              className="w-full border border-white/10 bg-white/[0.03] px-5 py-4 outline-none focus:border-white/30"
            />

            <input
              value={region}
              onChange={(e) =>
                setRegion(e.target.value)
              }
              placeholder="Bölge"
              className="w-full border border-white/10 bg-white/[0.03] px-5 py-4 outline-none focus:border-white/30"
            />
          </div>

          <textarea
            value={shortBio}
            onChange={(e) =>
              setShortBio(e.target.value)
            }
            placeholder="Kısa açıklama"
            rows={6}
            className="w-full resize-y border border-white/10 bg-white/[0.03] px-5 py-4 leading-7 outline-none focus:border-white/30"
          />

          <input
            value={people}
            onChange={(e) =>
              setPeople(e.target.value)
            }
            placeholder="İlgili kişiler — virgülle ayır"
            className="w-full border border-white/10 bg-white/[0.03] px-5 py-4 outline-none focus:border-white/30"
          />
        </section>

        {/* Fotoğraflar */}
        <section className="mt-20">
          <h2 className="text-2xl font-medium">
            Fotoğraflar
          </h2>

          <p className="mt-2 text-sm text-white/40">
            Birden fazla fotoğraf ekleyebilir, her
            fotoğraf için ayrı açıklama ve kaynak
            yazabilirsin.
          </p>

          <label className="mt-6 flex cursor-pointer items-center justify-center border border-dashed border-white/20 bg-white/[0.02] px-6 py-10 text-sm text-white/50 transition hover:border-white/40 hover:text-white">
            + Fotoğraf Ekle
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotos}
              className="hidden"
            />
          </label>

          {photos.length > 0 && (
            <div className="mt-8 space-y-10">
              {photos.map((photo, index) => (
                <div
                  key={`${photo.preview}-${index}`}
                  className="border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="overflow-hidden bg-black">
                    <img
                      src={photo.preview}
                      alt={`Fotoğraf ${index + 1}`}
                      className="max-h-[500px] w-full object-contain"
                    />
                  </div>

                  <div className="mt-5 space-y-4">
                    <textarea
                      value={photo.caption}
                      onChange={(e) =>
                        updatePhoto(
                          index,
                          "caption",
                          e.target.value
                        )
                      }
                      placeholder="Fotoğraf açıklaması"
                      rows={4}
                      className="w-full resize-y border border-white/10 bg-white/[0.03] px-5 py-4 leading-7 outline-none focus:border-white/30"
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
                      className="w-full border border-white/10 bg-white/[0.03] px-5 py-4 outline-none focus:border-white/30"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removePhoto(index)
                      }
                      className="border border-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      Fotoğrafı Kaldır
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ayrıntılı tarihçe */}
        <section className="mt-20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-medium">
                Ayrıntılı Tarihçe
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Tarihçeyi bölümlere ayırarak ekleyebilirsin.
              </p>
            </div>

            <button
              type="button"
              onClick={addBiographySection}
              className="border border-white/20 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
            >
              + Bölüm Ekle
            </button>
          </div>

          <div className="mt-8 space-y-8">
            {biography.map((section, index) => (
              <div
                key={index}
                className="border border-white/10 bg-white/[0.02] p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/30">
                    Bölüm {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeBiographySection(index)
                    }
                    className="text-xs text-red-400"
                  >
                    Bölümü Sil
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
                  className="w-full border border-white/10 bg-white/[0.03] px-5 py-4 outline-none focus:border-white/30"
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
                  placeholder="Bölüm metni"
                  rows={12}
                  className="mt-4 w-full resize-y border border-white/10 bg-white/[0.03] px-5 py-4 leading-7 outline-none focus:border-white/30"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Kaynakça */}
        <section className="mt-20">
          <h2 className="text-2xl font-medium">
            Kaynakça
          </h2>

          <p className="mt-2 text-sm text-white/40">
            Her kaynağı ayrı satıra yaz.
          </p>

          <textarea
            value={sources}
            onChange={(e) =>
              setSources(e.target.value)
            }
            rows={12}
            placeholder={"Kaynak 1\nKaynak 2\nKaynak 3"}
            className="mt-6 w-full resize-y border border-white/10 bg-white/[0.03] px-5 py-4 leading-7 outline-none focus:border-white/30"
          />
        </section>

        {/* Kaydet */}
        <section className="mt-16 border-t border-white/10 pt-10">
          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-white px-6 py-5 font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "KAYDEDİLİYOR..."
              : "KATLİAMI KAYDET"}
          </button>
        </section>
      </section>
    </main>
  );
}