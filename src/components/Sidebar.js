import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { BLOCK_CATALOG } from "./blocks/blockCatalog";
import { BLOCK_TYPES } from "./blocks/blockTypes";

function parseValueForPayload(key, value) {
  if (value === "" || value === undefined || value === null) return 0;
  if (key === "text") return value;

  const numericKeys = new Set([
    "seconds",
    "steps",
    "times",
    "degrees",
    "x",
    "y",
  ]);

  if (numericKeys.has(key)) {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }

  // fallback: return value as-is
  return value;
}

function PaletteBlock({ block }) {
  // keep config as strings for nicer editing UX (user can delete -> "")
  const [config, setConfig] = useState(() => {
    const res = {};
    // ensure block.default always exists
    const def = block.default || {};
    for (const k of Object.keys(def)) {
      // convert default values to strings for controlled inputs
      res[k] = def[k] === undefined || def[k] === null ? "" : String(def[k]);
    }
    return res;
  });

  // Build payload.default only once per drag (draggable's data)
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `palette-${block.type}`,
    data: {
      type: block.type,
      default: Object.fromEntries(
        Object.entries(config).map(([k, v]) => [k, parseValueForPayload(k, v)]),
      ),
    },
  });

  function update(key, value) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="bg-purple-500 text-white p-2 rounded mb-2 cursor-grab select-none"
    >
      {/* SAY / THINK */}
      {(block.type === BLOCK_TYPES.SAY || block.type === BLOCK_TYPES.THINK) && (
        <div className="flex flex-col gap-1">
          <div className="font-semibold">{block.type}</div>
          <input
            value={config.text ?? ""}
            placeholder="text"
            onChange={(e) => update("text", e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-black px-1 rounded"
          />
          <input
            value={config.seconds ?? ""}
            placeholder="seconds"
            onChange={(e) => update("seconds", e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-black px-1 rounded"
          />
        </div>
      )}

      {/* MOVE */}
      {block.type === BLOCK_TYPES.MOVE && (
        <div className="flex gap-2 items-center">
          move
          <input
            value={config.steps ?? ""}
            placeholder="+10 / -10"
            onChange={(e) => update("steps", e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-black px-1 rounded w-20"
          />
          steps
        </div>
      )}

      {/* TURN */}
      {block.type === BLOCK_TYPES.TURN && (
        <div className="flex items-center gap-2">
          turn
          <input
            placeholder="+15 / -15"
            value={config.degrees ?? ""}
            onChange={(e) => update("degrees", e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-black px-1 rounded w-20"
          />
          degrees
        </div>
      )}

      {/* GO TO */}
      {block.type === BLOCK_TYPES.GOTO && (
        <div className="flex gap-1 items-center">
          go to x:
          <input
            value={config.x ?? ""}
            placeholder="x"
            onChange={(e) => update("x", e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-black px-1 rounded w-12"
          />
          y:
          <input
            value={config.y ?? ""}
            placeholder="y"
            onChange={(e) => update("y", e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-black px-1 rounded w-12"
          />
        </div>
      )}

      {/* REPEAT */}
      {block.type === BLOCK_TYPES.REPEAT && (
        <div className="flex gap-2 items-center">
          repeat
          <input
            value={config.times ?? ""}
            placeholder="times"
            onChange={(e) => update("times", e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-black px-1 rounded w-16"
          />
          times
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  return (
    <div className="w-56 p-3 border-r bg-gray-100 overflow-y-auto">
      {Object.entries(BLOCK_CATALOG).map(([category, blocks]) => (
        <div key={category} className="mb-4">
          <h4 className="font-bold mb-2 capitalize">{category}</h4>
          {blocks.map((block) => (
            <PaletteBlock key={block.type} block={block} />
          ))}
        </div>
      ))}
    </div>
  );
}
