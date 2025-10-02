import { useState, useEffect, useCallback } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

/**
 * @hook useSupabaseQuery
 * @description Hook genérico e reutilizável para queries do Supabase
 * Elimina código duplicado entre useVagas, useEstacionamentoBookings, etc.
 */
export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T[] | null; error: PostgrestError | null }>,
  dependencies: any[] = [],
  options?: {
    enabled?: boolean;
    errorMessage?: string;
    transform?: (data: T[]) => T[];
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    // Se enabled for false, não executa a query
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await queryFn();

      if (result.error) throw result.error;

      // Aplica transformação se fornecida
      const transformedData = options?.transform 
        ? options.transform(result.data || [])
        : (result.data || []);

      setData(transformedData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      const errorMsg = err.message || options?.errorMessage || 'Erro ao carregar dados';
      setError(errorMsg);
      
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
