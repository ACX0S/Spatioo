import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, MapPin, Clock, Navigation, Star, Compass, TrendingUp, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useParkingData } from '@/hooks/useParkingData';
import { PublicParkingData } from '@/services/parkingService';
import { toast } from '@/hooks/use-toast';
import AutocompleteSearch from '@/components/AutocompleteSearch';
import ParkingGrid from '@/components/ParkingGrid';
import LoadingSpinner from '@/components/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [userLocation, setUserLocation] = useState('Obtendo localização...');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Use optimized hooks for data fetching
  const { 
    data: nearbyParkingSpots, 
    loading: nearbyLoading,
    error: nearbyError,
    refetch: refetchNearby
  } = useParkingData({ type: 'nearby', limit: 3 });

  const { 
    data: popularDestinations, 
    loading: popularLoading,
    error: popularError,
    refetch: refetchPopular
  } = useParkingData({ type: 'popular', limit: 4 });

  const loading = nearbyLoading || popularLoading;

  // Obter localização real do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=74c89b3be64946ac96d777d08b878d43`
            );
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              const location = data.results[0];
              const locationString = `${location.components.neighbourhood || location.components.suburb || location.components.city}, ${location.components.state}`;
              setUserLocation(locationString);
            }
          } catch (error) {
            console.error('Erro ao obter localização:', error);
            setUserLocation('Localização não disponível');
          }
        },
        (error) => {
          console.error('Erro de geolocalização:', error);
          setUserLocation('Localização não disponível');
        }
      );
    } else {
      setUserLocation('Geolocalização não suportada');
    }
  }, []);

  // Carregar recentes do localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  // Memoized callbacks for better performance
  const saveRecentSearch = useCallback((search: string) => {
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      saveRecentSearch(query);
      navigate('/explore', { state: { search: query } });
    }
  }, [navigate, saveRecentSearch]);

  const handleLocationSearch = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          toast({
            title: "Localização obtida",
            description: "Buscando estacionamentos próximos..."
          });
          navigate('/explore', { 
            state: { 
              userLocation: [latitude, longitude] 
            } 
          });
        },
        (error) => {
          toast({
            title: "Erro de localização",
            description: "Não foi possível obter sua localização atual.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Erro",
        description: "Geolocalização não é suportada neste dispositivo.",
        variant: "destructive"
      });
    }
  }, [navigate]);

  const handleParkingSelect = useCallback((spot: PublicParkingData) => {
    navigate(`/parking/${spot.id}`);
  }, [navigate]);

  const handleSuggestionClick = useCallback((location: string) => {
    navigate('/explore', { state: { search: location } });
  }, [navigate]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with greeting */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl font-bold">
          Olá{profile?.name ? `, ${profile.name}` : ''}! 👋
        </h1>
        <p className="text-muted-foreground">
          <MapPin className="inline w-4 h-4 mr-1" />
          {userLocation}
        </p>
      </motion.div>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <AutocompleteSearch
          onSearch={handleSearch}
          onParkingSelect={handleParkingSelect}
          placeholder="Para onde você vai?"
          className="w-full"
        />
      </motion.div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Buscas Recentes</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {recentSearches.slice(0, 3).map((search, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSuggestionClick(search)}
              >
                {search}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && <LoadingSpinner text="Carregando estacionamentos..." />}

      {/* Nearby Parking Section */}
      {!loading && nearbyParkingSpots.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Próximos a você</h2>
          </div>
          
          <ParkingGrid
            data={nearbyParkingSpots}
            onParkingSelect={handleParkingSelect}
            onRetry={refetchNearby}
            emptyMessage="Nenhum estacionamento próximo encontrado."
            className="mb-6"
          />
        </motion.section>
      )}

      {/* Popular Destinations Section */}
      {!loading && popularDestinations.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Destinos Populares</h2>
          </div>
          
          <ParkingGrid
            data={popularDestinations}
            onParkingSelect={handleParkingSelect}
            onRetry={refetchPopular}
            emptyMessage="Nenhum destino popular encontrado."
          />
        </motion.section>
      )}

      {/* Empty state when no data */}
      {!loading && nearbyParkingSpots.length === 0 && popularDestinations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-12"
        >
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum estacionamento encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Não encontramos estacionamentos na sua região ainda.
          </p>
          <Button onClick={() => navigate('/explore')}>
            Explorar Todos os Estacionamentos
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Home;