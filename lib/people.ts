import fs from "fs";
import path from "path";

export type Person = {
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

type PeopleFile = {
  people: Person[];
};

const filePath = path.join(
  process.cwd(),
  "data",
  "people.json"
);

function readData(): PeopleFile {
  try {
    if (!fs.existsSync(filePath)) {
      return { people: [] };
    }

    const file = fs.readFileSync(filePath, "utf8");

    if (!file.trim()) {
      return { people: [] };
    }

    const cleanFile = file.replace(/^\uFEFF/, "");

    const data = JSON.parse(cleanFile);

    if (
      !data ||
      typeof data !== "object" ||
      !Array.isArray(data.people)
    ) {
      return { people: [] };
    }

    return {
      people: data.people
    };
  } catch (error) {
    console.error(
      "KURDNAME PEOPLE READ ERROR:",
      error
    );

    return { people: [] };
  }
}

function writeData(data: PeopleFile): void {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

export function getPeople(): Person[] {
  return readData().people;
}

export function getPersonByQid(
  qid: string
): Person | null {
  const people = getPeople();

  return (
    people.find(
      (person) => person.qid === qid
    ) || null
  );
}

export function getPersonBySlug(
  slug: string
): Person | null {
  const people = getPeople();

  return (
    people.find(
      (person) => person.slug === slug
    ) || null
  );
}

export function deletePerson(
  qid: string
): boolean {
  const data = readData();

  const before = data.people.length;

  data.people = data.people.filter(
    (person) => person.qid !== qid
  );

  if (data.people.length === before) {
    return false;
  }

  writeData(data);

  return true;
}
