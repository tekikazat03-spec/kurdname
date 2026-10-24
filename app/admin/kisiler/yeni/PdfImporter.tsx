"use client";

import { useState } from "react";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";
import type { Worker } from "tesseract.js";

type Section = {
  title: string;
  content: string;
};

type ImportedPerson = {
  name: string;
  birth: string;
  death: string;
  biography: Section[];
  sources: string;
};

type Props = {
  onImport: (person: ImportedPerson) => void;
  disabled?: boolean;
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim();
}

function cleanHeading(value: string) {
  return value
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\*\*(.*?)\*\*$/, "$1")
    .trim();
}

function isSourcesHeading(value: string) {
  const heading = normalize(
    cleanHeading(value)
      .replace(/^\d+[.)]\s*/, "")
      .replace(/:$/, "")
  );

  return [
    "kaynakca",
    "kaynaklar",
    "kaynakca ve notlar",
    "kaynaklar ve notlar",
    "bibliyografya",
    "references",
    "bibliography",
  ].includes(heading);
}

function parseText(text: string): ImportedPerson {
  const lines = text.replace(/\r/g, "").split("\n");
  const firstLine = lines.find((line) => line.trim()) ?? "";
  const sourceIndex = lines.findIndex(isSourcesHeading);
  const body = sourceIndex >= 0 ? lines.slice(0, sourceIndex) : lines;
  const sources =
    sourceIndex >= 0
      ? lines.slice(sourceIndex + 1).join("\n").trim()
      : "";

  function readField(labels: string[]) {
    for (const line of body) {
      const colon = line.indexOf(":");
      if (colon < 0) continue;

      const label = normalize(
        line.slice(0, colon).replace(/\*\*/g, "")
      );

      if (labels.includes(label)) {
        return line.slice(colon + 1).replace(/^\*\*/, "").trim();
      }
    }
    return "";
  }

  const biography: Section[] = [];
  let current: Section = { title: "Biyografi", content: "" };

  function flush() {
    if (current.content.trim() || current.title !== "Biyografi") {
      biography.push({
        title: current.title.trim(),
        content: current.content.trim(),
      });
    }
  }

  for (let i = 0; i < body.length; i++) {
    const raw = body[i];
    const line = raw.trim();

    const beforeBlank = i > 0 && !body[i - 1].trim();
    const afterBlank = i + 1 < body.length && !body[i + 1].trim();

    const explicitHeading =
      /^#{1,6}\s+\S/.test(line) ||
      /^\*\*[^*]+\*\*$/.test(line) ||
      /^\d+[.)]\s+\S/.test(line);

    const isolatedHeading =
      beforeBlank &&
      afterBlank &&
      line.length > 2 &&
      line.length <= 90 &&
      !/[.!?;:,]$/.test(line) &&
      !line.includes(":") &&
      !/^[•\-–]/.test(line);

    if (
      i > 0 &&
      line.length <= 140 &&
      (explicitHeading || isolatedHeading)
    ) {
      flush();
      current = { title: cleanHeading(line), content: "" };
    } else {
      current.content += `${raw}\n`;
    }
  }

  flush();

  return {
    name: cleanHeading(firstLine),
    birth: readField(["dogum", "dogum tarihi"]),
    death: readField(["olum", "olum tarihi"]),
    biography:
      biography.length > 0
        ? biography
        : [{ title: "Biyografi", content: body.join("\n").trim() }],
    sources,
  };
}

