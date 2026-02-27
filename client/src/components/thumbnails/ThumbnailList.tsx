import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useEditorStore } from '../../store/editorStore';
import { ThumbnailItem } from './ThumbnailItem';

interface Props {
  pdfDoc: PDFDocumentProxy;
}

export function ThumbnailList({ pdfDoc }: Props) {
  const pageOrder = useEditorStore((s) => s.pageOrder);
  const setPageOrder = useEditorStore((s) => s.setPageOrder);
  const currentPage = useEditorStore((s) => s.currentPage);
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pageOrder.indexOf(Number(active.id));
    const newIndex = pageOrder.indexOf(Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...pageOrder];
    const [removed] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, removed);
    setPageOrder(newOrder);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={pageOrder} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2">
          {pageOrder.map((originalIndex, displayIndex) => (
            <ThumbnailItem
              key={originalIndex}
              id={originalIndex}
              pdfDoc={pdfDoc}
              pageIndex={originalIndex}
              displayIndex={displayIndex}
              isActive={displayIndex === currentPage}
              onClick={() => setCurrentPage(displayIndex)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
