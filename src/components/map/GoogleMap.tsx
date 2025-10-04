import React, { useState, useCallback } from 'react';
import { GoogleMap as GoogleMapComponent, Marker, InfoWindow } from '@react-google-maps/api';
import { PublicParkingData } from '@/services/parkingService';
import { Button } from '@/components/ui/button';
import { FaCar } from 'react-icons/fa';

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

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
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

  const handleMarkerClick = useCallback((spot: PublicParkingData) => {
    setSelectedSpot(spot);
  }, []);

  return (
    <GoogleMapComponent
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {/* Marcador da localização do usuário */}
      {userLocation && (
        <Marker
          position={{ lat: userLocation[0], lng: userLocation[1] }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#0ea5e9',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          }}
          title="Sua localização"
          zIndex={1000}
        />
      )}

      {/* Marcadores dos estacionamentos com ícone customizado */}
      {parkingSpots
        .filter(spot => spot.latitude && spot.longitude)
        .map((spot) => (
          <Marker
            key={spot.id}
            position={{ lat: Number(spot.latitude), lng: Number(spot.longitude) }}
            onClick={() => handleMarkerClick(spot)}
            title={spot.nome}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                      <feOffset dx="0" dy="2" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <path d="M18 0C8.059 0 0 8.059 0 18c0 10.59 18 30 18 30s18-19.41 18-30c0-9.941-8.059-18-18-18z" 
                        fill="#10B981" filter="url(#shadow)"/>
                  <circle cx="18" cy="18" r="8" fill="white"/>
                  <text x="18" y="23" font-size="14" text-anchor="middle" fill="#10B981" font-weight="bold" font-family="Arial">P</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(36, 48),
              anchor: new google.maps.Point(18, 48),
            }}
            animation={google.maps.Animation.DROP}
          />
        ))}

      {/* InfoWindow para o estacionamento selecionado */}
      {selectedSpot && selectedSpot.latitude && selectedSpot.longitude && (
        <InfoWindow
          position={{ lat: Number(selectedSpot.latitude), lng: Number(selectedSpot.longitude) }}
          onCloseClick={() => setSelectedSpot(null)}
        >
          <div className="p-3 min-w-[220px]">
            <h3 className="font-bold text-base mb-2 text-spatioo-primary">{selectedSpot.nome}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{selectedSpot.endereco}</p>
            <div className="flex items-center gap-2 mb-3">
              <FaCar className="w-4 h-4 text-spatioo-secondary" />
              <span className="text-sm font-medium">{selectedSpot.numero_vagas} vagas disponíveis</span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                onParkingSelect(selectedSpot);
                setSelectedSpot(null);
              }}
              className="w-full bg-spatioo-primary hover:bg-spatioo-primary/90"
            >
              Ver Detalhes
            </Button>
          </div>
        </InfoWindow>
      )}
    </GoogleMapComponent>
  );
};

export default GoogleMap;
