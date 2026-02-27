import { useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { Annotation } from '../types';

let nextId = 1;

export function useAnnotations() {
  const annotations = useEditorStore((s) => s.annotations);
  const addAnnotation = useEditorStore((s) => s.addAnnotation);
  const updateAnnotation = useEditorStore((s) => s.updateAnnotation);
  const removeAnnotation = useEditorStore((s) => s.removeAnnotation);
  const annotationColor = useEditorStore((s) => s.annotationColor);
  const annotationOpacity = useEditorStore((s) => s.annotationOpacity);

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
        color: annotationColor,
        opacity: 1,
      };
      addAnnotation(annotation);
      return annotation;
    },
    [addAnnotation, annotationColor]
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
        color: annotationColor,
        opacity: annotationOpacity,
      };
      addAnnotation(annotation);
      return annotation;
    },
    [addAnnotation, annotationColor, annotationOpacity]
  );

  const createDrawingAnnotation = useCallback(
    (pageIndex: number, points: { x: number; y: number }[]) => {
      if (points.length < 2) return null;
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const x = Math.min(...xs);
      const y = Math.min(...ys);
      const width = Math.max(...xs) - x;
      const height = Math.max(...ys) - y;
      const annotation: Annotation = {
        id: `ann-${nextId++}`,
        pageIndex,
        type: 'drawing',
        x,
        y,
        width: Math.max(width, 0.5),
        height: Math.max(height, 0.5),
        color: annotationColor,
        opacity: annotationOpacity,
        points,
        strokeWidth: 2,
      };
      addAnnotation(annotation);
      return annotation;
    },
    [addAnnotation, annotationColor, annotationOpacity]
  );

  return {
    annotations,
    createTextAnnotation,
    createHighlightAnnotation,
    createDrawingAnnotation,
    updateAnnotation,
    removeAnnotation,
  };
}
