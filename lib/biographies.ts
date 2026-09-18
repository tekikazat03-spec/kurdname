import fs from "fs";
import path from "path";

type BiographyRecord =
  | string
  | {
      qid?: string;
      biography?: string;
      updatedAt?: string;
    };

type BiographyData = {
  people: Record<string, BiographyRecord>;
};

const filePath = path.join(
  process.cwd(),
  "data",
  "biographies.json"
);

function readData(): BiographyData {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        people: {}
      };
    }

    const file = fs.readFileSync(filePath, "utf-8");

    if (!file.trim()) {
      return {
        people: {}
      };
    }

    const data = JSON.parse(file);

    return {
      people: data.people || {}
    };
  } catch (error) {
    console.error("KURDNAME BIOGRAPHY READ ERROR:", error);

    return {
      people: {}
    };
  }
}

export function getBiography(qid: string): string {
  const data = readData();
  const record = data.people[qid];

  if (!record) {
    return "";
  }

  if (typeof record === "string") {
    return record;
  }

  if (
    typeof record === "object" &&
    typeof record.biography === "string"
  ) {
    return record.biography;
  }

  return "";
}

export function saveBiography(
  qid: string,
  biography: string
): void {
  const data = readData();

  data.people[qid] = {
    qid,
    biography,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}
