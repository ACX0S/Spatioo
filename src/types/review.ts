export interface Review {
  id: string;
  booking_id: string;
  avaliador_id: string;
  avaliado_tipo: 'motorista' | 'estacionamento';
  avaliado_id: string;
  nota: number;
  tags?: string[];
  comentario?: string;
  created_at: string;
}

export const TAGS_ESTACIONAMENTO = [
  'Mal atendimento',
  'Má localização',
  'Organização precária',
  'Fotos enganosas'
] as const;

export const TAGS_MOTORISTA = [
  'Desrespeitoso',
  'Condução perigosa'
] as const;
