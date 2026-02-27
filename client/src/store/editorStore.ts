import { create } from 'zustand';
import { temporal } from 'zundo';
import type { EditorState } from '../types';

export const useEditorStore = create<EditorState>()(
  temporal(
    (set) => ({
      file: null,
      pdfData: null,
      currentPage: 0,
      zoom: 1,
      pageOrder: [],
      activeTool: 'select',
      annotations: [],
      annotationColor: '#ffeb3b',
      annotationOpacity: 0.35,
      pageRotations: {},

      setFile: (file, data) =>
        set({
          file,
          pdfData: data,
          currentPage: 0,
          pageOrder: Array.from({ length: file.pageCount }, (_, i) => i),
          annotations: [],
          pageRotations: {},
        }),

      clearFile: () =>
        set({
          file: null,
          pdfData: null,
          currentPage: 0,
          pageOrder: [],
          annotations: [],
          pageRotations: {},
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

      setAnnotationColor: (annotationColor) => set({ annotationColor }),
      setAnnotationOpacity: (annotationOpacity) => set({ annotationOpacity }),

      deletePage: (displayIndex) =>
        set((state) => {
          if (state.pageOrder.length <= 1) return state;
          const originalIndex = state.pageOrder[displayIndex];
          const newOrder = state.pageOrder.filter((_, i) => i !== displayIndex);
          const newAnnotations = state.annotations.filter(
            (a) => a.pageIndex !== originalIndex
          );
          const newCurrentPage = Math.min(
            state.currentPage,
            newOrder.length - 1
          );
          return {
            pageOrder: newOrder,
            annotations: newAnnotations,
            currentPage: newCurrentPage,
          };
        }),

      rotatePage: (pageIndex, degrees) =>
        set((state) => {
          const current = state.pageRotations[pageIndex] || 0;
          const next = ((current + degrees) % 360 + 360) % 360;
          return {
            pageRotations: { ...state.pageRotations, [pageIndex]: next },
          };
        }),

      rotateAllPages: (degrees) =>
        set((state) => {
          const newRotations: Record<number, number> = {};
          for (const idx of state.pageOrder) {
            const current = state.pageRotations[idx] || 0;
            newRotations[idx] = ((current + degrees) % 360 + 360) % 360;
          }
          return { pageRotations: newRotations };
        }),
    }),
    {
      partialize: (state) => ({
        annotations: state.annotations,
        pageOrder: state.pageOrder,
        pageRotations: state.pageRotations,
      }),
      limit: 50,
    }
  )
);
