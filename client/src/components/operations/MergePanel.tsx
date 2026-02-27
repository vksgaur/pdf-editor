import { useState, useCallback } from 'react';
import { uploadPdf, mergePdfs, downloadPdf } from '../../services/api';
import { useEditorStore } from '../../store/editorStore';

interface UploadedFile {
  fileId: string;
  name: string;
  pageCount: number;
}

interface Props {
  onClose: () => void;
}

export function MergePanel({ onClose }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setFile = useEditorStore((s) => s.setFile);

  const handleAddFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    setLoading(true);
    setError(null);
    try {
      const uploaded: UploadedFile[] = [];
      for (const file of Array.from(selectedFiles)) {
        const result = await uploadPdf(file);
        uploaded.push({ ...result, name: file.name });
      }
      setFiles((prev) => [...prev, ...uploaded]);
    } catch {
      setError('Failed to upload files');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const result = await mergePdfs(files.map((f) => f.fileId));
      const data = await downloadPdf(result.fileId);
      const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);
      setFile({ fileId: result.fileId, name: 'merged.pdf', pageCount: totalPages }, data);
      onClose();
    } catch {
      setError('Merge failed');
    } finally {
      setLoading(false);
    }
  }, [files, setFile, onClose]);

  const moveFile = (index: number, direction: -1 | 1) => {
    const newFiles = [...files];
    const target = index + direction;
    if (target < 0 || target >= newFiles.length) return;
    [newFiles[index], newFiles[target]] = [newFiles[target], newFiles[index]];
    setFiles(newFiles);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[480px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Merge PDFs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          <label className="block mb-3">
            <span className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-500 text-sm">
              Add PDF Files
            </span>
            <input
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleAddFiles}
            />
          </label>

          {files.length === 0 && (
            <p className="text-gray-400 text-sm">No files added yet. Add at least 2 PDFs to merge.</p>
          )}

          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={file.fileId} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="flex-1 text-sm truncate">{file.name}</span>
                <span className="text-xs text-gray-400">{file.pageCount}p</span>
                <button
                  className="text-xs px-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  disabled={i === 0}
                  onClick={() => moveFile(i, -1)}
                >
                  ↑
                </button>
                <button
                  className="text-xs px-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  disabled={i === files.length - 1}
                  onClick={() => moveFile(i, 1)}
                >
                  ↓
                </button>
                <button
                  className="text-xs px-1 text-red-500 hover:bg-red-50 rounded"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <button
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-40"
            disabled={files.length < 2 || loading}
            onClick={handleMerge}
          >
            {loading ? 'Merging...' : 'Merge'}
          </button>
        </div>
      </div>
    </div>
  );
}
