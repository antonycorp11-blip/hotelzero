import Phaser from 'phaser';
import { gameStore } from '../core/GameStore';
import { CHARACTERS, ALL_CAST } from '../data/characters';
import { ITEMS } from '../data/items';

export class JournalScene extends Phaser.Scene {
  constructor() { super('Journal'); }

  create(): void {
    if (this.scene.isActive('Hotel')) this.scene.pause('Hotel');
    const run = gameStore.run;
    this.add.rectangle(640, 360, 1280, 720, 0x080910, 0.97);
    this.add.rectangle(640, 360, 1180, 630, 0x12131b).setStrokeStyle(1, 0x765d37);
    this.add.text(92, 72, 'DIÁRIO DE CONHECIMENTO', { fontFamily: 'Cormorant Garamond', fontSize: '34px', color: '#e4d5b6', letterSpacing: 4 });
    this.add.text(92, 118, 'O QUE VOCÊ SABE SOBREVIVE AO QUE VOCÊ É.', { fontFamily: 'Inter', fontSize: '11px', color: '#777482', letterSpacing: 3 });
    this.section(92, 174, 'PISTAS PERSISTENTES');
    if (!gameStore.meta.knownClues.length) {
      this.add.text(92, 216, 'Nenhuma pista sobreviveu ainda.', { fontFamily: 'Inter', fontSize: '15px', color: '#777482' });
    } else {
      gameStore.meta.knownClues.forEach((id, index) => {
        const item = ITEMS[id];
        this.add.text(92, 215 + index * 64, `◆ ${item?.name ?? id}`, { fontFamily: 'Inter', fontSize: '15px', color: '#d5ae64' });
        this.add.text(114, 240 + index * 64, item?.description ?? '', { fontFamily: 'Inter', fontSize: '13px', color: '#aba6b0', wordWrap: { width: 480 } });
      });
    }
    this.section(670, 174, 'INVENTÁRIO DESTA RUN');
    (run?.inventory ?? []).slice(0, 6).forEach((id, index) => {
      const item = ITEMS[id] ?? (id === 'chave_201' ? { name: 'Chave do 201', description: 'Emprestada por Marta. Ainda está morna.' } : { name: id, description: '' });
      this.add.text(670, 215 + index * 48, `□ ${item.name}`, { fontFamily: 'Inter', fontSize: '14px', color: '#dad2c2' });
      this.add.text(688, 237 + index * 48, item.description, { fontFamily: 'Inter', fontSize: '11px', color: '#7f7b87', wordWrap: { width: 450 } });
    });
    this.section(670, 515, 'PESSOAS RECONHECIDAS');
    const known = Object.values(CHARACTERS).map((character) => character.name);
    this.add.text(670, 554, ALL_CAST.map((name) => known.includes(name) ? name : '???').join('  ·  '), { fontFamily: 'Inter', fontSize: '13px', color: '#9994a0', wordWrap: { width: 450 }, lineSpacing: 10 });
    this.button(1105, 653, 'FECHAR  J', () => this.close());
    this.input.keyboard!.once('keydown-J', () => this.close());
    this.input.keyboard!.once('keydown-ESC', () => this.close());
  }

  private section(x: number, y: number, label: string): void {
    this.add.text(x, y, label, { fontFamily: 'Inter', fontSize: '12px', color: '#98794b', letterSpacing: 2 });
    this.add.rectangle(x, y + 25, 485, 1, 0x51442f).setOrigin(0, 0.5);
  }

  private button(x: number, y: number, text: string, action: () => void): void {
    this.add.text(x, y, text, { fontFamily: 'Inter', fontSize: '13px', color: '#dcc89f', backgroundColor: '#22212a', padding: { x: 16, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', action);
  }

  private close(): void { this.scene.stop(); if (this.scene.isPaused('Hotel')) this.scene.resume('Hotel'); }
}
