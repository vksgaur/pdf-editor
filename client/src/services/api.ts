export async function uploadPdf(file: File): Promise<{ fileId: string; pageCount: number }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function downloadPdf(fileId: string): Promise<ArrayBuffer> {
  const res = await fetch(`/api/download/${fileId}`);
  if (!res.ok) throw new Error('Download failed');
  return res.arrayBuffer();
}

export async function mergePdfs(fileIds: string[]): Promise<{ fileId: string }> {
  const res = await fetch('/api/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileIds }),
  });
  if (!res.ok) throw new Error('Merge failed');
  return res.json();
}

export async function splitPdf(
  fileId: string,
  ranges: { start: number; end: number }[]
): Promise<{ fileIds: string[] }> {
  const res = await fetch('/api/split', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, ranges }),
  });
  if (!res.ok) throw new Error('Split failed');
  return res.json();
}

export async function deleteFile(fileId: string): Promise<void> {
  await fetch(`/api/file/${fileId}`, { method: 'DELETE' });
}
