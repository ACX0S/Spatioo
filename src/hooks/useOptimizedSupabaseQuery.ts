import { useState, useEffect, useCallback, useRef } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

/**
 * @hook useOptimizedSupabaseQuery
 * @description Hook otimizado com cache, retry logic e error handling robusto
 */
export function useOptimizedSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T[] | null; error: PostgrestError | null }>,
  dependencies: any[] = [],
  options?: {
    enabled?: boolean;
    errorMessage?: string;
    transform?: (data: T[]) => T[];
    cacheTime?: number;
    retryAttempts?: number;
    retryDelay?: number;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const cacheRef = useRef<{ data: T[]; timestamp: number } | null>(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cacheTime = options?.cacheTime ?? 60000; // 1 minuto padrão
  const maxRetries = options?.retryAttempts ?? 2;
  const retryDelay = options?.retryDelay ?? 1000;

  const fetchData = useCallback(async (isRetry = false) => {
    // Se enabled for false, não executa a query
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    // Verificar cache válido
    if (cacheRef.current && !isRetry) {
      const cacheAge = Date.now() - cacheRef.current.timestamp;
      if (cacheAge < cacheTime) {
        setData(cacheRef.current.data);
        setLoading(false);
        return;
      }
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

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
      
      // Atualizar cache
      cacheRef.current = {
        data: transformedData,
        timestamp: Date.now()
      };
      
      // Reset retry counter em caso de sucesso
      retryCountRef.current = 0;
      
    } catch (err: any) {
      // Ignore erros de abort
      if (err.name === 'AbortError') return;

      console.error('Error fetching data:', err);
      const errorMsg = err.message || options?.errorMessage || 'Erro ao carregar dados';
      setError(errorMsg);
      
      // Retry logic
      if (retryCountRef.current < maxRetries && !isRetry) {
        retryCountRef.current++;
        console.log(`Tentando novamente... (${retryCountRef.current}/${maxRetries})`);
        
        setTimeout(() => {
          fetchData(true);
        }, retryDelay * retryCountRef.current);
        return;
      }

      // Set empty array to avoid undefined errors
      setData([]);
      
      // Só mostra toast se não for retry
      if (!isRetry) {
        toast({
          title: "Erro",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [...dependencies, options?.enabled]);

  useEffect(() => {
    fetchData();
    
    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const invalidateCache = useCallback(() => {
    cacheRef.current = null;
    retryCountRef.current = 0;
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidateCache
  };
}
