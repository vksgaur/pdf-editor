import { useCallback } from 'react';
import { useAnnotations } from '../../hooks/useAnnotations';
import type { Annotation } from '../../types';

interface Props {
  annotation: Annotation;
}

export function HighlightAnnotation({ annotation }: Props) {
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

  return (
    <div
      className="absolute group"
      style={{
        left: `${annotation.x}%`,
        top: `${annotation.y}%`,
        width: `${annotation.width}%`,
        height: `${annotation.height}%`,
        backgroundColor: annotation.color,
        pointerEvents: 'auto',
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <button
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center leading-none"
        onClick={(e) => {
          e.stopPropagation();
          removeAnnotation(annotation.id);
        }}
      >
        x
      </button>
    </div>
  );
}
