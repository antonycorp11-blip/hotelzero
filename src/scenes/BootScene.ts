import Phaser from 'phaser';
import { registerCartoonAssets } from '../world/CartoonAssets';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload(): void {
    this.load.image('floor-atlas', 'assets/cartoon/floors.png');
    this.load.image('props-atlas', 'assets/cartoon/props.png');
    this.load.image('character-atlas', 'assets/cartoon/walk.png');
  }
  create(): void {
    registerCartoonAssets(this);
    const glow = this.add.graphics();
    glow.fillStyle(0xe7b961, 0.8).fillCircle(12, 12, 6);
    glow.generateTexture('interaction-glow', 24, 24);
    glow.destroy();
    this.scene.start('Menu');
  }
}
