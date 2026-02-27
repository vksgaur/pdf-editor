import { Router } from 'express';
import { deleteFile, fileExists } from '../services/storageService.js';

const router = Router();

router.delete('/:fileId', (req, res) => {
  const { fileId } = req.params;
  if (!fileExists(fileId)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  deleteFile(fileId);
  res.json({ success: true });
});

export default router;
