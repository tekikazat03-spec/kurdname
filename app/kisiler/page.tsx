import CategoryPage from "@/components/CategoryPage";

const content = {
  tr: {
    label: "KATEGORİ",
    title: "Kişiler",
    description:
      "KURDNAME kişi arşivi.",
    empty: "Henüz kişi eklenmedi.",
  },

  ku: {
    label: "KATEGORÎ",
    title: "Kesayetî",
    description:
      "Arşîva kesayetiyên KURDNAME.",
    empty: "Hîn kesayetî nehatine zêdekirin.",
  },

  en: {
    label: "CATEGORY",
    title: "People",
    description:
      "The KURDNAME people archive.",
    empty: "No people have been added yet.",
  },
};

export default function KisilerPage() {
  return <CategoryPage content={content} />;
}