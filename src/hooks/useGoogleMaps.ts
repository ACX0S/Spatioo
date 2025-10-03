import { useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyA-Ri0fzjZNvLjhJsio4K0kTqM8B_OFfqQ';
const libraries: ("places" | "geometry")[] = ['places', 'geometry'];

/**
 * Hook para carregar a API do Google Maps
 * Gerencia o carregamento e estado da biblioteca do Google Maps
 */
export const useGoogleMaps = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  return {
    isLoaded,
    loadError,
  };
};
