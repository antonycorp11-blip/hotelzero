import { CHARACTERS } from '../data/characters';
import { NARRATIVE_EVENTS } from '../data/narrativeEvents';
import { SaveSystem } from './SaveSystem';
import type { CharacterId, MetaState, RunState, SaveData } from './types';

const uid = (prefix: string): string => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

class Store {
  data: SaveData = SaveSystem.load();

  get run(): RunState | undefined { return this.data.activeRun; }
  get meta(): MetaState { return this.data.meta; }

  newRun(): RunState {
    const index = this.data.meta.nextRunIndex;
    const bodyId: CharacterId = index % 2 === 1 ? 'elise' : 'marta';
    const character = CHARACTERS[bodyId];
    const seed = 47000 + index * 7919;
    const run: RunState = {
      id: uid('run'), index, seed, bodyId, minute: 23 * 60 + 40,
      area: character.initialArea,
      x: bodyId === 'elise' ? 420 : 1020,
      y: bodyId === 'elise' ? 330 : 280,
      inventory: [...character.inventory], flags: {}, suspicion: 0,
      health: 100, mental: 100, events: [], ended: false,
    };
    this.data.meta.nextRunIndex += 1;
    this.data.activeRun = run;
    this.log('awakening', `run:${index}:body:${bodyId}`);
    this.persist();
    return run;
  }

  log(eventId: string, cause: string, choice = false): void {
    const run = this.run;
    if (!run || run.events.some((e) => e.eventId === eventId)) return;
    const definition = NARRATIVE_EVENTS.find((event) => event.id === eventId);
    if (!definition) return;
    run.events.push({ id: uid('event'), eventId, atMinute: run.minute, cause, choice });
    if (!definition.hidden && !this.meta.knownEvents.includes(eventId)) this.meta.knownEvents.push(eventId);
    this.persist();
  }

  discover(clueId: string, eventId: string): void {
    if (!this.meta.knownClues.includes(clueId)) this.meta.knownClues.push(clueId);
    this.log(eventId, `interaction:${clueId}`);
    this.persist();
  }

  endRun(ending: string): void {
    const run = this.run;
    if (!run || run.ended) return;
    run.ended = true;
    run.ending = ending;
    this.meta.runs.push({
      id: run.id, index: run.index, seed: run.seed, bodyId: run.bodyId,
      duration: run.minute - (23 * 60 + 40), ending,
      discoveries: run.events.filter((event) => event.eventId.includes('found')).length,
      events: [...run.events],
    });
    this.persist();
  }

  abandonEndedRun(): void {
    delete this.data.activeRun;
    this.persist();
  }

  persist(): void { SaveSystem.save(this.data); }
  has(eventId: string): boolean { return Boolean(this.run?.events.some((event) => event.eventId === eventId)); }
}

export const gameStore = new Store();
