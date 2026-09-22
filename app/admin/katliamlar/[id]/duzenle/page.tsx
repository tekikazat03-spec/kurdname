"use client";

import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";

type Photo = {
  imageUrl: string;
  caption?: string;
  source?: string;
};

type BiographySection = {
  title: string;
  content: string;
};

type Massacre = {
  id: string;
  slug: string;
  name: string;
  date: string;
  region: string;
  shortBio: string;
  people: string[];
  photos: Photo[];
  biography: BiographySection[];
  sources: string[];
};

export default function DuzenleKatliamPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [region, setRegion] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [people, setPeople] = useState("");

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [biography, setBiography] = useState<BiographySection[]>([]);
  const [sources, setSources] = useState<string[]>([""]);

  useEffect(() => {
    if (!id) return;

    const massacreRef = ref(database, `massacres/${id}`);

    const unsubscribe = onValue(massacreRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        router.push("/admin/katliamlar");
        return;
      }

      setName(data.name || "");
      setDate(data.date || "");
      setRegion(data.region || "");
      setShortBio(data.shortBio || "");

      setPeople(
        Array.isArray(data.people)
          ? data.people.join(", ")
          : ""
      );

      setPhotos(
        Array.isArray(data.photos)
          ? data.photos
          : []
      );

      setBiography(
        Array.isArray(data.biography)
          ? data.biography
          : []
      );

      setSources(
        Array.isArray(data.sources) && data.sources.length > 0
          ? data.sources
          : [""]
      );

      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, router]);

  function updatePhoto(
    index: number,
    field: keyof Photo,
    value: string
  ) {
    setPhotos((current) =>
      current.map((photo, i) =>
        i === index
          ? { ...photo, [field]: value }
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
          ? { ...section, [field]: value }
          : section
      )
    );
  }

  function updateSource(index: number, value: string) {
    setSources((current) =>
      current.map((source, i) =>
        i === index ? value : source
      )
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    try {
      const cleanPeople = people
        .split(",")
        .map((person) => person.trim())
        .filter(Boolean);

      const cleanPhotos = photos
        .filter((photo) => photo.imageUrl.trim())
        .map((photo) => ({
          imageUrl: photo.imageUrl.trim(),
          caption: photo.caption?.trim() || "",
          source: photo.source?.trim() || "",
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

      const massacreRef = ref(
        database,
        `massacres/${id}`
      );

      await update(massacreRef, {
        name: name.trim(),
        date: date.trim(),
        region: region.trim(),
        shortBio: shortBio.trim(),
        people: cleanPeople,
        photos: cleanPhotos,
        biography: cleanBiography,
        sources: cleanSources,
      });

      alert("Katliam kaydı güncellendi.");

      router.push("/admin/katliamlar");
    } catch (error) {
      console.error(error);
      alert("Güncelleme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] p-10 text-[#e8e3d8]">
        <p className="text-white/50">
          Kayıt yükleniyor...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 py-12 text-[#e8e3d8]">
      <div className="mx-auto max-w-4xl">

        <button
          type="button"
          onClick={() => router.push("/admin/katliamlar")}
          className="mb-6 text-sm text-white/40 hover:text-white"
        >
          ← Katliamlar
        </button>

        <h1 className="text-4xl font-semibold">
          Katliamı Düzenle
        </h1>

        <p className="mt-3 text-sm text-white/40">
          Mevcut arşiv kaydını düzenle.
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
              onChange={(e) => setName(e.target.value)}
              placeholder="Katliam adı"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
              required
            />

            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Tarih"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
            />

            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Bölge"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
            />

            <textarea
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="Kısa açıklama"
              rows={6}
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
            />

            <input
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              placeholder="Kişiler: Seyit Rıza, Alişer, ..."
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
            />
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
                className="space-y-3 rounded-lg border border-white/10 p-4"
              >
                <div className="flex justify-between">
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
                  value={photo.imageUrl}
                  onChange={(e) =>
                    updatePhoto(
                      index,
                      "imageUrl",
                      e.target.value
                    )
                  }
                  placeholder="Cloudinary fotoğraf URL'si"
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                />

                <input
                  value={photo.caption || ""}
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
                  value={photo.source || ""}
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
                className="space-y-3 rounded-lg border border-white/10 p-4"
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
                  setSources([...sources, ""])
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
                    updateSource(
                      index,
                      e.target.value
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
            disabled={saving}
            className="w-full rounded-lg bg-white px-5 py-4 font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {saving
              ? "Kaydediliyor..."
              : "Değişiklikleri Kaydet"}
          </button>

        </form>
      </div>
    </main>
  );
}