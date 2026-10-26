# Pipeline de assets

Todos os arquivos abaixo são autorais. A lógica usa IDs estáveis; a arte pode ser substituída sem alterar eventos ou cenas.

## Prioridade da vertical slice

| ID | Arquivo esperado | Finalidade | Especificação |
|---|---|---|---|
| `hotel-lobby` | `tiles/hotel-lobby.webp` | piso, paredes, balcão e sofás | tileset 32×32, grade 16×16, top-down, sem perspectiva lateral |
| `hotel-rooms` | `tiles/hotel-rooms.webp` | corredor e quartos 201/202 | tileset 32×32, portas em estados fechada/aberta/trancada |
| `elise` | `characters/elise.png` | personagem jogável/NPC | spritesheet 32×48, 4 direções × 4 frames, âncora 0.5/0.82, colisão 18×14 |
| `marta` | `characters/marta.png` | personagem jogável/NPC | spritesheet 32×48, 4 direções × 4 frames, mesma escala de Elise |
| `augusto` | `characters/augusto.png` | NPC | spritesheet 32×48, 4 direções × 4 frames |
| `raul` | `characters/raul.png` | NPC | spritesheet 32×48, 4 direções × 4 frames |
| `portrait-*` | `portraits/{id}.webp` | diálogo | 512×512, busto caricatural, fundo transparente |
| `clue-glow` | `fx/clue-glow.png` | interação | 64×32, transparente, 4 frames, aditivo |

Direção: hotel clássico decadente, verdes profundos, vinho queimado, dourado oxidado e violetas sobrenaturais. Silhuetas legíveis em telas pequenas; luz e sombra pré-renderizadas em camadas separadas. Não usar material de terceiros sem licença documentada.
