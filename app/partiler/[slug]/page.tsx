import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const party = (await getParties()).find((item) => item.slug === decodeURIComponent(slug));
  if (!party) return { title: "Parti bulunamadı", robots: { index: false } };
  const description = (party.shortBio?.trim() || `${party.name} hakkında kuruluş, tarihçe, faaliyetler ve kaynaklar. KURDNAME dijital arşivi.`).slice(0, 160);
  const url = `/partiler/${encodeURIComponent(party.slug)}`;
  return { title: party.name, description, alternates: { canonical: url }, openGraph: { title: `${party.name} | KURDNAME`, description, url, type: "article" } };
}
import Link from "next/link";
import ArchiveMediaGallery from "@/components/ArchiveMediaGallery";
import { notFound } from "next/navigation";
import {
  asList,
  getParties,
  type Photo,
  type Section,
} from "@/lib/parties";

export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parties = await getParties();
  const party = parties.find((item) => item.slug === slug);

  if (!party) notFound();

  const photos = asList<Photo>(party.photos);
  const sections = asList<Section>(party.biography);
  const sources = asList<string>(party.sources);
  const people = asList<string>(party.people);

  return (
    <main className="min-h-screen bg-[#0b100e] text-[#e8e0cb]">
      <header className="border-b border-[#b99a5b]/20 px-6 py-7">
        <div className="mx-auto flex max-w-5xl justify-between gap-4">
          <Link
            href="/"
            className="font-semibold tracking-[0.25em] text-[#d6b875]"
          >
            KURDNAME
          </Link>

          <Link href="/partiler" className="text-sm text-[#b8ad94]">
            ← Partiler
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs tracking-[0.3em] text-[#c2a46a]">
          SİYASİ PARTİLER ARŞİVİ
        </p>

        <h1 className="mt-6 font-serif text-4xl text-[#f1e6cc] sm:text-6xl">
          {party.name}
        </h1>

        <div className="my-10 h-px w-24 bg-[#b99a5b]" />

        <div className="grid gap-5 text-sm text-[#b8b3a6] sm:grid-cols-2">
          {party.startDate && (
            <p><strong>Kuruluş:</strong> {party.startDate}</p>
          )}

          {party.endDate && (
            <p><strong>Sona Eriş:</strong> {party.endDate}</p>
          )}

          {party.region && (
            <p><strong>Merkez / Bölge:</strong> {party.region}</p>
          )}
        </div>

        {party.shortBio && (
          <p className="mt-12 whitespace-pre-line text-lg leading-9 text-[#e0d7c4]">
            {party.shortBio}
          </p>
        )}

        {photos.length > 0 && (
          <section className="mt-16 grid gap-6 sm:grid-cols-2">
            {photos.map((photo, index) => (
              <figure key={index}>
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || party.name}
                  className="w-full border border-[#b99a5b]/20 object-cover"
                />

                {photo.caption && (
                  <figcaption className="mt-3 text-sm text-[#b8b3a6]">
                    {photo.caption}
                  </figcaption>
                )}

                {photo.source && (
                  <p className="mt-1 text-xs text-[#8c8575]">
                    Kaynak: {photo.source}
                  </p>
                )}
              </figure>
            ))}
          </section>
        )}

        {people.length > 0 && (
          <section className="mt-16 border-t border-[#b99a5b]/20 pt-10">
            <h2 className="font-serif text-3xl text-[#e8d7b3]">
              Önemli Şahsiyetler
            </h2>

            <p className="mt-5 leading-8 text-[#b8b3a6]">
              {people.join(", ")}
            </p>
          </section>
        )}

        {sections.map((section, index) => (
          <section
            key={index}
            className="mt-16 border-t border-[#b99a5b]/20 pt-10"
          >
            <h2 className="font-serif text-3xl text-[#e8d7b3]">
              {section.title || `Bölüm ${index + 1}`}
            </h2>

            <p className="mt-6 whitespace-pre-line leading-9 text-[#b8b3a6]">
              {section.content}
            </p>
          </section>
        ))}

        {sources.length > 0 && (
          <section className="mt-16 border-t border-[#b99a5b]/20 pt-10">
            <h2 className="font-serif text-3xl text-[#e8d7b3]">
              Kaynaklar
            </h2>

            <ul className="mt-6 list-disc space-y-3 pl-6 text-sm leading-7 text-[#b8b3a6]">
              {sources.map((source, index) => (
                <li key={index}>{source}</li>
              ))}
            </ul>
          </section>
        )}
      </article>
      <ArchiveMediaGallery collection="parties" />
    </main>
  );
}
