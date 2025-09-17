export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export const hsl = (h: number, s = 80, l = 60) =>
  `hsl(${Math.round(h)} ${s}% ${l}%)`;
