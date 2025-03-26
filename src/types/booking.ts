
export interface Booking {
  id: string;
  user_id: string;
  parking_spot_id: string;
  date: string;
  start_time: string;
  end_time: string;
  spot_number: string;
  price: number;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  created_at: string;
  
  // Campos populados
  parkingName?: string;
  parkingAddress?: string;
}
