/// <reference types="vite/client" />
import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { HotelScene } from './scenes/HotelScene';
import { JournalScene } from './scenes/JournalScene';
import { MindMapScene } from './scenes/MindMapScene';
import { SummaryScene } from './scenes/SummaryScene';

export const game = new Phaser.Game({
  type: Phaser.CANVAS,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#0b0c13',
  pixelArt: false,
  roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, MenuScene, HotelScene, JournalScene, MindMapScene, SummaryScene],
});

if (import.meta.env.DEV) Object.assign(window, { qaGame: game });
