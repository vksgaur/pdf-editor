import { useRef, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useEditorStore } from '../../store/editorStore';
import { PageCanvas } from './PageCanvas';

interface Props {
  pdfDoc: PDFDocumentProxy;
}

export function PdfViewer({ pdfDoc }: Props) {
  const pageOrder = useEditorStore((s) => s.pageOrder);
  const currentPage = useEditorStore((s) => s.currentPage);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to current page when it changes
  useEffect(() => {
    const el = document.getElementById(`page-${pageOrder[currentPage]}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentPage, pageOrder]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-gray-200 p-6 flex flex-col items-center"
    >
      {pageOrder.map((originalIndex, displayIndex) => (
        <PageCanvas
          key={`page-${originalIndex}`}
          pdfDoc={pdfDoc}
          pageIndex={originalIndex}
          isActive={displayIndex === currentPage}
        />
      ))}
    </div>
  );
}
