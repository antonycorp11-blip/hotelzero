import Phaser from 'phaser';

export function registerCartoonAssets(scene: Phaser.Scene): void {
  const grid = (key: string, names: string[][], columns: number, rows: number) => {
    const texture = scene.textures.get(key);
    const source = texture.getSourceImage() as HTMLImageElement;
    names.forEach((row, y) => row.forEach((name, x) => {
      const left = Math.round(x * source.width / columns), top = Math.round(y * source.height / rows);
      texture.add(name, 0, left, top, Math.round((x + 1) * source.width / columns) - left, Math.round((y + 1) * source.height / rows) - top);
    }));
  };
  grid('props-atlas', [['reception-desk', 'sofa', 'bed', 'manager-desk'], ['security-monitors', 'fuse-box', 'guest-ledger', 'service-bell'], ['plant', 'bookcase', 'coffee-table', 'lamp'], ['door-closed', 'window', 'painting', 'luggage']], 4, 4);
  grid('floor-atlas', [['floor-marble', 'floor-parquet'], ['floor-carpet', 'floor-service']], 2, 2);
  const ids = ['elise', 'marta', 'augusto', 'raul'], directions = ['down', 'right', 'up', 'left'];
  grid('character-atlas', Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => `${ids[Math.floor(y / 4) * 2 + Math.floor(x / 4)]}-${directions[y % 4]}-${x % 4}`)), 8, 8);
  ids.forEach(id => directions.forEach(direction => {
    scene.anims.create({ key: `${id}-${direction}`, frames: [0, 1, 2, 3].map(frame => ({ key: 'character-atlas', frame: `${id}-${direction}-${frame}` })), frameRate: 8, repeat: -1 });
    const texture = scene.textures.get('character-atlas'), frame = texture.get(`${id}-${direction}-1`);
    texture.add(`${id}-${direction}`, 0, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight);
  }));
}
