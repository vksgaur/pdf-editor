import { useEditorStore } from '../../store/editorStore';
import { useZoom } from '../../hooks/useZoom';
import type { Tool } from '../../types';

const tools: { id: Tool; label: string; icon: string }[] = [
  { id: 'select', label: 'Select', icon: '↖' },
  { id: 'text', label: 'Text', icon: 'T' },
  { id: 'highlight', label: 'Highlight', icon: '■' },
];

interface Props {
  onExport: () => void;
  onShowMerge: () => void;
  onShowSplit: () => void;
}

export function Toolbar({ onExport, onShowMerge, onShowSplit }: Props) {
  const file = useEditorStore((s) => s.file);
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const currentPage = useEditorStore((s) => s.currentPage);
  const pageOrder = useEditorStore((s) => s.pageOrder);
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage);
  const { zoom, zoomIn, zoomOut } = useZoom();

  return (
    <div className="h-12 bg-gray-800 text-white flex items-center px-4 gap-2 shrink-0">
      <span className="font-semibold mr-4">PDF Editor</span>

      {file && (
        <>
          {/* Tool buttons */}
          <div className="flex border border-gray-600 rounded overflow-hidden">
            {tools.map((tool) => (
              <button
                key={tool.id}
                className={`px-3 py-1 text-sm ${
                  activeTool === tool.id
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
              >
                {tool.icon} {tool.label}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-600 mx-2" />

          {/* Zoom */}
          <button className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600" onClick={zoomOut}>
            -
          </button>
          <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
          <button className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600" onClick={zoomIn}>
            +
          </button>

          <div className="w-px h-6 bg-gray-600 mx-2" />

          {/* Page nav */}
          <button
            className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-40"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ‹
          </button>
          <span className="text-sm">
            {currentPage + 1} / {pageOrder.length}
          </span>
          <button
            className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-40"
            disabled={currentPage >= pageOrder.length - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            ›
          </button>

          <div className="flex-1" />

          {/* Actions */}
          <button
            className="px-3 py-1 text-sm bg-indigo-600 rounded hover:bg-indigo-500"
            onClick={onShowMerge}
          >
            Merge
          </button>
          <button
            className="px-3 py-1 text-sm bg-indigo-600 rounded hover:bg-indigo-500"
            onClick={onShowSplit}
          >
            Split
          </button>
          <button
            className="px-3 py-1 text-sm bg-green-600 rounded hover:bg-green-500"
            onClick={onExport}
          >
            Download
          </button>
        </>
      )}
    </div>
  );
}
