import { supabase } from '@/integrations/supabase/client';

/**
 * @function getCurrentUser
 * @description Helper para obter usuário autenticado (evita código duplicado)
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) throw error;
  if (!user) throw new Error('Usuário não autenticado');
  
  return user;
}

/**
 * @function sortByNumericField
 * @description Helper genérico para ordenar por campos numéricos extraídos de strings
 */
export function sortByNumericField<T>(
  array: T[],
  fieldGetter: (item: T) => string
): T[] {
  return array.slice().sort((a, b) => {
    const getNum = (s: string) => {
      const match = s.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };
    return getNum(fieldGetter(a)) - getNum(fieldGetter(b));
  });
}

/**
 * @function handleSupabaseError
 * @description Formata mensagens de erro do Supabase de forma consistente
 */
export function handleSupabaseError(error: any, defaultMessage: string = 'Ocorreu um erro'): string {
  if (error?.message) {
    // Traduz erros comuns do Supabase
    if (error.message.includes('duplicate key')) {
      return 'Este registro já existe';
    }
    if (error.message.includes('foreign key')) {
      return 'Não é possível realizar esta ação devido a dependências';
    }
    if (error.message.includes('violates row-level security')) {
      return 'Você não tem permissão para realizar esta ação';
    }
    return error.message;
  }
  return defaultMessage;
}
