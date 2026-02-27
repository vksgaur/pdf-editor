import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PDFPageProxy } from 'pdfjs-dist';
import { useEditorStore } from '../../store/editorStore';
import { AnnotationLayer } from '../annotations/AnnotationLayer';

interface Props {
  pdfDoc: PDFDocumentProxy;
  pageIndex: number;
  isActive: boolean;
}

export function PageCanvas({ pdfDoc, pageIndex, isActive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoom = useEditorStore((s) => s.zoom);
  const pageRotations = useEditorStore((s) => s.pageRotations);
  const renderTaskRef = useRef<ReturnType<PDFPageProxy['render']> | null>(null);

  const rotation = pageRotations[pageIndex] || 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    pdfDoc.getPage(pageIndex + 1).then((page) => {
      if (cancelled) return;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const viewport = page.getViewport({ scale: zoom * 1.5, rotation });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d')!;
      const renderTask = page.render({ canvasContext: ctx, viewport, canvas });
      renderTaskRef.current = renderTask;

      renderTask.promise.catch(() => {
        // Render was cancelled, ignore
      });
    });

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageIndex, zoom, rotation]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block mb-4 shadow-lg ${
        isActive ? 'ring-2 ring-blue-500' : ''
      }`}
      id={`page-${pageIndex}`}
    >
      <canvas ref={canvasRef} className="block" />
      <AnnotationLayer pageIndex={pageIndex} canvasRef={canvasRef} />
    </div>
  );
}
