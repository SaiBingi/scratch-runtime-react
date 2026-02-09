import React from "react";
import CatSprite from "./CatSprite";
import DogSprite from "./DogSprite";
import { FaCloud } from "react-icons/fa";
import { SPRITES, MessageType } from "./constants";

export default function Sprite({
  x,
  y,
  type,
  rotation,
  direction,
  message,
  messageType,
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 95,
        height: 100,
        transform: `
          translate(-50%, -50%)
          rotate(${rotation}deg)
          scaleX(${direction === -1 ? -1 : 1})
        `,
        transformOrigin: "center center",
      }}
    >
      {message && (
        <div
          style={{
            position: "absolute",
            top: -45,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ffffff",
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: "6px 10px",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 10,
          }}
        >
          {messageType === MessageType.think && (
            <FaCloud size={14} color="#666" />
          )}
          <span>{message}</span>
        </div>
      )}
      {type === SPRITES.dog ? <DogSprite /> : <CatSprite />}
    </div>
  );
}
