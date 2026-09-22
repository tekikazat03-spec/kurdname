"use client";

import { useState } from "react";
import { get, getDatabase, push, ref } from "firebase/database";
import { database } from "@/lib/firebase";

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
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function YeniIsyanPage() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [region, setRegion] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [leaders, setLeaders] = useState("");

  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const [biography, setBiography] = useState<BiographySection[]>([
    {
      title: "",
      content: "",
    },
  ]);

  const [sources, setSources] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function addPhotos(files: FileList | null) {
    if (!files) return;

    const newPhotos = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: "",
      source: "",
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePhoto(
    index: number,
    field: "caption" | "source",
    value: string
  ) {
    setPhotos((prev) =>
      prev.map((photo, i) =>
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
    setBiography((prev) => [
      ...prev,
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
    setBiography((prev) =>
      prev.map((section, i) =>
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
    setBiography((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadToCloudinary(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary ayarları bulunamadı.");
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
      throw new Error("Fotoğraf yüklenemedi.");
    }

    const data = await response.json();

    return data.secure_url as string;
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      if (!name.trim()) {
        setMessage("İsyan adı gerekli.");
        setSaving(false);
        return;
      }

      if (photos.length === 0) {
        setMessage("En az bir fotoğraf eklemelisin.");
        setSaving(false);
        return;
      }

      // FOTOĞRAFLARI CLOUDINARY'YE YÜKLE
      const uploadedPhotos = [];

      for (const photo of photos) {
        const imageUrl = await uploadToCloudinary(photo.file);

        uploadedPhotos.push({
          imageUrl,
          caption: photo.caption.trim(),
          source: photo.source.trim(),
        });
      }

      const cleanBiography = biography
        .filter(
          (section) =>
            section.title.trim() || section.content.trim()
        )
        .map((section) => ({
          title: section.title.trim(),
          content: section.content.trim(),
        }));

      const cleanSources = sources
        .split("\n")
        .map((source) => source.trim())
        .filter(Boolean);

      const cleanLeaders = leaders
        .split(",")
        .map((leader) => leader.trim())
        .filter(Boolean);

      const rebellionRef = push(ref(database, "rebellions"));

      const rebellion = {
        id: rebellionRef.key,
        slug: createSlug(name),

        name,
        startDate,
        endDate,
        region,

        shortBio,

        leaders: cleanLeaders,

        biography: cleanBiography,

        sources: cleanSources,

        // HER FOTOĞRAF KENDİ AÇIKLAMASI VE KAYNAĞIYLA
        photos: uploadedPhotos,

        createdAt: new Date().toISOString(),
      };

      await import("firebase/database").then(({ set }) =>
        set(rebellionRef, rebellion)
      );

      setMessage("İsyan başarıyla kaydedildi.");

      setName("");
      setStartDate("");
      setEndDate("");
      setRegion("");
      setShortBio("");
      setLeaders("");
      setSources("");

      setPhotos([]);

      setBiography([
        {
          title: "",
          content: "",
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessage("Kayıt sırasında bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 py-12 text-[#e8e3d8]">
      <div className="mx-auto max-w-5xl">

        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[#777064]">
            KURDNAME / ADMİN
          </p>

          <h1 className="mt-3 text-4xl font-light text-white">
            Yeni İsyan Ekle
          </h1>
        </div>

        <div className="space-y-10">

          {/* TEMEL BİLGİLER */}
          <section className="border border-white/10 p-6">
            <h2 className="mb-6 text-xl text-white">
              Temel Bilgiler
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="İsyan adı"
                className="h-12 border border-white/10 bg-white/[0.03] px-4 outline-none"
              />

              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Bölge"
                className="h-12 border border-white/10 bg-white/[0.03] px-4 outline-none"
              />

              <input
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Başlangıç tarihi"
                className="h-12 border border-white/10 bg-white/[0.03] px-4 outline-none"
              />

              <input
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Bitiş tarihi"
                className="h-12 border border-white/10 bg-white/[0.03] px-4 outline-none"
              />

            </div>

            <textarea
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="Kısa biyografi / kısa açıklama"
              className="mt-5 min-h-32 w-full border border-white/10 bg-white/[0.03] p-4 outline-none"
            />

            <input
              value={leaders}
              onChange={(e) => setLeaders(e.target.value)}
              placeholder="Önemli kişiler (virgülle ayır)"
              className="mt-5 h-12 w-full border border-white/10 bg-white/[0.03] px-4 outline-none"
            />
          </section>

          {/* FOTOĞRAFLAR */}
          <section className="border border-white/10 p-6">
            <div className="mb-6">
              <h2 className="text-xl text-white">
                Fotoğraflar
              </h2>

              <p className="mt-2 text-sm text-[#777168]">
                Her fotoğrafın kendi açıklamasını ve kaynağını ekleyebilirsin.
              </p>
            </div>

            <label className="flex cursor-pointer items-center justify-center border border-dashed border-white/20 p-10 text-sm text-[#aaa397] transition hover:border-white/40">
              + Fotoğraf Ekle

              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addPhotos(e.target.files)}
              />
            </label>

            {photos.length > 0 && (
              <div className="mt-8 space-y-8">

                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="border border-white/10 p-5"
                  >
                    <div className="grid gap-6 md:grid-cols-[280px_1fr]">

                      {/* FOTOĞRAF */}
                      <div>
                        <img
                          src={photo.preview}
                          alt={`Fotoğraf ${index + 1}`}
                          className="aspect-[4/3] w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="mt-3 w-full border border-red-500/30 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10"
                        >
                          Fotoğrafı kaldır
                        </button>
                      </div>

                      {/* FOTOĞRAF BİLGİLERİ */}
                      <div className="space-y-4">

                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-widest text-[#777064]">
                            Fotoğraf açıklaması
                          </label>

                          <textarea
                            value={photo.caption}
                            onChange={(e) =>
                              updatePhoto(
                                index,
                                "caption",
                                e.target.value
                              )
                            }
                            placeholder="Örneğin: Koçgirî hareketine katılan savaşçılar..."
                            className="min-h-28 w-full border border-white/10 bg-white/[0.03] p-4 outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-widest text-[#777064]">
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
                            placeholder="Örneğin: Wikimedia Commons"
                            className="h-12 w-full border border-white/10 bg-white/[0.03] px-4 outline-none"
                          />
                        </div>

                      </div>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </section>

          {/* BİYOGRAFİ */}
          <section className="border border-white/10 p-6">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl text-white">
                Ayrıntılı Tarihçe
              </h2>

              <button
                type="button"
                onClick={addBiographySection}
                className="border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
              >
                + Bölüm Ekle
              </button>
            </div>

            <div className="space-y-6">

              {biography.map((section, index) => (
                <div
                  key={index}
                  className="border border-white/10 p-5"
                >

                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs text-[#777064]">
                      BÖLÜM {index + 1}
                    </span>

                    {biography.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeBiographySection(index)
                        }
                        className="text-xs text-red-300"
                      >
                        Bölümü sil
                      </button>
                    )}
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
                    className="mb-4 h-12 w-full border border-white/10 bg-white/[0.03] px-4 outline-none"
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
                    placeholder="Bu bölümün metni..."
                    className="min-h-60 w-full border border-white/10 bg-white/[0.03] p-4 leading-7 outline-none"
                  />

                </div>
              ))}

            </div>
          </section>

          {/* KAYNAKLAR */}
          <section className="border border-white/10 p-6">

            <h2 className="mb-3 text-xl text-white">
              Kaynaklar
            </h2>

            <p className="mb-4 text-sm text-[#777168]">
              Her kaynağı ayrı satıra yaz.
            </p>

            <textarea
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              placeholder={`Sciences Po – Mass Violence and Resistance...
TÜBA – Millî Mücadele Döneminde Koçgiri Ayaklanması...
Bayram Ayna – Millî Mücadele Yıllarında Koçgiri Aşireti...`}
              className="min-h-48 w-full border border-white/10 bg-white/[0.03] p-4 leading-7 outline-none"
            />

          </section>

          {/* KAYDET */}
          <div className="pb-20">

            {message && (
              <div className="mb-5 border border-white/10 bg-white/[0.03] p-4 text-sm">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#e8e3d8] px-6 py-4 text-sm font-medium uppercase tracking-widest text-black transition hover:bg-white disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "İsyanı Kaydet"}
            </button>

          </div>

        </div>
      </div>
    </main>
  );
}