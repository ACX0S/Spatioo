import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParkingData } from '@/hooks/useParkingData';
import { PublicParkingData } from '@/services/parkingService';
import ParkingGrid from '@/components/ParkingGrid';
import AutocompleteSearch from '@/components/AutocompleteSearch';
import ParkingMapView from '@/components/map/ParkingMapView';

const Explore = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSearch = location.state?.search || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [sortedParkingSpots, setSortedParkingSpots] = useState<(PublicParkingData & { distance?: number })[]>([]);
  const [showMapView, setShowMapView] = useState(false);

  // Use optimized data fetching
  const { 
    data: parkingSpots, 
    loading, 
    error,
    refetch
  } = useParkingData({ 
    type: searchTerm ? 'search' : 'all', 
    searchTerm,
    autoLoad: true 
  });

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, []);

  // Calculate distance function
  const calculateDistance = useCallback((spot: PublicParkingData): number => {
    if (!userLocation || !spot.latitude || !spot.longitude) return 0;
    
    const [userLat, userLng] = userLocation;
    const R = 6371; // Earth's radius in km
    const dLat = (spot.latitude - userLat) * Math.PI / 180;
    const dLng = (spot.longitude - userLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(spot.latitude * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [userLocation]);

  // Sort parking spots with distance when data changes
  const sortedData = useMemo(() => {
    if (parkingSpots.length === 0) return [];
    
    const spotsWithDistance = parkingSpots.map(spot => ({
      ...spot,
      distance: calculateDistance(spot)
    }));

    // Sort by distance if user location is available
    if (userLocation) {
      spotsWithDistance.sort((a, b) => a.distance - b.distance);
    }

    return spotsWithDistance;
  }, [parkingSpots, calculateDistance, userLocation]);

  useEffect(() => {
    setSortedParkingSpots(sortedData);
  }, [sortedData]);

  // Optimized search handler
  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query);
  }, []);

  // Handle direct navigation to spot details
  const handleParkingSelect = useCallback((spot: PublicParkingData) => {
    navigate(`/parking/${spot.id}`);
  }, [navigate]);

  // Handler para abrir a view do mapa
  const handleSearchFocus = useCallback(() => {
    setShowMapView(true);
  }, []);

  // Se está no modo mapa, mostra o ParkingMapView
  if (showMapView) {
    return (
      <ParkingMapView
        parkingSpots={sortedParkingSpots}
        onBack={() => setShowMapView(false)}
        onParkingSelect={handleParkingSelect}
        userLocation={userLocation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-spatioo-gray-light/10 to-spatioo-primary/10">
      <div className="container mx-auto p-4 relative">
        {/* Background decoration */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-spatioo-secondary/20 rounded-full blur-xl -z-10" />
        <div className="absolute bottom-32 left-8 w-16 h-16 bg-spatioo-primary/15 rounded-full blur-lg -z-10" />
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-4">Explorar Estacionamentos</h1>
        
        {/* Search Section */}
        <div className="space-y-4">
          <AutocompleteSearch
            onSearch={handleSearch}
            onParkingSelect={handleParkingSelect}
            onFocus={handleSearchFocus}
            placeholder="Buscar por nome ou endereço..."
            className="w-full"
          />
          
          {searchTerm && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Resultados para:</span>
              <Badge variant="outline">{searchTerm}</Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSearchTerm('')}
                className="text-xs"
              >
                Limpar
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Carregando...' : `${sortedParkingSpots.length} estacionamento(s) encontrado(s)`}
          </p>
          
          {userLocation && !loading && sortedParkingSpots.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Ordenado por distância
            </p>
          )}
        </div>

        <ParkingGrid
          data={sortedParkingSpots}
          loading={loading}
          error={error}
          onParkingSelect={handleParkingSelect}
          onRetry={refetch}
          showDistance={!!userLocation}
          calculateDistance={calculateDistance}
          emptyMessage={searchTerm 
            ? `Nenhum estacionamento encontrado para "${searchTerm}"`
            : "Nenhum estacionamento encontrado"
          }
          loadingText="Buscando estacionamentos..."
        />
      </motion.div>
      </div>
    </div>
  );
};

export default Explore;