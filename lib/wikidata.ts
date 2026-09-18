export type Person = {
  qid: string;
  name: string;
  description?: string;
  birth?: string;
  death?: string;
  birthPlace?: string;
  deathPlace?: string;
  occupation?: string;
  image?: string;
  wikipedia?: string;
  slug: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export { slugify };

type WikipediaPage = {
  pageid?: number;
  ns?: number;
  title?: string;
  pageprops?: {
    wikibase_item?: string;
  };
  original?: {
    source?: string;
  };
  fullurl?: string;
};

async function getWikipediaPeople(
  limit: number
): Promise<WikipediaPage[]> {
  const pages: WikipediaPage[] = [];

  let continuation = "";
  let requests = 0;

  while (
    pages.length < limit &&
    requests < 10
  ) {
    requests++;

    const params = new URLSearchParams({
      action: "query",
      generator: "categorymembers",
      gcmtitle: "Category:Kurdish_people",
      gcmtype: "page",
      gcmlimit: String(
        Math.min(100, limit - pages.length)
      ),
      prop: "pageprops|pageimages|info",
      ppprop: "wikibase_item",
      piprop: "original",
      inprop: "url",
      format: "json",
      origin: "*",
    });

    if (continuation) {
      params.set(
        "gcmcontinue",
        continuation
      );
    }

    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?${params.toString()}`,
      {
        headers: {
          "User-Agent":
            "KURDNAME/1.0 (Kurdish digital archive)",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.warn(
        `Wikipedia ${response.status}`
      );
      break;
    }

    const data = await response.json();

    const batch = Object.values(
      data?.query?.pages || {}
    ) as WikipediaPage[];

    for (const page of batch) {
      if (
        page.pageprops?.wikibase_item &&
        page.title
      ) {
        pages.push(page);
      }
    }

    continuation =
      data?.continue?.gcmcontinue || "";

    if (
      !continuation ||
      batch.length === 0
    ) {
      break;
    }
  }

  return pages;
}

export async function getPeople(
  limit = 300
): Promise<Person[]> {
  const safeLimit = Math.min(
    Math.max(limit, 1),
    500
  );

  const pages =
    await getWikipediaPeople(safeLimit);

  const unique = new Map<
    string,
    WikipediaPage
  >();

  for (const page of pages) {
    const qid =
      page.pageprops?.wikibase_item;

    if (!qid) continue;

    if (!unique.has(qid)) {
      unique.set(qid, page);
    }
  }

  const people: Person[] = [];

  for (const [qid, page] of unique) {
    if (people.length >= safeLimit) {
      break;
    }

    const name =
      page.title?.trim() || "";

    if (!name) continue;

    /*
      Kategori içinde yanlışlıkla bulunan
      liste/kurum/kategori benzeri sayfaları
      mümkün olduğunca çıkarıyoruz.
    */

    const lowerName =
      name.toLowerCase();

    if (
      lowerName.startsWith("list of ") ||
      lowerName.startsWith("category:") ||
      lowerName.includes("people by") ||
      lowerName.includes("kurdish people by")
    ) {
      continue;
    }

    people.push({
      qid,
      name,
      description:
        "Kürt tarihi, siyaseti, kültürü veya toplumu ile ilişkili kişi.",
      birth: "",
      death: "",
      birthPlace: "",
      deathPlace: "",
      occupation: "",
      image:
        page.original?.source || "",
      wikipedia:
        page.fullurl ||
        `https://en.wikipedia.org/wiki/${encodeURIComponent(
          name.replace(/ /g, "_")
        )}`,
      slug:
        `${slugify(name)}-${qid.toLowerCase()}`,
    });
  }

  return people;
}