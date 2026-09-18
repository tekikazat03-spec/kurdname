import CategoryPage from "@/components/CategoryPage";

const content = {
  tr: {
    label: "KATEGORİ",
    title: "Yazarlar ve Şairler",
    description:
      "Kürt edebiyatının yazarları, şairleri ve yayıncılarının arşivi.",
    empty: "Bu kategori için henüz kayıt eklenmedi.",
  },

  ku: {
    label: "KATEGORÎ",
    title: "Nivîskar û Helbestvan",
    description:
      "Arşîva nivîskar, helbestvan û weşangerên edebiyata Kurdî.",
    empty: "Ji bo vê kategoriyê hîn tomar nehatine zêdekirin.",
  },

  en: {
    label: "CATEGORY",
    title: "Writers and Poets",
    description:
      "An archive of Kurdish writers, poets and publishers.",
    empty: "No records have been added to this category yet.",
  },
};

export default function YazarlarPage() {
  return <CategoryPage content={content} />;
}