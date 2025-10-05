import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicParkingData } from '@/services/parkingService';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import GoogleMap from './GoogleMap';
import LocationInput from './LocationInput';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ParkingMapViewProps {
  parkingSpots: PublicParkingData[];
  onBack: () => void;
  onParkingSelect: (spot: PublicParkingData) => void;
  userLocation: [number, number] | null;
}

/**
 * View completa do mapa estilo Uber
 * Inclui campos de origem/destino, mapa e lista de estacionamentos
 */
const ParkingMapView: React.FC<ParkingMapViewProps> = ({
  parkingSpots,
  onBack,
  onParkingSelect,
  userLocation
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: -23.55052,
    lng: -46.633308 // São Paulo como padrão
  });

  // Centraliza no local do usuário quando disponível
  useEffect(() => {
    if (userLocation) {
      setMapCenter({ lat: userLocation[0], lng: userLocation[1] });
    }
  }, [userLocation]);

  // Handler para quando um destino é selecionado
  const handleDestinationSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setMapCenter({ lat, lng });
    }
  };

  // Ordena estacionamentos por distância do centro do mapa
  const sortedParkingSpots = useMemo(() => {
    if (!parkingSpots.length) return [];

    return [...parkingSpots]
      .filter(spot => spot.latitude && spot.longitude)
      .map(spot => {
        const distance = calculateDistance(
          mapCenter.lat,
          mapCenter.lng,
          Number(spot.latitude),
          Number(spot.longitude)
        );
        return { ...spot, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Mostra os 10 mais próximos
  }, [parkingSpots, mapCenter]);

  // Calcula distância usando a fórmula de Haversine
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive mb-2">Erro ao carregar o Google Maps</p>
          <Button onClick={onBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return <LoadingSpinner text="Carregando mapa..." />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header com campos de localização */}
      <div className="bg-background border-b border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-lg">Encontrar estacionamento</h2>
        </div>

        <div className="space-y-2">
          <LocationInput
            value={origin}
            onChange={setOrigin}
            onPlaceSelect={(place) => {}}
            placeholder="Local de partida"
            icon="origin"
          />
          <LocationInput
            value={destination}
            onChange={setDestination}
            onPlaceSelect={handleDestinationSelect}
            placeholder="Local de destino"
            icon="destination"
          />
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        <GoogleMap
          center={mapCenter}
          parkingSpots={sortedParkingSpots}
          onParkingSelect={onParkingSelect}
          userLocation={userLocation}
        />
      </div>

      {/* Lista de estacionamentos próximos */}
      <div className="bg-background border-t border-border max-h-[40vh] overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold mb-3">
            Estacionamentos próximos ({sortedParkingSpots.length})
          </h3>
          <div className="space-y-2">
            {sortedParkingSpots.map((spot) => (
              <Card
                key={spot.id}
                className="p-3 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onParkingSelect(spot)}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">{spot.nome}</h4>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {spot.distance?.toFixed(1)} km
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {spot.endereco}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{spot.numero_vagas} vagas</span>
                      </div>
                      {spot.preco_fixo_1h && (
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          <DollarSign className="h-3 w-3" />
                          <span>R$ {spot.preco_fixo_1h}/h</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {sortedParkingSpots.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                Nenhum estacionamento encontrado nesta região
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingMapView;
