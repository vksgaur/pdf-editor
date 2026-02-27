import { useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { Annotation } from '../types';

let nextId = 1;

export function useAnnotations() {
  const annotations = useEditorStore((s) => s.annotations);
  const addAnnotation = useEditorStore((s) => s.addAnnotation);
  const updateAnnotation = useEditorStore((s) => s.updateAnnotation);
  const removeAnnotation = useEditorStore((s) => s.removeAnnotation);

  const createTextAnnotation = useCallback(
    (pageIndex: number, x: number, y: number) => {
      const annotation: Annotation = {
        id: `ann-${nextId++}`,
        pageIndex,
        type: 'text',
        x,
        y,
        width: 20,
        height: 5,
        content: 'Text',
        color: '#ffeb3b',
      };
      addAnnotation(annotation);
      return annotation;
    },
    [addAnnotation]
  );

  const createHighlightAnnotation = useCallback(
    (pageIndex: number, x: number, y: number, width: number, height: number) => {
      const annotation: Annotation = {
        id: `ann-${nextId++}`,
        pageIndex,
        type: 'highlight',
        x,
        y,
        width,
        height,
        color: 'rgba(255, 235, 59, 0.35)',
      };
      addAnnotation(annotation);
      return annotation;
    },
    [addAnnotation]
  );

  return {
    annotations,
    createTextAnnotation,
    createHighlightAnnotation,
    updateAnnotation,
    removeAnnotation,
  };
}
