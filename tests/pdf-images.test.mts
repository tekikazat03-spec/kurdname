import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createCanvas } from '@napi-rs/canvas';
import { extractPhotos } from '../lib/pdf/images.ts';

test('real PDF: three image placements yield two distinct gallery files', async () => {
  // Minimal canvas/FileReader adapters; PDF decoding and image extraction are real.
  const oldDocument = globalThis.document;
  const oldReader = globalThis.FileReader;
  Object.assign(globalThis, {
    document: { createElement() {
      const canvas = createCanvas(1, 1);
      Object.assign(canvas, { toBlob: async (callback: (blob: Blob) => void) => callback(new Blob([new Uint8Array(await canvas.encode('png'))], { type: 'image/png' })) });
      return canvas;
    } },
    FileReader: class {
      result = ''; onload?: () => void; onerror?: () => void;
      async readAsDataURL(blob: Blob) {
        try { this.result = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`; this.onload?.(); } catch { this.onerror?.(); }
      }
    },
  });
  const { getDocument, OPS } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const task = getDocument({ data: new Uint8Array(await readFile(new URL('./fixtures/biography-images.pdf', import.meta.url))) });
  try {
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const canvas = createCanvas(viewport.width, viewport.height);
    await page.render({ canvas: canvas as never, canvasContext: canvas.getContext('2d') as never, viewport }).promise;
    const result = await extractPhotos(page, OPS, 'test.pdf', new Set());
    assert.deepEqual(result.warnings, []);
    assert.equal(result.photos.length, 2);
    for (const photo of result.photos) {
      assert.equal(photo.file.type, 'image/png');
      assert.ok(photo.file.size > 0);
      assert.ok(photo.preview.startsWith('data:image/png;base64,'));
      assert.equal(photo.source, 'test.pdf');
    }
  } finally { await task.destroy(); Object.assign(globalThis, { document: oldDocument, FileReader: oldReader }); }
});
