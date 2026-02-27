import { create } from 'zustand';
import type { EditorState } from '../types';

export const useEditorStore = create<EditorState>((set) => ({
  file: null,
  pdfData: null,
  currentPage: 0,
  zoom: 1,
  pageOrder: [],
  activeTool: 'select',
  annotations: [],

  setFile: (file, data) =>
    set({
      file,
      pdfData: data,
      currentPage: 0,
      pageOrder: Array.from({ length: file.pageCount }, (_, i) => i),
      annotations: [],
    }),

  clearFile: () =>
    set({
      file: null,
      pdfData: null,
      currentPage: 0,
      pageOrder: [],
      annotations: [],
    }),

  setCurrentPage: (page) => set({ currentPage: page }),
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(3, zoom)) }),
  setPageOrder: (pageOrder) => set({ pageOrder }),
  setActiveTool: (activeTool) => set({ activeTool }),

  addAnnotation: (annotation) =>
    set((state) => ({ annotations: [...state.annotations, annotation] })),

  updateAnnotation: (id, updates) =>
    set((state) => ({
      annotations: state.annotations.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),

  removeAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== id),
    })),
}));
