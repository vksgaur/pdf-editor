import { useRef, useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useAnnotations } from '../../hooks/useAnnotations';
import { TextAnnotation } from './TextAnnotation';
import { HighlightAnnotation } from './HighlightAnnotation';
import { DrawingAnnotation } from './DrawingAnnotation';

interface Props {
  pageIndex: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function AnnotationLayer({ pageIndex, canvasRef }: Props) {
  const activeTool = useEditorStore((s) => s.activeTool);
  const annotationColor = useEditorStore((s) => s.annotationColor);
  const annotationOpacity = useEditorStore((s) => s.annotationOpacity);
  const { annotations, createTextAnnotation, createHighlightAnnotation, createDrawingAnnotation } =
    useAnnotations();
  const layerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  // Drawing state — use ref to avoid re-renders on every point
  const drawingPointsRef = useRef<{ x: number; y: number }[]>([]);
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const isDrawingRef = useRef(false);

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
      } else if (activeTool === 'draw') {
        isDrawingRef.current = true;
        drawingPointsRef.current = [pos];
        setDrawingPoints([pos]);
      }
    },
    [activeTool, pageIndex, getPercentPosition, createTextAnnotation]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getPercentPosition(e.clientX, e.clientY);

      if (activeTool === 'highlight' && dragStart) {
        setDragCurrent(pos);
      } else if (activeTool === 'draw' && isDrawingRef.current) {
        const pts = drawingPointsRef.current;
        const last = pts[pts.length - 1];
        const dx = pos.x - last.x;
        const dy = pos.y - last.y;
        // Only add point if moved enough (0.5% threshold)
        if (dx * dx + dy * dy >= 0.25) {
          drawingPointsRef.current = [...pts, pos];
          setDrawingPoints(drawingPointsRef.current);
        }
      }
    },
    [dragStart, activeTool, getPercentPosition]
  );

  const handleMouseUp = useCallback(() => {
    if (activeTool === 'highlight' && dragStart && dragCurrent) {
      const x = Math.min(dragStart.x, dragCurrent.x);
      const y = Math.min(dragStart.y, dragCurrent.y);
      const width = Math.abs(dragCurrent.x - dragStart.x);
      const height = Math.abs(dragCurrent.y - dragStart.y);
      if (width > 1 && height > 0.5) {
        createHighlightAnnotation(pageIndex, x, y, width, height);
      }
      setDragStart(null);
      setDragCurrent(null);
    } else if (activeTool === 'draw' && isDrawingRef.current) {
      isDrawingRef.current = false;
      createDrawingAnnotation(pageIndex, drawingPointsRef.current);
      drawingPointsRef.current = [];
      setDrawingPoints([]);
    }
  }, [dragStart, dragCurrent, activeTool, pageIndex, createHighlightAnnotation, createDrawingAnnotation]);

  const cursor =
    activeTool === 'text'
      ? 'text'
      : activeTool === 'highlight' || activeTool === 'draw'
      ? 'crosshair'
      : 'default';

  return (
    <div
      ref={layerRef}
      className="absolute inset-0"
      style={{ cursor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {pageAnnotations.map((ann) =>
        ann.type === 'text' ? (
          <TextAnnotation key={ann.id} annotation={ann} />
        ) : ann.type === 'highlight' ? (
          <HighlightAnnotation key={ann.id} annotation={ann} />
        ) : (
          <DrawingAnnotation key={ann.id} annotation={ann} />
        )
      )}

      {/* Drag preview for highlight */}
      {dragStart && dragCurrent && activeTool === 'highlight' && (
        <div
          className="absolute border-2 pointer-events-none"
          style={{
            left: `${Math.min(dragStart.x, dragCurrent.x)}%`,
            top: `${Math.min(dragStart.y, dragCurrent.y)}%`,
            width: `${Math.abs(dragCurrent.x - dragStart.x)}%`,
            height: `${Math.abs(dragCurrent.y - dragStart.y)}%`,
            borderColor: annotationColor,
            backgroundColor: `${annotationColor}4d`,
          }}
        />
      )}

      {/* In-progress drawing stroke */}
      {activeTool === 'draw' && drawingPoints.length >= 2 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polyline
            points={drawingPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={annotationColor}
            strokeOpacity={annotationOpacity}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
}
