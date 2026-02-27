import { useEditorStore } from '../../store/editorStore';
import type { Tool } from '../../types';

const SWATCHES = [
  '#ffeb3b', // yellow
  '#f44336', // red
  '#4caf50', // green
  '#2196f3', // blue
  '#e91e63', // pink
  '#ff9800', // orange
  '#00bcd4', // cyan
  '#ffffff', // white
];

const TOOLS_WITH_OPACITY: Tool[] = ['highlight', 'draw'];

export function ColorPicker() {
  const annotationColor = useEditorStore((s) => s.annotationColor);
  const annotationOpacity = useEditorStore((s) => s.annotationOpacity);
  const setAnnotationColor = useEditorStore((s) => s.setAnnotationColor);
  const setAnnotationOpacity = useEditorStore((s) => s.setAnnotationOpacity);
  const activeTool = useEditorStore((s) => s.activeTool);

  const showOpacity = TOOLS_WITH_OPACITY.includes(activeTool);

  return (
    <div className="flex items-center gap-1">
      {/* Swatches */}
      {SWATCHES.map((swatch) => (
        <button
          key={swatch}
          title={swatch}
          className="w-5 h-5 rounded-sm border border-gray-500 flex-shrink-0"
          style={{
            backgroundColor: swatch,
            outline: annotationColor === swatch ? '2px solid white' : undefined,
            outlineOffset: '1px',
          }}
          onClick={() => setAnnotationColor(swatch)}
        />
      ))}

      {/* Custom color input */}
      <label title="Custom color" className="w-5 h-5 rounded-sm border border-gray-500 overflow-hidden cursor-pointer flex-shrink-0">
        <input
          type="color"
          value={annotationColor}
          onChange={(e) => setAnnotationColor(e.target.value)}
          className="opacity-0 w-full h-full cursor-pointer"
          style={{ marginTop: '-100%' }}
        />
        <div
          className="w-5 h-5 rounded-sm border-2 border-dashed border-gray-400 flex items-center justify-center text-xs"
          style={{ marginTop: '-100%', backgroundColor: annotationColor }}
        >
          +
        </div>
      </label>

      {/* Opacity slider */}
      {showOpacity && (
        <>
          <div className="w-px h-5 bg-gray-600 mx-1" />
          <span className="text-xs text-gray-300">Opacity</span>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={annotationOpacity}
            onChange={(e) => setAnnotationOpacity(parseFloat(e.target.value))}
            className="w-20"
            title={`Opacity: ${Math.round(annotationOpacity * 100)}%`}
          />
          <span className="text-xs text-gray-300 w-8">
            {Math.round(annotationOpacity * 100)}%
          </span>
        </>
      )}
    </div>
  );
}
