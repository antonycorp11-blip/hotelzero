import type { CharacterDefinition } from '../core/types';

export const CHARACTERS: Record<string, CharacterDefinition> = {
  elise: {
    id: 'elise', name: 'Elise', role: 'Recepcionista',
    personality: 'Sarcástica, observadora e profissional até o limite do razoável.',
    color: 0xd7a95b, initialArea: 'lobby', permissions: ['reception'],
    inventory: ['chave_recepcao'], vulnerability: 0.28,
    secret: 'Altera discretamente o livro de hóspedes desde que o hotel começou a repetir nomes.',
  },
  marta: {
    id: 'marta', name: 'Marta', role: 'Camareira',
    personality: 'Pragmática, cautelosa e cansada de limpar o inexplicável.',
    color: 0x6da9a1, initialArea: 'corridor', permissions: ['guest-rooms'],
    inventory: ['chave_mestra'], vulnerability: 0.46,
    secret: 'Encontrou uma parede respirando atrás do armário do quarto 202.',
  },
  augusto: {
    id: 'augusto', name: 'Augusto', role: 'Gerente',
    personality: 'Educado, controlador e sempre dois passos perto demais.',
    color: 0x8d5c57, initialArea: 'office', permissions: ['management', 'reception'],
    inventory: ['chave_escritorio'], vulnerability: 0.62,
    secret: 'Usa um contrato antigo para manter o hotel fora dos registros municipais.',
  },
  raul: {
    id: 'raul', name: 'Raul', role: 'Segurança',
    personality: 'Desconfiado, metódico e mais corajoso diante de monitores que de pessoas.',
    color: 0x65749b, initialArea: 'security', permissions: ['security'],
    inventory: ['cartao_seguranca'], vulnerability: 0.35,
    secret: 'Apagou uma gravação em que aparece entrando no hotel antes de ser contratado.',
  },
};

export const ALL_CAST = [
  'Elise', 'Augusto', 'Marta', 'Raul', 'Otávio', 'Helena',
  'Dante', 'Bianca', 'Elias', 'Nico', 'Vítor', 'Samuel',
];
