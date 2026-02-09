import { BLOCK_TYPES } from "./blockTypes";

export function createMoveBlock(steps = 10) {
  return {
    type: BLOCK_TYPES.MOVE,
    steps,
  };
}

export function createTurnLeftBlock(deg = 15) {
  return {
    type: BLOCK_TYPES.TURN_LEFT,
    degrees: deg,
  };
}

export function createTurnRightBlock(deg = 15) {
  return {
    type: BLOCK_TYPES.TURN_RIGHT,
    degrees: deg,
  };
}

export function createRepeatBlock(times = 5, body = []) {
  return {
    type: BLOCK_TYPES.REPEAT,
    times,
    body,
  };
}

export const createGoToBlock = (x, y) => ({
  type: BLOCK_TYPES.GOTO,
  x,
  y,
});

export const createSayBlock = (text, seconds = 2) => ({
  type: "say",
  text,
  seconds,
});

export const createThinkBlock = (text, seconds = 2) => ({
  type: "think",
  text,
  seconds,
});
