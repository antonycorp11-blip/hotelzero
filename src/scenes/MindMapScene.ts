import Phaser from 'phaser';
import { gameStore } from '../core/GameStore';
import type { EventCategory, RunEvent, RunSummary } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { NARRATIVE_EVENTS } from '../data/narrativeEvents';

type Filter = 'all' | EventCategory;

export class MindMapScene extends Phaser.Scene {
  private from = 'Menu';
  private graph!: Phaser.GameObjects.Container;
  private selectedRunId = 'active';
  private filter: Filter = 'all';
  private dragging = false;
  private lastPointer = new Phaser.Math.Vector2();
  private details!: Phaser.GameObjects.Text;

  constructor() { super('MindMap'); }

  init(data: { from?: string }): void { this.from = data.from ?? 'Menu'; }

  create(): void {
    this.cameras.main.setBackgroundColor('#090a10');
    this.add.text(38, 28, 'ARQUIVO DE LOOPS', { fontFamily: 'Cormorant Garamond', fontSize: '32px', color: '#e4d5b6', letterSpacing: 4 });
    this.add.text(38, 68, 'O mapa registra fatos. As lacunas registram possibilidades.', { fontFamily: 'Inter', fontSize: '12px', color: '#777482' });
    this.add.rectangle(150, 400, 270, 590, 0x11121a).setStrokeStyle(1, 0x4f432f);
    this.add.rectangle(755, 378, 920, 548, 0x0e0f16).setStrokeStyle(1, 0x302b26).setInteractive();
    this.add.rectangle(1125, 400, 250, 590, 0x11121a).setStrokeStyle(1, 0x4f432f);
    this.details = this.add.text(1022, 150, 'Selecione um nó.', { fontFamily: 'Inter', fontSize: '13px', color: '#aaa4af', wordWrap: { width: 205 }, lineSpacing: 7 });
    this.runList(); this.filters(); this.buildGraph();
    this.button(1135, 658, 'VOLTAR', () => this.goBack());
    this.button(680, 666, 'CENTRALIZAR', () => { this.graph.setPosition(360, 170).setScale(1); });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => { if (pointer.x > 295 && pointer.x < 985 && pointer.y > 104 && pointer.y < 650) { this.dragging = true; this.lastPointer.set(pointer.x, pointer.y); } });
    this.input.on('pointerup', () => { this.dragging = false; });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => { if (!this.dragging) return; this.graph.x += pointer.x - this.lastPointer.x; this.graph.y += pointer.y - this.lastPointer.y; this.lastPointer.set(pointer.x, pointer.y); });
    this.input.on('wheel', (_p: Phaser.Input.Pointer, _go: unknown, _dx: number, dy: number) => { const next = Phaser.Math.Clamp(this.graph.scale - dy * 0.001, 0.55, 1.6); this.graph.setScale(next); });
    this.input.keyboard!.once('keydown-ESC', () => this.goBack());
  }

  private runList(): void {
    this.add.text(36, 118, 'RUNS', { fontFamily: 'Inter', fontSize: '11px', color: '#9b7b49', letterSpacing: 2 });
    let y = 151;
    if (gameStore.run) {
      this.runButton('active', `RUN ${gameStore.run.index}  ·  ${CHARACTERS[gameStore.run.bodyId].name}\n${gameStore.run.ended ? gameStore.run.ending : 'EM ANDAMENTO'}`, y);
      y += 66;
    }
    [...gameStore.meta.runs].reverse().filter((summary) => summary.id !== gameStore.run?.id).forEach((run) => {
      this.runButton(run.id, `RUN ${run.index}  ·  ${CHARACTERS[run.bodyId].name}\n${run.ending.replaceAll('_', ' ').toUpperCase()}`, y);
      y += 66;
    });
    this.add.text(36, 585, 'LEGENDA', { fontFamily: 'Inter', fontSize: '11px', color: '#9b7b49', letterSpacing: 2 });
    this.add.text(36, 612, '◆ percorrido   ◆ morte\n◆ sobrenatural   ◇ conhecido', { fontFamily: 'Inter', fontSize: '11px', color: '#8e8994', lineSpacing: 8 });
  }

  private runButton(id: string, label: string, y: number): void {
    const text = this.add.text(36, y, label, { fontFamily: 'Inter', fontSize: '12px', color: '#c2b9a9', backgroundColor: id === this.selectedRunId ? '#29241c' : '#181922', padding: { x: 10, y: 8 }, fixedWidth: 228, lineSpacing: 4 }).setInteractive({ useHandCursor: true });
    text.on('pointerdown', () => { this.selectedRunId = id; this.scene.restart({ from: this.from }); });
  }

  private filters(): void {
    this.add.text(1022, 118, 'DETALHES', { fontFamily: 'Inter', fontSize: '11px', color: '#9b7b49', letterSpacing: 2 });
    this.add.text(1022, 430, 'FILTROS', { fontFamily: 'Inter', fontSize: '11px', color: '#9b7b49', letterSpacing: 2 });
    const entries: Array<[Filter, string]> = [['all', 'TODOS'], ['choice', 'ESCOLHAS'], ['clue', 'PISTAS'], ['death', 'MORTES'], ['supernatural', 'ANOMALIAS']];
    entries.forEach(([filter, label], index) => {
      const text = this.add.text(1022, 461 + index * 32, label, { fontFamily: 'Inter', fontSize: '11px', color: filter === this.filter ? '#e0bb6d' : '#777482', backgroundColor: '#181922', padding: { x: 9, y: 6 }, fixedWidth: 205 }).setInteractive({ useHandCursor: true });
      text.on('pointerdown', () => { this.filter = filter; this.graph.destroy(true); this.buildGraph(); });
    });
    if (gameStore.meta.runs.length >= 2) {
      const compare = this.add.text(1022, 626, 'COMPARAR 2 ÚLTIMAS', { fontFamily: 'Inter', fontSize: '10px', color: '#d2b06d', backgroundColor: '#22212a', padding: { x: 9, y: 7 }, fixedWidth: 205, align: 'center' }).setInteractive({ useHandCursor: true });
      compare.on('pointerdown', () => this.compareLatestRuns());
    }
  }

  private currentEvents(): RunEvent[] {
    if (this.selectedRunId === 'active') return gameStore.run?.events ?? [];
    return gameStore.meta.runs.find((run) => run.id === this.selectedRunId)?.events ?? [];
  }

  private selectedSummary(): RunSummary | undefined { return gameStore.meta.runs.find((run) => run.id === this.selectedRunId); }

  private buildGraph(): void {
    this.graph = this.add.container(360, 170).setDepth(10);
    const events = this.currentEvents();
    const actual = new Set(events.map((event) => event.eventId));
    const known = new Set(gameStore.meta.knownEvents);
    const visible = NARRATIVE_EVENTS.filter((definition) => {
      if (this.filter !== 'all' && definition.category !== this.filter) return false;
      return actual.has(definition.id) || known.has(definition.id) || definition.parents.some((parent) => actual.has(parent));
    });
    const positions = new Map<string, { x: number; y: number }>();
    visible.forEach((definition, index) => {
      const depth = this.depthOf(definition.id);
      const sameDepth = visible.slice(0, index).filter((candidate) => this.depthOf(candidate.id) === depth).length;
      positions.set(definition.id, { x: depth * 245, y: sameDepth * 105 });
    });
    visible.forEach((definition) => {
      const pos = positions.get(definition.id)!;
      definition.parents.forEach((parentId) => {
        const parent = positions.get(parentId); if (!parent) return;
        const line = this.add.line(0, 0, parent.x + 170, parent.y + 36, pos.x, pos.y + 36, 0x5f5548, actual.has(definition.id) ? 0.8 : 0.3).setOrigin(0);
        this.graph.add(line);
      });
    });
    visible.forEach((definition) => {
      const pos = positions.get(definition.id)!;
      const wasActual = actual.has(definition.id);
      const revealed = wasActual || known.has(definition.id);
      const color = !wasActual ? 0x41424a : definition.category === 'death' ? 0x8e3338 : definition.category === 'supernatural' ? 0x674383 : 0xa77e36;
      const panel = this.add.rectangle(pos.x, pos.y, 178, 72, color, wasActual ? 0.95 : 0.55).setOrigin(0).setStrokeStyle(2, wasActual ? 0xe0bd70 : 0x686872).setInteractive({ useHandCursor: true });
      const label = this.add.text(pos.x + 89, pos.y + 36, revealed ? definition.title : '?', { fontFamily: 'Inter', fontSize: revealed ? '12px' : '24px', color: '#f1eadf', align: 'center', wordWrap: { width: 154 } }).setOrigin(0.5);
      panel.on('pointerdown', () => {
        const log = events.find((event) => event.eventId === definition.id);
        const cause = log ? `\n\nCausa registrada: ${log.cause}\nTipo: ${log.choice ? 'escolha consciente' : 'evento automático'}` : '\n\nCaminho conhecido, mas não percorrido nesta run.';
        this.details.setText(revealed ? `${definition.title}\n\n${definition.description}${cause}` : 'Caminho ainda não descoberto. O mapa não inventa o que você não viveu.');
      });
      this.graph.add([panel, label]);
    });
    if (!visible.length) this.graph.add(this.add.text(0, 0, 'Nenhum evento nesta categoria.', { fontFamily: 'Inter', fontSize: '14px', color: '#777482' }));
    const summary = this.selectedSummary();
    if (summary) this.details.setText(`RUN ${summary.index}\nCorpo: ${CHARACTERS[summary.bodyId].name}\nSeed: ${summary.seed}\nDuração: ${summary.duration} min\nDesfecho: ${summary.ending.replaceAll('_', ' ')}`);
  }

  private depthOf(id: string, seen = new Set<string>()): number {
    if (seen.has(id)) return 0; seen.add(id);
    const event = NARRATIVE_EVENTS.find((entry) => entry.id === id);
    if (!event?.parents.length) return 0;
    return 1 + Math.max(...event.parents.map((parent) => this.depthOf(parent, new Set(seen))));
  }

  private compareLatestRuns(): void {
    const [previous, latest] = gameStore.meta.runs.slice(-2);
    if (!previous || !latest) return;
    const common = previous.events.filter((event) => latest.events.some((other) => other.eventId === event.eventId)).length;
    this.details.setText(
      `COMPARAÇÃO\n\nRUN ${previous.index} · ${CHARACTERS[previous.bodyId].name}\n${previous.ending.replaceAll('_', ' ')} · ${previous.events.length} eventos\n\n` +
      `RUN ${latest.index} · ${CHARACTERS[latest.bodyId].name}\n${latest.ending.replaceAll('_', ' ')} · ${latest.events.length} eventos\n\n` +
      `${common} acontecimentos em comum.\n${latest.events.length - common} desvios na run mais recente.`,
    );
  }

  private button(x: number, y: number, label: string, action: () => void): void {
    this.add.text(x, y, label, { fontFamily: 'Inter', fontSize: '12px', color: '#ddc797', backgroundColor: '#23212a', padding: { x: 14, y: 9 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', action);
  }

  private goBack(): void {
    if (this.from === 'Hotel') { this.scene.stop(); this.scene.resume('Hotel'); }
    else if (this.from === 'Summary') { this.scene.stop(); this.scene.resume('Summary'); }
    else this.scene.start('Menu');
  }
}
