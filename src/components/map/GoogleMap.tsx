import React, { useState, useCallback } from 'react';
import { GoogleMap as GoogleMapComponent, Marker, InfoWindow } from '@react-google-maps/api';
import { PublicParkingData } from '@/services/parkingService';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation2 } from 'lucide-react';

interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  parkingSpots: PublicParkingData[];
  onParkingSelect: (spot: PublicParkingData) => void;
  userLocation?: [number, number] | null;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

/**
 * Componente do mapa do Google Maps
 * Exibe marcadores dos estacionamentos e permite interação
 */
const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  parkingSpots,
  onParkingSelect,
  userLocation
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<PublicParkingData | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return (
    <GoogleMapComponent
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* Marcador da localização do usuário */}
      {userLocation && (
        <Marker
          position={{ lat: userLocation[0], lng: userLocation[1] }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }}
        />
      )}

      {/* Marcadores dos estacionamentos */}
      {parkingSpots.map((spot) => {
        if (!spot.latitude || !spot.longitude) return null;

        return (
          <Marker
            key={spot.id}
            position={{ lat: Number(spot.latitude), lng: Number(spot.longitude) }}
            onClick={() => setSelectedSpot(spot)}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 8.836 16 24 16 24s16-15.164 16-24c0-8.837-7.163-16-16-16z" fill="#10B981"/>
                  <circle cx="16" cy="16" r="6" fill="white"/>
                  <text x="16" y="20" font-size="10" text-anchor="middle" fill="#10B981" font-weight="bold">P</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 40),
              anchor: new google.maps.Point(16, 40),
            }}
          />
        );
      })}

      {/* InfoWindow para o estacionamento selecionado */}
      {selectedSpot && selectedSpot.latitude && selectedSpot.longitude && (
        <InfoWindow
          position={{ lat: Number(selectedSpot.latitude), lng: Number(selectedSpot.longitude) }}
          onCloseClick={() => setSelectedSpot(null)}
        >
          <div className="p-2 max-w-[200px]">
            <h3 className="font-semibold text-sm mb-1">{selectedSpot.nome}</h3>
            <p className="text-xs text-muted-foreground mb-2">{selectedSpot.endereco}</p>
            <p className="text-xs mb-2">
              Vagas disponíveis: <strong>{selectedSpot.numero_vagas}</strong>
            </p>
            <Button
              size="sm"
              onClick={() => {
                onParkingSelect(selectedSpot);
                setSelectedSpot(null);
              }}
              className="w-full text-xs h-7"
            >
              Ver detalhes
            </Button>
          </div>
        </InfoWindow>
      )}
    </GoogleMapComponent>
  );
};

export default GoogleMap;
