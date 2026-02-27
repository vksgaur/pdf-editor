import { useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';

export function useZoom() {
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);

  const zoomIn = useCallback(() => setZoom(zoom + 0.25), [zoom, setZoom]);
  const zoomOut = useCallback(() => setZoom(zoom - 0.25), [zoom, setZoom]);
  const resetZoom = useCallback(() => setZoom(1), [setZoom]);

  return { zoom, zoomIn, zoomOut, resetZoom, setZoom };
}
