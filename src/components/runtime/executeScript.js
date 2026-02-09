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
  // defensive: ensure script is an array
  let pc = 0;

  while (pc < (script?.length || 0)) {
    const block = script[pc];

    /* =============== MOVE =============== */
    if (block.type === BLOCK_TYPES.MOVE) {
      const totalSteps = Math.abs(Number(block.steps) || 0);

      // initialize direction ONLY ONCE
      setSprites((prev) =>
        prev.map((s) =>
          s.id === spriteId && s.direction == null
            ? { ...s, direction: block.steps >= 0 ? 1 : -1 }
            : s,
        ),
      );

      let remaining = totalSteps;

      while (remaining > 0) {
        setSprites((prev) => {
          const next = prev.map((s) => ({ ...s }));
          const self = next.find((s) => s.id === spriteId);
          if (!self) return prev;

          // move using persistent direction
          self.x += self.direction;

          // collision detection
          for (const other of next) {
            if (other.id === self.id) continue;

            if (isColliding(self, other)) {
              // rollback
              self.x -= self.direction;

              // reverse BOTH permanently
              self.direction *= -1;
              other.direction = (other.direction ?? 1) * -1;

              // separate to avoid sticking
              self.x += self.direction * 6;
              other.x += other.direction * 6;

              break;
            }
          }

          return next;
        });

        remaining--;
        await sleep(16);
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
      // small pause to show rotation
      // eslint-disable-next-line no-await-in-loop
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
      // eslint-disable-next-line no-await-in-loop
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
        // eslint-disable-next-line no-await-in-loop
        await executeScript(block.body || [], spriteId, setSprites);
      }
      pc++;
      continue;
    }

    /* =============== FALLBACK =============== */
    pc++;
    // eslint-disable-next-line no-await-in-loop
    await sleep(60);
  }
}
