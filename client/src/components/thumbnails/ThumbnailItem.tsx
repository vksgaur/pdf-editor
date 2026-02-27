import { useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface Props {
  id: number;
  pdfDoc: PDFDocumentProxy;
  pageIndex: number;
  displayIndex: number;
  isActive: boolean;
  onClick: () => void;
}

export function ThumbnailItem({ id, pdfDoc, pageIndex, displayIndex, isActive, onClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    pdfDoc.getPage(pageIndex + 1).then((page) => {
      const viewport = page.getViewport({ scale: 0.3 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      page.render({ canvasContext: ctx, viewport, canvas });
    });
  }, [pdfDoc, pageIndex]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-pointer rounded border-2 overflow-hidden ${
        isActive ? 'border-blue-500' : 'border-transparent hover:border-gray-400'
      }`}
      onClick={onClick}
    >
      <canvas ref={canvasRef} className="w-full" />
      <div className="text-center text-xs text-gray-600 py-0.5">
        {displayIndex + 1}
      </div>
    </div>
  );
}
