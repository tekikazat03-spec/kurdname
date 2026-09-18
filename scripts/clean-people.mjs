import fs from "fs";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "data",
  "people.json"
);

const data = JSON.parse(
  fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")
);

const before = data.people.length;

data.people = data.people
  .filter((person) => {
    if (!person) return false;
    if (!person.qid) return false;
    if (!person.name) return false;

    // Q123456 şeklindeki sahte isimleri kaldır
    if (/^Q\d+$/i.test(person.name.trim())) {
      return false;
    }

    return true;
  })
  .map((person) => ({
    ...person,
    image: "/placeholder-person.svg"
  }));

fs.writeFileSync(
  filePath,
  JSON.stringify(data, null, 2),
  "utf8"
);

console.log("");
console.log("KURDNAME TEMİZLİK");
console.log("==========================");
console.log("Önce:", before);
console.log("Sonra:", data.people.length);
console.log("Silinen:", before - data.people.length);
console.log("==========================");
console.log("");