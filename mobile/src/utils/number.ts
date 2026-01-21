export function clampInt0to10(v: string) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 10) return null;
  return n;
}