export default function PdfImporter({
  onImport,
  disabled = false,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [forceOcr, setForceOcr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function readPdf() {
    if (!file || busy || disabled) return;

    setError("");
    setNotice("");
    setText("");
    setBusy(true);

    let task: PDFDocumentLoadingTask | undefined;
    let worker: Worker | undefined;
    let currentPage = 0;
    const emptyPages: number[] = [];

    try {
      if (file.size > 30 * 1024 * 1024) {
        throw new Error("PDF en fazla 30 MB olabilir.");
      }

      setProgress("PDF açılıyor...");

      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc =
        "/pdf/pdf.worker.min.mjs";

      task = pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
      });

      const pdf = await task.promise;

      if (pdf.numPages > 40) {
        throw new Error(
          "Bir seferde en fazla 40 sayfalık PDF yükleyebilirsin."
        );
      }

      const pages: string[] = [];

      for (let number = 1; number <= pdf.numPages; number++) {
        currentPage = number;
        setProgress(`Sayfa ${number}/${pdf.numPages} okunuyor...`);

        const page = await pdf.getPage(number);
        const content = await page.getTextContent();

        let pageText = "";
        let previousY: number | undefined;

        for (const item of content.items) {
          if (!("str" in item)) continue;

          const y = item.transform[5];
          const height = Math.max(Math.abs(item.height), 1);

          if (
            previousY !== undefined &&
            Math.abs(y - previousY) > height * 0.6
          ) {
            pageText +=
              Math.abs(y - previousY) > height * 1.8
                ? "\n\n"
                : "\n";
          }

          pageText += item.str;
          pageText += item.hasEOL ? "\n" : " ";
          previousY = y;
        }

        if (forceOcr || pageText.replace(/\s/g, "").length < 30) {
          if (!worker) {
            setProgress(
              "Görüntüden okuma hazırlanıyor. İlk açılış biraz sürebilir..."
            );

            const { createWorker } = await import("tesseract.js");

            worker = await createWorker("tur+eng", 1, {
              logger: (message) => {
                if (message.status === "recognizing text") {
                  setProgress(
                    `Sayfa ${currentPage}/${pdf.numPages}: ` +
                    `%${Math.round(message.progress * 100)}`
                  );
                }
              },
            });
          }

          const original = page.getViewport({ scale: 1 });
          const scale = Math.min(
            3,
            2400 / Math.max(original.width, original.height)
          );
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);

          const context = canvas.getContext("2d");
          if (!context) {
            throw new Error("Sayfa görüntüsü oluşturulamadı.");
          }

          try {
            await page.render({
              canvas,
              canvasContext: context,
              viewport,
              background: "white",
            }).promise;

            const result = await worker.recognize(canvas);
            pageText = result.data.text;
          } finally {
            canvas.width = 0;
            canvas.height = 0;
          }
        }

        if (!pageText.trim()) emptyPages.push(number);

        pages.push(pageText.trim());
        page.cleanup();
      }

      const result = pages.join("\n\n").trim();

      if (!result) {
        throw new Error(
          "PDF'den yazı okunamadı. Daha net bir dosya kullan."
        );
      }

      setText(result);
      setProgress("Okuma tamamlandı.");

      if (emptyPages.length) {
        setNotice(
          `Metin okunamayan sayfalar: ${emptyPages.join(", ")}. ` +
          "Bunlar boş sayfa değilse aktarım öncesinde kontrol et."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "PDF okunamadı."
      );
      setProgress("");
    } finally {
      try {
        await worker?.terminate();
      } catch {
        // Okuma sonucunu koru.
      }

      try {
        await task?.destroy();
      } catch {
        // Okuma sonucunu koru.
      }

      setBusy(false);
    }
  }

  function applyImport() {
    if (!text.trim() || busy || disabled) return;

    if (
      !window.confirm(
        "Ad, doğum, ölüm, biyografi ve kaynaklar alanları " +
        "bu metinden oluşturulan taslakla değiştirilecek. Devam edilsin mi?"
      )
    ) return;

    onImport(parseText(text));

    setNotice(
      "Taslak forma aktarıldı. Başlıkları, tarihleri ve özel isimleri " +
      "kontrol et. Henüz siteye kaydedilmedi."
    );
  }

  const buttonClass =
    "border border-white/20 px-5 py-3 text-sm text-white " +
    "hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <section className="border border-[#b99a5b]/40 bg-[#151710] p-6 md:p-8">
      <h2 className="text-xl text-[#e3c88e]">PDF’den Doldur</h2>

      <p className="mt-3 text-sm leading-6 text-white/60">
        PDF’yi seç, metni oku ve kontrol ederek forma aktar.
        Görüntü olan sayfaların okunması birkaç dakika sürebilir.
      </p>

      <input
        type="file"
        accept=".pdf,application/pdf"
        disabled={busy || disabled}
        className="mt-6 block w-full text-sm text-white/70"
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
          setText("");
          setError("");
          setNotice("");
          setProgress("");
        }}
      />

      <label className="mt-5 flex items-center gap-3 text-sm text-white/60">
        <input
          type="checkbox"
          checked={forceOcr}
          disabled={busy || disabled}
          onChange={(event) => setForceOcr(event.target.checked)}
        />
        Tüm sayfaları görüntüden oku. Eksik metin çıkarsa kullan.
      </label>

      <button
        type="button"
        onClick={readPdf}
        disabled={!file || busy || disabled}
        className={`${buttonClass} mt-5`}
      >
        {busy ? "PDF okunuyor..." : "PDF’yi Oku"}
      </button>

      <p role="status" className="mt-4 text-sm text-[#e3c88e]">
        {progress}
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}

      {notice && (
        <p role="status" className="mt-4 text-sm leading-6 text-amber-200">
          {notice}
        </p>
      )}

      {text && (
        <div className="mt-6">
          <label htmlFor="pdf-text" className="text-sm text-white">
            Okunan metin
          </label>

          <p className="mt-2 text-xs leading-6 text-white/50">
            Yazım hatalarını burada düzeltebilirsin.
            Bölüm başlığı anlaşılmadıysa satırın başına ## koy.
            Kaynakça başlığı ayrı bir satırda olsun.
            Kısa biyografi ve etiketleri formda kendin doldur.
          </p>

          <textarea
            id="pdf-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={busy || disabled}
            rows={16}
            className="mt-3 w-full border border-white/15 bg-black/30 p-4 text-sm leading-7 text-white outline-none"
          />

          <button
            type="button"
            onClick={applyImport}
            disabled={busy || disabled || !text.trim()}
            className={`${buttonClass} mt-4`}
          >
            Metni Forma Aktar
          </button>
        </div>
      )}
    </section>
  );
}