export interface PdfFile {
  fileId: string;
  name: string;
  pageCount: number;
}

export interface Annotation {
  id: string;
  pageIndex: number;
  type: 'text' | 'highlight';
  // Percentage-based coordinates (0-100)
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string; // For text annotations
  color: string;
}

export type Tool = 'select' | 'text' | 'highlight';

export interface EditorState {
  // Current file
  file: PdfFile | null;
  pdfData: ArrayBuffer | null;

  // View
  currentPage: number;
  zoom: number;
  pageOrder: number[];

  // Tools
  activeTool: Tool;

  // Annotations
  annotations: Annotation[];

  // Actions
  setFile: (file: PdfFile, data: ArrayBuffer) => void;
  clearFile: () => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  setPageOrder: (order: number[]) => void;
  setActiveTool: (tool: Tool) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;
}
