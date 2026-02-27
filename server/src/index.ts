import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import uploadRouter from './routes/upload.js';
import downloadRouter from './routes/download.js';
import mergeRouter from './routes/merge.js';
import splitRouter from './routes/split.js';
import fileRouter from './routes/file.js';
import { cleanupOldFiles } from './services/storageService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../uploads');

// Ensure uploads dir exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

app.use('/api/upload', uploadRouter);
app.use('/api/download', downloadRouter);
app.use('/api/merge', mergeRouter);
app.use('/api/split', splitRouter);
app.use('/api/file', fileRouter);

// Serve built client in production
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Cleanup old files every 15 minutes
setInterval(cleanupOldFiles, 15 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
