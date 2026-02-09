import React from "react";

export default function SpriteList({ sprites = [], selectedId, onSelect }) {
  return (
    <div className="p-2 border-t">
      <div className="font-bold mb-2">Sprites</div>
      <div className="flex flex-row gap-2 overflow-x-auto">
        {sprites.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`p-2 rounded cursor-pointer border ${selectedId === s.id ? "border-indigo-600 bg-indigo-50" : "border-gray-200 bg-white"}`}
            style={{ minWidth: 100 }}
          >
            <div className="font-semibold">{s.name}</div>
            <div className="text-xs text-gray-500">{s.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
