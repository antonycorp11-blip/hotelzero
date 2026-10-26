# Revisão cartoon

- Arte carregada: `public/assets/cartoon/{walk,props,floors}.png`. Os arquivos antigos permanecem como histórico, mas não são carregados.
- Personagens: atlas 1254×1254, grade 8×8, quadrantes Elise/Marta/Augusto/Raul; cada quadrante tem quatro direções e quatro poses de caminhada. Playback a 8 fps, pausado ao parar e em diálogos.
- Cenário: 16 props separados, quatro materiais de piso, lambris, tapetes, janelas, plantas, iluminação leve e grupos de móveis.
- Lobby: 1560×1100 (antes 860×600). Galeria: 1160×320 (antes 760×320). Novos pontos examináveis no salão de leitura e estar.
- Relógio: 7 segundos por minuto de jogo; Shift acelera em 4×. Aumentado para acomodar a exploração.
- QA: screenshots desktop e mobile landscape, diálogo com Marta e verificação de avanço dos frames via CDP. `scripts/cdp-screenshot.mjs` usa um perfil isolado de Chromium; limpa o save do perfil de teste.

Ainda precisa de refinamento manual de alinhamento dos frames gerados, rotas de NPCs com navegação por obstáculos e animações de ação específicas. O atlas tem poses diferentes; não representa animação desenhada manualmente quadro a quadro.
