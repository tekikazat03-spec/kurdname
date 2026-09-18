"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

type Props = {
  people: Person[];
};

export default function KisilerClient({ people }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tümü");

  const categories = useMemo(() => {
    const values = new Set<string>();

    for (const person of people) {
      if (person.category) values.add(person.category);
      for (const tag of person.tags || []) values.add(tag);
    }

    return ["Tümü", ...Array.from(values)];
  }, [people]);

  const filteredPeople = useMemo(() => {
    const query = search.toLocaleLowerCase("tr-TR").trim();

    return people.filter((person) => {
      const matchesCategory =
        category === "Tümü" ||
        person.category === category ||
        (person.tags || []).includes(category);

      const searchableText = [
        person.name,
        person.profession,
        person.places,
        person.category,
        ...(person.tags || []),
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      const matchesSearch =
        query === "" || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [people, search, category]);

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">

      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">

          <p className="text-xs tracking-[0.4em] text-white/30">
            KURDNAME
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mt-4">

            <div>
              <h1 className="text-4xl md:text-5xl font-semibold">
                Kişiler
              </h1>

              <p className="text-white/40 mt-3 max-w-2xl">
                Kürt tarihinin, siyasetinin, edebiyatının ve
                kültürünün önemli isimleri.
              </p>
            </div>

            <div className="text-sm text-white/30">
              {filteredPeople.length} / {people.length} kişi
            </div>

          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kişi, meslek, yer veya kategori ara..."
            className="w-full bg-[#101010] border border-white/10 px-5 py-4 text-sm outline-none focus:border-white/30 transition placeholder:text-white/25"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-10">

          {categories.map((item) => {
            const active = category === item;

            return (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`px-4 py-2 text-xs border transition ${
                  active
                    ? "bg-[#e8e3d8] text-[#0b0b0b] border-[#e8e3d8]"
                    : "bg-[#101010] text-white/50 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}

        </div>

        {filteredPeople.length === 0 ? (

          <div className="border border-white/10 bg-[#101010] p-12 text-center">

            <div className="text-lg">
              Aradığın kişi bulunamadı.
            </div>

            <div className="text-sm text-white/30 mt-2">
              Farklı bir isim, meslek, yer veya kategori dene.
            </div>

          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {filteredPeople.map((person) => (

              <Link
                key={person.qid}
                href={`/kisiler/${person.slug}`}
                className="group border border-white/10 bg-[#101010] overflow-hidden hover:border-white/25 transition"
              >

                <div className="aspect-[4/3] bg-[#151515] overflow-hidden">

                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.02] transition duration-500"
                  />

                </div>

                <div className="p-5">

                  <h2 className="text-xl font-semibold">
                    {person.name}
                  </h2>

                  <p className="text-sm text-white/40 mt-2">
                    {person.birth}—{person.death}
                  </p>

                  <p className="text-sm text-white/60 mt-4">
                    {person.profession}
                  </p>

                  <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">

                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs text-white/30">
                        {person.category}
                      </span>
                      {(person.tags || []).slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] border border-white/10 px-2 py-1 text-white/30">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="text-xs text-white/40 group-hover:text-white transition">
                      İNCELE →
                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}