import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { useSupabaseQuery } from './useSupabaseQuery';

type EstacionamentoData = Database['public']['Tables']['estacionamento']['Row'];

/**
 * @hook useUserEstacionamentos
 * @description Hook otimizado para gerenciar estacionamentos do usuário
 * Agora usa useSupabaseQuery para reduzir código duplicado
 */
export const useUserEstacionamentos = () => {
  const { user } = useAuth();

  // Usa o hook genérico para buscar estacionamentos
  const { data: estacionamentos, loading, error, refetch } = useSupabaseQuery<EstacionamentoData>(
    async () => supabase
      .from('estacionamento')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    [user?.id],
    {
      enabled: !!user,
      errorMessage: 'Não foi possível carregar suas vagas'
    }
  );

  return {
    estacionamentos,
    loading,
    error,
    refetch
  };
};