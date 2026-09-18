import CategoryPage from "@/components/CategoryPage";

const content = {
  tr: {
    label: "KATEGORİ",
    title: "İsyanlar ve Hareketler",
    description:
      "Kürdistan tarihindeki isyanlar, ayaklanmalar ve siyasi hareketlerin arşivi.",
    empty: "Bu kategori için henüz kayıt eklenmedi.",
  },

  ku: {
    label: "KATEGORÎ",
    title: "Serhildan û Tevger",
    description:
      "Arşîva serhildan, tevger û bûyerên siyasî di dîroka Kurdistanê de.",
    empty: "Ji bo vê kategoriyê hîn tomar nehatine zêdekirin.",
  },

  en: {
    label: "CATEGORY",
    title: "Rebellions and Movements",
    description:
      "An archive of rebellions, uprisings and political movements in the history of Kurdistan.",
    empty: "No records have been added to this category yet.",
  },
};

export default function IsyanlarPage() {
  return <CategoryPage content={content} />;
}