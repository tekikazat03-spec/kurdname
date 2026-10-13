export type Photo = {
  imageUrl: string;
  caption?: string;
  source?: string;
};

export type Section = {
  title: string;
  content: string;
};

export type Party = {
  id: string;
  slug: string;
  name: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  shortBio?: string;
  people?: string[];
  photos?: Photo[];
  biography?: Section[];
  sources?: string[];
};

export function asList<T>(
  value: T[] | Record<string, T> | null | undefined
): T[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    return Object.values(value);
  }
  return [];
}

export async function getParties(): Promise<Party[]> {
  try {
    const response = await fetch(
      "https://kurdname-7ba60-default-rtdb.firebaseio.com/parties.json",
      { cache: "no-store" }
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (!data || typeof data !== "object") return [];

    return Object.entries(data).map(([id, value]) => ({
      ...(value as Omit<Party, "id">),
      id,
    }));
  } catch (error) {
    console.error("Partiler alınamadı:", error);
    return [];
  }
}
