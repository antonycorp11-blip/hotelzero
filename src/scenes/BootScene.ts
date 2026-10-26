import Phaser from 'phaser';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload(): void {
    this.load.image('hotel-atlas', 'assets/generated/hotel-phase1-atlas.png');
    this.load.image('floor-atlas', 'assets/generated/floors-phase1-atlas.png');
    this.load.image('props-atlas', 'assets/generated/props-phase1-atlas.png');
    this.load.image('sofa-standalone', 'assets/generated/sofa-phase1.png');
    this.load.image('character-atlas', 'assets/generated/characters-phase1-atlas.png');
    this.load.image('portrait-atlas', 'assets/generated/portraits-phase1-atlas.png');
  }

  create(): void {
    this.registerAtlasFrames();
    this.createPlaceholderTextures();
    this.scene.start('Menu');
  }

  private registerAtlasFrames(): void {
    const addGrid = (textureKey: string, names: string[][], columns: number, rows: number) => {
      const texture = this.textures.get(textureKey);
      const source = texture.getSourceImage() as HTMLImageElement;
      names.forEach((row, rowIndex) => row.forEach((name, columnIndex) => {
        const x = Math.floor(columnIndex * source.width / columns);
        const y = Math.floor(rowIndex * source.height / rows);
        const nextX = Math.floor((columnIndex + 1) * source.width / columns);
        const nextY = Math.floor((rowIndex + 1) * source.height / rows);
        texture.add(name, 0, x, y, nextX - x, nextY - y);
      }));
    };
    addGrid('hotel-atlas', [
      ['floor-marble', 'floor-parquet', 'floor-carpet', 'floor-service'],
      ['wall-green', 'wall-wood', 'door-closed', 'door-open'],
      ['reception-desk', 'sofa', 'bed', 'manager-desk'],
      ['security-monitors', 'fuse-box', 'guest-ledger', 'service-bell'],
    ], 4, 4);
    addGrid('floor-atlas', [
      ['floor-marble', 'floor-parquet'], ['floor-carpet', 'floor-service'],
    ], 2, 2);
    addGrid('props-atlas', [
      ['reception-desk', 'sofa', 'bed', 'manager-desk'],
      ['security-monitors', 'fuse-box', 'guest-ledger', 'service-bell'],
    ], 4, 2);
    const ids = ['elise', 'marta', 'augusto', 'raul'];
    addGrid('character-atlas', [
      ids.map((id) => `${id}-down`), ids.map((id) => `${id}-right`),
      ids.map((id) => `${id}-up`), ids.map((id) => `${id}-left`),
    ], 4, 4);
    addGrid('portrait-atlas', [['elise', 'marta'], ['augusto', 'raul']], 2, 2);
  }

  private createPlaceholderTextures(): void {
    const graphics = this.add.graphics();
    graphics.clear();
    graphics.fillStyle(0xb7914a).fillRoundedRect(2, 2, 44, 12, 3);
    graphics.fillStyle(0x31291e).fillRect(7, 7, 34, 4);
    graphics.generateTexture('interaction-glow', 48, 16);
    graphics.destroy();
  }
}
