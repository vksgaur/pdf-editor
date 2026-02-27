import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import { getFilePath } from './storageService.js';

export async function mergePdfs(fileIds: string[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const fileId of fileIds) {
    const filePath = getFilePath(fileId);
    const pdfBytes = fs.readFileSync(filePath);
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    for (const page of pages) {
      mergedPdf.addPage(page);
    }
  }

  return mergedPdf.save();
}
