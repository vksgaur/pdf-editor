import { useRef, useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useAnnotations } from '../../hooks/useAnnotations';
import { TextAnnotation } from './TextAnnotation';
import { HighlightAnnotation } from './HighlightAnnotation';

interface Props {
  pageIndex: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function AnnotationLayer({ pageIndex, canvasRef }: Props) {
  const activeTool = useEditorStore((s) => s.activeTool);
  const { annotations, createTextAnnotation, createHighlightAnnotation } =
    useAnnotations();
  const layerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  const pageAnnotations = annotations.filter((a) => a.pageIndex === pageIndex);

  const getPercentPosition = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100,
      };
    },
    [canvasRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool === 'select') return;
      const pos = getPercentPosition(e.clientX, e.clientY);

      if (activeTool === 'text') {
        createTextAnnotation(pageIndex, pos.x, pos.y);
      } else if (activeTool === 'highlight') {
        setDragStart(pos);
        setDragCurrent(pos);
      }
    },
    [activeTool, pageIndex, getPercentPosition, createTextAnnotation]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragStart || activeTool !== 'highlight') return;
      setDragCurrent(getPercentPosition(e.clientX, e.clientY));
    },
    [dragStart, activeTool, getPercentPosition]
  );

  const handleMouseUp = useCallback(() => {
    if (dragStart && dragCurrent && activeTool === 'highlight') {
      const x = Math.min(dragStart.x, dragCurrent.x);
      const y = Math.min(dragStart.y, dragCurrent.y);
      const width = Math.abs(dragCurrent.x - dragStart.x);
      const height = Math.abs(dragCurrent.y - dragStart.y);
      if (width > 1 && height > 0.5) {
        createHighlightAnnotation(pageIndex, x, y, width, height);
      }
    }
    setDragStart(null);
    setDragCurrent(null);
  }, [dragStart, dragCurrent, activeTool, pageIndex, createHighlightAnnotation]);

  return (
    <div
      ref={layerRef}
      className="absolute inset-0"
      style={{ cursor: activeTool === 'text' ? 'text' : activeTool === 'highlight' ? 'crosshair' : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {pageAnnotations.map((ann) =>
        ann.type === 'text' ? (
          <TextAnnotation key={ann.id} annotation={ann} />
        ) : (
          <HighlightAnnotation key={ann.id} annotation={ann} />
        )
      )}

      {/* Drag preview for highlight */}
      {dragStart && dragCurrent && (
        <div
          className="absolute border-2 border-yellow-400 bg-yellow-200/30 pointer-events-none"
          style={{
            left: `${Math.min(dragStart.x, dragCurrent.x)}%`,
            top: `${Math.min(dragStart.y, dragCurrent.y)}%`,
            width: `${Math.abs(dragCurrent.x - dragStart.x)}%`,
            height: `${Math.abs(dragCurrent.y - dragStart.y)}%`,
          }}
        />
      )}
    </div>
  );
}
