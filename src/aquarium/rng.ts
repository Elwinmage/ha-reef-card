/**
 * Seeded pseudo-random numbers (mulberry32): the same aquarium starts the
 * same way on every render, so fish do not jump around when the card is
 * rebuilt.
 */

export class Rng {
  private _state: number;

  constructor(seed: number | string) {
    this._state = typeof seed === "number" ? seed >>> 0 : hash(seed);
  }

  /** Next number in [0, 1). */
  next(): number {
    this._state = (this._state + 0x6d2b79f5) >>> 0;
    let t = this._state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Number in [min, max). */
  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  /** Integer in [min, max]. */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /** One element of a non-empty array. */
  pick<T>(items: T[]): T {
    return items[
      Math.min(items.length - 1, Math.floor(this.next() * items.length))
    ];
  }
}

/** 32-bit FNV-1a hash of a string. */
export function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
