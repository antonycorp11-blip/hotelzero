import Phaser from 'phaser';
import { gameStore } from '../core/GameStore';
import { CHARACTERS } from '../data/characters';
import { NARRATIVE_EVENTS } from '../data/narrativeEvents';

export class SummaryScene extends Phaser.Scene {
  constructor() { super('Summary'); }

  create(): void {
    const run = gameStore.run;
    if (!run) { this.scene.start('Menu'); return; }
    this.cameras.main.setBackgroundColor('#090a10');
    this.add.rectangle(640, 360, 1180, 640, 0x11121a).setStrokeStyle(1, 0x725a38);
    this.add.text(640, 78, run.ending === 'player_taken' ? 'VOCÊ MORREU' : 'A NOITE RECOMEÇA', { fontFamily: 'Cormorant Garamond', fontSize: '46px', color: run.ending === 'player_taken' ? '#b95055' : '#d7ad62', letterSpacing: 7 }).setOrigin(0.5);
    this.add.text(640, 137, `RUN ${run.index} · ${CHARACTERS[run.bodyId].name.toUpperCase()} · SEED ${run.seed}`, { fontFamily: 'Inter', fontSize: '12px', color: '#777482', letterSpacing: 2 }).setOrigin(0.5);
    const endingText: Record<string, string> = {
      player_taken: 'Você deslocou a vítima, mas não rompeu o vínculo. O hotel cobrou o corpo mais próximo.',
      night_closed: 'O assassinato se completou. O hotel preservou sua versão favorita da madrugada.',
      loop_survived: 'Marta sobreviveu e Augusto foi forçado a reconhecer o padrão. Algo mudou — pouco, mas de verdade.',
    };
    this.add.text(640, 188, endingText[run.ending ?? ''] ?? 'A noite acabou sem oferecer explicações.', { fontFamily: 'Inter', fontSize: '17px', color: '#d7d0c4', align: 'center', wordWrap: { width: 820 }, lineSpacing: 7 }).setOrigin(0.5, 0);
    this.add.text(160, 285, 'REGISTRO DA RUN', { fontFamily: 'Inter', fontSize: '12px', color: '#9b7b49', letterSpacing: 2 });
    run.events.slice(-7).forEach((entry, index) => {
      const event = NARRATIVE_EVENTS.find((definition) => definition.id === entry.eventId);
      const clock = `${Math.floor((entry.atMinute % 1440) / 60).toString().padStart(2, '0')}:${(entry.atMinute % 60).toString().padStart(2, '0')}`;
      this.add.text(160, 323 + index * 38, `${clock}  ${event?.title ?? entry.eventId}`, { fontFamily: 'Inter', fontSize: '14px', color: event?.category === 'death' ? '#c25a60' : event?.category === 'supernatural' ? '#a77ac2' : '#b9b2a5' });
    });
    const nextIndex = gameStore.meta.nextRunIndex;
    const nextBody = nextIndex % 2 === 1 ? 'elise' : 'marta';
    this.button(960, 574, 'ABRIR MAPA MENTAL', () => { this.scene.pause(); this.scene.launch('MindMap', { from: 'Summary' }); });
    this.button(960, 632, `REINICIAR COMO ${CHARACTERS[nextBody].name.toUpperCase()}`, () => {
      gameStore.abandonEndedRun(); gameStore.newRun(); this.scene.start('Hotel');
    }, true);
  }

  private button(x: number, y: number, label: string, action: () => void, primary = false): void {
    const text = this.add.text(x, y, label, { fontFamily: 'Inter', fontSize: '13px', color: primary ? '#17120c' : '#dcc89f', backgroundColor: primary ? '#d0a85d' : '#23212a', padding: { x: 20, y: 12 }, fixedWidth: 300, align: 'center' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    text.on('pointerdown', action);
  }
}
