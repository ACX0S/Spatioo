import React, { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder: string;
  icon?: 'origin' | 'destination';
  className?: string;
}

/**
 * Componente de input com autocomplete do Google Maps
 * Permite que o usuário pesquise e selecione localizações
 */
const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  icon = 'destination',
  className
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    // Inicializa o autocomplete do Google
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'br' }, // Restringe para Brasil
      fields: ['geometry', 'formatted_address', 'name', 'place_id'],
    });

    // Listener para quando um lugar é selecionado
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place && place.geometry) {
        onPlaceSelect(place);
        onChange(place.formatted_address || place.name || '');
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelect, onChange]);

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="absolute left-3 z-10">
        {icon === 'origin' ? (
          <Navigation className="h-5 w-5 text-primary" />
        ) : (
          <MapPin className="h-5 w-5 text-destructive" />
        )}
      </div>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 h-12 bg-background border-border"
      />
    </div>
  );
};

export default LocationInput;
