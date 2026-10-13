"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { get, ref, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { asList, type Photo, type Section } from "@/lib/parties";

type FormData = {
  name: string;
  startDate: string;
  endDate: string;
  region: string;
  shortBio: string;
  people: string[];
  photos: Photo[];
  biography: Section[];
  sources: string[];
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
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const fieldClass =
  "w-full rounded-lg border border-white/15 bg-black p-4 text-white outline-none focus:border-[#d9ac57]";

export default function EditPartyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snapshot = await get(
          ref(database, `parties/${id}`)
        );

        if (!snapshot.exists()) {
          alert("Parti bulunamadı.");
          router.replace("/admin/partiler");
          return;
        }

        const data = snapshot.val();

        setForm({
          name: data.name || "",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          region: data.region || "",
          shortBio: data.shortBio || "",
          people: asList<string>(data.people),
          photos: asList<Photo>(data.photos),
          biography: asList<Section>(data.biography),
          sources: asList<string>(data.sources),
        });
      } catch (error) {
        console.error(error);
        alert("Parti bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id, router]);

  function change(
    field: "name" | "startDate" | "endDate" | "region" | "shortBio",
    value: string
  ) {
    setForm((current) =>
      current ? { ...current, [field]: value } : current
    );
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    if (!form || !form.name.trim()) {
      alert("Parti adını yaz.");
      return;
    }

    setSaving(true);

    try {
      await update(ref(database, `parties/${id}`), {
        name: form.name.trim(),
        slug: createSlug(form.name),
        startDate: form.startDate.trim(),
        endDate: form.endDate.trim(),
        region: form.region.trim(),
        shortBio: form.shortBio.trim(),
        people: form.people.filter(Boolean),
        photos: form.photos.filter((p) => p.imageUrl.trim()),
        biography: form.biography.filter(
          (s) => s.title.trim() || s.content.trim()
        ),
        sources: form.sources.filter(Boolean),
        updatedAt: Date.now(),
      });

      alert("Parti başarıyla güncellendi.");
      router.push("/admin/partiler");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Güncelleme başarısız. Yönetici girişini kontrol et.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090c0a] p-16 text-white">
        Parti yükleniyor...
      </main>
    );
  }

  if (!form) return null;

  return (
    <main className="min-h-screen bg-[#090c0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/partiler" className="text-[#d9ac57]">
          ← Partilere Dön
        </Link>

        <h1 className="mb-10 mt-12 text-4xl">Partiyi Düzenle</h1>

        <form onSubmit={handleSave} className="space-y-8">
          <section className="space-y-5 border border-white/10 p-6">
            <h2 className="text-xl">Temel Bilgiler</h2>

            {(
              [
                ["name", "Parti Adı"],
                ["startDate", "Kuruluş Tarihi"],
                ["endDate", "Kapanış Tarihi"],
                ["region", "Merkez / Faaliyet Bölgesi"],
              ] as const
            ).map(([field, label]) => (
              <label key={field} className="block">
                <span className="mb-2 block text-sm text-white/50">
                  {label}
                </span>
                <input
                  value={form[field]}
                  onChange={(e) => change(field, e.target.value)}
                  className={fieldClass}
                />
              </label>
            ))}

            <label className="block">
              <span className="mb-2 block text-sm text-white/50">
                Önemli Kişiler (virgülle ayır)
              </span>
              <input
                value={form.people.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    people: e.target.value.split(",").map((x) => x.trim()),
                  })
                }
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/50">
                Kısa Açıklama
              </span>
              <textarea
                value={form.shortBio}
                onChange={(e) => change("shortBio", e.target.value)}
                rows={6}
                className={fieldClass}
              />
            </label>
          </section>

          <section className="space-y-5 border border-white/10 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl">Fotoğraflar</h2>

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    photos: [
                      ...form.photos,
                      { imageUrl: "", caption: "", source: "" },
                    ],
                  })
                }
                className="border border-white/20 px-4 py-2 text-sm"
              >
                + Fotoğraf
              </button>
            </div>

            <p className="text-xs text-white/40">
              Mevcut Cloudinary fotoğraflarının bağlantılarını
              düzenleyebilir veya yeni fotoğraf URL'si ekleyebilirsin.
            </p>

            {form.photos.map((photo, index) => (
              <div key={index} className="space-y-3 border border-white/10 p-4">
                {photo.imageUrl && (
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || "Parti fotoğrafı"}
                    className="max-h-48 object-contain"
                  />
                )}

                {(
                  [
                    ["imageUrl", "Fotoğraf URL"],
                    ["caption", "Açıklama"],
                    ["source", "Kaynak"],
                  ] as const
                ).map(([field, label]) => (
                  <input
                    key={field}
                    placeholder={label}
                    value={photo[field] || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        photos: form.photos.map((item, i) =>
                          i === index
                            ? { ...item, [field]: e.target.value }
                            : item
                        ),
                      })
                    }
                    className={fieldClass}
                  />
                ))}

                <button
                  type="button"
                  className="text-sm text-red-400"
                  onClick={() =>
                    setForm({
                      ...form,
                      photos: form.photos.filter((_, i) => i !== index),
                    })
                  }
                >
                  Fotoğrafı Kaldır
                </button>
              </div>
            ))}
          </section>

          <section className="space-y-5 border border-white/10 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl">Tarihçe</h2>

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    biography: [
                      ...form.biography,
                      { title: "", content: "" },
                    ],
                  })
                }
                className="border border-white/20 px-4 py-2 text-sm"
              >
                + Bölüm
              </button>
            </div>

            {form.biography.map((section, index) => (
              <div key={index} className="space-y-3 border border-white/10 p-4">
                <input
                  placeholder="Bölüm başlığı"
                  value={section.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      biography: form.biography.map((item, i) =>
                        i === index
                          ? { ...item, title: e.target.value }
                          : item
                      ),
                    })
                  }
                  className={fieldClass}
                />

                <textarea
                  placeholder="Bölüm içeriği"
                  value={section.content}
                  rows={9}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      biography: form.biography.map((item, i) =>
                        i === index
                          ? { ...item, content: e.target.value }
                          : item
                      ),
                    })
                  }
                  className={fieldClass}
                />

                <button
                  type="button"
                  className="text-sm text-red-400"
                  onClick={() =>
                    setForm({
                      ...form,
                      biography: form.biography.filter((_, i) => i !== index),
                    })
                  }
                >
                  Bölümü Kaldır
                </button>
              </div>
            ))}
          </section>

          <section className="border border-white/10 p-6">
            <h2 className="mb-4 text-xl">Kaynaklar</h2>

            <textarea
              value={form.sources.join("\n")}
              onChange={(e) =>
                setForm({
                  ...form,
                  sources: e.target.value.split("\n"),
                })
              }
              rows={8}
              placeholder="Her kaynağı ayrı satıra yaz"
              className={fieldClass}
            />
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#d9ac57] px-6 py-4 font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}
