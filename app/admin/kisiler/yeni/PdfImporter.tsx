"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";
import type { Worker } from "tesseract.js";

import { parseText, structuredText, type TextLine } from "@/lib/pdf/structure";
import { extractPhotos, type PdfPhoto } from "@/lib/pdf/images";

type Props = {
  onImport: (person: ReturnType<typeof parseText> & { photos: PdfPhoto[] }) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
};

async function within<T>(promise: Promise<T>, milliseconds: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(label + " zaman aşımına uğradı. Yeniden deneyebilirsin.")), milliseconds); })]);
  } finally { clearTimeout(timer); }
}

export default function PdfImporter({
  onImport,
  disabled = false,
  onBusyChange,
}: Props) {
  const cancelRead = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelRead.current?.(), []);
  const [photos, setPhotos] = useState<PdfPhoto[]>([]);
  const [applied, setApplied] = useState(false);
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
    onBusyChange?.(true);
    setPhotos([]);
    setApplied(false);

    let cancelled = false;
    cancelRead.current = () => { cancelled = true; void task?.destroy().catch(() => {}); void worker?.terminate().catch(() => {}); };
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
        new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

      task = pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
        maxImageSize: 24_000_000,
      });

      const pdf = await within(task.promise, 45000, "PDF açma");

      if (pdf.numPages > 40) {
        throw new Error(
          "Bir seferde en fazla 40 sayfalık PDF yükleyebilirsin."
        );
      }

      const pages: TextLine[][] = [];
      const extracted: PdfPhoto[] = [];
      const warnings: string[] = [];
      const seen = new Set<string>();
      let imageBytes = 0;

      for (let number = 1; number <= pdf.numPages; number++) {
        if (cancelled) throw new Error("Okuma iptal edildi.");
        currentPage = number;
        setProgress(`Sayfa ${number}/${pdf.numPages} okunuyor...`);

        const page = await pdf.getPage(number);
        const content = await page.getTextContent();

        const lines: TextLine[] = [];
        for (const item of content.items) {
          if (!("str" in item) || !item.str.trim()) continue;
          const size = Math.hypot(item.transform[2], item.transform[3]) || Math.abs(item.height) || 12;
          const bold = /bold|black|heavy|demi/i.test(item.fontName + " " + (content.styles[item.fontName]?.fontFamily || ""));
          const y = item.transform[5], x = item.transform[4];
          const previous = lines[lines.length - 1];
          if (previous && Math.abs(previous.y - y) < Math.min(previous.size, size) * 0.35) {
            previous.text += " " + item.str;
            previous.bold = previous.bold && bold;
            previous.size = Math.max(previous.size, size);
          } else lines.push({ text: item.str, size, bold, x, y, page: number, fontName: item.fontName });
        }
        let pageText = lines.map(line => line.text).join("\n");
        const scanned = pageText.replace(/\s/g, "").length < 30;
        const original = page.getViewport({ scale: 1 });
        const scale = Math.min(2.5, 2200 / Math.max(original.width, original.height));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Sayfa görüntüsü oluşturulamadı.");
        try {
          await within(page.render({ canvas, canvasContext: context, viewport, background: "white" }).promise, 60000, "Sayfa işleme");
          for (const line of lines) {
            if (line.fontName && page.commonObjs.has(line.fontName)) {
              const font = page.commonObjs.get(line.fontName) as { name?: string };
              line.bold ||= /bold|black|heavy|demi/i.test(font?.name || "");
            }
          }
          const result = await extractPhotos(page, pdfjs.OPS, file.name, seen);
          extracted.push(...result.photos); warnings.push(...result.warnings);
          imageBytes += result.photos.reduce((sum, photo) => sum + photo.file.size, 0);
          if (extracted.length > 150 || imageBytes > 60 * 1024 * 1024) throw new Error("Çıkarılan görseller 150 adet veya 60 MB sınırını aştı. PDF’yi daha küçük parçalara ayır.");
          if (scanned) warnings.push(`Sayfa ${number} taranmış olabilir. Sayfa görseli içindeki fotoğraflar ayrı nesneler değilse otomatik ayrılamaz; galeri önizlemesini kontrol et.`);
        if (forceOcr || pageText.replace(/\s/g, "").length < 30) {
          try {
          if (cancelled) throw new Error("Okuma iptal edildi.");
          if (!worker) {
            setProgress(
              "Görüntüden okuma hazırlanıyor. İlk açılış biraz sürebilir..."
            );

            const { createWorker } = await import("tesseract.js");

            let abandoned = false;
            try {
            worker = await within(createWorker("tur+eng", 1, {
              logger: (message) => {
                if (message.status === "recognizing text") {
                  setProgress(
                    `Sayfa ${currentPage}/${pdf.numPages}: ` +
                    `%${Math.round(message.progress * 100)}`
                  );
                }
              },
            }).then(created => { if (cancelled || abandoned) { void created.terminate(); throw new Error("Okuma iptal edildi."); } worker = created; return created; }), 90000, "Görüntüden okuma hazırlığı");
            } catch (error) { abandoned = true; throw error; }
          }

          if (!worker) throw new Error("Görüntüden okuma başlatılamadı.");
          const result = await within(worker.recognize(canvas), 120000, "Görüntüden okuma");
          pageText = result.data.text;
          lines.splice(0, lines.length, ...pageText.split("\n").map((text, index) => ({ text, size: 12, bold: false, x: 0, y: -index * 16, page: number })));
          } catch (ocrError) {
            if (cancelled) throw ocrError;
            warnings.push(`Sayfa ${number}: görüntüden okuma başarısız. ${ocrError instanceof Error ? ocrError.message : "Metni elle kontrol et."}`);
            await worker?.terminate().catch(() => {}); worker = undefined;
          }
        }
        } finally { canvas.width = 0; canvas.height = 0; }

        if (!pageText.trim()) emptyPages.push(number);

        pages.push(lines);
        page.cleanup();
      }

      const result = structuredText(pages).trim();

      if (!result && !extracted.length) {
        throw new Error(
          "PDF'den yazı okunamadı. Daha net bir dosya kullan."
        );
      }

      if (cancelled) throw new Error("Okuma iptal edildi.");
      setText(result);
      setPhotos(extracted);
      setNotice(warnings.join("\n"));
      setProgress("Okuma tamamlandı.");

      if (emptyPages.length) {
        setNotice(warnings.join("\n") + "\n" +
          `Metin okunamayan sayfalar: ${emptyPages.join(", ")}. ` +
          "Bunlar boş sayfa değilse aktarım öncesinde kontrol et."
        );
      }
    } catch (err) {
      setError(
        cancelled ? "Okuma iptal edildi." : err instanceof Error ? err.message : "PDF okunamadı."
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

      cancelRead.current = null;
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  function applyImport() {
    if ((!text.trim() && !photos.length) || busy || disabled || applied) return;

    if (
      !window.confirm(
        "PDF’den bulunan alanlar forma aktarılacak; mevcut dolu alanların " +
        "yerini alacak. Seçilen fotoğraflar galeriye eklenecek. Devam edilsin mi?"
      )
    ) return;

    onImport({ ...parseText(text), photos });
    setApplied(true);

    setNotice(previous => previous + "\n" +
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
          setPhotos([]);
          setApplied(false);
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

      {busy && <button type="button" onClick={() => cancelRead.current?.()} className={`${buttonClass} ml-3`}>İptal et</button>}

      <p role="status" className="mt-4 text-sm text-[#e3c88e]">
        {progress}
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}

      {notice && (
        <p role="status" className="mt-4 whitespace-pre-line text-sm leading-6 text-amber-200">
          {notice}
        </p>
      )}

      {(text || photos.length > 0) && (
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
            onChange={(event) => { setText(event.target.value); setApplied(false); }}
            disabled={busy || disabled}
            rows={16}
            className="mt-3 w-full border border-white/15 bg-black/30 p-4 text-sm leading-7 text-white outline-none"
          />

          <div className="mt-5 space-y-3">
            <h3>{parseText(text).biography.length} bölüm · {photos.length} görsel</h3>
            {parseText(text).biography.map((section, index) => <details key={index} className="border border-white/15 p-3"><summary>{section.title}</summary><p className="whitespace-pre-wrap text-sm mt-3">{section.content}</p></details>)}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {photos.map(photo => <div key={photo.id}><img src={photo.preview} alt={photo.title} className="h-32 w-full object-contain"/><p className="text-xs">{photo.title}</p><button type="button" disabled={busy || disabled || applied} onClick={() => setPhotos(items => items.filter(item => item.id !== photo.id))} className="text-sm text-red-300">Çıkar</button></div>)}
            </div>
          </div>
          <button
            type="button"
            onClick={applyImport}
            disabled={busy || disabled || (!text.trim() && !photos.length) || applied}
            className={`${buttonClass} mt-4`}
          >
            {applied ? "Forma aktarıldı" : "Bölümleri ve Fotoğrafları Forma Aktar"}
          </button>
        </div>
      )}
    </section>
  );
}