
import { useState, useEffect } from 'react';
import { fetchParkingSpotById } from '@/services/parkingService';
import { ParkingSpot } from '@/types/parking';
import { toast } from '@/components/ui/use-toast';

export const useParkingDetail = (id: string) => {
  const [parkingSpot, setParkingSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParkingDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchParkingSpotById(id);
        setParkingSpot(data);
      } catch (err: any) {
        console.error('Erro ao carregar estacionamento:', err);
        setError(err.message || 'Erro ao carregar dados do estacionamento');
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do estacionamento.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadParkingDetail();
    }
  }, [id]);

  return { parkingSpot, loading, error };
};
