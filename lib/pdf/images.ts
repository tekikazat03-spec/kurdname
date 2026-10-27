import type { PDFPageProxy } from "pdfjs-dist";

export type PdfPhoto = { id: string; file: File; preview: string; title: string; source: string; page: number };
type Pixels = { width: number; height: number; bitmap?: ImageBitmap; data?: Uint8ClampedArray | Uint8Array; kind?: number };

async function toBlob(value: Pixels): Promise<Blob> {
  const { width, height } = value;
  if (!width || !height || width * height > 24_000_000) throw new Error("Görsel boyutu güvenli işleme sınırını aşıyor.");
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Görsel oluşturulamadı.");
    if (value.bitmap) ctx.drawImage(value.bitmap, 0, 0);
    else {
      const data = value.data;
      if (!data) throw new Error("Görsel verisi okunamadı.");
      const pixels = ctx.createImageData(width, height);
      if (value.kind === 3) pixels.data.set(data);
      else if (value.kind === 2) {
        for (let i = 0; i < width * height; i++) {
          pixels.data.set(data.subarray(i * 3, i * 3 + 3), i * 4); pixels.data[i * 4 + 3] = 255;
        }
      } else if (value.kind === 1) {
        const stride = Math.ceil(width / 8);
        for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
          const v = data[y * stride + (x >> 3)] & (128 >> (x & 7)) ? 255 : 0;
          pixels.data.set([v, v, v, 255], (y * width + x) * 4);
        }
      } else throw new Error("Bu görsel biçimi desteklenmiyor.");
      ctx.putImageData(pixels, 0, 0);
    }
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Görsel dönüştürülemedi.")), "image/png"));
  } finally { canvas.width = 0; canvas.height = 0; }
}

/** Called after rendering, when PDF.js has resolved image dependencies. */
export async function extractPhotos(page: PDFPageProxy, ops: Record<string, number>, source: string, seen: Set<string>) {
  const list = await page.getOperatorList();
  const photos: PdfPhoto[] = [], warnings: string[] = [];
  const ids = new Set<string>();
  for (let i = 0; i < list.fnArray.length; i++) {
    const op = list.fnArray[i];
    const args = list.argsArray[i];
    let value: Pixels | undefined;
    try {
      if (op === ops.paintImageXObject || op === ops.paintImageXObjectRepeat) {
        const id = args[0] as string;
        if (ids.has(id)) continue;
        ids.add(id);
        const objects = id.startsWith("g_") ? page.commonObjs : page.objs;
        value = await new Promise<Pixels>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("Görsel yüklemesi zaman aşımına uğradı.")), 15000);
          objects.get(id, (image: Pixels) => { clearTimeout(timer); resolve(image); });
        });
      } else if (op === ops.paintInlineImageXObject) value = args[0] as Pixels;
      else if (op === ops.paintInlineImageXObjectGroup || op === ops.paintImageMaskXObject || op === ops.paintImageMaskXObjectGroup) {
        warnings.push(`Sayfa ${page.pageNumber}: parçalı veya maskeli bir görsel otomatik çıkarılamadı; PDF ile karşılaştır.`); continue;
      } else continue;
      if (!value) throw new Error("Görsel verisi eksik.");
      const blob = await toBlob(value);
      const bytes = await blob.arrayBuffer();
      const id = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map(n => n.toString(16).padStart(2, "0")).join("");
      if (seen.has(id)) continue;
      seen.add(id);
      const preview = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.onerror = () => reject(new Error("Önizleme oluşturulamadı.")); reader.readAsDataURL(blob);
      });
      photos.push({ id, file: new File([blob], `pdf-${id.slice(0, 16)}.png`, { type: "image/png" }), preview, title: `Sayfa ${page.pageNumber} · Görsel ${photos.length + 1}`, source, page: page.pageNumber });
    } catch (err) {
      warnings.push(`Sayfa ${page.pageNumber}: ${err instanceof Error ? err.message : "Fotoğraf çıkarılamadı."}`);
    }
  }
  return { photos, warnings: [...new Set(warnings)] };
}
