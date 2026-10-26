import Phaser from 'phaser';
import { dressHotel } from '../world/HotelDecor';
import { gameStore } from '../core/GameStore';
import { formatTime } from '../core/time';
import type { AreaId, CharacterId, DialogueChoice, DialogueNode, Permission, RunState } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { ITEMS } from '../data/items';
import { AREAS, AREA_SPAWNS, DOORS } from '../data/world';

interface InteractionTarget {
  id: string;
  label: string;
  x: number;
  y: number;
  available?: () => boolean;
  action: () => void;
}

interface NpcActor { id: CharacterId; sprite: Phaser.Physics.Arcade.Sprite; target: InteractionTarget }

export class HotelScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private journalKey!: Phaser.Input.Keyboard.Key;
  private mapKey!: Phaser.Input.Keyboard.Key;
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private prompt!: Phaser.GameObjects.Text;
  private hudTime!: Phaser.GameObjects.Text;
  private hudStatus!: Phaser.GameObjects.Text;
  private locationText!: Phaser.GameObjects.Text;
  private toast!: Phaser.GameObjects.Text;
  private targets: InteractionTarget[] = [];
  private npcs: NpcActor[] = [];
  private activeTarget?: InteractionTarget;
  private dialogueOpen = false;
  private overlay?: Phaser.GameObjects.Container;
  private minuteAccumulator = 0;
  private autosaveAccumulator = 0;
  private routineStage = '';
  private touchVector = new Phaser.Math.Vector2();
  private touchInteract = false;
  private touchCleanup: Array<() => void> = [];
  private roomCovers: Array<{ area: AreaId; cover: Phaser.GameObjects.Rectangle }> = [];

  constructor() { super('Hotel'); }

  create(): void {
    const run = gameStore.run ?? gameStore.newRun();
    this.targets = []; this.npcs = []; this.roomCovers = []; this.routineStage = ''; this.dialogueOpen = false;
    this.minuteAccumulator = 0; this.autosaveAccumulator = 0;
    this.physics.world.setBounds(-700, -360, 2740, 1480);
    this.cameras.main.setBounds(-700, -360, 2740, 1480);
    this.buildWorld();
    this.buildInteractables();
    this.createActors(run);
    this.createHud(run);
    this.setupInput();
    this.updateRoutines(true);
    this.time.addEvent({ delay: 8000, loop: true, callback: () => {
      if (this.dialogueOpen) return;
      this.npcs.forEach(npc => {
        if (this.tweens.isTweening(npc.sprite)) return;
        const direction = npc.sprite.getData('patrolRight') ? -1 : 1;
        npc.sprite.setData('patrolRight', direction > 0);
        npc.sprite.play(`${npc.id}-${direction > 0 ? 'right' : 'left'}`, true);
        this.tweens.add({targets: npc.sprite, x: npc.sprite.x + 36 * direction, duration: 900,
          onComplete: () => { npc.sprite.anims.stop(); npc.sprite.setFrame(`${npc.id}-down`); }});
      });
    }});
    this.cameras.main.fadeIn(650, 5, 5, 9);
    this.showToast(`RUN ${run.index} · Você desperta como ${CHARACTERS[run.bodyId].name}.`);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupTouch());
  }

  update(_time: number, delta: number): void {
    const run = gameStore.run;
    if (!run || run.ended) return;
    this.handleMovement();
    this.updateAreaFromPosition(run);
    this.roomCovers.forEach(({ area, cover }) => cover.setVisible(run.area !== area));
    this.npcs.forEach(npc => {
      const room = AREAS.find(area => npc.sprite.x > area.x && npc.sprite.x < area.x + area.width && npc.sprite.y > area.y && npc.sprite.y < area.y + area.height);
      npc.sprite.setVisible(!room || ['lobby', 'corridor'].includes(room.id) || run.area === room.id);
    });
    this.updateProximity();
    if (!this.dialogueOpen) {
      const speed = this.shiftKey.isDown ? 4 : 1;
      this.minuteAccumulator += delta * speed;
      while (this.minuteAccumulator >= 7000) {
        this.minuteAccumulator -= 7000;
        run.minute += 1;
        this.processTimeline(run);
      }
    }
    this.autosaveAccumulator += delta;
    if (this.autosaveAccumulator >= 3000) {
      this.autosaveAccumulator = 0;
      run.x = Math.round(this.player.x); run.y = Math.round(this.player.y);
      gameStore.persist();
    }
    this.updateRoutines();
    this.updateHud(run);
  }

  private buildWorld(): void {
    AREAS.forEach((area) => {
      const floorFrame: Record<AreaId, string> = {
        lobby: 'floor-marble', corridor: 'floor-carpet', room201: 'floor-parquet',
        room202: 'floor-carpet', office: 'floor-parquet', security: 'floor-service',
      };
      this.add.tileSprite(area.x + area.width / 2, area.y + area.height / 2, area.width, area.height, 'floor-atlas', floorFrame[area.id]).setTileScale(0.42).setAlpha(0.76);
      this.add.rectangle(area.x + area.width / 2, area.y + area.height / 2, area.width, area.height, area.color, 0.22);
      const grid = this.add.grid(area.x + area.width / 2, area.y + area.height / 2, area.width, area.height, 48, 48, 0x000000, 0, 0x90866f, 0.055);
      grid.setDepth(1);
      this.add.text(area.x + 24, area.y + 20, area.name, { fontFamily: 'Inter', fontSize: '11px', color: '#8b816f', letterSpacing: 3 }).setDepth(2);
      this.addAreaWalls(area.id, area.x, area.y, area.width, area.height);
    });
    this.furniture(430, 180, 400, 48, 'reception-desk', 470, 250);
    this.furniture(420, 430, 180, 60, 'sofa', 245, 170);
    this.furniture(1120, -150, 150, 80, 'bed', 190, 235);
    this.furniture(1460, -150, 150, 80, 'bed', 190, 235);
    this.furniture(220, -165, 160, 68, 'manager-desk', 230, 180);
    this.furniture(625, -165, 180, 60, 'security-monitors', 230, 190);
    dressHotel(this);
    AREAS.filter(area => !['lobby', 'corridor'].includes(area.id)).forEach(area => {
      this.roomCovers.push({area: area.id, cover: this.add.rectangle(area.x + area.width / 2, area.y + area.height / 2 - 20, area.width, area.height - 40, 0x0b111b).setDepth(9)});
    });
  }

  private addAreaWalls(id: AreaId, x: number, y: number, width: number, height: number): void {
    const wall = (wx: number, wy: number, ww: number, wh: number) => {
      const object = this.add.rectangle(wx, wy, ww, wh, 0x11121a).setDepth(5);
      this.physics.add.existing(object, true);
      if (this.player) this.physics.add.collider(this.player, object);
      object.setData('wall', true);
    };
    wall(x + width / 2, y + 8, width, 16);
    this.add.rectangle(x + width / 2, y + 32, width - 32, 48, 0x264649).setStrokeStyle(2, 0x967247).setDepth(3);
    for (let px = x + 44; px < x + width - 30; px += 68) {
      this.add.rectangle(px, y + 32, 52, 30, 0x1c353b).setStrokeStyle(1, 0x56716b).setDepth(3);
    }
    wall(x + width / 2, y + height - 8, width, 16);
    if (id !== 'corridor') wall(x + 8, y + height / 2, 16, height);
    if (id === 'lobby') {
      wall(x + width - 8, y + 60, 16, 120);
      wall(x + width - 8, y + 770, 16, 660);
    } else if (id !== 'corridor') {
      wall(x + width - 8, y + height / 2, 16, height);
    } else {
      wall(x + width - 8, y + height / 2, 16, height);
    }
  }

  private furniture(x: number, y: number, width: number, height: number, frame: string, artWidth: number, artHeight: number): void {
    const texture = 'props-atlas';
    this.add.image(x, y, texture, frame).setDisplaySize(artWidth, artHeight).setDepth(4);
    const object = this.add.rectangle(x, y, width, height, 0x000000, 0.001).setDepth(4);
    this.physics.add.existing(object, true);
    object.setData('wall', true);
  }

  private buildInteractables(): void {
    DOORS.forEach((door) => {
      this.add.image(door.x, door.y - 25, 'props-atlas', 'door-closed').setDisplaySize(100, 100).setDepth(6);
      this.targets.push({
        id: door.id, label: `Entrar — ${door.label}`, x: door.x, y: door.y,
        action: () => this.useDoor(door.to, door.permission, door.id),
      });
    });
    const returns: Array<{ id: string; x: number; y: number; to: AreaId; label: string }> = [
      { id: 'return201', x: 1100, y: 94, to: 'corridor', label: 'Sair para o corredor' },
      { id: 'return202', x: 1440, y: 94, to: 'corridor', label: 'Sair para o corredor' },
      { id: 'returnOffice', x: 225, y: -26, to: 'lobby', label: 'Sair para o lobby' },
      { id: 'returnSecurity', x: 630, y: -26, to: 'lobby', label: 'Sair para o lobby' },
    ];
    returns.forEach((door) => this.targets.push({ ...door, action: () => this.teleport(door.to) }));

    this.addMarker(330, 205);
    this.add.image(330, 205, 'props-atlas', 'guest-ledger').setDisplaySize(64, 64).setDepth(7);
    this.targets.push({ id: 'ledger', label: 'Examinar arquivos da recepção', x: 330, y: 215, action: () => this.inspectLedger() });
    this.addMarker(1040, -65);
    this.targets.push({ id: 'fiber', label: 'Examinar mancha junto à cama', x: 1040, y: -65, available: () => !gameStore.has('fiber_found'), action: () => this.inspectFiber() });
    this.addMarker(700, -205);
    this.add.image(700, -205, 'props-atlas', 'fuse-box').setDisplaySize(82, 82).setDepth(7);
    this.targets.push({ id: 'breaker', label: 'Examinar quadro elétrico', x: 700, y: -205, action: () => this.inspectBreaker() });
    this.addMarker(590, 210);
    this.add.image(590, 210, 'props-atlas', 'service-bell').setDisplaySize(58, 58).setDepth(7);
    this.targets.push({ id: 'bell', label: 'Tocar a campainha três vezes', x: 590, y: 210, action: () => this.ringBell() });
    this.targets.push({ id: 'hallway', label: 'Seguir para o corredor leste', x: 842, y: 280, action: () => { if (gameStore.run) gameStore.run.area = 'corridor'; } });
    this.targets.push({id: 'reading', label: 'Ler o livro abandonado', x: -350, y: 400,
      action: () => this.showToast('Todas as páginas terminam na mesma frase: “O hóspede ainda não saiu.” A última está quente.')});
    this.targets.push({id: 'luggage', label: 'Examinar as malas sem dono', x: 570, y: 800,
      action: () => this.showToast('Doze malas. Onze etiquetas. Na última, só há uma marca onde deveria estar seu nome.')});
    this.targets.push({id: 'tea', label: 'Examinar o chá servido', x: 170, y: 890,
      action: () => this.showToast('O chá ainda está quente. A xícara tem a impressão de um sexto dedo.')});
  }

  private addMarker(x: number, y: number): void {
    this.add.image(x, y, 'interaction-glow').setAlpha(0.55).setDepth(7);
  }

  private createActors(run: RunState): void {
    this.player = this.physics.add.sprite(run.x, run.y, 'character-atlas', `${run.bodyId}-down`).setDepth(20).setDisplaySize(76, 80);
    this.player.setCollideWorldBounds(true).setSize(46, 24).setOffset(55, 125);
    this.children.list.filter((child) => child.getData?.('wall')).forEach((wall) => this.physics.add.collider(this.player, wall as Phaser.GameObjects.GameObject));
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1);

    const starts: Record<CharacterId, { x: number; y: number }> = {
      elise: { x: 465, y: 235 }, marta: { x: 1280, y: 280 }, augusto: { x: 250, y: -100 }, raul: { x: 610, y: -100 },
    };
    (Object.keys(CHARACTERS) as CharacterId[]).filter((id) => id !== run.bodyId).forEach((id) => {
      const pos = starts[id];
      const sprite = this.physics.add.sprite(pos.x, pos.y, 'character-atlas', `${id}-down`).setDepth(19).setDisplaySize(76, 80);
      sprite.setImmovable(true);
      const target: InteractionTarget = { id: `npc-${id}`, label: `Falar com ${CHARACTERS[id].name}`, x: pos.x, y: pos.y, action: () => this.talkTo(id) };
      this.targets.push(target);
      this.npcs.push({ id, sprite, target });
    });
  }

  private createHud(run: RunState): void {
    const top = this.add.rectangle(640, 41, 1230, 58, 0x090a10, 0.9).setScrollFactor(0).setStrokeStyle(1, 0x5e4d33).setDepth(100);
    const character = CHARACTERS[run.bodyId];
    this.add.image(62, 41, 'character-atlas', `${run.bodyId}-down`).setDisplaySize(52, 52).setScrollFactor(0).setDepth(101);
    this.hudStatus = this.add.text(98, 26, `${character.name.toUpperCase()} · ${character.role}\nMENTE ${run.mental}   SUSPEITA ${run.suspicion}`, { fontFamily: 'Inter', fontSize: '12px', color: '#d9cdb6', lineSpacing: 5 }).setScrollFactor(0).setDepth(101);
    this.hudTime = this.add.text(640, 24, formatTime(run.minute), { fontFamily: 'Cormorant Garamond', fontSize: '30px', color: '#e8d8b6' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);
    this.locationText = this.add.text(1218, 30, 'LOBBY', { fontFamily: 'Inter', fontSize: '11px', color: '#8f8a98', letterSpacing: 2 }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);
    this.prompt = this.add.text(640, 646, '', { fontFamily: 'Inter', fontSize: '15px', color: '#f0e5cc', backgroundColor: '#101119dd', padding: { x: 18, y: 10 } }).setOrigin(0.5).setScrollFactor(0).setDepth(110);
    this.toast = this.add.text(640, 102, '', { fontFamily: 'Inter', fontSize: '14px', color: '#e9ddc5', backgroundColor: '#17151ddd', padding: { x: 18, y: 10 }, align: 'center', wordWrap: { width: 680 } }).setOrigin(0.5).setScrollFactor(0).setDepth(120).setAlpha(0);
    top.setInteractive().on('pointerdown', () => this.scene.launch('Journal'));
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.interactKey = this.input.keyboard!.addKey('E');
    this.journalKey = this.input.keyboard!.addKey('J');
    this.mapKey = this.input.keyboard!.addKey('M');
    this.shiftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.interactKey.on('down', () => this.interact());
    this.journalKey.on('down', () => { if (!this.dialogueOpen) this.scene.launch('Journal'); });
    this.mapKey.on('down', () => { if (!this.dialogueOpen) { this.scene.pause(); this.scene.launch('MindMap', { from: 'Hotel' }); } });
    this.setupTouch();
  }

  private setupTouch(): void {
    const zone = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    const interact = document.getElementById('touch-interact');
    const journal = document.getElementById('touch-journal');
    if (!zone || !stick || !interact || !journal) return;
    const move = (event: PointerEvent) => {
      const rect = zone.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2); const dy = event.clientY - (rect.top + rect.height / 2);
      const vector = new Phaser.Math.Vector2(dx, dy); if (vector.length() > 38) vector.setLength(38);
      this.touchVector.set(vector.x / 38, vector.y / 38); stick.style.transform = `translate(${vector.x}px,${vector.y}px)`;
    };
    const down = (event: PointerEvent) => { zone.setPointerCapture(event.pointerId); move(event); };
    const up = () => { this.touchVector.set(0); stick.style.transform = ''; };
    const tap = () => { this.touchInteract = true; this.interact(); };
    const openJournal = () => { if (!this.dialogueOpen) this.scene.launch('Journal'); };
    zone.addEventListener('pointerdown', down); zone.addEventListener('pointermove', move); zone.addEventListener('pointerup', up); zone.addEventListener('pointercancel', up);
    interact.addEventListener('pointerdown', tap); journal.addEventListener('pointerdown', openJournal);
    this.touchCleanup.push(() => zone.removeEventListener('pointerdown', down), () => zone.removeEventListener('pointermove', move), () => zone.removeEventListener('pointerup', up), () => zone.removeEventListener('pointercancel', up), () => interact.removeEventListener('pointerdown', tap), () => journal.removeEventListener('pointerdown', openJournal));
  }

  private cleanupTouch(): void { this.touchCleanup.forEach((cleanup) => cleanup()); this.touchCleanup = []; }

  private handleMovement(): void {
    if (this.dialogueOpen) { this.player.setVelocity(0); this.player.anims.stop(); return; }
    let x = this.touchVector.x; let y = this.touchVector.y;
    if (this.cursors.left.isDown || this.wasd.A.isDown) x -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) x += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) y -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) y += 1;
    const velocity = new Phaser.Math.Vector2(x, y).normalize().scale(170);
    this.player.setVelocity(velocity.x, velocity.y);
    const direction = Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : y < 0 ? 'up' : 'down';
    if (x || y) this.player.play(`${gameStore.run!.bodyId}-${direction}`, true);
    else this.player.anims.stop();
    this.player.setFlipX(false);
  }

  private updateProximity(): void {
    this.npcs.forEach((npc) => { npc.target.x = npc.sprite.x; npc.target.y = npc.sprite.y; });
    const available = this.targets.filter((target) => target.available?.() !== false);
    this.activeTarget = available.reduce<InteractionTarget | undefined>((best, target) => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
      if (distance > 88) return best;
      if (!best) return target;
      return distance < Phaser.Math.Distance.Between(this.player.x, this.player.y, best.x, best.y) ? target : best;
    }, undefined);
    const showPrompt = !this.dialogueOpen && Boolean(this.activeTarget);
    this.prompt.setVisible(showPrompt);
    if (showPrompt) this.prompt.setText(`[ E ]  ${this.activeTarget!.label}`);
  }

  private interact(): void {
    if (this.dialogueOpen || !this.activeTarget) return;
    this.activeTarget.action();
  }

  private useDoor(to: AreaId, permission: Permission | undefined, id: string): void {
    const run = gameStore.run!;
    const character = CHARACTERS[run.bodyId];
    const hasPermission = !permission || character.permissions.includes(permission);
    const specialKey = id === 'door201' && run.inventory.includes('chave_201');
    if (!hasPermission && !specialKey) {
      run.suspicion = Math.min(100, run.suspicion + 4);
      this.showToast(`${character.name} não tem acesso a esta porta. Alguém percebeu a tentativa.`);
      return;
    }
    this.teleport(to);
  }

  private teleport(to: AreaId): void {
    const run = gameStore.run!;
    const spawn = AREA_SPAWNS[to];
    run.area = to; run.x = spawn.x; run.y = spawn.y;
    this.player.setPosition(spawn.x, spawn.y);
    this.cameras.main.flash(180, 18, 14, 24);
    gameStore.persist();
  }

  private inspectLedger(): void {
    const run = gameStore.run!;
    const allowed = CHARACTERS[run.bodyId].permissions.includes('reception');
    if (!allowed && run.bodyId !== 'marta') { this.showToast('O arquivo está trancado. A recepção protege seus segredos com burocracia.'); return; }
    if (!run.inventory.includes('livro_hospedes')) run.inventory.push('livro_hospedes');
    if (!run.inventory.includes('chave_201') && allowed) run.inventory.push('chave_201');
    gameStore.discover('livro_hospedes', 'ledger_found');
    this.showToast('PISTA: Marta consta como hóspede do 202. A data de saída é amanhã — há 36 anos.');
  }

  private inspectFiber(): void {
    const run = gameStore.run!;
    run.inventory.push('fibra_violeta');
    gameStore.discover('fibra_violeta', 'fiber_found');
    this.showToast('PISTA: fibra violeta. Idêntica ao forro do paletó de Augusto, mas gelada e molhada.');
  }

  private inspectBreaker(): void {
    const run = gameStore.run!;
    if (!CHARACTERS[run.bodyId].permissions.includes('security')) {
      this.showToast('O painel exige o cartão de Raul. A fiação sussurra atrás da chapa.'); return;
    }
    if (!run.inventory.includes('fusivel')) run.inventory.push('fusivel');
    this.showToast('O fusível queimado está marcado “03:17”. Isso ainda não aconteceu.');
  }

  private ringBell(): void {
    const run = gameStore.run!;
    run.flags.calledRaul = true;
    this.showToast('DIN. DIN. DIN. Em algum monitor, uma cadeira range.');
  }

  private talkTo(id: CharacterId): void {
    const run = gameStore.run!;
    if (id === 'marta') {
      this.openDialogue({ speaker: 'Marta', text: 'Se veio reclamar da poeira, converse com a década de 1940.', choices: [
        { text: 'Preciso entrar no quarto 201.', response: 'Você devolve. E não abre o armário. Ele abre de volta.', effect: () => { if (!run.inventory.includes('chave_201')) run.inventory.push('chave_201'); } },
        { text: 'Seu nome está registrado no quarto 202.', requires: () => gameStore.has('ledger_found'), response: 'Isso não é possível. Eu nasci em 1989. ...Eu vou ficar no lobby.', eventId: 'marta_warned', effect: () => { run.flags.martaWarned = true; this.updateRoutines(true); } },
        { text: 'O hotel sempre foi assim?', response: 'Não. Antes cobrava café da manhã à parte. A maldição veio depois.' },
      ] });
    } else if (id === 'augusto') {
      this.openDialogue({ speaker: 'Augusto', text: 'Tudo sob controle. É uma frase, não um diagnóstico.', choices: [
        { text: 'A fibra, o registro e o quarto 202. Explique.', requires: () => gameStore.has('ledger_found') && gameStore.has('fiber_found'), response: 'Não entre no 202. O hotel repete pessoas como repete corredores. Eu só escolho quem continua respirando.', eventId: 'augusto_confronted', effect: () => { run.flags.augustoConfronted = true; run.suspicion += 15; } },
        { text: 'Onde estava às 23h40?', response: 'Administrando. É o nome elegante para esconder vazamentos e hóspedes.' },
        { text: 'Seu paletó perdeu um pedaço.', requires: () => gameStore.has('fiber_found'), response: 'Este hotel também rouba tecidos. Apresente a queixa na recepção.' },
      ] });
    } else if (id === 'raul') {
      this.openDialogue({ speaker: 'Raul', text: 'As câmeras estão normais. O problema é o que elas consideram normal.', choices: [
        { text: 'A campainha tocou sozinha.', requires: () => Boolean(run.flags.calledRaul), response: 'Três vezes? É o sinal da câmera sete. Vou verificar o corredor.', eventId: 'raul_distracted', effect: () => { run.flags.raulDistracted = true; } },
        { text: 'Mostre a gravação do 202.', response: 'Ela mostra o quarto vazio. E alguém gritando dentro da parede.' },
      ] });
    } else {
      this.openDialogue({ speaker: 'Elise', text: 'Tecnicamente estou fora do balcão. Espiritualmente também.', choices: [
        { text: 'Abra o arquivo de Marta para mim.', requires: (_r, meta) => meta.knownClues.includes('livro_hospedes'), response: 'Você já sabe o que vai encontrar, não sabe? Ótimo. Eu odeio suspense administrativo.', eventId: 'ledger_found', effect: () => { if (!run.inventory.includes('livro_hospedes')) run.inventory.push('livro_hospedes'); } },
        { text: 'Você lembra desta noite?', response: 'Lembro de hóspedes que ainda não chegaram. Serve?' },
      ] });
    }
  }

  private openDialogue(node: DialogueNode): void {
    this.dialogueOpen = true;
    this.player.setVelocity(0);
    const choices = (node.choices ?? []).filter((choice) => !choice.requires || choice.requires(gameStore.run!, gameStore.meta));
    const panel = this.add.rectangle(640, 525, 1120, 300, 0x0d0e15, 0.97).setStrokeStyle(2, 0x8d7043).setScrollFactor(0);
    const portraitId = node.speaker.toLowerCase();
    const portrait = this.add.image(215, 525, 'character-atlas', `${portraitId}-down`).setDisplaySize(230, 220).setScrollFactor(0);
    const speaker = this.add.text(340, 405, node.speaker.toUpperCase(), { fontFamily: 'Cormorant Garamond', fontSize: '27px', color: '#d7ad62', letterSpacing: 3 }).setScrollFactor(0);
    const body = this.add.text(340, 448, node.text, { fontFamily: 'Inter', fontSize: '17px', color: '#ece5d8', wordWrap: { width: 760 }, lineSpacing: 6 }).setScrollFactor(0);
    const objects: Phaser.GameObjects.GameObject[] = [panel, portrait, speaker, body];
    choices.forEach((choice, index) => {
      const y = 530 + index * 48;
      const option = this.add.text(340, y, `${index + 1}. ${choice.text}`, { fontFamily: 'Inter', fontSize: '15px', color: '#bbb3a5', backgroundColor: '#171822', padding: { x: 12, y: 8 }, fixedWidth: 770 }).setScrollFactor(0).setInteractive({ useHandCursor: true });
      option.on('pointerover', () => option.setColor('#ffffff'));
      option.on('pointerout', () => option.setColor('#bbb3a5'));
      option.on('pointerdown', () => this.chooseDialogue(choice, node.speaker));
      objects.push(option);
    });
    const close = this.add.text(1138, 400, 'FECHAR ×', { fontFamily: 'Inter', fontSize: '12px', color: '#827f89' }).setScrollFactor(0).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.closeDialogue()); objects.push(close);
    this.overlay = this.add.container(0, 0, objects).setDepth(300);
    const keys = this.input.keyboard!.addKeys('ONE,TWO,THREE') as Record<string, Phaser.Input.Keyboard.Key>;
    ['ONE', 'TWO', 'THREE'].forEach((key, index) => keys[key].once('down', () => { if (choices[index]) this.chooseDialogue(choices[index], node.speaker); }));
  }

  private chooseDialogue(choice: DialogueChoice, speaker: string): void {
    choice.effect?.(gameStore.run!, gameStore.meta);
    if (choice.eventId) gameStore.log(choice.eventId, `dialogue:${speaker}`, true);
    gameStore.persist();
    this.overlay?.destroy();
    this.overlay = undefined;
    const panel = this.add.rectangle(640, 550, 1120, 235, 0x0d0e15, 0.97).setStrokeStyle(2, 0x8d7043).setScrollFactor(0);
    const portrait = this.add.image(215, 550, 'character-atlas', `${speaker.toLowerCase()}-down`).setDisplaySize(230, 220).setScrollFactor(0);
    const name = this.add.text(340, 462, speaker.toUpperCase(), { fontFamily: 'Cormorant Garamond', fontSize: '25px', color: '#d7ad62' }).setScrollFactor(0);
    const response = this.add.text(340, 510, choice.response, { fontFamily: 'Inter', fontSize: '17px', color: '#ece5d8', wordWrap: { width: 760 }, lineSpacing: 7 }).setScrollFactor(0);
    const continueText = this.add.text(1135, 630, 'CONTINUAR  ›', { fontFamily: 'Inter', fontSize: '13px', color: '#d7ad62' }).setOrigin(1).setScrollFactor(0).setInteractive({ useHandCursor: true });
    continueText.on('pointerdown', () => this.closeDialogue());
    this.overlay = this.add.container(0, 0, [panel, portrait, name, response, continueText]).setDepth(300);
    this.input.keyboard!.once('keydown-SPACE', () => this.closeDialogue());
    this.input.keyboard!.once('keydown-ENTER', () => this.closeDialogue());
  }

  private closeDialogue(): void { this.overlay?.destroy(); this.overlay = undefined; this.dialogueOpen = false; }

  private processTimeline(run: RunState): void {
    if (run.minute >= 24 * 60 + 5 && !gameStore.has('power_flicker')) {
      gameStore.log('power_flicker', 'clock:00:05');
      this.cameras.main.flash(700, 70, 45, 90);
      run.mental = Math.max(0, run.mental - 8);
      this.showToast('As luzes apagam. Por seis segundos, o hotel parece respirar.');
    }
    if (run.minute >= 24 * 60 + 8 && run.flags.calledRaul && !gameStore.has('raul_distracted')) {
      run.flags.raulDistracted = true;
      gameStore.log('raul_distracted', 'condition:bell+power', false);
      this.showToast('Raul abandona os monitores. A câmera do 202 fica sem testemunha.');
    }
    if (run.minute >= 24 * 60 + 20 && !run.flags.murderResolved) {
      run.flags.murderResolved = true;
      if (run.flags.martaWarned) {
        gameStore.log('murder_prevented', 'condition:marta_warned', true);
        if (run.flags.augustoConfronted) {
          this.showToast('00:20 — O quarto 202 permanece vazio. Pela primeira vez, o hotel errou a conta.');
        } else {
          gameStore.log('player_taken', 'condition:victim_displaced_without_binding', false);
          run.health = 0;
          this.endAfterDelay('Você salvou Marta. O hotel transferiu a dívida para o seu corpo.', 'player_taken', 2400);
        }
      } else {
        gameStore.log('marta_murdered', 'condition:victim_on_schedule', false);
        this.showToast('00:20 — Um impacto seco vem do quarto 202. Marta não responde.');
      }
    }
    if (run.minute >= 24 * 60 + 24 && !run.ended) {
      if (gameStore.has('murder_prevented') && run.flags.augustoConfronted) {
        gameStore.log('loop_survived', 'condition:crime_prevented+manager_confronted');
        this.endAfterDelay('Marta vive. Augusto se cala. Às 00:24, o corredor dobra e devolve você ao início.', 'loop_survived', 900);
      } else if (gameStore.has('marta_murdered')) {
        gameStore.log('night_closed', 'condition:murder_completed');
        this.endAfterDelay('Marta morreu no 202. As portas desaparecem uma a uma. A noite fecha sobre você.', 'night_closed', 900);
      }
    }
  }

  private endAfterDelay(message: string, ending: string, delay: number): void {
    if (gameStore.run?.flags.endingQueued) return;
    gameStore.run!.flags.endingQueued = true;
    this.showToast(message);
    this.time.delayedCall(delay, () => {
      gameStore.endRun(ending);
      this.scene.start('Summary');
    });
  }

  private updateRoutines(force = false): void {
    const run = gameStore.run!;
    const stage = run.minute < 23 * 60 + 55 ? 'early' : run.minute < 24 * 60 + 8 ? 'mid' : run.minute < 24 * 60 + 18 ? 'late' : 'critical';
    if (!force && stage === this.routineStage) return;
    this.routineStage = stage;
    this.npcs.forEach((npc) => {
      let destination = { x: npc.sprite.x, y: npc.sprite.y };
      if (npc.id === 'augusto') destination = stage === 'early' ? { x: 250, y: -100 } : { x: 710, y: 300 };
      if (npc.id === 'raul') destination = (run.flags.raulDistracted || stage === 'late') ? { x: 980, y: 300 } : { x: 610, y: -100 };
      if (npc.id === 'marta') destination = run.flags.martaWarned ? { x: 520, y: 350 } : stage === 'critical' ? { x: 1430, y: 270 } : { x: 1280, y: 280 };
      if (npc.id === 'elise') destination = { x: 465, y: 235 };
      const dx = destination.x - npc.sprite.x, dy = destination.y - npc.sprite.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 2) return;
      const facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      this.tweens.killTweensOf(npc.sprite);
      npc.sprite.play(`${npc.id}-${facing}`, true);
      this.tweens.add({ targets: npc.sprite, x: destination.x, y: destination.y, duration: distance / 100 * 1000,
        onComplete: () => { npc.sprite.anims.stop(); npc.sprite.setFrame(`${npc.id}-down`); } });
    });
  }

  private updateHud(run: RunState): void {
    const character = CHARACTERS[run.bodyId];
    this.hudTime.setText(formatTime(run.minute));
    this.hudStatus.setText(`${character.name.toUpperCase()} · ${character.role}\nMENTE ${run.mental}   SUSPEITA ${run.suspicion}`);
    const area = AREAS.find((entry) => entry.id === run.area);
    this.locationText.setText(area?.name ?? 'HOTEL ZERO');
  }

  private updateAreaFromPosition(run: RunState): void {
    if (this.player.x > 860 && this.player.y >= 120 && this.player.y <= 440) run.area = 'corridor';
    else if (this.player.x < 860 && this.player.y >= 0) run.area = 'lobby';
  }

  private showToast(message: string): void {
    this.toast.setText(message).setAlpha(1);
    this.tweens.killTweensOf(this.toast);
    this.tweens.add({ targets: this.toast, alpha: 0, delay: 3600, duration: 600 });
  }
}
