// Fisher-Yates, non-mutating. Only ever called from a useState initializer
// inside a step component (i.e. once per run, client-side), never during render
// — a fresh shuffle on every render would reorder tiles under the child's
// fingers.
export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
