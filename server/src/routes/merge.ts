import { Router } from 'express';
import { mergePdfs } from '../services/mergeService.js';
import { fileExists } from '../services/storageService.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getUploadsDir } from '../services/storageService.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { fileIds } = req.body as { fileIds: string[] };

    if (!fileIds || fileIds.length < 2) {
      res.status(400).json({ error: 'At least 2 files required' });
      return;
    }

    for (const id of fileIds) {
      if (!fileExists(id)) {
        res.status(404).json({ error: `File ${id} not found` });
        return;
      }
    }

    const mergedBytes = await mergePdfs(fileIds);
    const mergedId = uuidv4();
    const outPath = path.join(getUploadsDir(), `${mergedId}.pdf`);
    fs.writeFileSync(outPath, mergedBytes);

    res.json({ fileId: mergedId, pageCount: mergedBytes.length });
  } catch (err) {
    res.status(500).json({ error: 'Merge failed' });
  }
});

export default router;
