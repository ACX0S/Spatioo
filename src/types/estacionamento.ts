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
  hora_extra?: number | null; // Valor cobrado por hora adicional (opcional, a critério do proprietário)
  // Comodidades do estacionamento
  funcionamento_24h?: boolean;
  suporte_carro_eletrico?: boolean;
  vaga_coberta?: boolean;
  manobrista?: boolean;
  suporte_caminhao?: boolean;
  vaga_moto?: boolean;
  tamanho_vaga?: 'P' | 'M' | 'G'; // Tamanho da vaga residencial
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
  hora_extra?: number | null; // Valor opcional para hora adicional
  // Comodidades do estacionamento
  funcionamento_24h?: boolean;
  suporte_carro_eletrico?: boolean;
  vaga_coberta?: boolean;
  manobrista?: boolean;
  suporte_caminhao?: boolean;
  vaga_moto?: boolean;
  tamanho_vaga?: 'P' | 'M' | 'G'; // Tamanho da vaga residencial
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
  hora_extra?: number | null; // Valor opcional para hora adicional
  // Comodidades do estacionamento
  funcionamento_24h?: boolean;
  suporte_carro_eletrico?: boolean;
  vaga_coberta?: boolean;
  manobrista?: boolean;
  suporte_caminhao?: boolean;
  vaga_moto?: boolean;
  tamanho_vaga?: 'P' | 'M' | 'G'; // Tamanho da vaga residencial
}