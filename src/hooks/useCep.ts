
import { useState } from 'react';

export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

export interface CepValidationResult {
  isValid: boolean;
  message?: string;
}

export const useCep = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedCep, setLastFetchedCep] = useState<string | null>(null);
  const [cachedResults, setCachedResults] = useState<Record<string, CepData>>({});

  /**
   * Valida o formato do CEP
   * @param cep CEP a ser validado
   * @returns Resultado da validação
   */
  const validateCepFormat = (cep: string): CepValidationResult => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (!cleanCep) {
      return { isValid: false, message: 'CEP não pode estar vazio' };
    }
    
    if (cleanCep.length !== 8) {
      return { isValid: false, message: 'CEP deve conter 8 dígitos' };
    }
    
    // Verifica se o CEP não é composto apenas por números repetidos
    if (/^(\d)\1+$/.test(cleanCep)) {
      return { isValid: false, message: 'CEP inválido' };
    }
    
    return { isValid: true };
  };

  /**
   * Busca os dados de endereço a partir de um CEP
   * @param cep CEP a ser consultado
   * @returns Dados do endereço ou null em caso de erro
   */
  const fetchCep = async (cep: string): Promise<CepData | null> => {
    const cleanCep = cep.replace(/\D/g, '');
    
    // Verifica se o CEP é válido
    const validation = validateCepFormat(cleanCep);
    if (!validation.isValid) {
      setError(validation.message || 'CEP inválido');
      return null;
    }

    // Verifica se o CEP já está em cache
    if (cachedResults[cleanCep]) {
      return cachedResults[cleanCep];
    }

    setLoading(true);
    setError(null);
    setLastFetchedCep(cleanCep);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      
      const data: CepData = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return null;
      }

      // Armazena o resultado em cache
      setCachedResults(prev => ({
        ...prev,
        [cleanCep]: data
      }));

      return data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Tempo limite excedido. Verifique sua conexão.');
      } else {
        setError(`Erro ao buscar CEP: ${err.message}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata um CEP para o padrão 00000-000
   * @param value Valor a ser formatado
   * @returns CEP formatado
   */
  const formatCep = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 8) {
      return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cleanValue.slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  /**
   * Formata um endereço completo a partir dos dados do CEP
   * @param data Dados do CEP
   * @returns Endereço formatado
   */
  const formatAddress = (data: CepData): string => {
    if (!data) return '';
    
    const parts = [
      data.logradouro,
      data.bairro,
      `${data.localidade} - ${data.uf}`,
      `CEP: ${data.cep}`
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return {
    fetchCep,
    formatCep,
    validateCepFormat,
    formatAddress,
    loading,
    error,
    lastFetchedCep
  };
};
