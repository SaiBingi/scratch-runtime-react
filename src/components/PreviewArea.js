import React from "react";
import Sprite from "./Sprite";

export default function PreviewArea({ sprites }) {
  return (
    <div className="flex-none h-full p-2 relative">
      {sprites.map((sprite) => (
        <Sprite
          key={sprite.id}
          x={sprite.x}
          y={sprite.y}
          vx={sprite.vx}
          type={sprite.type}
          flipped={sprite.flipped}
          rotation={sprite.rotation}
          message={sprite.message}
          messageType={sprite.messageType}
        />
      ))}
    </div>
  );
}
