import { Router } from 'express';
import { splitPdf, PageRange } from '../services/splitService.js';
import { fileExists, getUploadsDir } from '../services/storageService.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { fileId, ranges } = req.body as { fileId: string; ranges: PageRange[] };

    if (!fileId || !ranges || ranges.length === 0) {
      res.status(400).json({ error: 'fileId and ranges required' });
      return;
    }

    if (!fileExists(fileId)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const results = await splitPdf(fileId, ranges);
    const fileIds: string[] = [];

    for (const pdfBytes of results) {
      const newId = uuidv4();
      fs.writeFileSync(path.join(getUploadsDir(), `${newId}.pdf`), pdfBytes);
      fileIds.push(newId);
    }

    res.json({ fileIds });
  } catch (err) {
    res.status(500).json({ error: 'Split failed' });
  }
});

export default router;
