# Pipeline de assets

Todos os arquivos abaixo são autorais. A lógica usa IDs estáveis; a arte pode ser substituída sem alterar eventos ou cenas.

## Assets integrados na vertical slice

Os cinco atlas e o sofá isolado em `public/assets/generated/` foram gerados como arte original para o projeto e são carregados diretamente pelo Phaser. As grades são registradas em runtime pela `BootScene`, preservando os arquivos-fonte sem recortes.

- `hotel-phase1-atlas.png`: 16 módulos de ambiente e objetos.
- `floors-phase1-atlas.png`: quatro texturas de piso seamless sem margens.
- `props-phase1-atlas.png`: oito móveis e objetos com células isoladas.
- `sofa-phase1.png`: sofá isolado para evitar sangramento entre células do atlas.
- `characters-phase1-atlas.png`: quatro personagens em quatro direções.
- `portraits-phase1-atlas.png`: quatro retratos para HUD e diálogo.

## Contrato para evolução

| ID | Arquivo esperado | Finalidade | Especificação |
|---|---|---|---|
| `hotel-lobby` | `tiles/hotel-lobby.webp` | evolução do piso, paredes, balcão e sofás | tileset 32×32, grade 16×16, top-down, sem perspectiva lateral |
| `hotel-rooms` | `tiles/hotel-rooms.webp` | corredor e quartos 201/202 | tileset 32×32, portas em estados fechada/aberta/trancada |
| `elise` | `characters/elise.png` | personagem jogável/NPC | spritesheet 32×48, 4 direções × 4 frames, âncora 0.5/0.82, colisão 18×14 |
| `marta` | `characters/marta.png` | personagem jogável/NPC | spritesheet 32×48, 4 direções × 4 frames, mesma escala de Elise |
| `augusto` | `characters/augusto.png` | NPC | spritesheet 32×48, 4 direções × 4 frames |
| `raul` | `characters/raul.png` | NPC | spritesheet 32×48, 4 direções × 4 frames |
| `portrait-*` | `portraits/{id}.webp` | diálogo | 512×512, busto caricatural, fundo transparente |
| `clue-glow` | `fx/clue-glow.png` | interação | 64×32, transparente, 4 frames, aditivo |

Direção: hotel clássico decadente, verdes profundos, vinho queimado, dourado oxidado e violetas sobrenaturais. Silhuetas legíveis em telas pequenas; luz e sombra pré-renderizadas em camadas separadas. Não usar material de terceiros sem licença documentada.
