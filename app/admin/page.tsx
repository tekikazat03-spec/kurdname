"use client";

import { useEffect, useMemo, useState } from "react";

type Person = {
  qid: string;
  slug: string;
  name: string;
  birth: string;
  death: string;
  profession: string;
  places: string;
  category: string;
  tags?: string[];
  image: string;
};

const ADMIN_PASSWORD = "kurdname123";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] =
    useState<Person | null>(null);

  const [biography, setBiography] = useState("");
  const [search, setSearch] = useState("");

  const [loadingPeople, setLoadingPeople] = useState(false);
  const [loadingBiography, setLoadingBiography] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  async function loadPeople() {
    try {
      setLoadingPeople(true);

      const response = await fetch("/api/people", {
        cache: "no-store"
      });

      const data = await response.json();

      if (data.success) {
        setPeople(data.people || []);
      } else {
        setMessage("Kişiler yüklenemedi.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Kişiler yüklenemedi.");
    } finally {
      setLoadingPeople(false);
    }
  }

  async function login() {
    if (password !== ADMIN_PASSWORD) {
      setMessage("Şifre yanlış.");
      return;
    }

    setLoggedIn(true);
    setMessage("");

    await loadPeople();
  }

  async function selectPerson(person: Person) {
    setSelectedPerson(person);
    setBiography("");
    setMessage("");
    setLoadingBiography(true);

    try {
      const response = await fetch(
        `/api/admin?qid=${encodeURIComponent(person.qid)}`,
        {
          headers: {
            "x-admin-password": ADMIN_PASSWORD
          },
          cache: "no-store"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Biyografi alınamadı."
        );
        return;
      }

      setBiography(data.biography || "");
    } catch (error) {
      console.error(error);
      setMessage("Biyografi alınamadı.");
    } finally {
      setLoadingBiography(false);
    }
  }

  async function saveBiography() {
    if (!selectedPerson) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": ADMIN_PASSWORD
        },
        body: JSON.stringify({
          qid: selectedPerson.qid,
          biography
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Kaydetme başarısız."
        );
        return;
      }

      setMessage("✓ Biyografi başarıyla kaydedildi.");
    } catch (error) {
      console.error(error);
      setMessage("Kaydetme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  const filteredPeople = useMemo(() => {
    const value = search
      .toLocaleLowerCase("tr-TR")
      .trim();

    if (!value) {
      return people;
    }

    return people.filter((person) =>
      [
        person.name,
        person.profession,
        person.category,
        person.places,
        ...(person.tags || [])
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(value)
    );
  }, [people, search]);

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8] flex items-center justify-center px-6">
        <div className="w-full max-w-md border border-white/10 bg-[#111] p-8">
          <div className="mb-8">
            <p className="text-xs tracking-[0.35em] text-white/40 mb-3">
              KURDNAME
            </p>

            <h1 className="text-3xl font-semibold">
              YÖNETİCİ GİRİŞİ
            </h1>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                login();
              }
            }}
            placeholder="Admin şifresi"
            className="w-full bg-[#0b0b0b] border border-white/10 px-4 py-3 outline-none focus:border-white/30"
          />

          <button
            onClick={login}
            className="mt-4 w-full bg-[#e8e3d8] text-[#0b0b0b] py-3 font-semibold hover:opacity-90"
          >
            GİRİŞ YAP
          </button>

          {message && (
            <p className="mt-4 text-sm text-red-400">
              {message}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.35em] text-white/40">
              KURDNAME
            </p>

            <h1 className="text-2xl font-semibold mt-1">
              YÖNETİM PANELİ
            </h1>
          </div>

          <button
            onClick={() => {
              setLoggedIn(false);
              setSelectedPerson(null);
              setBiography("");
              setPassword("");
            }}
            className="border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
          >
            ÇIKIŞ
          </button>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr] min-h-[calc(100vh-90px)]">
        <aside className="border-r border-white/10 p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold tracking-wider">
              KİŞİLER
            </h2>

            <p className="text-xs text-white/40 mt-1">
              {people.length} kişi
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Kişi ara..."
            className="w-full bg-[#111] border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30 mb-4"
          />

          <div className="space-y-1 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
            {loadingPeople ? (
              <p className="text-sm text-white/40 py-4">
                Kişiler yükleniyor...
              </p>
            ) : filteredPeople.length === 0 ? (
              <p className="text-sm text-white/40 py-4">
                Kişi bulunamadı.
              </p>
            ) : (
              filteredPeople.map((person) => {
                const active =
                  selectedPerson?.qid === person.qid;

                return (
                  <button
                    key={person.qid}
                    onClick={() =>
                      selectPerson(person)
                    }
                    className={`w-full text-left p-4 border transition ${
                      active
                        ? "border-white/20 bg-white/10"
                        : "border-transparent hover:border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <div className="font-medium">
                      {person.name}
                    </div>

                    <div className="text-xs text-white/40 mt-1">
                      {person.birth}—{person.death}
                    </div>

                    <div className="text-xs text-white/50 mt-1">
                      {person.category}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="p-6 lg:p-10">
          {!selectedPerson ? (
            <div className="h-full min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs tracking-[0.35em] text-white/30 mb-4">
                  KURDNAME
                </p>

                <h2 className="text-2xl text-white/70">
                  BİR KİŞİ SEÇ
                </h2>

                <p className="text-sm text-white/30 mt-2">
                  Soldaki listeden biyografisini düzenlemek
                  istediğin kişiyi seç.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl">
              <div className="mb-8 border-b border-white/10 pb-6">
                <p className="text-xs tracking-[0.3em] text-white/30 mb-3">
                  BİYOGRAFİ DÜZENLEME
                </p>

                <h2 className="text-3xl font-semibold">
                  {selectedPerson.name}
                </h2>

                <div className="flex flex-wrap gap-3 mt-3 text-sm text-white/40">
                  <span>
                    {selectedPerson.birth}—
                    {selectedPerson.death}
                  </span>

                  <span>•</span>

                  <span>
                    {selectedPerson.profession}
                  </span>

                  <span>•</span>

                  <span>
                    {selectedPerson.category}
                  </span>
                </div>
              </div>

              {loadingBiography ? (
                <div className="py-10 text-white/40">
                  Biyografi yükleniyor...
                </div>
              ) : (
                <>
                  <label className="block text-xs tracking-[0.25em] text-white/40 mb-3">
                    KURDNAME BİYOGRAFİSİ
                  </label>

                  <textarea
                    value={biography}
                    onChange={(e) =>
                      setBiography(e.target.value)
                    }
                    placeholder="Bu kişi hakkında KURDNAME biyografisini buraya yaz..."
                    className="w-full min-h-[500px] resize-y bg-[#111] border border-white/10 p-5 leading-7 text-[15px] outline-none focus:border-white/30"
                  />

                  <div className="flex items-center justify-between mt-5">
                    <div className="text-sm">
                      {message && (
                        <span
                          className={
                            message.startsWith("✓")
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {message}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={saveBiography}
                      disabled={saving}
                      className="bg-[#e8e3d8] text-[#0b0b0b] px-7 py-3 font-semibold disabled:opacity-50"
                    >
                      {saving
                        ? "KAYDEDİLİYOR..."
                        : "BİYOGRAFİYİ KAYDET"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
