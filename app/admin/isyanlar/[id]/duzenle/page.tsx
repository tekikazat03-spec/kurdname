"use client";

import { useEffect, useState } from "react";
import { get, ref, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type Photo = {
  imageUrl: string;
  caption?: string;
  source?: string;
};

type BiographySection = {
  title: string;
  content: string;
};

export default function DuzenleIsyanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [id, setId] = useState("");

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [region, setRegion] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [leaders, setLeaders] = useState("");

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [biography, setBiography] = useState<BiographySection[]>([]);
  const [sources, setSources] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const resolvedParams = await params;
      setId(resolvedParams.id);

      try {
        const snapshot = await get(
          ref(database, `rebellions/${resolvedParams.id}`)
        );

        if (!snapshot.exists()) {
          setMessage("İsyan bulunamadı.");
          setLoading(false);
          return;
        }

        const data = snapshot.val();

        setName(data.name || "");
        setStartDate(data.startDate || "");
        setEndDate(data.endDate || "");
        setRegion(data.region || "");
        setShortBio(data.shortBio || "");
        setLeaders(
          Array.isArray(data.leaders)
            ? data.leaders.join(", ")
            : ""
        );

        setPhotos(
          Array.isArray(data.photos)
            ? data.photos
            : []
        );

        setBiography(
          Array.isArray(data.biography)
            ? data.biography.map((item: BiographySection) => ({
                title: item.title || "",
                content: item.content || "",
              }))
            : []
        );

        setSources(
          Array.isArray(data.sources)
            ? data.sources.join("\n")
            : ""
        );
      } catch (error) {
        console.error(error);
        setMessage("Veriler yüklenirken hata oluştu.");
      }

      setLoading(false);
    }

    load();
  }, [params]);

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

  function removePhoto(index: number) {
    setPhotos((current) =>
      current.filter((_, i) => i !== index)
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

  function removeBiographySection(index: number) {
    setBiography((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function save() {
    if (!id) return;

    if (!name.trim()) {
      setMessage("İsyan adı boş bırakılamaz.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
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
        .map((item) => item.trim())
        .filter(Boolean);

      const cleanLeaders = leaders
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await update(ref(database, `rebellions/${id}`), {
        name: name.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        region: region.trim(),
        shortBio: shortBio.trim(),
        leaders: cleanLeaders,
        photos,
        biography: cleanBiography,
        sources: cleanSources,
        updatedAt: new Date().toISOString(),
      });

      setMessage("İsyan başarıyla güncellendi.");

      setTimeout(() => {
        router.push("/admin/isyanlar");
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("Kaydetme sırasında hata oluştu.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-white/50">
        Yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <button
            onClick={() => router.push("/admin/isyanlar")}
            className="text-sm text-white/50 transition hover:text-white"
          >
            ← İsyanlar
          </button>

          <div className="text-xs uppercase tracking-[0.3em] text-white/30">
            Düzenle
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-32 pt-16">
        <h1 className="text-5xl font-semibold tracking-tight">
          {name || "İsyan Düzenle"}
        </h1>

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
            onChange={(e) => setName(e.target.value)}
            placeholder="İsyan adı"
            className="w-full border border-white/10 bg-white/[0.03] px-5 py-4 outline-none transition focus:border-white/30"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <input
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Başlangıç tarihi"
              className="w-full border border-white/10 bg-white/[0.03] px-5 py-4 outline-none focus:border-white/30"
            />

            <input
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Bitiş tarihi"
              className="w-full border border-white/10 bg-white/[0.03] px-5 py-4 outline-none focus:border-white/30"
            />
          </div>

          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Bölge"
            className="w-full border border-white/10 bg-white/[0.03] px-5 py-4 outline-none focus:border-white/30"
          />

          <textarea
            value={shortBio}
            onChange={(e) => setShortBio(e.target.value)}
            placeholder="Kısa açıklama"
            rows={6}
            className="w-full resize-y border border-white/10 bg-white/[0.03] px-5 py-4 outline-none focus:border-white/30"
          />

          <input
            value={leaders}
            onChange={(e) => setLeaders(e.target.value)}
            placeholder="Önemli kişiler — virgülle ayır"
            className="w-full border border-white/10 bg-white/[0.03] px-5 py-4 outline-none focus:border-white/30"
          />
        </section>

        {/* Fotoğraflar */}
        <section className="mt-20">
          <h2 className="text-2xl font-medium">
            Fotoğraflar
          </h2>

          <p className="mt-2 text-sm text-white/40">
            Fotoğrafların açıklamalarını ve kaynaklarını buradan değiştirebilirsin.
          </p>

          {photos.length === 0 ? (
            <div className="mt-8 border border-white/10 p-8 text-sm text-white/35">
              Bu kayıtta fotoğraf bulunmuyor.
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {photos.map((photo, index) => (
                <div
                  key={`${photo.imageUrl}-${index}`}
                  className="border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="overflow-hidden bg-black">
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || `Fotoğraf ${index + 1}`}
                      className="max-h-[500px] w-full object-contain"
                    />
                  </div>

                  <div className="mt-5 space-y-4">
                    <textarea
                      value={photo.caption || ""}
                      onChange={(e) =>
                        updatePhoto(
                          index,
                          "caption",
                          e.target.value
                        )
                      }
                      placeholder="Fotoğraf açıklaması"
                      rows={4}
                      className="w-full resize-y border border-white/10 bg-white/[0.03] px-5 py-4 outline-none focus:border-white/30"
                    />

                    <input
                      value={photo.source || ""}
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
                      onClick={() => removePhoto(index)}
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

        {/* Tarihçe */}
        <section className="mt-20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-medium">
                Ayrıntılı Tarihçe
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Bölümleri buradan düzenleyebilirsin.
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

        {/* Kaynaklar */}
        <section className="mt-20">
          <h2 className="text-2xl font-medium">
            Kaynakça
          </h2>

          <p className="mt-2 text-sm text-white/40">
            Her kaynağı ayrı satıra yaz.
          </p>

          <textarea
            value={sources}
            onChange={(e) => setSources(e.target.value)}
            rows={12}
            placeholder="Kaynak 1&#10;Kaynak 2&#10;Kaynak 3"
            className="mt-6 w-full resize-y border border-white/10 bg-white/[0.03] px-5 py-4 leading-7 outline-none focus:border-white/30"
          />
        </section>

        {/* Kaydet */}
        <section className="mt-16 border-t border-white/10 pt-10">
          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-white px-6 py-4 font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "DEĞİŞİKLİKLERİ KAYDET"}
          </button>
        </section>
      </section>
    </main>
  );
}