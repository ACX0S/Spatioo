export type TamanhoVeiculo = 'P' | 'M' | 'G';

export interface Veiculo {
  id: string;
  user_id: string;
  tipo: string;
  modelo: string;
  cor: string;
  placa: string;
  tamanho: TamanhoVeiculo;
  created_at: string;
  updated_at: string;
}

export interface VeiculoInsert {
  tipo: string;
  modelo: string;
  cor: string;
  placa: string;
  tamanho: TamanhoVeiculo;
  user_id: string;
}

export interface VeiculoUpdate {
  tipo?: string;
  modelo?: string;
  cor?: string;
  placa?: string;
  tamanho?: TamanhoVeiculo;
}

export const TAMANHO_REFERENCIAS = {
  P: 'até 3,8m x 1,7m',
  M: 'até 4,3m x 1,8m',
  G: 'acima de 4,3m'
} as const;
