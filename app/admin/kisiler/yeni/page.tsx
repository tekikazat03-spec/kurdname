"use client";

import PdfImporter from "./PdfImporter";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { push, ref, set } from "firebase/database";

import type { PdfPhoto } from "@/lib/pdf/images";

import { database } from "@/lib/firebase";

type BiographySection = {
  title: string;
  content: string;
};

export default function NewPersonPage() {
  const [importVersion, setImportVersion] = useState(0);
  const [pdfPhotos, setPdfPhotos] = useState<PdfPhoto[]>([]);
  const [readingPdf, setReadingPdf] = useState(false);
  const [saveProgress, setSaveProgress] = useState("");
  const uploadCache = useRef(new Map<File, string>());
  const pendingPerson = useRef<ReturnType<typeof push> | null>(null);
  const submitting = useRef(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [death, setDeath] = useState("");
  const [tags, setTags] = useState("");
  const [shortBio, setShortBio] = useState("");

  const [biography, setBiography] = useState<BiographySection[]>([
    {
      title: "",
      content: "",
    },
  ]);

  const [sources, setSources] = useState("");

  const [saving, setSaving] = useState(false);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
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

  function removeBiographySection(index: number) {
    setBiography((prev) => prev.filter((_, i) => i !== index));
  }

  function updateBiographySection(
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

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function uploadToCloudinary(file: File) {
    const cached = uploadCache.current.get(file);
    if (cached) return cached;
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary ayarları bulunamadı. .env.local dosyasını kontrol et."
      );
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        signal: AbortSignal.timeout(90000),
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Fotoğraf Cloudinary'ye yüklenemedi.");
    }

    const data = await response.json();

    if (typeof data.secure_url !== "string" || !data.secure_url.startsWith("https://")) throw new Error("Fotoğraf bağlantısı alınamadı.");
    uploadCache.current.set(file, data.secure_url);
    return data.secure_url as string;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current || readingPdf) return;

    if (!name.trim()) {
      alert("Lütfen kişinin adını yaz.");
      return;
    }

    if (!image) {
      alert("Lütfen kişinin fotoğrafını seç.");
      return;
    }

    try {
      submitting.current = true;
      setSaving(true);
      setSaveProgress("Ana fotoğraf yükleniyor...");

      // 1. Fotoğrafı Cloudinary'ye yükle
      const imageUrl = await uploadToCloudinary(image);

      // 2. Firebase'de yeni kayıt için ID oluştur
      const personRef = pendingPerson.current ?? push(ref(database, "people"));
      pendingPerson.current = personRef;
      const media: Record<string, { kind: string; format: string; title: string; source: string; url: string; createdAt: number }> = {};
      for (let index = 0; index < pdfPhotos.length; index++) {
        const photo = pdfPhotos[index];
        setSaveProgress(`Galeri fotoğrafı ${index + 1}/${pdfPhotos.length} yükleniyor...`);
        const url = await uploadToCloudinary(photo.file);
        media[photo.id] = { kind: "photo", format: "image", title: photo.title.trim() || `Görsel ${index + 1}`, source: photo.source, url, createdAt: Date.now() };
      }
      setSaveProgress("Bölümler ve galeri kaydediliyor...");

      // 3. Kişi verisini hazırla
      const personData = {
        id: personRef.key,
        slug: createSlug(name),

        name: name.trim(),
        birth: birth.trim(),
        death: death.trim(),

        category: "Şahsiyetler",

        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        shortBio: shortBio.trim(),

        biography: biography
          .filter(
            (section) =>
              section.title.trim() || section.content.trim()
          )
          .map((section) => ({
            title: section.title.trim(),
            content: section.content.trim(),
          })),

        sources: sources
          .split("\n")
          .map((source) => source.trim())
          .filter(Boolean),

        imageUrl,
        media,

        createdAt: new Date().toISOString(),
      };

      // 4. Firebase Realtime Database'e kaydet
      await set(personRef, personData);

      alert("Kişi başarıyla kaydedildi!");

      // Formu temizle
      setPdfPhotos([]);
      setImportVersion(value => value + 1);
      uploadCache.current.clear();
      pendingPerson.current = null;
      setName("");
      setBirth("");
      setDeath("");
      setTags("");
      setShortBio("");
      setSources("");
      setImage(null);
      setImagePreview("");

      setBiography([
        {
          title: "",
          content: "",
        },
      ]);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Kayıt sırasında bir hata oluştu."
      );
    } finally {
      setSaving(false);
      submitting.current = false;
      setSaveProgress("");
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-[#e8e3d8]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
          <a
            href="/admin"
            className="text-xs uppercase tracking-[0.25em] text-white/50 hover:text-white"
          >
            ← Yönetim Paneli
          </a>

          <div className="text-xl font-semibold tracking-[0.3em] text-white">
            KURDNAME
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12">
          <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#a79d88]">
            Kişiler
          </p>

          <h1 className="text-5xl font-light tracking-tight text-white">
            Yeni Kişi Ekle
          </h1>

          <p className="mt-4 text-sm text-white/45">
            Arşive yeni bir kişi kaydı oluştur.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <PdfImporter
            key={importVersion}
            disabled={saving}
            onBusyChange={setReadingPdf}
            onImport={(person) => {
              if (person.name) setName(person.name);
              if (person.birth) setBirth(person.birth);
              if (person.death) setDeath(person.death);
              if (person.biography.length) setBiography(person.biography);
              if (person.sources) setSources(person.sources);
              setPdfPhotos(previous => [...previous, ...person.photos.filter(photo => !previous.some(item => item.id === photo.id))]);
              if (!image && person.photos[0]) {
                setImage(person.photos[0].file);
                setImagePreview(person.photos[0].preview);
              }
            }}
          />
          <fieldset disabled={saving || readingPdf} className="space-y-8 disabled:opacity-60">
          {pdfPhotos.length > 0 && <section className="border border-white/10 p-8">
            <h2 className="text-xl">PDF Fotoğraf Galerisi · {pdfPhotos.length}</h2>
            <p className="mt-2 text-sm text-white/50">Bu görseller kişi kaydedildiğinde sitedeki galerisinde görünecek. Başlıkları düzenleyebilir, istemediklerini çıkarabilirsin.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pdfPhotos.map(photo => <div key={photo.id} className="border border-white/10 p-3">
                <img src={photo.preview} alt={photo.title} className="h-44 w-full object-contain" />
                <input aria-label="Galeri fotoğrafı başlığı" value={photo.title} onChange={event => setPdfPhotos(items => items.map(item => item.id === photo.id ? { ...item, title: event.target.value } : item))} className="mt-3 w-full bg-black/30 p-2" />
                <button type="button" onClick={() => { setImage(photo.file); setImagePreview(photo.preview); }} className="mt-3 mr-4 text-sm text-amber-200">Ana fotoğraf yap</button>
                <button type="button" onClick={() => setPdfPhotos(items => items.filter(item => item.id !== photo.id))} className="mt-3 text-sm text-red-300">Galeriden çıkar</button>
              </div>)}
            </div>
          </section>}
          {/* FOTOĞRAF */}
          <section className="border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl text-white">
              Fotoğraf
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Kişinin ana portresini yükle.
            </p>

            <div className="mt-8">
              <label className="block cursor-pointer">
                {imagePreview ? (
                  <div className="relative h-80 w-64 overflow-hidden border border-white/20">
                    <img
                      src={imagePreview}
                      alt="Fotoğraf önizleme"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-80 w-64 items-center justify-center border border-dashed border-white/20 bg-black/20">
                    <div className="text-center">
                      <div className="text-4xl text-white/30">
                        +
                      </div>

                      <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-white/40">
                        Fotoğraf Seç
                      </div>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          {/* TEMEL BİLGİLER */}
          <section className="border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl text-white">
              Temel Bilgiler
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/45">
                  Ad Soyad
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mehmed Şerîf Paşa"
                  className="h-14 w-full border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/45">
                  Doğum
                </label>

                <input
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  placeholder="1865"
                  className="h-14 w-full border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/45">
                  Ölüm
                </label>

                <input
                  value={death}
                  onChange={(e) => setDeath(e.target.value)}
                  placeholder="1951"
                  className="h-14 w-full border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/45">
                  Etiketler
                </label>

                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Baban, Paris Barış Konferansı, Diplomasi"
                  className="h-14 w-full border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-white/30"
                />

                <p className="mt-2 text-xs text-white/30">
                  Etiketleri virgülle ayır.
                </p>
              </div>
            </div>
          </section>

          {/* KISA BİYOGRAFİ */}
          <section className="border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl text-white">
              Kısa Biyografi
            </h2>

            <textarea
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="Kişinin kısa biyografisini yaz..."
              rows={6}
              className="mt-6 w-full resize-y border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white outline-none focus:border-white/30"
            />
          </section>

          {/* BİYOGRAFİ */}
          <section className="border border-white/10 bg-white/[0.02] p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl text-white">
                  Biyografi
                </h2>

                <p className="mt-2 text-sm text-white/40">
                  Biyografiyi bölümlere ayırabilirsin.
                </p>
              </div>

              <button
                type="button"
                onClick={addBiographySection}
                className="border border-white/15 px-4 py-3 text-xs uppercase tracking-[0.15em] text-white/70 transition hover:border-white/30 hover:text-white"
              >
                + Bölüm Ekle
              </button>
            </div>

            <div className="mt-8 space-y-6">
              {biography.map((section, index) => (
                <div
                  key={index}
                  className="border border-white/10 p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/30">
                      Bölüm {index + 1}
                    </span>

                    {biography.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeBiographySection(index)
                        }
                        className="text-xs text-red-400/70 hover:text-red-400"
                      >
                        Bölümü Sil
                      </button>
                    )}
                  </div>

                  <input
                    value={section.title}
                    onChange={(e) =>
                      updateBiographySection(
                        index,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Bölüm başlığı"
                    className="h-14 w-full border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-white/30"
                  />

                  <textarea
                    value={section.content}
                    onChange={(e) =>
                      updateBiographySection(
                        index,
                        "content",
                        e.target.value
                      )
                    }
                    placeholder="Bu bölümün metnini yaz..."
                    rows={10}
                    className="mt-4 w-full resize-y border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white outline-none focus:border-white/30"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* KAYNAKLAR */}
          <section className="border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl text-white">
              Kaynaklar
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Her kaynağı ayrı satıra yaz.
            </p>

            <textarea
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              placeholder={`Rohat Alakom, ...
Metin Atmaca, ...
Sevr Antlaşması, 10 Ağustos 1920...`}
              rows={8}
              className="mt-6 w-full resize-y border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white outline-none focus:border-white/30"
            />
          </section>

          {/* KAYDET */}
          <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-8">
            <p className="max-w-xl text-xs leading-6 text-white/30">
              Kaydettiğinde fotoğraf Cloudinary'ye, kişi
              bilgileri Firebase Realtime Database'e
              kaydedilecektir.
            </p>

            <button
              type="submit"
              disabled={saving || readingPdf}
              className="min-w-56 bg-[#e8e3d8] px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? saveProgress || "KAYDEDİLİYOR..."
                : "KİŞİYİ KAYDET"}
            </button>
          </div>
          </fieldset>
        </form>
      </div>
    </main>
  );
}
