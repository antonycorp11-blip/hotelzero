import Phaser from 'phaser';
import { gameStore } from '../core/GameStore';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#090a10');
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x141725, 0x141725, 0x090a10, 0x090a10, 1);
    bg.fillRect(0, 0, width, height);
    for (let x = 40; x < width; x += 96) {
      bg.lineStyle(1, 0x6c604b, 0.12).lineBetween(x, 0, x - 180, height);
    }
    this.add.rectangle(width / 2, 112, 3, 60, 0xd0aa5b, 0.75);
    this.add.text(width / 2, 185, 'HOTEL', {
      fontFamily: 'Cormorant Garamond', fontSize: '86px', color: '#ede2c8', letterSpacing: 24,
    }).setOrigin(0.5);
    this.add.text(width / 2, 263, 'ZERO', {
      fontFamily: 'Cormorant Garamond', fontSize: '86px', color: '#b38b4d', letterSpacing: 38,
    }).setOrigin(0.5);
    this.add.text(width / 2, 326, 'A NOITE SE LEMBRA DE VOCÊ', {
      fontFamily: 'Inter', fontSize: '14px', color: '#858391', letterSpacing: 6,
    }).setOrigin(0.5);

    const canContinue = Boolean(gameStore.run && !gameStore.run.ended);
    let y = 430;
    if (canContinue) {
      this.button(width / 2, y, 'CONTINUAR A NOITE', () => this.scene.start('Hotel'));
      y += 64;
    }
    this.button(width / 2, y, gameStore.meta.runs.length ? 'INICIAR NOVO LOOP' : 'INICIAR', () => {
      if (gameStore.run?.ended) gameStore.abandonEndedRun();
      if (!gameStore.run) gameStore.newRun();
      this.scene.start('Hotel');
    });
    if (gameStore.meta.runs.length) {
      this.button(width / 2, y + 64, 'MAPA DAS RUNS', () => this.scene.start('MindMap', { from: 'Menu' }));
    }
    this.add.text(width / 2, height - 42, 'WASD / SETAS · E INTERAGIR · J DIÁRIO · M MAPA MENTAL · SHIFT ACELERAR', {
      fontFamily: 'Inter', fontSize: '12px', color: '#666572', letterSpacing: 1,
    }).setOrigin(0.5);
  }

  private button(x: number, y: number, label: string, callback: () => void): void {
    const panel = this.add.rectangle(x, y, 340, 48, 0x161720, 0.92).setStrokeStyle(1, 0x9a7a45).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, { fontFamily: 'Inter', fontSize: '14px', color: '#e7dbc2', letterSpacing: 2 }).setOrigin(0.5);
    panel.on('pointerover', () => { panel.setFillStyle(0x24212a); text.setColor('#ffffff'); });
    panel.on('pointerout', () => { panel.setFillStyle(0x161720); text.setColor('#e7dbc2'); });
    panel.on('pointerdown', callback);
  }
}
