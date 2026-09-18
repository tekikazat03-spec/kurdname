"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { type Language, languages } from "@/lib/i18n";

const languageList: Language[] = ["tr", "ku", "en"];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      {languageList.map((item) => (
        <button
          key={item}
          onClick={() => setLanguage(item)}
          className={`border px-3 py-1.5 text-xs transition ${
            language === item
              ? "border-white/30 bg-white/10 text-white"
              : "border-transparent text-white/40 hover:text-white"
          }`}
        >
          {languages[item]}
        </button>
      ))}
    </div>
  );
}