import { BLOCK_TYPES } from "../blocks/blockTypes";

export function expandScript(blocks) {
  let result = [];

  for (const block of blocks) {
    if (block.type === BLOCK_TYPES.REPEAT) {
      for (let i = 0; i < block.times; i++) {
        result.push(...expandScript(block.body));
      }
    } else {
      result.push(block);
    }
  }

  return result;
}
