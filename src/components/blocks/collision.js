export function isColliding(a, b) {
  const W = 80;
  const H = 80;

  return Math.abs(a.x - b.x) < W && Math.abs(a.y - b.y) < H;
}
