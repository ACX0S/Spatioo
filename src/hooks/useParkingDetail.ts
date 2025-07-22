
import { useState, useEffect } from 'react';
import { fetchParkingSpotById } from '@/services/parkingService';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/components/ui/use-toast';

type EstacionamentoRow = Database['public']['Tables']['estacionamento']['Row'];

export const useParkingDetail = (id: string) => {
  const [parkingSpot, setParkingSpot] = useState<EstacionamentoRow | null>(null);
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
