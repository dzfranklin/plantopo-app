export function nonLocaleCompare(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}
