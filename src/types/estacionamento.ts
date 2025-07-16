export interface Estacionamento {
  id: string;
  nome: string;
  cnpj: string;
  cep: string;
  endereco: string;
  numero_vagas: number;
  fotos: string[];
  horario_funcionamento: {
    abertura: string;
    fechamento: string;
  };
  preco: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface EstacionamentoInsert {
  nome: string;
  cnpj: string;
  cep: string;
  endereco: string;
  numero_vagas: number;
  fotos?: string[];
  horario_funcionamento: {
    abertura: string;
    fechamento: string;
  };
  preco: number;
  user_id: string;
}

export interface EstacionamentoUpdate {
  nome?: string;
  cnpj?: string;
  cep?: string;
  endereco?: string;
  numero_vagas?: number;
  fotos?: string[];
  horario_funcionamento?: {
    abertura: string;
    fechamento: string;
  };
  preco?: number;
}