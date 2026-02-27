import { useStore } from 'zustand';
import { useEditorStore } from '../store/editorStore';

export function useUndoRedo() {
  const temporal = useStore(useEditorStore.temporal, (s) => s);

  return {
    undo: temporal.undo,
    redo: temporal.redo,
    canUndo: temporal.pastStates.length > 0,
    canRedo: temporal.futureStates.length > 0,
  };
}
