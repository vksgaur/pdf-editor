import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import { getFilePath } from './storageService.js';

export interface PageRange {
  start: number;
  end: number;
}

export async function splitPdf(
  fileId: string,
  ranges: PageRange[]
): Promise<Uint8Array[]> {
  const filePath = getFilePath(fileId);
  const pdfBytes = fs.readFileSync(filePath);
  const sourcePdf = await PDFDocument.load(pdfBytes);
  const results: Uint8Array[] = [];

  for (const range of ranges) {
    const newPdf = await PDFDocument.create();
    // Ranges are 1-indexed from the client
    const indices = [];
    for (let i = range.start - 1; i < range.end && i < sourcePdf.getPageCount(); i++) {
      indices.push(i);
    }
    const pages = await newPdf.copyPages(sourcePdf, indices);
    for (const page of pages) {
      newPdf.addPage(page);
    }
    results.push(await newPdf.save());
  }

  return results;
}
