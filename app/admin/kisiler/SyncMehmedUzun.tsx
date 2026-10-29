"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { get, ref, runTransaction, update } from "firebase/database";

import { ADMIN_UID } from "@/lib/admin";
import { auth, database } from "@/lib/firebase";
import mehmedUzun from "@/data/mehmed-uzun.json";

type StoredPerson = {
  name?: string;
  slug?: string;
  shortBio?: string;
  biography?: Array<{ title?: string; content?: string }>;
  sources?: string[];
  imageUrl?: string;
};

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .replace(/[ıî]/g, "i")
    .replace(/[êé]/g, "e")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * One-time, admin-only migration. The published biography is immediately visible
 * through the archive fallback, but admins need a native Firebase record to edit it.
 * Never replace existing editorial content or create a duplicate person.
 */
export default function SyncMehmedUzun() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const synchronize = async () => {
      try {
        await auth.authStateReady();
        if (!active || auth.currentUser?.uid !== ADMIN_UID) return;
        if (active) setStatus("syncing");
        await auth.currentUser.getIdToken();

        const peopleRef = ref(database, "people");
        const snapshot = await get(peopleRef);
        const entries = snapshot.exists()
          ? Object.entries(snapshot.val() as Record<string, StoredPerson>)
          : [];
        const matched = entries.find(([, person]) =>
          normalize(person?.slug || "") === normalize(mehmedUzun.slug) ||
          normalize(person?.name || "") === normalize(mehmedUzun.name)
        );

        if (matched) {
          // Keep any existing text written by the admin; only fill empty fields.
          const [firebaseId, person] = matched;
          const missing: Partial<StoredPerson> = {};
          if (!person.shortBio?.trim()) missing.shortBio = mehmedUzun.shortBio;
          if (!Array.isArray(person.biography) || !person.biography.some((s) => s.content?.trim())) {
            missing.biography = mehmedUzun.biography;
          }
          if (!Array.isArray(person.sources) || person.sources.length === 0) {
            missing.sources = mehmedUzun.sources;
          }
          if (!person.imageUrl?.trim()) missing.imageUrl = mehmedUzun.imageUrl;
          if (Object.keys(missing).length) {
            await update(ref(database, `people/${firebaseId}`), missing);
          }
        } else {
          const target = ref(database, `people/${mehmedUzun.id}`);
          await runTransaction(
            target,
            (current: StoredPerson | null) => current ?? {
              ...mehmedUzun,
              category: "Şahsiyetler",
              createdAt: new Date().toISOString(),
            },
            { applyLocally: false }
          );
        }

        if (active) {
          setStatus("done");
          router.refresh();
        }
      } catch (error) {
        console.error("Mehmed Uzun Firebase kaydı eşitlenemedi:", error);
        if (active) {
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : "Bilinmeyen hata");
        }
      }
    };

    void synchronize();
    return () => { active = false; };
  }, [router]);

  if (status === "idle" || status === "done") return null;

  return (
    <p role="status" className={`mt-4 text-xs ${status === "error" ? "text-red-300" : "text-[#c9b78d]"}`}>
      {status === "syncing"
        ? "Mehmed Uzun kaydı yönetim veritabanıyla eşitleniyor..."
        : `Mehmed Uzun veritabanına eklenemedi: ${errorMessage}`}
    </p>
  );
}
