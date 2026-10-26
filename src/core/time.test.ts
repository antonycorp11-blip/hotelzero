import { describe, expect, it } from 'vitest';
import { SeededRandom } from './SeededRandom';
import { formatTime } from './time';
import { NARRATIVE_EVENTS } from '../data/narrativeEvents';

describe('deterministic loop helpers', () => {
  it('formats absolute minutes across midnight', () => {
    expect(formatTime(23 * 60 + 40)).toBe('23:40');
    expect(formatTime(24 * 60 + 17)).toBe('00:17');
  });

  it('replays the same random sequence from the same seed', () => {
    const a = new SeededRandom(1234);
    const b = new SeededRandom(1234);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });

  it('keeps every narrative transition connected to a real event', () => {
    const ids = new Set(NARRATIVE_EVENTS.map((event) => event.id));
    expect(new Set(ids).size).toBe(NARRATIVE_EVENTS.length);
    NARRATIVE_EVENTS.forEach((event) => event.parents.forEach((parent) => expect(ids.has(parent)).toBe(true)));
  });
});
