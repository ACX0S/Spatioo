export type TamanhoVeiculo = 'P' | 'M' | 'G';

export interface Veiculo {
  id: string;
  user_id: string;
  nome: string;
  cor: string;
  placa: string;
  largura: number; // em metros
  comprimento: number; // em metros
  created_at: string;
  updated_at: string;
}

export interface VeiculoInsert {
  nome: string;
  cor: string;
  placa: string;
  largura: number;
  comprimento: number;
  user_id: string;
}

export interface VeiculoUpdate {
  nome?: string;
  cor?: string;
  placa?: string;
  largura?: number;
  comprimento?: number;
}

export const CORES_DISPONIVEIS = [
  'Preto',
  'Prata',
  'Cinza',
  'Vermelho',
  'Azul',
  'Verde',
  'Marrom',
  'Bege',
  'Amarelo',
  'Laranja'
] as const;
