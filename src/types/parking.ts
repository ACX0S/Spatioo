
export interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  description: string | null;
  lat: number | null;
  lng: number | null;
  price_per_hour: number;
  available_spots: number;
  image_url: string | null;
  rating: number | null;
  reviews_count: number | null;
  created_at: string | null;
  created_by: string | null;
}
