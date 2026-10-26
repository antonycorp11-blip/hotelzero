import Phaser from 'phaser';

export function dressHotel(scene: Phaser.Scene): void {
  const rug = (x: number, y: number, width: number, height: number) => {
    scene.add.rectangle(x, y, width + 12, height + 12, 0x9f7b46).setDepth(2);
    scene.add.tileSprite(x, y, width, height, 'floor-atlas', 'floor-carpet').setTileScale(0.5).setDepth(2);
    scene.add.rectangle(x, y, width - 24, height - 24, 0, 0).setStrokeStyle(2, 0xbe9958, 0.6).setDepth(2);
  };
  const prop = (x: number, y: number, frame: string, w: number, h: number) => {
    scene.add.ellipse(x, y + h * 0.32, w * 0.7, 20, 0x091520, 0.3).setDepth(3);
    scene.add.image(x, y, 'props-atlas', frame).setDisplaySize(w, h).setDepth(4);
    if (!['window', 'painting', 'lamp'].includes(frame)) {
      const collider = scene.add.rectangle(x, y + h * 0.15, w * 0.6, h * 0.35, 0, 0);
      scene.physics.add.existing(collider, true); collider.setData('wall', true);
    }
  };
  rug(-345, 335, 480, 400); rug(50, 790, 1060, 340); rug(430, 355, 530, 420);
  // Readable furniture groups, leaving a clear walking route through the centre.
  prop(-350, 200, 'sofa', 250, 145); prop(-350, 400, 'coffee-table', 150, 125);
  prop(-580, 300, 'lamp', 75, 170); prop(-100, 300, 'plant', 90, 135);
  prop(-550, 80, 'bookcase', 140, 190); prop(-350, 70, 'window', 120, 170);
  prop(-130, 75, 'bookcase', 140, 190); prop(-610, 540, 'plant', 100, 145);
  prop(-350, 740, 'sofa', 230, 145); prop(-350, 890, 'coffee-table', 130, 110);
  prop(170, 740, 'sofa', 230, 145); prop(170, 890, 'coffee-table', 130, 110);
  prop(570, 800, 'luggage', 130, 180); prop(-590, 860, 'lamp', 85, 170);
  prop(760, 560, 'plant', 100, 145); prop(60, 130, 'luggage', 100, 140);
  prop(780, 80, 'window', 100, 150); prop(50, 70, 'painting', 75, 100);
  prop(1740, 175, 'painting', 70, 95); prop(1870, 175, 'window', 95, 125);
  prop(1940, 350, 'plant', 80, 100);
  for (const [x, y] of [[-580, 260], [-590, 830], [780, 90], [1740, 180], [180, 80]]) {
    scene.add.ellipse(x, y + 80, 230, 150, 0xf1b869, 0.055).setDepth(8);
  }
  scene.add.text(-560, 575, 'SALÃO DE LEITURA', {fontFamily:'Georgia',fontSize:'17px',color:'#e2c389',letterSpacing:3}).setDepth(8);
  scene.add.text(-190, 1020, 'HOTEL ZERO  ·  DESDE 1940', {fontFamily:'Georgia',fontSize:'18px',color:'#dec18e',letterSpacing:3}).setDepth(8);
}
