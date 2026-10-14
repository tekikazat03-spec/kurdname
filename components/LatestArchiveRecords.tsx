"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ArchiveRecord = {
  id: string;
  name: string;
  category: string;
  href: string;
  createdAt: number | null;
};

const collections = [
  {
    key: "people",
    title: "Şahsiyet",
    route: "kisiler",
  },
  {
    key: "organizations",
    title: "Örgüt",
    route: "orgutler",
  },
  {
    key: "parties",
    title: "Parti",
    route: "partiler",
  },
];

function getTimestamp(value: unknown): number | null {
  if (typeof value === "number") {
    const timestamp =
      value < 10000000000 ? value * 1000 : value;

    return Number.isFinite(timestamp) ? timestamp : null;
  }

  if (typeof value === "string") {
    const timestamp = Date.parse(value);

    return Number.isFinite(timestamp) ? timestamp : null;
  }

  return null;
}

async function loadLatestRecords(): Promise<ArchiveRecord[]> {
  const groups = await Promise.all(
    collections.map(async (collection) => {
      const response = await fetch(
        `https://kurdname-7ba60-default-rtdb.firebaseio.com/${collection.key}.json`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Arşiv kayıtları yüklenemedi.");
      }

      const data: unknown = await response.json();

      if (!data || typeof data !== "object") {
        return [] as ArchiveRecord[];
      }

      return Object.entries(data).flatMap(([id, value]) => {
        if (!value || typeof value !== "object") {
          return [];
        }

        const record = value as Record<string, unknown>;

        const name =
          typeof record.name === "string"
            ? record.name.trim()
            : "";

        const slug =
          typeof record.slug === "string"
            ? record.slug.trim()
            : "";

        if (!name || !slug) {
          return [];
        }

        return [
          {
            id: `${collection.key}-${id}`,
            name,
            category: collection.title,
            href: `/${collection.route}/${slug}`,
            createdAt: getTimestamp(record.createdAt),
          },
        ];
      });
    })
  );

  return groups
    .flat()
    .sort((a, b) => {
      const difference =
        (b.createdAt ?? 0) - (a.createdAt ?? 0);

      return difference || a.name.localeCompare(b.name, "tr");
    })
    .slice(0, 6);
}

export default function LatestArchiveRecords() {
  const [records, setRecords] = useState<ArchiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    loadLatestRecords()
      .then((data) => {
        if (active) setRecords(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="border-t border-[#c9a66b]/15 bg-[#101711] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#c9a66b]">
            KURDNAME DİJİTAL ARŞİV
          </p>

          <h2 className="mt-6 font-serif text-4xl text-[#f1e6cc] sm:text-5xl">
            Son Eklenenler
          </h2>

          <div className="mx-auto my-7 h-px w-20 bg-[#c9a66b]/60" />

          <p className="text-sm leading-7 text-[#aaa397]">
            Arşivimize en son eklenen tarihî kayıtları keşfedin.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#aaa397]">
            Kayıtlar yükleniyor...
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-[#aaa397]">
            Kayıtlar şu anda görüntülenemiyor.
          </div>
        ) : records.length === 0 ? (
          <div className="border border-[#c9a66b]/20 bg-[#17211a] px-6 py-16 text-center">
            <p className="font-serif text-xl text-[#e8d7b3]">
              Arşiv Hazırlanıyor
            </p>

            <p className="mt-4 text-sm text-[#aaa397]">
              Henüz kayıt eklenmedi.
              Yeni kayıtlar burada görüntülenecek.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <Link
                key={record.id}
                href={record.href}
                className="group flex min-h-52 flex-col justify-between border border-[#c9a66b]/20 bg-[#17211a] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#c9a66b]/70"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a66b]">
                    {record.category}
                  </p>

                  <h3 className="mt-6 font-serif text-2xl leading-snug text-[#f1e6cc]">
                    {record.name}
                  </h3>

                  {record.createdAt !== null && (
                    <p className="mt-4 text-xs text-[#aaa397]">
                      Eklenme:{" "}
                      {new Date(record.createdAt).toLocaleDateString(
                        "tr-TR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "UTC",
                        }
                      )}
                    </p>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-[#c9a66b]/15 pt-5">
                  <span className="text-xs uppercase tracking-[0.15em] text-[#c9a66b]">
                    Kaydı İncele
                  </span>

                  <span className="text-xl text-[#c9a66b] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
