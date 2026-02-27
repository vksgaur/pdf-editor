import { Router } from 'express';
import { getFilePath, fileExists } from '../services/storageService.js';

const router = Router();

router.get('/:fileId', (req, res) => {
  const { fileId } = req.params;
  if (!fileExists(fileId)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const filePath = getFilePath(fileId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileId}.pdf"`);
  res.sendFile(filePath);
});

export default router;
