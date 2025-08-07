import { useState } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const useGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
    setLoading(true);
    setError(null);

    try {
      // Use OpenStreetMap Nominatim API for geocoding (free alternative to Google Maps)
      const encodedAddress = encodeURIComponent(`${address}, Brasil`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Erro na requisição de geocodificação');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      } else {
        setError('Endereço não encontrado');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao geocodificar endereço');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const geocodeCep = async (cep: string): Promise<Coordinates | null> => {
    setLoading(true);
    setError(null);

    try {
      // First get address from CEP using ViaCEP
      const cleanCep = cep.replace(/\D/g, '');
      const cepResponse = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const cepData = await cepResponse.json();

      if (cepData.erro) {
        setError('CEP não encontrado');
        return null;
      }

      // Then geocode the address
      const fullAddress = `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}`;
      return await geocodeAddress(fullAddress);
    } catch (err: any) {
      setError(err.message || 'Erro ao geocodificar CEP');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    geocodeAddress,
    geocodeCep,
    loading,
    error
  };
};