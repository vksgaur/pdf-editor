import { Router } from 'express';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const pdfBytes = fs.readFileSync(req.file.path);
    const pdf = await PDFDocument.load(pdfBytes);
    const pageCount = pdf.getPageCount();
    const fileId = path.basename(req.file.filename, '.pdf');

    res.json({ fileId, pageCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

export default router;
