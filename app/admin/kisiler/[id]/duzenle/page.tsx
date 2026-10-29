"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { get, push, ref, set, update } from "firebase/database";
import { auth, database } from "@/lib/firebase";
import { ADMIN_UID } from "@/lib/admin";
import { importedPeople } from "@/lib/imported-biographies";
import { findImportedPerson } from "@/lib/imported-biographies";

type BiographySection = {
  title: string;
  content: string;
};

type Person = {
  id: string;
  name: string;
  slug: string;
  birth: string;
  death: string;
  category: string;
  tags: string[];
  shortBio: string;
  biography: BiographySection[];
  sources: string[];
  imageUrl: string;
};

export default function EditPersonPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;
  const isImported = id.startsWith("pdf-");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [death, setDeath] = useState("");
  const [tags, setTags] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const uploadedImageCache = useRef(new Map<File, string>());

  const [biography, setBiography] = useState<BiographySection[]>([
    {
      title: "",
      content: "",
    },
  ]);

  const [sources, setSources] = useState("");

  useEffect(() => {
    async function loadPerson() {
      try {
        await auth.authStateReady();
        let data: Person;
        if (isImported) {
          const record = importedPeople.find((person) => person.id === id);
          if (!record) {
            alert("PDF biyografisi bulunamadı.");
            router.push("/admin/kisiler");
            return;
          }
          data = record as Person;
        } else {
          const snapshot = await get(ref(database, `people/${id}`));
          if (!snapshot.exists()) {
            alert("Kişi bulunamadı.");
            router.push("/admin/kisiler");
            return;
          }
          data = snapshot.val() as Person;
        }

        // An older Firebase record might still contain the original unsplit PDF text.
        const imported = findImportedPerson(data.slug || data.name || "");
        const legacy = imported && Array.isArray(data.biography) &&
          data.biography.length === 1 && typeof data.biography[0]?.content === "string" &&
          legacyHash(data.biography[0].content) === imported.legacyBiographyHash;
        if (legacy && imported) {
          data = {
            ...data,
            biography: imported.biography as BiographySection[],
            sources: imported.sources,
          };
        }

        setName(data.name || "");
        setBirth(data.birth || "");
        setDeath(data.death || "");
        setTags(Array.isArray(data.tags) ? data.tags.join(", ") : "");
        setShortBio(data.shortBio || "");
        setImageUrl(data.imageUrl || "");
        setSources(
          Array.isArray(data.sources)
            ? data.sources.join("\n")
            : ""
        );

        setBiography(
          Array.isArray(data.biography) && data.biography.length > 0
            ? data.biography
            : [{ title: "", content: "" }]
        );
      } catch (error) {
        console.error(error);
        alert("Kişi yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPerson();
    }
  }, [id, isImported, router]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Lütfen JPG, PNG veya WebP fotoğraf seç.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Fotoğraf en fazla 10 MB olabilir.");
      return;
    }
    setImageFile(file);
    setSaveStatus("");
  }

  async function uploadImage(file: File): Promise<string> {
    const cached = uploadedImageCache.current.get(file);
    if (cached) return cached;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      throw new Error("Fotoğraf yükleme ayarları eksik. Vercel Cloudinary ayarlarını kontrol et.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      { method: "POST", body: formData, signal: AbortSignal.timeout(90000) }
    );
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message = typeof body?.error?.message === "string" ? body.error.message : "Bilinmeyen hata";
      throw new Error(`Fotoğraf yüklenemedi: ${message}`);
    }

    const result = await response.json();
    if (typeof result.secure_url !== "string" || !result.secure_url.startsWith("https://")) {
      throw new Error("Fotoğraf için güvenli bağlantı alınamadı.");
    }
    uploadedImageCache.current.set(file, result.secure_url);
    return result.secure_url;
  }

  function restorePdfSections() {
    const record = importedPeople.find((person) => person.id === id) || findImportedPerson(name);
    if (!record) return;
    if (!window.confirm("Bu kişinin biyografi bölümlerini ve kaynaklarını PDF'deki düzenlenmiş hâliyle değiştirmek istiyor musun? Henüz kaydedilmemiş metin değişikliklerin silinir.")) {
      return;
    }
    setBiography((record.biography || []).map((section) => ({
      title: section.title || "",
      content: section.content || "",
    })));
    setSources((record.sources || []).join("\\n").replaceAll("\\n", "\n"));
    setSaveStatus(`PDF'den ${record.biography?.length || 0} ayrı bölüm ve ${record.sources?.length || 0} kaynak forma aktarıldı. Kaydet butonuna basarak değişiklikleri Firebase'e işle.`);
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

  function addBiographySection() {
    setBiography((current) => [
      ...current,
      {
        title: "",
        content: "",
      },
    ]);
  }

  function removeBiographySection(index: number) {
    setBiography((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("İsim alanı boş bırakılamaz.");
      return;
    }

    setSaving(true);
    setSaveStatus("Değişiklikler hazırlanıyor...");

    try {
      const cleanBiography = biography.filter(
        (section) =>
          section.title.trim() || section.content.trim()
      );

      const cleanTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const cleanSources = sources
        .split("\n")
        .map((source) => source.trim())
        .filter(Boolean);

      await auth.authStateReady();
      if (auth.currentUser?.uid !== ADMIN_UID) {
        throw new Error("Yönetici hesabıyla giriş yapılmalı.");
      }
      await auth.currentUser.getIdToken();

      let savedImageUrl = imageUrl.trim();
      if (imageFile) {
        setSaveStatus("Kişi kartı fotoğrafı yükleniyor...");
        savedImageUrl = await uploadImage(imageFile);
      }

      setSaveStatus("Kişi bilgileri kaydediliyor...");
      const importedSource = isImported
        ? importedPeople.find((person) => person.id === id)
        : undefined;

      const payload = {
        name: name.trim(),
        slug: importedSource && name.trim() === importedSource.name
          ? importedSource.slug
          : createSlug(name),
        birth: birth.trim(),
        death: death.trim(),
        tags: cleanTags,
        shortBio: shortBio.trim(),
        biography: cleanBiography,
        sources: cleanSources,
        imageUrl: savedImageUrl,
      };

      if (isImported && importedSource) {
        // Never blindly create a duplicate if this biography already exists in Firebase.
        const snapshot = await get(ref(database, "people"));
        const entries = snapshot.exists()
          ? Object.entries(snapshot.val() as Record<string, { slug?: string; name?: string }>)
          : [];
        const normalize = (text: string) => text.toLocaleLowerCase("tr")
          .replace(/[ıî]/g, "i").replace(/[êé]/g, "e")
          .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c")
          .replace(/ö/g, "o").replace(/ü/g, "u")
          .normalize("NFD").replace(/[^\x00-\x7F]/g, "")
          .replace(/[^a-z0-9]/g, "");
        const names = [importedSource.slug, importedSource.name, ...importedSource.aliases].map(normalize);
        const existing = entries.find(([, record]) =>
          names.includes(normalize(record?.slug || "")) ||
          names.includes(normalize(record?.name || ""))
        );

        if (existing) {
          await update(ref(database, `people/${existing[0]}`), payload);
        } else {
          const personRef = push(ref(database, "people"));
          await set(personRef, {
            id: personRef.key,
            category: "Şahsiyetler",
            createdAt: new Date().toISOString(),
            sourceKind: "pdf-import",
            originalFileName: importedSource.originalFileName,
            ...payload,
          });
        }
      } else {
        await update(ref(database, `people/${id}`), payload);
      }

      alert(isImported ? "Kişi Firebase'e kaydedildi. Artık panelden düzenleyebilirsin." : "Kişi başarıyla güncellendi.");

      router.push("/admin/kisiler");
      router.refresh();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Kişi kaydedilirken hata oluştu.";
      setSaveStatus(message);
      alert(message);
    } finally {
      setSaving(false);
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

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-14">
        <div className="mb-10 border-b border-white/10 pb-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#a99f8b]">
            YÖNETİM PANELİ
          </div>

          <h1 className="mt-4 text-4xl font-light text-white">
            Kişiyi Düzenle
          </h1>

          <p className="mt-3 text-sm text-white/40">
            {isImported ? "PDF biyografisini düzenle. Kaydedince Firebase kayıtlarına eklenir." : "Kişinin arşiv bilgilerini güncelle."}
          </p>
        </div>

        <div className="space-y-10">
          {/* TEMEL BİLGİLER */}
          <section className="border border-white/10 p-6">
            <h2 className="text-lg font-light text-white">
              Temel Bilgiler
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                label="Ad Soyad"
                value={name}
                onChange={setName}
              />

              <Field
                label="Doğum"
                value={birth}
                onChange={setBirth}
              />

              <Field
                label="Ölüm"
                value={death}
                onChange={setDeath}
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                Etiketler
              </label>

              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Xoybûn, Diplomasi, Edebiyat"
                className="w-full border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white outline-none transition focus:border-white/30"
              />

              <p className="mt-2 text-xs text-white/25">
                Etiketleri virgülle ayır.
              </p>
            </div>
          </section>

          {/* FOTOĞRAF */}
          <section className="border border-white/10 p-6">
            <h2 className="text-lg font-light text-white">Kişi Kartı Fotoğrafı</h2>
            <p className="mt-2 text-xs leading-6 text-white/45">
              Bilgisayarından fotoğraf seç. JPG, PNG veya WebP; en fazla 10 MB.
              Fotoğraf, değişiklikleri kaydettiğinde siteye yüklenecek.
            </p>

            <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row">
              <div className="h-64 w-48 shrink-0 overflow-hidden border border-white/15 bg-white/[0.03]">
                {(imagePreview || imageUrl) ? (
                  <img
                    src={imagePreview || imageUrl}
                    alt={name ? `${name} kart fotoğrafı` : "Kişi fotoğrafı"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-xs text-white/35">
                    Fotoğraf yok
                  </div>
                )}
              </div>

              <div className="w-full max-w-md">
                <label className="inline-flex cursor-pointer items-center justify-center border border-[#b99a5b]/60 bg-[#b99a5b]/10 px-6 py-4 text-xs tracking-[0.12em] text-[#e8d7b3] transition hover:bg-[#b99a5b]/20">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={saving}
                    onChange={selectImage}
                    className="sr-only"
                    aria-label="Kişi kartı fotoğrafı seç"
                  />
                  Fotoğraf Seç / Değiştir
                </label>

                {imageFile && (
                  <div className="mt-4">
                    <p className="break-all text-sm text-white/65">{imageFile.name}</p>
                    <p className="mt-2 text-xs text-amber-200/80">
                      Fotoğraf henüz kaydedilmedi. Aşağıdaki kaydet butonuna bas.
                    </p>
                    <button
                      type="button"
                      disabled={saving}
                      className="mt-3 text-xs text-white/50 underline hover:text-white"
                      onClick={() => setImageFile(null)}
                    >
                      Fotoğraf seçimini iptal et
                    </button>
                  </div>
                )}
                <label className="mt-8 block text-xs uppercase tracking-[0.15em] text-white/45">
                  Alternatif: Fotoğraf URL
                </label>
                <input
                  value={imageUrl}
                  disabled={saving}
                  onChange={(event) => {
                    setImageUrl(event.target.value);
                    setImageFile(null);
                  }}
                  placeholder="https://..."
                  className="mt-2 w-full border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white outline-none focus:border-white/30"
                />
                <p className="mt-2 text-xs leading-5 text-white/35">
                  Dosya seçmek için bağlantı girmen gerekmiyor.
                </p>
              </div>
            </div>
          </section>

          {/* KISA BİYOGRAFİ */}
          <section className="border border-white/10 p-6">
            <h2 className="text-lg font-light text-white">
              Kısa Biyografi
            </h2>

            <textarea
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              rows={7}
              className="mt-6 w-full resize-y border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-white/30"
            />
          </section>

          {/* UZUN BİYOGRAFİ */}
          <section className="border border-white/10 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-light text-white">Biyografi</h2>
                <p className="mt-2 text-xs text-white/40">
                  Her PDF başlığı ayrı bölümde görünür. Şu an {biography.length} ayrı bölüm var.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
              {(importedPeople.some((record) => record.id === id) || findImportedPerson(name)) && (
                <button
                  type="button"
                  onClick={restorePdfSections}
                  disabled={saving}
                  className="border border-[#b99a5b]/50 px-4 py-3 text-xs text-[#e8d7b3] hover:bg-[#b99a5b]/10 disabled:opacity-50"
                >
                  PDF Başlıklarını ve Kaynaklarını Yenile
                </button>
              )}
              <button
                type="button"
                onClick={addBiographySection}
                className="border border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-white/50 transition hover:border-white/30 hover:text-white"
              >
                + Bölüm Ekle
              </button>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {biography.map((section, index) => (
                <div
                  key={index}
                  className="border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                      Bölüm {index + 1}
                    </span>

                    {biography.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeBiographySection(index)
                        }
                        className="text-[10px] uppercase tracking-[0.15em] text-red-400/50 transition hover:text-red-400"
                      >
                        Bölümü Sil
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
                    className="mt-4 w-full border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white outline-none transition focus:border-white/30"
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
                    placeholder="Bölüm metni..."
                    rows={12}
                    className="mt-4 w-full resize-y border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-white/30"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* KAYNAKLAR */}
          <section className="border border-white/10 p-6">
            <h2 className="text-lg font-light text-white">
              Kaynaklar
            </h2>

            <p className="mt-2 text-xs text-white/30">
              PDF kaynakçası ayrı bir alandır. Kaynakları burada düzenleyebilirsin.
            </p>

            <textarea
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              rows={10}
              className="mt-6 w-full resize-y border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-white/30"
            />
          </section>

          {/* BUTONLAR */}
          {saveStatus && <p role="status" aria-live="polite" className="text-sm text-[#e8d7b3]">{saveStatus}</p>}
          <div className="flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:justify-between">
            <Link
              href="/admin/kisiler"
              className="border border-white/10 px-6 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/40 transition hover:border-white/30 hover:text-white"
            >
              İptal
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#e8e3d8] px-8 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : isImported ? "Kaydet ve Firebase\u0027e Ekle" : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white outline-none transition focus:border-white/30"
      />
    </div>
  );
}

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
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function legacyHash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
