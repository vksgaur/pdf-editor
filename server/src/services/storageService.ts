import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

export function getFilePath(fileId: string): string {
  // Sanitize to prevent directory traversal
  const sanitized = path.basename(fileId).replace(/[^a-zA-Z0-9-]/g, '');
  return path.join(uploadsDir, `${sanitized}.pdf`);
}

export function fileExists(fileId: string): boolean {
  return fs.existsSync(getFilePath(fileId));
}

export function deleteFile(fileId: string): boolean {
  const filePath = getFilePath(fileId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

export function getUploadsDir(): string {
  return uploadsDir;
}

// Cleanup files older than 1 hour
export function cleanupOldFiles(): void {
  const maxAge = 60 * 60 * 1000; // 1 hour
  const now = Date.now();
  const files = fs.readdirSync(uploadsDir);
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const stat = fs.statSync(filePath);
    if (now - stat.mtimeMs > maxAge) {
      fs.unlinkSync(filePath);
    }
  }
}
