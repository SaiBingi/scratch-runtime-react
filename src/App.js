import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import SpriteList from "./components/SpriteList";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { executeScript } from "./components/runtime/executeScript";
import { SPRITES } from "./components/constants";

export default function App() {
  /* ---------------- DnD sensors ---------------- */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  /* ---------------- Sprites ---------------- */
  const [sprites, setSprites] = useState([
    {
      id: "sprite-" + Date.now(),
      name: SPRITES.cat.toUpperCase(),
      type: SPRITES.cat,
      rotation: 0,
      x: 80,
      y: 150,
      direction: 1,
    },
  ]);

  /* ---------------- Scripts per sprite ---------------- */
  const [scriptsById, setScriptsById] = useState({
    [sprites[0].id]: [],
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSpriteId, setSelectedSpriteId] = useState(sprites[0].id);

  /* ---------------- Helpers ---------------- */
  function findAndRemove(blocks, id) {
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i]._id === id) {
        return blocks.splice(i, 1)[0];
      }
      if (blocks[i].body) {
        const found = findAndRemove(blocks[i].body, id);
        if (found) return found;
      }
    }
    return null;
  }

  function addSprite(type) {
    const id = "sprite-" + Date.now();
    setSprites((p) => [
      ...p,
      {
        id,
        name:
          type === SPRITES.cat
            ? SPRITES.cat.toUpperCase()
            : SPRITES.dog.toUpperCase(),
        type,
        x: 160,
        y: 140,
        rotation: 0,
        direction: 1,
      },
    ]);
    setScriptsById((p) => ({ ...p, [id]: [] }));
    setSelectedSpriteId(id);
  }

  function findContainer(blocks, parentId) {
    if (parentId === "root") return blocks;

    for (const b of blocks) {
      if (b._id === parentId) return b.body;
      if (b.body) {
        const found = findContainer(b.body, parentId);
        if (found) return found;
      }
    }
    return null;
  }

  /* ---------------- Play ---------------- */
  async function onPlay() {
    if (isPlaying) return;

    setIsPlaying(true);

    setSprites((prev) =>
      prev.map((s) => ({
        ...s,
        direction: 1, // Before every play animation starts, set the direction of each sprite to 1
      })),
    );

    const spriteIds = Object.keys(scriptsById);

    const tasks = spriteIds.map((spriteId) =>
      executeScript(scriptsById[spriteId] || [], spriteId, setSprites),
    );

    // Wait until all sprites finish
    await Promise.all(tasks);

    setSprites((prev) =>
      prev.map((s) => ({
        ...s,
        direction: 1, // After every play animation completion, set the direction of each sprite to 1
      })),
    );

    setIsPlaying(false);
  }

  /* ---------------- Render ---------------- */
  return (
    <div className="bg-blue-100 pt-6 font-sans h-screen">
      <div className="h-full overflow-hidden flex flex-row">
        {/* LEFT: Sidebar + Script editor */}
        <div className="flex-1 h-full overflow-hidden flex flex-row bg-white border-t border-r rounded-tr-xl mr-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return;

              const fromPalette = active.data?.current?.type;

              setScriptsById((prev) => {
                const script = structuredClone(prev[selectedSpriteId] || []);

                let block;

                /* Create or extract block */
                if (fromPalette) {
                  block = {
                    _id: crypto.randomUUID(),
                    type: fromPalette,
                    label: active.data.current.label,
                    ...active.data.current.default,
                    body: fromPalette === "repeat" ? [] : undefined,
                  };
                } else {
                  block = findAndRemove(script, active.id);
                  if (!block) return prev;
                }

                /* Determine drop container */
                let parentId = "root";

                if (over.id.startsWith("repeat-body-")) {
                  parentId = over.id.replace("repeat-body-", "");
                } else if (over.data?.current?.parentId) {
                  parentId = over.data.current.parentId;
                }

                const container = findContainer(script, parentId);
                if (!container) return prev;

                const overIndex = container.findIndex((b) => b._id === over.id);

                if (overIndex === -1) {
                  container.push(block);
                } else {
                  container.splice(overIndex, 0, block);
                }

                return {
                  ...prev,
                  [selectedSpriteId]: script,
                };
              });
            }}
          >
            <Sidebar />

            <MidArea
              script={scriptsById[selectedSpriteId] || []}
              selectedSpriteId={selectedSpriteId}
              onDeleteBlock={(blockId) => {
                setScriptsById((prev) => {
                  const next = structuredClone(prev);
                  findAndRemove(next[selectedSpriteId], blockId);
                  return next;
                });
              }}
              onDeleteAll={() => {
                setScriptsById((prev) => ({
                  ...prev,
                  [selectedSpriteId]: [],
                }));
              }}
            />
          </DndContext>
        </div>

        {/* RIGHT: Controls + Sprites + Stage */}
        <div className="w-1/3 h-full flex flex-col bg-white border-t border-l rounded-tl-xl ml-2">
          <div className="p-2 flex gap-2 border-b">
            <button
              onClick={onPlay}
              disabled={isPlaying}
              className={`px-4 py-2 rounded font-bold ${
                isPlaying
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white"
              }`}
            >
              ▶ Play
            </button>

            <button
              onClick={() => addSprite(SPRITES.cat)}
              disabled={isPlaying}
              className={`px-3 py-2 rounded text-white
                ${
                  isPlaying
                    ? "bg-yellow-300 cursor-not-allowed opacity-60"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
            >
              + Cat
            </button>

            <button
              onClick={() => addSprite(SPRITES.dog)}
              disabled={isPlaying}
              className={`px-3 py-2 rounded text-white
                ${
                  isPlaying
                    ? "bg-blue-300 cursor-not-allowed opacity-60"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
              + Dog
            </button>
          </div>

          <SpriteList
            sprites={sprites}
            selectedId={selectedSpriteId}
            onSelect={setSelectedSpriteId}
          />

          <div className="flex-1 p-2 overflow-hidden">
            <PreviewArea sprites={sprites} />
          </div>
        </div>
      </div>
    </div>
  );
}
