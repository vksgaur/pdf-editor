import { useState, useCallback } from 'react';
import { splitPdf } from '../../services/api';
import { useEditorStore } from '../../store/editorStore';

interface Range {
  start: string;
  end: string;
}

interface Props {
  onClose: () => void;
}

export function SplitPanel({ onClose }: Props) {
  const file = useEditorStore((s) => s.file);
  const [ranges, setRanges] = useState<Range[]>([{ start: '1', end: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultIds, setResultIds] = useState<string[]>([]);

  const handleSplit = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const parsedRanges = ranges.map((r) => ({
        start: parseInt(r.start) || 1,
        end: parseInt(r.end) || file.pageCount,
      }));
      const result = await splitPdf(file.fileId, parsedRanges);
      setResultIds(result.fileIds);
    } catch {
      setError('Split failed');
    } finally {
      setLoading(false);
    }
  }, [file, ranges]);

  const handleDownload = (fileId: string) => {
    window.open(`/api/download/${fileId}`, '_blank');
  };

  const updateRange = (index: number, field: 'start' | 'end', value: string) => {
    const newRanges = [...ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setRanges(newRanges);
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[480px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Split PDF</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          <p className="text-sm text-gray-500 mb-3">
            {file.name} — {file.pageCount} pages
          </p>

          <div className="space-y-2 mb-3">
            {ranges.map((range, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-16">Range {i + 1}:</span>
                <input
                  type="number"
                  min={1}
                  max={file.pageCount}
                  placeholder="Start"
                  className="w-20 px-2 py-1 border rounded text-sm"
                  value={range.start}
                  onChange={(e) => updateRange(i, 'start', e.target.value)}
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  min={1}
                  max={file.pageCount}
                  placeholder="End"
                  className="w-20 px-2 py-1 border rounded text-sm"
                  value={range.end}
                  onChange={(e) => updateRange(i, 'end', e.target.value)}
                />
                {ranges.length > 1 && (
                  <button
                    className="text-red-500 text-xs hover:bg-red-50 px-1 rounded"
                    onClick={() => setRanges(ranges.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setRanges([...ranges, { start: '', end: '' }])}
          >
            + Add range
          </button>

          {resultIds.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded">
              <p className="text-sm font-medium text-green-800 mb-2">Split complete!</p>
              {resultIds.map((id, i) => (
                <button
                  key={id}
                  className="block text-sm text-blue-600 hover:underline mb-1"
                  onClick={() => handleDownload(id)}
                >
                  Download Part {i + 1}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <button
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-40"
            disabled={loading}
            onClick={handleSplit}
          >
            {loading ? 'Splitting...' : 'Split'}
          </button>
        </div>
      </div>
    </div>
  );
}
