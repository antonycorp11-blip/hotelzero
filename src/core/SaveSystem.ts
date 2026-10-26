import type { SaveData } from './types';

const SAVE_KEY = 'hotel-zero-save-v1';

const defaults = (): SaveData => ({
  version: 1,
  meta: { knownClues: [], knownEvents: [], runs: [], nextRunIndex: 1 },
  settings: { volume: 0.7, textSpeed: 1, reduceMotion: false },
});

export class SaveSystem {
  static load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaults();
      const data = JSON.parse(raw) as Partial<SaveData>;
      if (data.version !== 1 || !data.meta || !data.settings) return defaults();
      return data as SaveData;
    } catch {
      return defaults();
    }
  }

  static save(data: SaveData): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  static clear(): void {
    localStorage.removeItem(SAVE_KEY);
  }
}
