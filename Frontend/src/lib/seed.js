/**
 * Deterministic PRNG using FNV-1a hash algorithm.
 * Returns a value between 0 and 1 for any string key.
 */
export function hashString(str) {
  let hash = 0x811c9dc5;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0) / 4294967295;
}

/**
 * Signed jitter helper.
 * Returns a deterministic pseudo-random float between -amount and +amount.
 */
export function jitter(id, amount = 1) {
  const h = hashString(id);
  return (h * 2 - 1) * amount;
}
