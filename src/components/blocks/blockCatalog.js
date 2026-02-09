import { BLOCK_TYPES } from "./blockTypes";

export const BLOCK_CATALOG = {
  motion: [
    {
      type: BLOCK_TYPES.MOVE,
      label: "move [10] steps",
      default: { steps: 10 },
    },
    {
      type: BLOCK_TYPES.TURN,
      label: "turn [degrees]",
      default: { degrees: 15 },
    },
    {
      type: BLOCK_TYPES.GOTO,
      label: "go to x:[0] y:[0]",
      default: { x: 0, y: 0 },
    },
  ],

  looks: [
    {
      type: BLOCK_TYPES.SAY,
      label: "say [Hello] for [2] seconds",
      default: { text: "Hello", seconds: 2 },
    },
    {
      type: BLOCK_TYPES.THINK,
      label: "think [Hmm] for [2] seconds",
      default: { text: "Hmm", seconds: 2 },
    },
  ],

  control: [
    {
      type: BLOCK_TYPES.REPEAT,
      label: "repeat [10] times",
      default: { times: 10, body: [] },
    },
  ],
};
