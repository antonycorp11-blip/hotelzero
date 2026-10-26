import Phaser from 'phaser';
import { CHARACTERS } from '../data/characters';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create(): void {
    this.createPlaceholderTextures();
    this.scene.start('Menu');
  }

  private createPlaceholderTextures(): void {
    const graphics = this.add.graphics();
    Object.values(CHARACTERS).forEach((character) => {
      graphics.clear();
      graphics.fillStyle(0x101018).fillEllipse(18, 34, 30, 16);
      graphics.fillStyle(character.color).fillRoundedRect(7, 11, 22, 28, 7);
      graphics.fillStyle(0xe2c5a4).fillCircle(18, 9, 8);
      graphics.lineStyle(2, 0xf3e6cc, 0.85).strokeRoundedRect(7, 11, 22, 28, 7);
      graphics.generateTexture(`character-${character.id}`, 36, 44);
    });
    graphics.clear();
    graphics.fillStyle(0xb7914a).fillRoundedRect(2, 2, 44, 12, 3);
    graphics.fillStyle(0x31291e).fillRect(7, 7, 34, 4);
    graphics.generateTexture('interaction-glow', 48, 16);
    graphics.destroy();
  }
}
