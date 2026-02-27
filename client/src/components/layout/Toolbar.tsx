import { useEditorStore } from '../../store/editorStore';
import { useZoom } from '../../hooks/useZoom';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { ColorPicker } from './ColorPicker';
import type { Tool } from '../../types';

const tools: { id: Tool; label: string; icon: string }[] = [
  { id: 'select', label: 'Select', icon: '↖' },
  { id: 'text', label: 'Text', icon: 'T' },
  { id: 'highlight', label: 'Highlight', icon: '■' },
  { id: 'draw', label: 'Draw', icon: '✎' },
];

const COLOR_TOOLS: Tool[] = ['text', 'highlight', 'draw'];

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
  const pageRotations = useEditorStore((s) => s.pageRotations);
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage);
  const rotatePage = useEditorStore((s) => s.rotatePage);
  const { zoom, zoomIn, zoomOut } = useZoom();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  const currentOriginalIndex = pageOrder[currentPage];

  return (
    <div className="h-12 bg-gray-800 text-white flex items-center px-4 gap-2 shrink-0 overflow-x-auto">
      <span className="font-semibold mr-2 shrink-0">PDF Editor</span>

      {file && (
        <>
          {/* Tool buttons */}
          <div className="flex border border-gray-600 rounded overflow-hidden shrink-0">
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

          {/* Color picker (for text/highlight/draw tools) */}
          {COLOR_TOOLS.includes(activeTool) && (
            <>
              <div className="w-px h-6 bg-gray-600 mx-1 shrink-0" />
              <ColorPicker />
            </>
          )}

          <div className="w-px h-6 bg-gray-600 mx-1 shrink-0" />

          {/* Undo / Redo */}
          <button
            className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-40"
            title="Undo (Ctrl+Z)"
            disabled={!canUndo}
            onClick={() => undo()}
          >
            ↶
          </button>
          <button
            className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-40"
            title="Redo (Ctrl+Shift+Z)"
            disabled={!canRedo}
            onClick={() => redo()}
          >
            ↷
          </button>

          <div className="w-px h-6 bg-gray-600 mx-1 shrink-0" />

          {/* Rotate current page */}
          <button
            className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600"
            title="Rotate page left 90°"
            onClick={() => rotatePage(currentOriginalIndex, -90)}
          >
            ↺
          </button>
          <button
            className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600"
            title="Rotate page right 90°"
            onClick={() => rotatePage(currentOriginalIndex, 90)}
          >
            ↻
          </button>
          <span className="text-xs text-gray-400 shrink-0">
            {pageRotations[currentOriginalIndex] || 0}°
          </span>

          <div className="w-px h-6 bg-gray-600 mx-1 shrink-0" />

          {/* Zoom */}
          <button className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 shrink-0" onClick={zoomOut}>
            −
          </button>
          <span className="text-sm w-12 text-center shrink-0">{Math.round(zoom * 100)}%</span>
          <button className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 shrink-0" onClick={zoomIn}>
            +
          </button>

          <div className="w-px h-6 bg-gray-600 mx-1 shrink-0" />

          {/* Page nav */}
          <button
            className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-40 shrink-0"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ‹
          </button>
          <span className="text-sm shrink-0">
            {currentPage + 1} / {pageOrder.length}
          </span>
          <button
            className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-40 shrink-0"
            disabled={currentPage >= pageOrder.length - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            ›
          </button>

          <div className="flex-1" />

          {/* Actions */}
          <button
            className="px-3 py-1 text-sm bg-indigo-600 rounded hover:bg-indigo-500 shrink-0"
            onClick={onShowMerge}
          >
            Merge
          </button>
          <button
            className="px-3 py-1 text-sm bg-indigo-600 rounded hover:bg-indigo-500 shrink-0"
            onClick={onShowSplit}
          >
            Split
          </button>
          <button
            className="px-3 py-1 text-sm bg-green-600 rounded hover:bg-green-500 shrink-0"
            onClick={onExport}
          >
            Download
          </button>
        </>
      )}
    </div>
  );
}
