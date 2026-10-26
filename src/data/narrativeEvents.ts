import type { NarrativeEventDefinition } from '../core/types';

export const NARRATIVE_EVENTS: NarrativeEventDefinition[] = [
  { id: 'awakening', title: '23h40 — Despertar', description: 'A consciência desperta em um corpo emprestado.', category: 'automatic', parents: [] },
  { id: 'ledger_found', title: 'O nome impossível', description: 'O livro liga Marta ao quarto 202.', category: 'clue', parents: ['awakening'] },
  { id: 'fiber_found', title: 'Fibra violeta', description: 'Uma fibra liga o quarto 201 ao uniforme do gerente.', category: 'clue', parents: ['awakening'] },
  { id: 'power_flicker', title: 'A luz hesita', description: 'O hotel apaga as luzes por seis segundos.', category: 'supernatural', parents: ['awakening'] },
  { id: 'raul_distracted', title: 'Olhos fora das telas', description: 'Raul abandona os monitores para verificar o corredor.', category: 'choice', parents: ['power_flicker'] },
  { id: 'augusto_confronted', title: 'Conversa decisiva', description: 'Augusto é confrontado com evidências.', category: 'choice', parents: ['ledger_found', 'fiber_found'] },
  { id: 'marta_warned', title: 'Aviso a Marta', description: 'Marta recebe um aviso concreto sobre o quarto 202.', category: 'choice', parents: ['ledger_found'] },
  { id: 'marta_murdered', title: 'O quarto cobra', description: 'Marta é encontrada morta no 202.', category: 'death', parents: ['power_flicker'] },
  { id: 'murder_prevented', title: 'Quarto vazio', description: 'A vítima sai da rota planejada e o crime falha.', category: 'choice', parents: ['marta_warned'] },
  { id: 'player_taken', title: 'A conta transferida', description: 'Sem Marta, o hotel escolhe a testemunha.', category: 'death', parents: ['murder_prevented'], hidden: true },
  { id: 'night_closed', title: 'A noite fecha', description: 'O corredor dobra sobre si e a run termina.', category: 'ending', parents: ['marta_murdered'] },
  { id: 'loop_survived', title: 'Uma morte adiada', description: 'A madrugada reinicia com Marta viva.', category: 'ending', parents: ['murder_prevented'] },
];
