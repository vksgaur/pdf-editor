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
  rotation?: number;
  onClick: () => void;
  onDelete?: () => void;
  onRotate?: (degrees: number) => void;
}

export function ThumbnailItem({
  id,
  pdfDoc,
  pageIndex,
  displayIndex,
  isActive,
  rotation = 0,
  onClick,
  onDelete,
  onRotate,
}: Props) {
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
      const viewport = page.getViewport({ scale: 0.3, rotation });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      page.render({ canvasContext: ctx, viewport, canvas });
    });
  }, [pdfDoc, pageIndex, rotation]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group cursor-pointer rounded border-2 overflow-hidden ${
        isActive ? 'border-blue-500' : 'border-transparent hover:border-gray-400'
      }`}
      onClick={onClick}
    >
      <canvas ref={canvasRef} className="w-full" />
      <div className="text-center text-xs text-gray-600 py-0.5">
        {displayIndex + 1}
      </div>

      {/* Hover controls */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
        {onRotate && (
          <button
            className="absolute bottom-5 right-0 w-6 h-6 bg-gray-700 text-white rounded-full text-xs flex items-center justify-center hover:bg-gray-600"
            title="Rotate 90°"
            onClick={(e) => {
              e.stopPropagation();
              onRotate(90);
            }}
          >
            ↻
          </button>
        )}
        {onDelete && (
          <button
            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-400"
            title="Delete page"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
