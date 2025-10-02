import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { useSupabaseQuery } from './useSupabaseQuery';
import { sortByNumericField, handleSupabaseError } from '@/utils/supabaseHelpers';

type VagaData = Database['public']['Tables']['vagas']['Row'];

/**
 * @hook useVagas
 * @description Hook otimizado para gerenciar vagas de um estacionamento
 * Agora usa useSupabaseQuery para reduzir código duplicado
 */
export const useVagas = (estacionamentoId: string | undefined) => {
  const { toast } = useToast();

  // Usa o hook genérico para buscar vagas
  const { data: vagas, loading, error, refetch } = useSupabaseQuery<VagaData>(
    async () => supabase
      .from('vagas')
      .select('*')
      .eq('estacionamento_id', estacionamentoId!),
    [estacionamentoId],
    {
      enabled: !!estacionamentoId,
      errorMessage: 'Erro ao carregar vagas',
      transform: (data) => sortByNumericField(data, (item) => item.numero_vaga)
    }
  );

  // Otimizado com useCallback para evitar re-renders desnecessários
  const updateVagaStatus = useCallback(async (vagaId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('vagas')
        .update({ status: newStatus })
        .eq('id', vagaId);

      if (error) throw error;

      // Refetch para garantir consistência com o banco
      await refetch();

      toast({
        title: "Sucesso",
        description: "Status da vaga atualizado com sucesso",
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: handleSupabaseError(err, "Erro ao atualizar status da vaga"),
        variant: "destructive"
      });
    }
  }, [refetch, toast]);

  const deleteVaga = useCallback(async (vagaId: string) => {
    try {
      const { error } = await supabase
        .from('vagas')
        .delete()
        .eq('id', vagaId);

      if (error) throw error;

      // Refetch para garantir consistência com o banco
      await refetch();

      toast({
        title: "Sucesso",
        description: "Vaga deletada com sucesso",
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: handleSupabaseError(err, "Erro ao deletar vaga"),
        variant: "destructive"
      });
    }
  }, [refetch, toast]);

  return {
    vagas,
    loading,
    error,
    refetch,
    updateVagaStatus,
    deleteVaga
  };
};