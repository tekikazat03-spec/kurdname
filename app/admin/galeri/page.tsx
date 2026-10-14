"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { get, push, ref, remove, set } from "firebase/database";
import { auth, database } from "@/lib/firebase";

const ADMIN_UID = "BVBczt2Ry3bhOnaoNKHK39pRLjg1";

type Collection = "people" | "organizations" | "parties";

type RecordItem = {
  id: string;
  name: string;
};

type MediaItem = {
  id: string;
  title: string;
  url: string;
};

const inputClass =
  "w-full border border-[#b99a5b]/30 bg-[#0b100e] px-4 py-3 text-white outline-none focus:border-[#d6b875]";

export default function AdminGalleryPage() {
  const [allowed, setAllowed] = useState(false);
  const [collection, setCollection] = useState<Collection>("people");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [recordId, setRecordId] = useState("");
  const [existing, setExisting] = useState<MediaItem[]>([]);

  const [mode, setMode] = useState("photo");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [source, setSource] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setAllowed(user?.uid === ADMIN_UID);
    });
  }, []);

  useEffect(() => {
    if (!allowed) return;

    let active = true;

    setRecords([]);
    setRecordId("");
    setExisting([]);

    get(ref(database, collection))
      .then((snapshot) => {
        const data = snapshot.val();

        const items: RecordItem[] = data
          ? Object.entries(data).flatMap(([id, value]) => {
              if (!value || typeof value !== "object") return [];

              const record = value as { name?: unknown };

              if (typeof record.name !== "string") return [];

              return [{ id, name: record.name }];
            })
          : [];

        items.sort((a, b) => a.name.localeCompare(b.name, "tr"));

        if (active) setRecords(items);
      })
      .catch(() => {
        if (active) setError("Arşiv kayıtları yüklenemedi.");
      });

    return () => { active = false; };
  }, [collection, allowed]);

  async function refreshMedia(id: string, type: Collection) {
    const snapshot = await get(ref(database, `${type}/${id}/media`));
    const value = snapshot.val();

    const items: MediaItem[] = value
      ? Object.entries(value).flatMap(([key, entry]) => {
          if (!entry || typeof entry !== "object") return [];

          const item = entry as { title?: string; url?: string };

          return [{
            id: key,
            title: item.title || "İsimsiz belge",
            url: item.url || "",
          }];
        })
      : [];

    setExisting(items);
  }

  useEffect(() => {
    setExisting([]);

    if (!recordId || !allowed) return;

    let active = true;

    get(ref(database, `${collection}/${recordId}/media`))
      .then((snapshot) => {
        if (!active) return;

        const value = snapshot.val();

        const items: MediaItem[] = value
          ? Object.entries(value).map(([id, entry]) => {
              const item = entry as { title?: string; url?: string };
              return {
                id,
                title: item?.title || "İsimsiz belge",
                url: item?.url || "",
              };
            })
          : [];

        setExisting(items);
      })
      .catch(() => {
        if (active) setError("Galeri kayıtları yüklenemedi.");
      });

    return () => { active = false; };
  }, [recordId, collection, allowed]);

  async function uploadImage(selectedFile: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
      throw new Error("Cloudinary ayarları bulunamadı.");
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
      throw new Error("Yalnızca JPG, PNG veya WebP yükleyebilirsin.");
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      throw new Error("Görsel 10 MB sınırını aşıyor.");
    }

    const body = new FormData();
    body.append("file", selectedFile);
    body.append("upload_preset", preset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body }
    );

    if (!response.ok) {
      throw new Error("Cloudinary görsel yüklemesi başarısız.");
    }

    const result = await response.json();

    if (typeof result.secure_url !== "string") {
      throw new Error("Görsel bağlantısı alınamadı.");
    }

    return result.secure_url;
  }

  function checkUrl(value: string) {
    const parsed = new URL(value);

    if (parsed.protocol !== "https:") {
      throw new Error("Bağlantı https:// ile başlamalı.");
    }

    return parsed.toString();
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!allowed || auth.currentUser?.uid !== ADMIN_UID || !recordId) {
      setError("Yönetici yetkisi veya arşiv kaydı bulunamadı.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (!title.trim() || !source.trim()) {
        throw new Error("Başlık ve kaynak alanlarını doldur.");
      }

      let mediaUrl = "";
      let format: "image" | "pdf" = "image";

      if (mode === "pdf") {
        mediaUrl = checkUrl(url.trim());
        format = "pdf";
      } else if (file) {
        mediaUrl = await uploadImage(file);
      } else if (url.trim()) {
        mediaUrl = checkUrl(url.trim());
      } else {
        throw new Error("Bir görsel seç veya görsel bağlantısı gir.");
      }

      if (auth.currentUser?.uid !== ADMIN_UID) {
        throw new Error("Yönetici oturumu sona erdi.");
      }

      const newRef = push(
        ref(database, `${collection}/${recordId}/media`)
      );

      await set(newRef, {
        kind: mode === "photo" ? "photo" : "document",
        format,
        title: title.trim(),
        date: date.trim(),
        source: source.trim(),
        url: mediaUrl,
        createdAt: Date.now(),
      });

      await refreshMedia(recordId, collection);

      setFile(null);
      setUrl("");
      setTitle("");
      setDate("");
      setSource("");

      alert("Galeri kaydı başarıyla eklendi.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Kayıt eklenemedi."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(mediaId: string) {
    if (!allowed || !recordId) return;

    if (!window.confirm("Bu galeri kaydını silmek istiyor musun?")) {
      return;
    }

    try {
      await remove(
        ref(database, `${collection}/${recordId}/media/${mediaId}`)
      );

      await refreshMedia(recordId, collection);
    } catch {
      setError("Galeri kaydı silinemedi.");
    }
  }

  if (!allowed) {
    return (
      <main className="min-h-screen bg-[#0b100e] p-12 text-[#e8e0cb]">
        Yönetici yetkisi kontrol ediliyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b100e] px-6 py-16 text-[#e8e0cb]">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin" className="text-sm text-[#d6b875]">
          ← Yönetim Paneli
        </Link>

        <p className="mt-14 text-xs tracking-[0.3em] text-[#c9a66b]">
          KURDNAME ARŞİV YÖNETİMİ
        </p>

        <h1 className="mt-5 font-serif text-4xl text-[#f1e6cc]">
          Belge ve Fotoğraf Yönetimi
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#aaa397]">
          Bir arşiv kaydı seç, fotoğraf veya tarihî belge ekle.
        </p>

        <div className="mt-10 space-y-5 border border-[#b99a5b]/20 bg-[#111a15] p-6">
          <div>
            <label className="mb-2 block text-sm text-[#c9a66b]">
              Arşiv Bölümü
            </label>

            <select
              value={collection}
              onChange={(e) => {
                setCollection(e.target.value as Collection);
                setError("");
              }}
              className={inputClass}
            >
              <option value="people">Şahsiyetler</option>
              <option value="organizations">Örgütler</option>
              <option value="parties">Partiler</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#c9a66b]">
              Galerisi Düzenlenecek Kayıt
            </label>

            <select
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              className={inputClass}
            >
              <option value="">Arşiv kaydı seç...</option>

              {records.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {recordId && (
          <>
            <form
              onSubmit={handleSave}
              className="mt-8 space-y-5 border border-[#b99a5b]/20 bg-[#111a15] p-6"
            >
              <h2 className="font-serif text-2xl text-[#f1e6cc]">
                Yeni Galeri Kaydı
              </h2>

              <label className="block">
                <span className="mb-2 block text-sm text-[#c9a66b]">
                  Materyal Türü
                </span>

                <select
                  value={mode}
                  onChange={(e) => {
                    setMode(e.target.value);
                    setFile(null);
                    setUrl("");
                  }}
                  className={inputClass}
                >
                  <option value="photo">Tarihî Fotoğraf</option>
                  <option value="scan">Taranmış Belge veya Gazete</option>
                  <option value="pdf">PDF Belgesi (Bağlantı)</option>
                </select>
              </label>

              {mode !== "pdf" ? (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm text-[#c9a66b]">
                      Görsel Yükle
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-[#aaa397]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-[#c9a66b]">
                      Ya da Görsel URL
                    </span>

                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </label>
                </>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm text-[#c9a66b]">
                    PDF Bağlantısı
                  </span>

                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://.../belge.pdf"
                    className={inputClass}
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm text-[#c9a66b]">
                  Başlık
                </span>

                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Belgenin veya fotoğrafın başlığı"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-[#c9a66b]">
                  Tarih
                </span>

                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Örneğin 1927 veya 15 Mayıs 1930"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-[#c9a66b]">
                  Kaynak
                </span>

                <input
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Arşiv, kitap, koleksiyon veya bağlantı"
                  className={inputClass}
                />
              </label>

              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#c9a66b] px-6 py-4 font-semibold text-[#0b100e] disabled:opacity-50"
              >
                {busy ? "KAYDEDİLİYOR..." : "GALERİYE EKLE"}
              </button>
            </form>

            <section className="mt-8 border border-[#b99a5b]/20 bg-[#111a15] p-6">
              <h2 className="font-serif text-2xl text-[#f1e6cc]">
                Mevcut Galeri Kayıtları
              </h2>

              {existing.length === 0 ? (
                <p className="mt-6 text-sm text-[#aaa397]">
                  Bu kayda henüz galeri materyali eklenmedi.
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  {existing.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-4 border border-[#b99a5b]/20 p-4"
                    >
                      <span className="text-sm">{item.title}</span>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-sm text-red-400"
                      >
                        Kaydı Sil
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
