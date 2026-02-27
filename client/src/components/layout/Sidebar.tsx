import { ThumbnailList } from '../thumbnails/ThumbnailList';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface Props {
  pdfDoc: PDFDocumentProxy | null;
}

export function Sidebar({ pdfDoc }: Props) {
  if (!pdfDoc) return null;

  return (
    <div className="w-48 bg-gray-100 border-r border-gray-300 overflow-auto hide-scrollbar shrink-0">
      <div className="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Pages
      </div>
      <ThumbnailList pdfDoc={pdfDoc} />
    </div>
  );
}
