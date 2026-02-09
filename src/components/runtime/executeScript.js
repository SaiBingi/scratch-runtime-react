import { BLOCK_TYPES } from "../blocks/blockTypes";

const SPRITE_WIDTH = 95;
const SPRITE_HEIGHT = 100;

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function isColliding(a, b) {
  return (
    a.x < b.x + SPRITE_WIDTH &&
    a.x + SPRITE_WIDTH > b.x &&
    a.y < b.y + SPRITE_HEIGHT &&
    a.y + SPRITE_HEIGHT > b.y
  );
}

export async function executeScript(script = [], spriteId, setSprites) {
  let pc = 0;

  while (pc < (script?.length || 0)) {
    const block = script[pc];

    /* =============== MOVE =============== */
    if (block.type === BLOCK_TYPES.MOVE) {
      const rawSteps = Number(block.steps) || 0;
      const inputDir = Math.sign(rawSteps) || 1;
      let remaining = Math.abs(rawSteps);

      while (remaining > 0) {
        let collidedWith = null;

        setSprites((prev) => {
          const next = prev.map((s) => ({ ...s }));
          const self = next.find((s) => s.id === spriteId);
          if (!self) return prev;

          // angle-based movement
          const angleRad = (self.rotation * Math.PI) / 180;
          const moveDir = inputDir * self.direction;

          const dx = Math.cos(angleRad) * moveDir;
          const dy = Math.sin(angleRad) * moveDir;

          // attempt move
          self.x += dx;
          self.y += dy;

          // detect collision ONLY
          for (const other of next) {
            if (other.id === self.id) continue;

            if (isColliding(self, other)) {
              collidedWith = other.id;

              // rollback movement
              self.x -= dx;
              self.y -= dy;
              break;
            }
          }

          return next;
        });

        // resolve collision
        if (collidedWith) {
          setSprites((prev) =>
            prev.map((s) => {
              if (s.id === spriteId || s.id === collidedWith) {
                return { ...s, direction: -s.direction };
              }
              return s;
            }),
          );
        }

        remaining--;
        await sleep(10);
      }

      pc++;
      continue;
    }

    /* =============== TURN =============== */
    if (block.type === BLOCK_TYPES.TURN) {
      const deg = Number(block.degrees) || 0;
      setSprites((prev) =>
        prev.map((s) =>
          s.id === spriteId
            ? { ...s, rotation: (s.rotation + deg + 360) % 360 }
            : s,
        ),
      );

      pc++;
      await sleep(60);
      continue;
    }

    /* =============== GOTO =============== */
    if (block.type === BLOCK_TYPES.GOTO) {
      setSprites((prev) =>
        prev.map((s) =>
          s.id === spriteId
            ? {
                ...s,
                x: Number(block.x) || 0,
                y: Number(block.y) || 0,
              }
            : s,
        ),
      );

      pc++;
      await sleep(60);
      continue;
    }

    /* =============== SAY / THINK =============== */
    if (block.type === BLOCK_TYPES.SAY || block.type === BLOCK_TYPES.THINK) {
      setSprites((prev) =>
        prev.map((s) =>
          s.id === spriteId
            ? {
                ...s,
                message: block.text ?? "",
                messageType: block.type,
              }
            : s,
        ),
      );

      const seconds = Number(block.seconds) || 0;
      await sleep(seconds * 1000);

      setSprites((prev) =>
        prev.map((s) =>
          s.id === spriteId ? { ...s, message: null, messageType: null } : s,
        ),
      );

      pc++;
      continue;
    }

    /* =============== REPEAT =============== */
    if (block.type === BLOCK_TYPES.REPEAT) {
      const times = Number(block.times) || 0;
      for (let i = 0; i < times; i++) {
        // recursive execution of the body array
        await executeScript(block.body || [], spriteId, setSprites);
      }
      pc++;
      continue;
    }

    pc++;
    await sleep(60);
  }
}
