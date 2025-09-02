import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, MapPin, Clock, Navigation, Star, Compass, TrendingUp, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNearbyParkingSpots, fetchPopularParkingSpots, PublicParkingData } from '@/services/parkingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import AutocompleteSearch from '@/components/AutocompleteSearch';

const Home = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [userLocation, setUserLocation] = useState('Obtendo localização...');
  const [nearbyParkingSpots, setNearbyParkingSpots] = useState<PublicParkingData[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<PublicParkingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Obter localização real do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Fazer geocodificação reversa para obter o endereço
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`
            );
            const data = await response.json();
            
            if (data.address) {
              const city = data.address.city || data.address.town || data.address.village || '';
              const state = data.address.state || '';
              const location = city && state ? `${city}, ${state}` : 'Localização obtida';
              setUserLocation(location);
            } else {
              setUserLocation('Localização obtida');
            }
          } catch (error) {
            console.error('Erro na geocodificação reversa:', error);
            setUserLocation('Localização obtida');
          }
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setUserLocation('Localização não disponível');
          toast({
            title: "Localização não disponível",
            description: "Não foi possível acessar sua localização. Verifique as permissões do navegador.",
            variant: "destructive"
          });
        }
      );
    } else {
      setUserLocation('Geolocalização não suportada');
    }
    
    // Carregar buscas recentes do localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Carregar estacionamentos do Supabase
  useEffect(() => {
    const fetchParkingSpots = async () => {
      try {
        setLoading(true);
        
        // Buscar locais próximos
        const { data: nearby, error: nearbyError } = await supabase
          .from('estacionamento')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (nearbyError) throw nearbyError;
        setNearbyParkingSpots(nearby || []);
        
        // Buscar destinos populares
        const { data: popular, error: popularError } = await supabase
          .from('estacionamento')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
          
        if (popularError) throw popularError;
        setPopularDestinations(popular || []);
        
      } catch (error: any) {
        console.error('Erro ao carregar estacionamentos:', error.message);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível buscar os estacionamentos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchParkingSpots();
  }, []);

  // Handle search submission
  const handleSearch = (query: string) => {
    if (query.trim()) {
      try {
        // Salvar busca no histórico recente
        const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 4);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
        
        // Realizar a busca e navegar para os resultados
        navigate('/explore', { state: { search: query } });
      } catch (error) {
        console.error('Erro ao realizar busca:', error);
        toast({
          title: "Erro",
          description: "Não foi possível completar a busca.",
          variant: "destructive"
        });
      }
    }
  };

  // Handle parking spot selection
  const handleParkingSelect = (spot: PublicParkingData) => {
    navigate(`/parking/${spot.id}`);
  };

  // Handle suggestion click
  const handleSuggestionClick = (location: string) => {
    navigate('/explore', { state: { search: location } });
  };

  return (
    <div className="container p-4 max-w-md mx-auto">
      {/* Location and Welcome section */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MapPin className="h-4 w-4 text-spatioo-green" />
            <span className="text-sm">{userLocation}</span>
          </div>
          <h1 className="text-2xl font-bold">Olá, {profile?.name || 'Visitante'}!</h1>
          <p className="text-muted-foreground">Encontre as melhores vagas perto de você</p>
        </motion.div>
      </div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <AutocompleteSearch 
          onSearch={handleSearch} 
          onParkingSelect={handleParkingSelect}
          placeholder="Para onde você vai?"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-8"
      >
        <div className="grid grid-cols-4 gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/explore')}
            className="flex flex-col items-center justify-center h-20 space-y-1 rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-colors"
          >
            <Compass className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Explorar</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center justify-center h-20 space-y-1 rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-colors"
          >
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Reservas</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 space-y-1 rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-colors"
            onClick={() => {
              if (nearbyParkingSpots.length > 0) {
                navigate(`/parking/${nearbyParkingSpots[0].id}`);
              } else {
                navigate('/explore');
              }
            }}
          >
            <Navigation className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Próximo</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/profile')} 
            className="flex flex-col items-center justify-center h-20 space-y-1 rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-colors"
          >
            <History className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Perfil</span>
          </Button>
        </div>
      </motion.div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold mb-3">Buscas recentes</h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer px-3 py-1 rounded-full hover:bg-secondary"
                onClick={() => handleSuggestionClick(search)}
              >
                <History className="h-3 w-3 mr-1" />
                {search}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Suggested Nearby Locations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Próximos a você</h2>
          <Button 
            variant="link" 
            className="h-auto p-0 text-spatioo-green"
            onClick={() => navigate('/explore')}
          >
            Ver todos
          </Button>
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spatioo-green"></div>
            </div>
          ) : nearbyParkingSpots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum estacionamento encontrado
            </div>
          ) : (
            nearbyParkingSpots.map((spot) => (
              <Card 
                key={spot.id} 
                className="overflow-hidden cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => navigate(`/parking/${spot.id}`)}
              >
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base mb-1">{spot.nome}</CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {spot.endereco}
                    </div>
                    <div className="flex items-center text-xs mt-1">
                      <Badge variant="secondary" className="rounded-full mr-2 px-2 py-0 h-5">
                        <Navigation className="h-3 w-3 mr-1" />
                        {spot.numero_vagas} vagas
                      </Badge>
                      <Badge variant="outline" className="rounded-full px-2 py-0 h-5 font-medium border-spatioo-green/30 text-spatioo-green bg-spatioo-green/10">
                        R$ {spot.preco}/h
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-spatioo-green/10 h-10 w-10 rounded-full flex items-center justify-center">
                    <Car className="h-5 w-5 text-spatioo-green" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.div>

      {/* Popular Destinations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Destinos populares</h2>
          <Button 
            variant="link" 
            className="h-auto p-0 text-spatioo-green"
            onClick={() => navigate('/explore')}
          >
            Ver todos
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spatioo-green"></div>
            </div>
          ) : popularDestinations.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              Nenhum destino popular encontrado
            </div>
          ) : (
            popularDestinations.map((destination) => (
              <Card 
                key={destination.id} 
                className="overflow-hidden cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => navigate(`/parking/${destination.id}`)}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="bg-muted rounded-lg h-16 w-full flex items-center justify-center overflow-hidden">
                    {destination.fotos && destination.fotos.length > 0 ? (
                      <img 
                        src={`https://ojnayvmppwpbdcsddpaw.supabase.co/storage/v1/object/public/estacionamento-photos/${destination.fotos[0]}`}
                        alt={destination.nome} 
                        className="h-full w-full object-cover rounded-lg" 
                      />
                    ) : (
                      <Car className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-sm">{destination.nome}</CardTitle>
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="rounded-full px-2 py-0 h-5">
                      {destination.numero_vagas} vagas
                    </Badge>
                    <span className="text-muted-foreground">R$ {destination.preco}/h</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
