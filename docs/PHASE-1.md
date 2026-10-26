# HOTEL ZERO — Fase 1

## Arquitetura mínima

- `src/scenes`: fluxo visível (boot, menu, hotel, diário, mapa mental e resumo).
- `src/core`: store do jogo, save local versionado, tipos, relógio, seed e barramento de eventos.
- `src/data`: personagens, áreas, itens e grafo narrativo. Renderização não contém a verdade narrativa.
- `public/assets/manifest.json`: inventário dos atlas gerados e contrato de evolução da arte.

## Recorte jogável

Uma run começa às 23h40 e fecha às 00h24 nesta vertical slice (o jogo completo converge às 03h17). A escala é 1 minuto de jogo por 7 segundos reais e Shift acelera em 4×. Elise pode operar a recepção; Marta, na run seguinte, abre os quartos com a chave mestra. O assassinato das 00h20 tem três resultados verificáveis conforme o aviso a Marta e o confronto com Augusto.

O save persiste conhecimento, histórico de runs, seed, eventos e run ativa em `localStorage`. O mapa mental é derivado do mesmo registro de eventos usado pelo gameplay; nós desconhecidos aparecem sem rótulo.

## Próximas etapas

1. Converter o atlas de ambiente em tileset 32×32 com autotiling e variações de dano.
2. Refinar alinhamento e ações específicas dos novos ciclos de caminhada cartoon (ver CARTOON-REVISION.md).
3. Adicionar sistema completo de furtividade, linha de visão e suspeita por testemunha.
4. Expandir a run até 03h17 e integrar cozinha, serviço e subsolo.
5. Incluir os oito personagens restantes e cenários autorais de possessão.
