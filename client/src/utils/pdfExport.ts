import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Annotation } from '../types';

export async function exportPdf(
  pdfData: ArrayBuffer,
  pageOrder: number[],
  annotations: Annotation[]
): Promise<Uint8Array> {
  const sourcePdf = await PDFDocument.load(pdfData);
  const outputPdf = await PDFDocument.create();
  const font = await outputPdf.embedFont(StandardFonts.Helvetica);

  // Copy pages in the reordered sequence
  const copiedPages = await outputPdf.copyPages(sourcePdf, pageOrder);
  for (const page of copiedPages) {
    outputPdf.addPage(page);
  }

  // Build a mapping: original page index -> new page index
  const pageMap = new Map<number, number>();
  pageOrder.forEach((originalIndex, newIndex) => {
    pageMap.set(originalIndex, newIndex);
  });

  // Bake annotations
  for (const ann of annotations) {
    const newPageIndex = pageMap.get(ann.pageIndex);
    if (newPageIndex === undefined) continue;

    const page = outputPdf.getPage(newPageIndex);
    const { width, height } = page.getSize();

    const x = (ann.x / 100) * width;
    // PDF coordinate system is bottom-up
    const y = height - (ann.y / 100) * height;

    if (ann.type === 'text' && ann.content) {
      const fontSize = 12;
      page.drawText(ann.content, {
        x,
        y: y - fontSize,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    } else if (ann.type === 'highlight') {
      const w = (ann.width / 100) * width;
      const h = (ann.height / 100) * height;
      page.drawRectangle({
        x,
        y: y - h,
        width: w,
        height: h,
        color: rgb(1, 0.92, 0.23),
        opacity: 0.35,
      });
    }
  }

  return outputPdf.save();
}
