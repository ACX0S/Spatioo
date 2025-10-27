import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Veiculo, VeiculoInsert, VeiculoUpdate } from '@/types/veiculo';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchVehicles = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('veiculos')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setVehicles((data || []) as unknown as Veiculo[]);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      const errorMsg = err.message || 'Erro ao carregar veículos';
      setError(errorMsg);
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicleData: Omit<VeiculoInsert, 'user_id'>) => {
    if (!profile?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('veiculos')
        .insert({
          ...vehicleData,
          user_id: profile.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Sucesso',
        description: 'Veículo cadastrado com sucesso!'
      });

      await fetchVehicles();
      return data;
    } catch (err: any) {
      console.error('Error adding vehicle:', err);
      const errorMessage = err.message?.includes('veiculos_placa_unique') || err.code === '23505'
        ? 'Esta placa já está cadastrada no sistema'
        : err.message || 'Erro ao cadastrar veículo';
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updateVehicle = async (id: string, vehicleData: VeiculoUpdate) => {
    try {
      const { error: updateError } = await supabase
        .from('veiculos')
        .update(vehicleData)
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Sucesso',
        description: 'Veículo atualizado com sucesso!'
      });

      await fetchVehicles();
      return true;
    } catch (err: any) {
      console.error('Error updating vehicle:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao atualizar veículo',
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('veiculos')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Sucesso',
        description: 'Veículo excluído com sucesso!'
      });

      await fetchVehicles();
      return true;
    } catch (err: any) {
      console.error('Error deleting vehicle:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao excluir veículo',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVehicles();

    // Realtime subscription
    const channel = supabase
      .channel('veiculos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'veiculos',
          filter: `user_id=eq.${profile?.id}`
        },
        () => {
          fetchVehicles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return {
    vehicles,
    loading,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    refetch: fetchVehicles
  };
}
