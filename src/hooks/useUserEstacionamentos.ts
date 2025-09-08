import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { Estacionamento } from '@/types/estacionamento';

type EstacionamentoData = Database['public']['Tables']['estacionamento']['Row'];

export const useUserEstacionamentos = () => {
  const [estacionamentos, setEstacionamentos] = useState<EstacionamentoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadEstacionamentos = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('estacionamento')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user estacionamentos:', error);
        throw error;
      }

      setEstacionamentos(data || []);
    } catch (err: any) {
      console.error('Failed to fetch user estacionamentos:', err);
      setError(err.message || 'Erro ao carregar suas vagas');
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas vagas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstacionamentos();
  }, [user]);

  return {
    estacionamentos,
    loading,
    error,
    refetch: loadEstacionamentos
  };
};