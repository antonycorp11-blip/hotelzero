import Phaser from 'phaser';

export const eventBus = new Phaser.Events.EventEmitter();

export const EVENTS = {
  RUN_UPDATED: 'run-updated',
  INTERACT: 'interact',
  OPEN_JOURNAL: 'open-journal',
  CLOSE_OVERLAY: 'close-overlay',
} as const;
