import { Trash2, Pencil, Power, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Stop = {
  id: string;
  latitude?: number | null;
  longitude?: number | null;
  name?: string | null;
  is_active?: boolean;
};

type Props = {
  stops: Stop[];
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (stop: Stop) => void;
  onReorder: (stops: Stop[]) => void;
};

type RowProps = {
  stop: Stop;
  index: number;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (stop: Stop) => void;
};

function SortableRow({ stop, index, onDelete, onToggle, onEdit }: RowProps) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const isActive = stop.is_active ?? true;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-gray-50 transition-colors"
    >

      {/* Drag Handle */}
      <td className="px-3 cursor-grab" {...attributes} {...listeners}>
        <GripVertical size={16} className="text-gray-400" />
      </td>

      {/* Order Number */}
      <td className="px-5 py-4 text-gray-700 font-semibold">
        {index + 1}
      </td>

      {/* Stop Name */}
      <td className="px-5 py-4 font-medium text-gray-800 truncate">
        {stop.name ? (
          stop.name
        ) : (
          <span className="text-gray-400 italic">Unnamed Stop</span>
        )}
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 flex justify-center gap-2">

        <button
          onClick={() => onEdit(stop)}
          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => onToggle(stop.id, !isActive)}
          className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 hover:text-yellow-700"
        >
          <Power size={16} />
        </button>

        <button
          onClick={() => onDelete(stop.id)}
          className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700"
        >
          <Trash2 size={16} />
        </button>

      </td>

    </tr>
  );
}

export default function StopsTable({
  stops,
  onDelete,
  onToggle,
  onEdit,
  onReorder
}: Props) {

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  function handleDragEnd(event: any) {

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = stops.findIndex(s => s.id === active.id);
    const newIndex = stops.findIndex(s => s.id === over.id);

    const newStops = arrayMove(stops, oldIndex, newIndex);

    onReorder(newStops);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">

      <div className="flex-1 overflow-y-auto min-h-0">

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >

          <table className="w-full text-sm table-fixed">

            <thead className="bg-green-900 text-white uppercase text-xs tracking-wider sticky top-0 shadow-sm">
              <tr>
                <th className="w-[40px]"></th>
                <th className="w-[80px] text-left px-5 py-3 font-semibold">Order</th>
                <th className="text-left px-5 py-3 font-semibold">Bus Stop</th>
                <th className="w-[120px] text-left px-5 py-3 font-semibold">Status</th>
                <th className="w-[140px] text-center px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <SortableContext
              items={stops.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >

              <tbody className="divide-y">

                {stops.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-gray-400 italic"
                    >
                      No stops added yet
                    </td>
                  </tr>
                ) : (
                  stops.map((stop, index) => (
                    <SortableRow
                      key={stop.id}
                      stop={stop}
                      index={index}
                      onDelete={onDelete}
                      onToggle={onToggle}
                      onEdit={onEdit}
                    />
                  ))
                )}

              </tbody>

            </SortableContext>

          </table>

        </DndContext>

      </div>

    </div>
  );
}