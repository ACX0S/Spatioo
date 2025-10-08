export type BookingStatus = 
  | 'aguardando_confirmacao' 
  | 'reservada' 
  | 'ocupada' 
  | 'concluida' 
  | 'cancelada' 
  | 'rejeitada' 
  | 'expirada';

export interface Booking {
  id: string;
  user_id: string;
  estacionamento_id: string;
  date: string;
  start_time: string;
  end_time: string;
  spot_number: string;
  price: number;
  status: BookingStatus;
  created_at: string;
  expires_at?: string;
  accepted_at?: string;
  rejected_at?: string;
  arrival_confirmed_by_owner_at?: string;
  arrival_confirmed_by_user_at?: string;
  departure_confirmed_by_owner_at?: string;
  departure_confirmed_by_user_at?: string;
  completed_at?: string;
  
  // Campos populados
  parkingName?: string;
  parkingAddress?: string;
  estacionamento?: any;
}
