import { useCallback } from 'react';
import { useAnnotations } from '../../hooks/useAnnotations';
import type { Annotation } from '../../types';

interface Props {
  annotation: Annotation;
}

export function DrawingAnnotation({ annotation }: Props) {
  const { removeAnnotation } = useAnnotations();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeAnnotation(annotation.id);
      }
    },
    [annotation.id, removeAnnotation]
  );

  if (!annotation.points || annotation.points.length < 2) return null;

  const points = annotation.points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div
      className="absolute group"
      style={{
        left: `${annotation.x}%`,
        top: `${annotation.y}%`,
        width: `${annotation.width}%`,
        height: `${annotation.height}%`,
        // Extend hit area slightly so the SVG is reachable
        minWidth: '8px',
        minHeight: '8px',
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Full-page SVG so points (which are in page-percent space) render correctly */}
      <svg
        style={{
          position: 'absolute',
          left: `${-annotation.x}%`,
          top: `${-annotation.y}%`,
          width: `${10000 / annotation.width}%`,
          height: `${10000 / annotation.height}%`,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={annotation.color}
          strokeOpacity={annotation.opacity ?? 1}
          strokeWidth={annotation.strokeWidth ?? 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <button
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center leading-none z-10"
        onClick={(e) => {
          e.stopPropagation();
          removeAnnotation(annotation.id);
        }}
      >
        ×
      </button>
    </div>
  );
}
