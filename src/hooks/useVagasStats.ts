import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VagasStats {
  total_vagas: number;
  vagas_disponiveis: number;
  vagas_ocupadas: number;
  vagas_reservadas: number;
  vagas_manutencao: number;
}

export const useVagasStats = (estacionamentoId: string | undefined) => {
  const [stats, setStats] = useState<VagasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    if (!estacionamentoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('get_vagas_stats', { estacionamento_id_param: estacionamentoId });

      if (error) throw error;

      if (data && data.length > 0) {
        setStats(data[0]);
      } else {
        setStats({
          total_vagas: 0,
          vagas_disponiveis: 0,
          vagas_ocupadas: 0,
          vagas_reservadas: 0,
          vagas_manutencao: 0
        });
      }
    } catch (err: any) {
      console.error('Error fetching vagas stats:', err);
      setError(err.message || 'Erro ao carregar estatísticas das vagas');
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas das vagas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [estacionamentoId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};