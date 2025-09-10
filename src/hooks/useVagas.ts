import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type VagaData = Database['public']['Tables']['vagas']['Row'];

export const useVagas = (estacionamentoId: string | undefined) => {
  const [vagas, setVagas] = useState<VagaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVagas = async () => {
    if (!estacionamentoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vagas')
        .select('*')
        .eq('estacionamento_id', estacionamentoId)
        .order('numero_vaga');

      if (error) throw error;

      setVagas(data || []);
    } catch (err: any) {
      console.error('Error fetching vagas:', err);
      setError(err.message || 'Erro ao carregar vagas');
      toast({
        title: "Erro",
        description: "Erro ao carregar vagas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVagaStatus = async (vagaId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('vagas')
        .update({ status: newStatus })
        .eq('id', vagaId);

      if (error) throw error;

      // Update local state
      setVagas(prevVagas => 
        prevVagas.map(vaga => 
          vaga.id === vagaId ? { ...vaga, status: newStatus } : vaga
        )
      );

      toast({
        title: "Sucesso",
        description: "Status da vaga atualizado com sucesso",
      });
    } catch (err: any) {
      console.error('Error updating vaga status:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da vaga",
        variant: "destructive"
      });
    }
  };

  const deleteVaga = async (vagaId: string) => {
    try {
      const { error } = await supabase
        .from('vagas')
        .delete()
        .eq('id', vagaId);

      if (error) throw error;

      // Update local state
      setVagas(prevVagas => prevVagas.filter(vaga => vaga.id !== vagaId));

      toast({
        title: "Sucesso",
        description: "Vaga deletada com sucesso",
      });
    } catch (err: any) {
      console.error('Error deleting vaga:', err);
      toast({
        title: "Erro",
        description: "Erro ao deletar vaga",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchVagas();
  }, [estacionamentoId]);

  return {
    vagas,
    loading,
    error,
    refetch: fetchVagas,
    updateVagaStatus,
    deleteVaga
  };
};