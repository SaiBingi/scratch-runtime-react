import React from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { BLOCK_TYPES } from "./blocks/blockTypes";
import { FaTrash } from "react-icons/fa";

/* ---------- Block Label Renderer ---------- */

function getBlockText(block) {
  switch (block.type) {
    case BLOCK_TYPES.SAY:
      return `say ${block.text} for ${block.seconds} seconds`;

    case BLOCK_TYPES.THINK:
      return `think ${block.text} for ${block.seconds} seconds`;

    case BLOCK_TYPES.MOVE:
      return `move ${block.steps} steps`;

    case BLOCK_TYPES.TURN:
      return `turn ${block.degrees} degrees`;

    case BLOCK_TYPES.GOTO:
      return `go to x:${block.x} y:${block.y}`;

    case BLOCK_TYPES.REPEAT:
      return `repeat ${block.times} times`;

    default:
      return block.type;
  }
}

/* ---------- Sortable Block ---------- */

function SortableBlock({ block, onDelete }) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    listeners,
    attributes,
  } = useSortable({ id: block._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between px-3 py-2 mb-2 rounded
        ${isDragging ? "bg-purple-600" : "bg-purple-400"}
        text-white`}
    >
      <div
        {...listeners}
        {...attributes}
        className="flex-1 cursor-grab select-none"
      >
        {getBlockText(block)}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation(); // prevents drag
          onDelete(block._id);
        }}
        className="ml-3 flex items-center justify-center
                   w-6 h-6 rounded
                   text-white/80 hover:text-white hover:bg-red-500"
        title="Delete block"
      >
        <FaTrash size={12} />
      </button>
    </div>
  );
}

/* ---------- Recursive Renderer ---------- */

function BlockRenderer({ blocks, onDelete }) {
  return (
    <SortableContext
      items={blocks.map((b) => b._id)}
      strategy={verticalListSortingStrategy}
    >
      {blocks.map((block) => (
        <div key={block._id} className="ml-2">
          <SortableBlock block={block} onDelete={onDelete} />

          {block.type === BLOCK_TYPES.REPEAT && (
            <RepeatBody block={block} onDelete={onDelete} />
          )}
        </div>
      ))}
    </SortableContext>
  );
}

/* ---------- Repeat Body ---------- */

function RepeatBody({ block, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `repeat-body-${block._id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`ml-6 mt-2 mb-2 p-2 rounded border-2 border-dashed
        ${isOver ? "bg-blue-100 border-blue-400" : "border-gray-300"}`}
    >
      {block.body.length === 0 && (
        <div className="text-xs italic text-gray-400">drop blocks here</div>
      )}

      <BlockRenderer blocks={block.body} onDelete={onDelete} />
    </div>
  );
}

/* ---------- MidArea ---------- */

export default function MidArea({
  script,
  selectedSpriteId,
  onDeleteBlock,
  onDeleteAll,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "script-drop-zone",
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-4 transition-colors ${
        isOver ? "bg-blue-50" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center mb-2">
        <h3 className="font-bold">Script for {selectedSpriteId}</h3>

        <button
          onClick={onDeleteAll}
          className="ml-auto px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All
        </button>
      </div>

      {script.length === 0 && (
        <div className="text-gray-400 italic">Drag blocks here</div>
      )}

      <BlockRenderer blocks={script} onDelete={onDeleteBlock} />
    </div>
  );
}
