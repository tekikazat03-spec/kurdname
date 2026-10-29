import records from "@/data/imported-biographies.json";

export type BiographySection = { title?: string; content?: string };
export type ImportedPerson = {
  id: string;
  name: string;
  slug: string;
  birth?: string;
  death?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  shortBio?: string;
  biography?: BiographySection[];
  sources?: string[];
  aliases: string[];
  originalFileName: string;
  sourceKind: string;
  importedAt: string;
  importFormatVersion: number;
  legacyBiographyHash: string;
};

export const importedPeople: ImportedPerson[] = records as ImportedPerson[];


function legacyHash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function containsOriginalUnstructuredText(
  current: { biography?: BiographySection[] },
  imported: ImportedPerson
): boolean {
  if (!Array.isArray(current.biography) || current.biography.length !== 1) return false;
  const body = current.biography[0]?.content;
  return typeof body === "string" && legacyHash(body) === imported.legacyBiographyHash;
}

function normalizeName(input: string): string {
  return input
    .toLocaleLowerCase("tr")
    .replace(/[ıî]/g, "i")
    .replace(/[êé]/g, "e")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function matches(person: { slug: string; name: string }, record: ImportedPerson): boolean {
  const keys = [record.slug, record.name, ...record.aliases].map(normalizeName);
  return keys.includes(normalizeName(person.slug)) || keys.includes(normalizeName(person.name));
}

export function findImportedPerson(slugOrName: string): ImportedPerson | null {
  const key = normalizeName(slugOrName);
  return importedPeople.find((person) =>
    [person.slug, person.name, ...person.aliases].some((value) => normalizeName(value) === key)
  ) || null;
}

export function mergeImportedPeople<T extends { id: string; slug: string; name: string }>(remote: T[]): T[] {
  const result = [...remote];
  for (const person of importedPeople) {
    if (!result.some((entry) => matches(entry, person))) {
      result.push(person as unknown as T);
    }
  }
  return result;
}

export function mergeImportedPerson<T extends {
  id: string;
  slug: string;
  name: string;
  biography?: BiographySection[];
  shortBio?: string;
  sources?: string[];
}>(remote: T | null, requestedSlug: string): T | null {
  const imported = importedPeople.find((person) =>
    normalizeName(person.slug) === normalizeName(requestedSlug) ||
    (remote !== null && matches(remote, person))
  );
  if (!imported) return remote;
  if (!remote) return imported as unknown as T;
  const legacyBiography = containsOriginalUnstructuredText(remote, imported);
  const existingBiography = !legacyBiography && Array.isArray(remote.biography) &&
    remote.biography.some((section) => typeof section.content === "string" && section.content.trim().length > 0);
  return {
    ...imported,
    ...remote,
    biography: existingBiography ? remote.biography : imported.biography,
    shortBio: remote.shortBio?.trim() ? remote.shortBio : imported.shortBio,
    sources: Array.isArray(remote.sources) && remote.sources.length ? remote.sources : imported.sources,
  } as T;
}
