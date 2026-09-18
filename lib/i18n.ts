export type Language = "tr" | "ku" | "en";

export const languages = {
  tr: "Türkçe",
  ku: "Kurdî",
  en: "English",
} as const;

export const translations = {
  tr: {
    home: "Ana Sayfa",
    rebellions: "İsyanlar ve Hareketler",
    massacres: "Katliamlar ve Kıyımlar",
    organizations: "Örgütler ve Cemiyetler",
    writers: "Yazarlar ve Şairler",
    politicians: "Siyasetçiler ve Aydınlar",
    people: "Kişiler",
    search: "Ara",
    archive: "KURDNAME ARŞİVİ",
    readMore: "Devamını Oku",
    noRecords: "Henüz kayıt eklenmedi.",
  },

  ku: {
    home: "Malpera Destpêkê",
    rebellions: "Serhildan û Tevger",
    massacres: "Komkujî û Qirkirin",
    organizations: "Rêxistin û Civak",
    writers: "Nivîskar û Helbestvan",
    politicians: "Siyasetmedar û Rewşenbîr",
    people: "Kesayetî",
    search: "Lêgerîn",
    archive: "ARŞÎVA KURDNAME",
    readMore: "Bêtir Bixwîne",
    noRecords: "Hîn tomar tune ye.",
  },

  en: {
    home: "Home",
    rebellions: "Rebellions and Movements",
    massacres: "Massacres and Atrocities",
    organizations: "Organizations and Societies",
    writers: "Writers and Poets",
    politicians: "Politicians and Intellectuals",
    people: "People",
    search: "Search",
    archive: "KURDNAME ARCHIVE",
    readMore: "Read More",
    noRecords: "No records have been added yet.",
  },
} as const;

export function getTranslation(
  language: Language,
  key: keyof typeof translations.tr
) {
  return translations[language][key];
}