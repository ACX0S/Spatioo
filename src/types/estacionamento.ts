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
  latitude?: number;
  longitude?: number;
  descricao?: string;
  ativo?: boolean;
  hora_extra?: number; // Valor cobrado por hora adicional quando não há preço específico
  // Comodidades do estacionamento
  funcionamento_24h?: boolean;
  suporte_carro_eletrico?: boolean;
  vaga_coberta?: boolean;
  manobrista?: boolean;
  suporte_caminhao?: boolean;
  vaga_moto?: boolean;
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
  latitude?: number;
  longitude?: number;
  hora_extra?: number; // Valor obrigatório para hora adicional
  // Comodidades do estacionamento
  funcionamento_24h?: boolean;
  suporte_carro_eletrico?: boolean;
  vaga_coberta?: boolean;
  manobrista?: boolean;
  suporte_caminhao?: boolean;
  vaga_moto?: boolean;
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
  latitude?: number;
  longitude?: number;
  ativo?: boolean;
  hora_extra?: number; // Valor para hora adicional
  // Comodidades do estacionamento
  funcionamento_24h?: boolean;
  suporte_carro_eletrico?: boolean;
  vaga_coberta?: boolean;
  manobrista?: boolean;
  suporte_caminhao?: boolean;
  vaga_moto?: boolean;
}