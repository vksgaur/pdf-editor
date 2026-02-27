import { useState, useRef, useEffect, useCallback } from 'react';
import { useAnnotations } from '../../hooks/useAnnotations';
import { useEditorStore } from '../../store/editorStore';
import type { Annotation } from '../../types';

interface Props {
  annotation: Annotation;
}

export function TextAnnotation({ annotation }: Props) {
  const { updateAnnotation, removeAnnotation } = useAnnotations();
  const activeTool = useEditorStore((s) => s.activeTool);
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setEditing(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || (e.key === 'Backspace' && !editing)) {
        e.preventDefault();
        removeAnnotation(annotation.id);
      }
      if (e.key === 'Escape') {
        setEditing(false);
      }
    },
    [editing, annotation.id, removeAnnotation]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'select' || editing) return;
      e.stopPropagation();
      e.preventDefault();
      const parentRect = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - (annotation.x / 100) * parentRect.width,
        y: e.clientY - (annotation.y / 100) * parentRect.height,
      };
      setDragging(true);

      const handleMove = (ev: MouseEvent) => {
        const newX = ((ev.clientX - dragOffset.current.x) / parentRect.width) * 100;
        const newY = ((ev.clientY - dragOffset.current.y) / parentRect.height) * 100;
        updateAnnotation(annotation.id, {
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY)),
        });
      };

      const handleUp = () => {
        setDragging(false);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [activeTool, editing, annotation.id, annotation.x, annotation.y, updateAnnotation]
  );

  return (
    <div
      className={`absolute group ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${annotation.x}%`,
        top: `${annotation.y}%`,
        minWidth: '60px',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="px-2 py-1 rounded text-sm border border-yellow-400 shadow-sm"
        style={{ backgroundColor: annotation.color }}
      >
        {editing ? (
          <textarea
            ref={inputRef}
            className="bg-transparent border-none outline-none resize-none w-full text-black text-sm"
            value={annotation.content || ''}
            onChange={(e) => updateAnnotation(annotation.id, { content: e.target.value })}
            onBlur={handleBlur}
            rows={2}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-black select-none whitespace-pre-wrap">
            {annotation.content || 'Text'}
          </span>
        )}
      </div>
      {/* Delete button */}
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
