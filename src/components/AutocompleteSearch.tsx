
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { fetchAllParkingSpots } from '@/services/parkingService';

type EstacionamentoRow = Database['public']['Tables']['estacionamento']['Row'];

interface AutocompleteSearchProps {
  onSearch: (query: string) => void;
  onParkingSelect?: (parking: EstacionamentoRow) => void;
  placeholder?: string;
  className?: string;
}

const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  onSearch,
  onParkingSelect,
  placeholder = "Para onde você vai?",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<EstacionamentoRow[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allParkingSpots, setAllParkingSpots] = useState<EstacionamentoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load all parking spots for autocomplete
  useEffect(() => {
    const loadParkingSpots = async () => {
      try {
        setLoading(true);
        const spots = await fetchAllParkingSpots();
        setAllParkingSpots(spots);
      } catch (error) {
        console.error('Error loading parking spots for autocomplete:', error);
      } finally {
        setLoading(false);
      }
    };

    loadParkingSpots();
  }, []);

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filteredSuggestions = allParkingSpots.filter(spot => 
      spot.nome.toLowerCase().includes(query) || 
      spot.endereco.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to 5 suggestions

    setSuggestions(filteredSuggestions);
  }, [searchQuery, allParkingSpots]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (spot: EstacionamentoRow) => {
    setSearchQuery(spot.nome);
    setShowSuggestions(false);
    if (onParkingSelect) {
      onParkingSelect(spot);
    } else {
      onSearch(spot.nome);
    }
  };

  return (
    <div className={`relative ${className}`} ref={suggestionsRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          className="pl-10 pr-4 h-12 rounded-full bg-card shadow-sm border-input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <Button 
          type="submit"
          size="sm" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-spatioo-green hover:bg-spatioo-green-dark text-black h-8"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-card rounded-lg shadow-lg border border-border overflow-hidden">
          {suggestions.map((spot) => (
            <div 
              key={spot.id} 
              className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-0"
              onClick={() => handleSuggestionClick(spot)}
            >
              <div className="font-medium">{spot.nome}</div>
              <div className="text-sm text-muted-foreground flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {spot.endereco}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && searchQuery.trim().length > 0 && suggestions.length === 0 && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-card rounded-lg shadow-lg border border-border p-3 text-center text-muted-foreground">
          Nenhum local encontrado com "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;
