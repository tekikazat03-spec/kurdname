import CategoryPage from "@/components/CategoryPage";

const content = {
  tr: {
    label: "KATEGORİ",
    title: "Siyasetçiler ve Aydınlar",
    description:
      "Siyasi ve entelektüel yaşamda yer alan kişilerin arşivi.",
    empty: "Bu kategori için henüz kayıt eklenmedi.",
  },

  ku: {
    label: "KATEGORÎ",
    title: "Siyasetmedar û Rewşenbîr",
    description:
      "Arşîva kesayetiyên ku di jiyana siyasî û rewşenbîrî de cih girtine.",
    empty: "Ji bo vê kategoriyê hîn tomar nehatine zêdekirin.",
  },

  en: {
    label: "CATEGORY",
    title: "Politicians and Intellectuals",
    description:
      "An archive of people involved in political and intellectual life.",
    empty: "No records have been added to this category yet.",
  },
};

export default function SiyasetcilerPage() {
  return <CategoryPage content={content} />;
}