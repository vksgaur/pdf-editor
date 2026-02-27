export interface PdfFile {
  fileId: string;
  name: string;
  pageCount: number;
}

export interface Annotation {
  id: string;
  pageIndex: number;
  type: 'text' | 'highlight' | 'drawing';
  // Percentage-based coordinates (0-100)
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string; // For text annotations
  color: string;
  opacity?: number;
  points?: { x: number; y: number }[]; // For drawing annotations
  strokeWidth?: number; // For drawing annotations
}

export type Tool = 'select' | 'text' | 'highlight' | 'draw';

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

  // Color / opacity
  annotationColor: string;
  annotationOpacity: number;

  // Page rotations (original page index -> degrees)
  pageRotations: Record<number, number>;

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
  setAnnotationColor: (color: string) => void;
  setAnnotationOpacity: (opacity: number) => void;
  deletePage: (displayIndex: number) => void;
  rotatePage: (pageIndex: number, degrees: number) => void;
  rotateAllPages: (degrees: number) => void;
}
