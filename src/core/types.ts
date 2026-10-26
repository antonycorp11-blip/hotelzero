export type CharacterId = 'elise' | 'marta' | 'augusto' | 'raul';
export type AreaId = 'lobby' | 'corridor' | 'room201' | 'room202' | 'office' | 'security';
export type Permission = 'reception' | 'guest-rooms' | 'management' | 'security';

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  role: string;
  personality: string;
  color: number;
  initialArea: AreaId;
  permissions: Permission[];
  inventory: string[];
  vulnerability: number;
  secret: string;
}

export type EventCategory = 'choice' | 'automatic' | 'clue' | 'death' | 'supernatural' | 'ending';

export interface NarrativeEventDefinition {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  parents: string[];
  hidden?: boolean;
}

export interface RunEvent {
  id: string;
  eventId: string;
  atMinute: number;
  cause: string;
  choice: boolean;
  discoveredConsequences?: string[];
}

export interface RunState {
  id: string;
  index: number;
  seed: number;
  bodyId: CharacterId;
  minute: number;
  area: AreaId;
  x: number;
  y: number;
  inventory: string[];
  flags: Record<string, boolean>;
  suspicion: number;
  health: number;
  mental: number;
  events: RunEvent[];
  ended: boolean;
  ending?: string;
}

export interface RunSummary {
  id: string;
  index: number;
  seed: number;
  bodyId: CharacterId;
  duration: number;
  ending: string;
  discoveries: number;
  events: RunEvent[];
}

export interface MetaState {
  knownClues: string[];
  knownEvents: string[];
  runs: RunSummary[];
  nextRunIndex: number;
}

export interface SaveData {
  version: 1;
  meta: MetaState;
  activeRun?: RunState;
  settings: { volume: number; textSpeed: number; reduceMotion: boolean };
}

export interface DialogueChoice {
  text: string;
  requires?: (run: RunState, meta: MetaState) => boolean;
  effect?: (run: RunState, meta: MetaState) => void;
  response: string;
  eventId?: string;
}

export interface DialogueNode {
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
}
