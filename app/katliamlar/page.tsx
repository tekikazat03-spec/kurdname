import CategoryPage from "@/components/CategoryPage";

const content = {
  tr: {
    label: "KATEGORİ",
    title: "Katliamlar ve Kıyımlar",
    description:
      "Toplu şiddet, katliam, sürgün ve kıyım olaylarının arşivi.",
    empty: "Bu kategori için henüz kayıt eklenmedi.",
  },

  ku: {
    label: "KATEGORÎ",
    title: "Komkujî û Qirkirin",
    description:
      "Arşîva komkujî, qirkirin, sirgûn û bûyerên tundûtûjiyê.",
    empty: "Ji bo vê kategoriyê hîn tomar nehatine zêdekirin.",
  },

  en: {
    label: "CATEGORY",
    title: "Massacres and Atrocities",
    description:
      "An archive of massacres, forced displacement and mass violence.",
    empty: "No records have been added to this category yet.",
  },
};

export default function KatliamlarPage() {
  return <CategoryPage content={content} />;
}