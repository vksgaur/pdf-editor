import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import type { Annotation } from '../types';

/** Parse hex color string (#rrggbb or #rgb) into {r,g,b} in 0-1 range */
function parseColor(str: string): { r: number; g: number; b: number } {
  const hex = str.replace('#', '');
  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16) / 255,
      g: parseInt(hex[1] + hex[1], 16) / 255,
      b: parseInt(hex[2] + hex[2], 16) / 255,
    };
  }
  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
    };
  }
  // Fallback: yellow
  return { r: 1, g: 0.92, b: 0.23 };
}

export async function exportPdf(
  pdfData: ArrayBuffer,
  pageOrder: number[],
  annotations: Annotation[],
  pageRotations: Record<number, number> = {}
): Promise<Uint8Array> {
  const sourcePdf = await PDFDocument.load(pdfData);
  const outputPdf = await PDFDocument.create();
  const font = await outputPdf.embedFont(StandardFonts.Helvetica);

  // Copy pages in the reordered sequence
  const copiedPages = await outputPdf.copyPages(sourcePdf, pageOrder);
  for (const page of copiedPages) {
    outputPdf.addPage(page);
  }

  // Apply rotations
  pageOrder.forEach((originalIndex, newIndex) => {
    const rotation = pageRotations[originalIndex] || 0;
    if (rotation !== 0) {
      const page = outputPdf.getPage(newIndex);
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + rotation) % 360));
    }
  });

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

    const { r, g, b } = parseColor(ann.color);
    const opacity = ann.opacity ?? 1;

    if (ann.type === 'text' && ann.content) {
      const fontSize = 12;
      page.drawText(ann.content, {
        x,
        y: y - fontSize,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
      });
    } else if (ann.type === 'highlight') {
      const w = (ann.width / 100) * width;
      const h = (ann.height / 100) * height;
      page.drawRectangle({
        x,
        y: y - h,
        width: w,
        height: h,
        color: rgb(r, g, b),
        opacity,
      });
    } else if (ann.type === 'drawing' && ann.points && ann.points.length >= 2) {
      const pts = ann.points;
      for (let i = 0; i < pts.length - 1; i++) {
        const x1 = (pts[i].x / 100) * width;
        const y1 = height - (pts[i].y / 100) * height;
        const x2 = (pts[i + 1].x / 100) * width;
        const y2 = height - (pts[i + 1].y / 100) * height;
        page.drawLine({
          start: { x: x1, y: y1 },
          end: { x: x2, y: y2 },
          thickness: ann.strokeWidth ?? 2,
          color: rgb(r, g, b),
          opacity,
        });
      }
    }
  }

  return outputPdf.save();
}
