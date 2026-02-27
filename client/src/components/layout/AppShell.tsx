import { useState, useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { useZoom } from '../../hooks/useZoom';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { uploadPdf, downloadPdf } from '../../services/api';
import { exportPdf } from '../../utils/pdfExport';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { PdfViewer } from '../viewer/PdfViewer';
import { MergePanel } from '../operations/MergePanel';
import { SplitPanel } from '../operations/SplitPanel';

export function AppShell() {
  const file = useEditorStore((s) => s.file);
  const pdfData = useEditorStore((s) => s.pdfData);
  const pageOrder = useEditorStore((s) => s.pageOrder);
  const annotations = useEditorStore((s) => s.annotations);
  const pageRotations = useEditorStore((s) => s.pageRotations);
  const setFile = useEditorStore((s) => s.setFile);
  const { pdfDoc, loading, error } = usePdfDocument(pdfData);
  const { zoomIn, zoomOut } = useZoom();
  const { undo, redo } = useUndoRedo();

  const [showMerge, setShowMerge] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (uploadedFile: File) => {
      setUploading(true);
      try {
        const result = await uploadPdf(uploadedFile);
        const data = await downloadPdf(result.fileId);
        setFile({ ...result, name: uploadedFile.name }, data);
      } catch (err) {
        alert('Failed to upload PDF');
      } finally {
        setUploading(false);
      }
    },
    [setFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleUpload(f);
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f && f.type === 'application/pdf') handleUpload(f);
    },
    [handleUpload]
  );

  const handleExport = useCallback(async () => {
    if (!pdfData) return;
    try {
      const bytes = await exportPdf(pdfData, pageOrder, annotations, pageRotations);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file?.name ? `edited-${file.name}` : 'edited.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    }
  }, [pdfData, pageOrder, annotations, pageRotations, file]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (e.key === '=' && ctrl) {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' && ctrl) {
        e.preventDefault();
        zoomOut();
      } else if (e.key === 'z' && ctrl && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'z' && ctrl && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [zoomIn, zoomOut, undo, redo]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Toolbar
        onExport={handleExport}
        onShowMerge={() => setShowMerge(true)}
        onShowSplit={() => setShowSplit(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar pdfDoc={pdfDoc} />

        {!file ? (
          <div
            className="flex-1 flex items-center justify-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-700 mb-4">PDF Editor</h1>
              <p className="text-gray-500 mb-6">
                Upload a PDF to get started. You can view, annotate, reorder pages, merge, and split.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-lg disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </button>
              <p className="text-gray-400 text-sm mt-3">
                or drag and drop a PDF file here
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading PDF...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : pdfDoc ? (
          <PdfViewer pdfDoc={pdfDoc} />
        ) : null}
      </div>

      {showMerge && <MergePanel onClose={() => setShowMerge(false)} />}
      {showSplit && <SplitPanel onClose={() => setShowSplit(false)} />}
    </div>
  );
}
