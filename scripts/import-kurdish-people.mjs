import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PEOPLE_FILE = path.join(ROOT, "data", "people.json");
const TARGET_COUNT = 1000;

const ENDPOINT = "https://query.wikidata.org/sparql";

const queries = [
  `
  SELECT DISTINCT ?item ?itemLabel ?birth ?death ?occupationLabel ?birthPlaceLabel WHERE {
    ?item wdt:P31 wd:Q5.
    ?item wdt:P172 wd:Q12223.
    OPTIONAL { ?item wdt:P569 ?birth. }
    OPTIONAL { ?item wdt:P570 ?death. }
    OPTIONAL { ?item wdt:P106 ?occupation. }
    OPTIONAL { ?item wdt:P19 ?birthPlace. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "ku,tr,en". }
  }
  LIMIT 2000
  `,

  `
  SELECT DISTINCT ?item ?itemLabel ?birth ?death ?occupationLabel ?birthPlaceLabel WHERE {
    ?item wdt:P31 wd:Q5.
    ?item wdt:P27 wd:Q796.
    OPTIONAL { ?item wdt:P569 ?birth. }
    OPTIONAL { ?item wdt:P570 ?death. }
    OPTIONAL { ?item wdt:P106 ?occupation. }
    OPTIONAL { ?item wdt:P19 ?birthPlace. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "ku,tr,en". }
  }
  LIMIT 2000
  `,

  `
  SELECT DISTINCT ?item ?itemLabel ?birth ?death ?occupationLabel ?birthPlaceLabel WHERE {
    ?item wdt:P31 wd:Q5.
    ?item wdt:P19 ?birthPlace.
    ?birthPlace wdt:P131* ?region.
    VALUES ?region {
      wd:Q200514
      wd:Q197720
      wd:Q192814
      wd:Q207008
      wd:Q200060
      wd:Q193117
    }
    OPTIONAL { ?item wdt:P569 ?birth. }
    OPTIONAL { ?item wdt:P570 ?death. }
    OPTIONAL { ?item wdt:P106 ?occupation. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "ku,tr,en". }
  }
  LIMIT 2000
  `,

  `
  SELECT DISTINCT ?item ?itemLabel ?birth ?death ?occupationLabel ?birthPlaceLabel WHERE {
    ?item wdt:P31 wd:Q5.
    ?item wdt:P106 ?occupation.
    VALUES ?occupation {
      wd:Q49757
      wd:Q36180
      wd:Q6625963
      wd:Q82955
      wd:Q1930187
      wd:Q2526255
      wd:Q1598262
      wd:Q1650915
      wd:Q482980
      wd:Q3665646
      wd:Q37226
      wd:Q201788
    }
    OPTIONAL { ?item wdt:P569 ?birth. }
    OPTIONAL { ?item wdt:P570 ?death. }
    OPTIONAL { ?item wdt:P19 ?birthPlace. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "ku,tr,en". }
  }
  LIMIT 3000
  `
];

function clean(value) {
  if (!value) return "";

  return value
    .replace(/\s+/g, " ")
    .trim();
}

function year(value) {
  if (!value) return "";

  const match = value.match(/^([+-]?\d{1,6})-/);

  if (!match) return "";

  return match[1].replace("+", "");
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ş/gi, "s")
    .replace(/ğ/gi, "g")
    .replace(/ı/gi, "i")
    .replace(/ö/gi, "o")
    .replace(/ü/gi, "u")
    .replace(/ç/gi, "c")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function getValue(row, key) {
  return row?.[key]?.value || "";
}

