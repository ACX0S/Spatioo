
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { fetchAllParkingSpots, PublicParkingData } from '@/services/parkingService';

/**
 * @interface AutocompleteSearchProps
 * @description Propriedades para o componente AutocompleteSearch.
 * @param onSearch - Função chamada quando uma busca é submetida.
 * @param onParkingSelect - Função opcional chamada quando um estacionamento específico é selecionado da lista de sugestões.
 * @param onFocus - Função opcional chamada quando o campo de busca recebe foco.
 * @param placeholder - Texto de placeholder para o campo de busca.
 * @param className - Classes CSS adicionais para o container do componente.
 */
interface AutocompleteSearchProps {
  onSearch: (query: string) => void;
  onParkingSelect?: (parking: PublicParkingData) => void;
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
}

/**
 * @component AutocompleteSearch
 * @description Um componente de barra de busca com funcionalidade de autocompletar.
 * Ele busca e exibe sugestões de estacionamentos conforme o usuário digita.
 */
const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  onSearch,
  onParkingSelect,
  onFocus,
  placeholder = "Para onde você vai?",
  className = ""
}) => {
  // Estado para armazenar o valor da busca.
  const [searchQuery, setSearchQuery] = useState('');
  // Estado para armazenar as sugestões filtradas.
  const [suggestions, setSuggestions] = useState<PublicParkingData[]>([]);
  // Estado para controlar a visibilidade do dropdown de sugestões.
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Estado para armazenar todos os estacionamentos disponíveis para busca.
  const [allParkingSpots, setAllParkingSpots] = useState<PublicParkingData[]>([]);
  // Estado para indicar se os dados estão sendo carregados.
  const [loading, setLoading] = useState(false);
  // Ref para o container de sugestões, usado para detectar cliques fora dele.
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Efeito para carregar todos os estacionamentos na montagem do componente.
  useEffect(() => {
    const loadParkingSpots = async () => {
      try {
        setLoading(true);
        const spots = await fetchAllParkingSpots();
        setAllParkingSpots(spots);
      } catch (error) {
        console.error('Erro ao carregar estacionamentos para autocompletar:', error);
      } finally {
        setLoading(false);
      }
    };

    loadParkingSpots();
  }, []);

  // Efeito para filtrar as sugestões com base na query de busca.
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    // Filtra os estacionamentos cujo nome ou endereço correspondem à busca.
    const filteredSuggestions = allParkingSpots.filter(spot => 
      spot.nome.toLowerCase().includes(query) || 
      spot.endereco.toLowerCase().includes(query)
    ).slice(0, 5); // Limita a 5 sugestões.

    setSuggestions(filteredSuggestions);
  }, [searchQuery, allParkingSpots]);

  // Efeito para fechar o dropdown de sugestões ao clicar fora dele.
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

  // Função para lidar com a submissão do formulário de busca.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  // Função para lidar com o clique em uma sugestão.
  const handleSuggestionClick = (spot: PublicParkingData) => {
    setSearchQuery(spot.nome);
    setShowSuggestions(false);
    // Se onParkingSelect for fornecido, chama-o; senão, usa onSearch.
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
          onFocus={() => {
            setShowSuggestions(true);
            onFocus?.();
          }}
        />
        <Button 
          type="submit"
          size="sm" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-spatioo-green hover:bg-spatioo-green-dark text-black h-8"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Dropdown de sugestões */}
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

      {/* Mensagem de nenhum resultado encontrado */}
      {showSuggestions && searchQuery.trim().length > 0 && suggestions.length === 0 && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-card rounded-lg shadow-lg border border-border p-3 text-center text-muted-foreground">
          Nenhum local encontrado com "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;
