import CategoryPage from "@/components/CategoryPage";

const content = {
  tr: {
    label: "KATEGORİ",
    title: "Örgütler ve Cemiyetler",
    description:
      "Siyasi, kültürel ve askerî örgütler ile cemiyetlerin arşivi.",
    empty: "Bu kategori için henüz kayıt eklenmedi.",
  },

  ku: {
    label: "KATEGORÎ",
    title: "Rêxistin û Civak",
    description:
      "Arşîva rêxistin û civakên siyasî, çandî û leşkerî.",
    empty: "Ji bo vê kategoriyê hîn tomar nehatine zêdekirin.",
  },

  en: {
    label: "CATEGORY",
    title: "Organizations and Societies",
    description:
      "An archive of political, cultural and military organizations and societies.",
    empty: "No records have been added to this category yet.",
  },
};

export default function OrgutlerPage() {
  return <CategoryPage content={content} />;
}