"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { get, ref, update } from "firebase/database";
import { database } from "@/lib/firebase";

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [death, setDeath] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");

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
        const snapshot = await get(ref(database, `people/${id}`));

        if (!snapshot.exists()) {
          alert("Kişi bulunamadı.");
          router.push("/admin/kisiler");
          return;
        }

        const data = snapshot.val() as Person;

        setName(data.name || "");
        setBirth(data.birth || "");
        setDeath(data.death || "");
        setCategory(data.category || "");
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
  }, [id, router]);

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

      await update(ref(database, `people/${id}`), {
        name: name.trim(),
        slug: createSlug(name),
        birth: birth.trim(),
        death: death.trim(),
        category: category.trim(),
        tags: cleanTags,
        shortBio: shortBio.trim(),
        biography: cleanBiography,
        sources: cleanSources,
        imageUrl: imageUrl.trim(),
      });

      alert("Kişi başarıyla güncellendi.");

      router.push("/admin/kisiler");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Kişi güncellenirken bir hata oluştu.");
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
            Kişinin arşiv bilgilerini güncelle.
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

              <Field
                label="Kategori"
                value={category}
                onChange={setCategory}
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
            <h2 className="text-lg font-light text-white">
              Fotoğraf
            </h2>

            {imageUrl && (
              <div className="mt-6">
                <img
                  src={imageUrl}
                  alt={name}
                  className="h-64 w-48 object-cover"
                />
              </div>
            )}

            <div className="mt-5">
              <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                Fotoğraf URL
              </label>

              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Cloudinary fotoğraf URL'si"
                className="w-full border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>

            <p className="mt-3 text-xs leading-5 text-white/25">
              Şimdilik mevcut fotoğraf URL'sini değiştirebilirsin.
              Yeni fotoğraf yükleme sistemini ayrıca ekleyeceğiz.
            </p>
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
                <h2 className="text-lg font-light text-white">
                  Biyografi
                </h2>

                <p className="mt-2 text-xs text-white/30">
                  Biyografiyi bölümlere ayırabilirsin.
                </p>
              </div>

              <button
                type="button"
                onClick={addBiographySection}
                className="border border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-white/50 transition hover:border-white/30 hover:text-white"
              >
                + Bölüm Ekle
              </button>
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
              Her kaynağı ayrı satıra yaz.
            </p>

            <textarea
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              rows={10}
              className="mt-6 w-full resize-y border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-white/30"
            />
          </section>

          {/* BUTONLAR */}
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
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
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