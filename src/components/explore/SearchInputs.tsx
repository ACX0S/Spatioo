import React from 'react';
import { Locate, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LocationInput from '@/components/map/LocationInput';

interface SearchInputsProps {
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onOriginSelect: (place: google.maps.places.PlaceResult) => void;
  onDestinationSelect: (place: google.maps.places.PlaceResult) => void;
  onUseCurrentLocation: () => void;
  isMobile?: boolean;
}

/**
 * Componente de inputs de busca (origem e destino)
 * Reutilizável para desktop e mobile
 */
const SearchInputs: React.FC<SearchInputsProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onOriginSelect,
  onDestinationSelect,
  onUseCurrentLocation,
  isMobile = false
}) => {
  if (isMobile) {
    return (
      <div className="space-y-2 mb-2">
        <LocationInput
          placeholder="De onde você está saindo?"
          icon="origin"
          value={origin}
          onChange={onOriginChange}
          onPlaceSelect={onOriginSelect}
        />
        
        <LocationInput
          placeholder="Para onde você vai?"
          icon="destination"
          value={destination}
          onChange={onDestinationChange}
          onPlaceSelect={onDestinationSelect}
        />
        
        <Button
          variant="outline"
          size="sm"
          className="w-full hover:bg-primary hover:text-primary-foreground hover:scale-[1.01] active:scale-95 transition-all duration-500"
          onClick={onUseCurrentLocation}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Usar minha localização
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 border-b border-border bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Partida
        </label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onUseCurrentLocation}
            className="flex-shrink-0 h-12 w-12 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
            title="Usar localização atual"
          >
            <Locate className="h-5 w-5 text-primary" />
          </Button>
          <LocationInput
            value={origin}
            onChange={onOriginChange}
            onPlaceSelect={onOriginSelect}
            placeholder="Digite o endereço de partida"
            icon="origin"
            className="flex-1"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          Destino
        </label>
        <LocationInput
          value={destination}
          onChange={onDestinationChange}
          onPlaceSelect={onDestinationSelect}
          placeholder="Para onde você vai?"
          icon="destination"
        />
      </div>
    </div>
  );
};

export default SearchInputs;