async function runQuery(query, index) {
  console.log(`Sorgu ${index + 1}/${queries.length} çalışıyor...`);

  const url =
    ENDPOINT +
    "?query=" +
    encodeURIComponent(query) +
    "&format=json";

  const response = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent":
        "KURDNAME/1.0 Kurdish digital archive"
    }
  });

  if (!response.ok) {
    throw new Error(
      `Wikidata ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();

  const results = data.results?.bindings || [];

  console.log(`  ${results.length} sonuç bulundu.`);

  return results;
}

function makePerson(row) {
  const itemUrl = getValue(row, "item");
  const qid = itemUrl.split("/").pop();

  const name = clean(getValue(row, "itemLabel"));

  if (!qid || !name) return null;

  // Wikidata bazı durumlarda etiketi QID olarak döndürebilir.
  if (/^Q\d+$/i.test(name)) {
    return null;
  }

  return {
    qid,
    slug: slugify(name) || qid.toLowerCase(),
    name,
    birth: year(getValue(row, "birth")),
    death: year(getValue(row, "death")),
    profession:
      clean(getValue(row, "occupationLabel")) ||
      "Kürt şahsiyet",
    places: clean(getValue(row, "birthPlaceLabel")),
    category: "Diğer",
    image: "/placeholder-person.svg"
  };
}

function deduplicate(people) {
  const map = new Map();

  for (const person of people) {
    if (!person?.qid) continue;

    if (!map.has(person.qid)) {
      map.set(person.qid, person);
    }
  }

  return Array.from(map.values());
}

function makeUniqueSlugs(people) {
  const used = new Map();

  return people.map((person) => {
    const base =
      person.slug ||
      person.qid.toLowerCase();

    const count = used.get(base) || 0;

    used.set(base, count + 1);

    return {
      ...person,
      slug:
        count === 0
          ? base
          : `${base}-${count + 1}`
    };
  });
}

async function main() {
  console.log("");
  console.log("=================================");
  console.log("       KURDNAME ARŞİV İMPORT");
  console.log("=================================");
  console.log("");

  if (!fs.existsSync(PEOPLE_FILE)) {
    throw new Error(
      "data/people.json bulunamadı."
    );
  }

  const oldData = JSON.parse(
    fs
      .readFileSync(PEOPLE_FILE, "utf8")
      .replace(/^\uFEFF/, "")
  );

  const oldPeople = Array.isArray(oldData.people)
    ? oldData.people
    : [];

  console.log(
    `Mevcut kayıt: ${oldPeople.length}`
  );

  let allRows = [];

  for (let i = 0; i < queries.length; i++) {
    try {
      const rows = await runQuery(
        queries[i],
        i
      );

      allRows.push(...rows);

      // Wikidata'yı gereksiz yere zorlamamak için
      // sorgular arasında kısa bekleme.
      if (i < queries.length - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2500)
        );
      }
    } catch (error) {
      console.log(
        `  Sorgu ${i + 1} başarısız: ${error.message}`
      );
    }
  }

  console.log("");
  console.log(
    `Toplam ham sonuç: ${allRows.length}`
  );

  const imported = allRows
    .map(makePerson)
    .filter(Boolean);

  const combined = deduplicate([
    ...oldPeople,
    ...imported
  ]);

  console.log(
    `Tekilleştirilmiş toplam: ${combined.length}`
  );

  const finalPeople = makeUniqueSlugs(
    combined
  ).slice(0, TARGET_COUNT);

  fs.writeFileSync(
    PEOPLE_FILE,
    JSON.stringify(
      {
        people: finalPeople
      },
      null,
      2
    ),
    "utf8"
  );

  console.log("");
  console.log("=================================");
  console.log("       İMPORT TAMAMLANDI");
  console.log("=================================");
  console.log(
    `Eski kayıt: ${oldPeople.length}`
  );
  console.log(
    `Yeni toplam: ${finalPeople.length}`
  );
  console.log(
    `Eksik: ${Math.max(
      0,
      TARGET_COUNT - finalPeople.length
    )}`
  );
  console.log("");
  console.log(
    `Dosya: ${PEOPLE_FILE}`
  );
  console.log("");

  if (finalPeople.length >= TARGET_COUNT) {
    console.log(
      "🔥 KURDNAME 1000 KİŞİLİK ARŞİVE ULAŞTI."
    );
  } else {
    console.log(
      `⚠️ Şimdilik ${finalPeople.length} gerçek kayıt bulundu.`
    );
    console.log(
      "Bir sonraki aşamada farklı kaynaklarla genişletebiliriz."
    );
  }

  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error(
    "KURDNAME İMPORT HATASI:"
  );
  console.error(error);
  console.error("");
  process.exit(1);
});