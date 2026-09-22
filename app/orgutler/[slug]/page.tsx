"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { useParams } from "next/navigation";
import { database } from "@/lib/firebase";

type Organization = {
  id: string;
  slug: string;
  name: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  shortBio?: string;
  people?: string[];
  photos?: {
    imageUrl: string;
    caption?: string;
    source?: string;
  }[];
  biography?: {
    title: string;
    content: string;
  }[];
  sources?: string[];
};

export default function OrgutDetayPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [organization, setOrganization] =
    useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const organizationsRef = ref(
      database,
      "organizations"
    );

    const unsubscribe = onValue(
      organizationsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setOrganization(null);
          setLoading(false);
          return;
        }

        const found = Object.entries(data)
          .map(([id, value]: [string, any]) => ({
            id,
            ...value,
          }))
          .find(
            (item: Organization) =>
              item.slug === slug
          );

        setOrganization(found || null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] p-10 text-[#e8e3d8]">
        <p className="text-white/40">
          Yükleniyor...
        </p>
      </main>
    );
  }

  if (!organization) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] p-10 text-[#e8e3d8]">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-semibold">
            Kayıt bulunamadı
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#e8e3d8]">
      <div className="mx-auto max-w-5xl px-6 py-16">

        <header className="border-b border-white/10 pb-10">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">
            ÖRGÜTLER VE CEMİYETLER
          </p>

          <h1 className="text-4xl font-semibold md:text-6xl">
            {organization.name}
          </h1>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/50">
            {organization.startDate && (
              <span>
                Kuruluş: {organization.startDate}
              </span>
            )}

            {organization.endDate && (
              <span>
                Son dönem: {organization.endDate}
              </span>
            )}

            {organization.region && (
              <span>
                {organization.region}
              </span>
            )}
          </div>
        </header>

        {organization.shortBio && (
          <section className="border-b border-white/10 py-10">
            <p className="max-w-4xl text-lg leading-8 text-white/70">
              {organization.shortBio}
            </p>
          </section>
        )}

        {organization.photos &&
          organization.photos.length > 0 && (
            <section className="py-12">
              <h2 className="mb-8 text-2xl font-medium">
                Fotoğraflar
              </h2>

              <div className="space-y-12">
                {organization.photos.map(
                  (photo, index) => (
                    <figure key={index}>
                      <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                        <img
                          src={photo.imageUrl}
                          alt={
                            photo.caption ||
                            organization.name
                          }
                          className="max-h-[700px] w-full object-contain"
                        />
                      </div>

                      {photo.caption && (
                        <figcaption className="mt-3 text-sm text-white/60">
                          {photo.caption}
                        </figcaption>
                      )}

                      {photo.source && (
                        <p className="mt-1 text-xs text-white/35">
                          Kaynak: {photo.source}
                        </p>
                      )}
                    </figure>
                  )
                )}
              </div>
            </section>
          )}

        {organization.people &&
          organization.people.length > 0 && (
            <section className="border-t border-white/10 py-12">
              <h2 className="mb-6 text-2xl font-medium">
                Önemli Kişiler
              </h2>

              <div className="flex flex-wrap gap-2">
                {organization.people.map(
                  (person, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60"
                    >
                      {person}
                    </span>
                  )
                )}
              </div>
            </section>
          )}

        {organization.biography &&
          organization.biography.length > 0 && (
            <section className="border-t border-white/10 py-12">
              <h2 className="mb-10 text-2xl font-medium">
                Tarihçe
              </h2>

              <div className="space-y-12">
                {organization.biography.map(
                  (section, index) => (
                    <article key={index}>
                      <h3 className="mb-4 text-xl font-medium">
                        {section.title}
                      </h3>

                      <p className="whitespace-pre-line leading-8 text-white/65">
                        {section.content}
                      </p>
                    </article>
                  )
                )}
              </div>
            </section>
          )}

        {organization.sources &&
          organization.sources.length > 0 && (
            <section className="border-t border-white/10 py-12">
              <h2 className="mb-6 text-2xl font-medium">
                Kaynaklar
              </h2>

              <ol className="space-y-3">
                {organization.sources.map(
                  (source, index) => (
                    <li
                      key={index}
                      className="text-sm leading-6 text-white/50"
                    >
                      {index + 1}. {source}
                    </li>
                  )
                )}
              </ol>
            </section>
          )}

      </div>
    </main>
  );
}