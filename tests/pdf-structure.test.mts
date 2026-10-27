import test from "node:test";
import assert from "node:assert/strict";
import { parseText, structuredText, type TextLine } from "../lib/pdf/structure.ts";

test("unknown headings create distinct ordered sections; sources stay separate", () => {
  const result = parseText("## Cegerxwîn\nDoğum: 1903\n## Çocukluğu\nİlk paragraf.\n## Daha Önce Olmayan Başlık\nİkinci paragraf.\n## Kaynakça\n1. Yazar, Kitap.\n2. Arşiv.");
  assert.equal(result.name, "Cegerxwîn");
  assert.equal(result.birth, "1903");
  assert.deepEqual(result.biography, [{ title: "Çocukluğu", content: "İlk paragraf." }, { title: "Daha Önce Olmayan Başlık", content: "İkinci paragraf." }]);
  assert.equal(result.sources, "1. Yazar, Kitap.\n2. Arşiv.");
});

test("font size and bold identify headings without blank lines", () => {
  const line = (text: string, size: number, y: number, bold = false): TextLine => ({ text, size, y, bold, x: 40, page: 1 });
  const text = structuredText([[line("Azad Tekik", 24, 800), line("İlk Yıllar", 16, 770), line("Bu normal paragraf uzun bir metindir ve bölümün içinde kalmalıdır.", 12, 750), line("Eserleri", 12, 730, true), line("Kitapları hakkında ikinci bir paragraf burada yer alır.", 12, 710)]]);
  assert.deepEqual(parseText(text).biography.map(s => s.title), ["İlk Yıllar", "Eserleri"]);
});

test("long opening paragraph is preserved and not guessed as a name", () => {
  const paragraph = "Bu bir biyografi paragrafıdır ve adı bilinmeyen kişinin hayatını anlatır.";
  const result = parseText(paragraph + "\n## Yeni Bölüm\nMetin.");
  assert.equal(result.name, "");
  assert.equal(result.biography[0].content, paragraph);
});

test("repeated page furniture is removed without removing internal headings", () => {
  const pages = [1, 2, 3].map(page => [
    { text: "KURDNAME ARŞİVİ", size: 10, bold: false, x: 20, y: 800, page },
    { text: `Bölüm ${page}`, size: 16, bold: true, x: 20, y: 740, page },
    { text: "Uzun bir metin paragrafı bu bölümün içerisinde yer alır.", size: 12, bold: false, x: 20, y: 700, page },
    { text: String(page), size: 10, bold: false, x: 20, y: 20, page },
  ]);
  const text = structuredText(pages);
  assert.ok(!text.includes("KURDNAME ARŞİVİ"));
  assert.equal((text.match(/## Bölüm/g) || []).length, 3);
});
