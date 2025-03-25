
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, MapPin, Clock, Navigation, Search, Star, Compass, TrendingUp, History } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for recent searches
const RECENT_SEARCHES = [
  'Shopping Center',
  'Teatro Municipal',
  'Parque Ibirapuera',
  'Aeroporto de Congonhas'
];

// Mock data for suggested locations
const SUGGESTED_LOCATIONS = [
  {
    id: '1',
    name: 'Centro Empresarial',
    address: 'Av. Paulista, 1000',
    distance: '1.2 km',
    price: 'R$ 5,50/h'
  },
  {
    id: '2',
    name: 'Shopping Vila Olímpia',
    address: 'Rua das Olimpíadas, 200',
    distance: '2.8 km',
    price: 'R$ 6,00/h'
  },
  {
    id: '3',
    name: 'Estacionamento Downtown',
    address: 'Rua Conselheiro Lafayette, 180',
    distance: '0.5 km',
    price: 'R$ 4,00/h'
  }
];

// Mock data for popular destinations
const POPULAR_DESTINATIONS = [
  {
    id: '1',
    name: 'Shopping ABC',
    image: 'https://via.placeholder.com/80',
    rating: 4.8,
    spots: 12,
    distance: '2.3 km'
  },
  {
    id: '2',
    name: 'Parque Central',
    image: 'https://via.placeholder.com/80',
    rating: 4.5,
    spots: 8,
    distance: '3.1 km'
  },
  {
    id: '3',
    name: 'Centro Comercial',
    image: 'https://via.placeholder.com/80',
    rating: 4.2,
    spots: 5,
    distance: '1.8 km'
  },
  {
    id: '4',
    name: 'Estádio Municipal',
    image: 'https://via.placeholder.com/80',
    rating: 4.7,
    spots: 20,
    distance: '4.2 km'
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState('Obtendo localização...');

  // Simulate getting user location
  useEffect(() => {
    setTimeout(() => {
      setUserLocation('São Caetano do Sul, SP');
    }, 1500);
  }, []);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/explore', { state: { search: searchQuery } });
    }
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
          <h1 className="text-2xl font-bold">Olá, Maria!</h1>
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
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Para onde você vai?"
            className="pl-10 pr-4 h-12 rounded-full bg-card shadow-sm border-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            type="submit"
            size="sm" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-spatioo-green hover:bg-spatioo-green-dark text-black h-8"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>
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
            className="flex flex-col items-center justify-center h-20 space-y-1 rounded-xl"
          >
            <Compass className="h-6 w-6 text-spatioo-green" />
            <span className="text-xs">Explorar</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center justify-center h-20 space-y-1 rounded-xl"
          >
            <Clock className="h-6 w-6 text-spatioo-green" />
            <span className="text-xs">Reservas</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 space-y-1 rounded-xl"
          >
            <Navigation className="h-6 w-6 text-spatioo-green" />
            <span className="text-xs">Próximo</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 space-y-1 rounded-xl"
          >
            <History className="h-6 w-6 text-spatioo-green" />
            <span className="text-xs">Recentes</span>
          </Button>
        </div>
      </motion.div>

      {/* Recent Searches */}
      {RECENT_SEARCHES.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold mb-3">Buscas recentes</h2>
          <div className="flex flex-wrap gap-2">
            {RECENT_SEARCHES.map((search, index) => (
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
          {SUGGESTED_LOCATIONS.map((location) => (
            <Card 
              key={location.id} 
              className="overflow-hidden cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => navigate(`/parking/${location.id}`)}
            >
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <CardTitle className="text-base mb-1">{location.name}</CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {location.address}
                  </div>
                  <div className="flex items-center text-xs mt-1">
                    <Badge variant="secondary" className="rounded-full mr-2 px-2 py-0 h-5">
                      <Navigation className="h-3 w-3 mr-1" />
                      {location.distance}
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-2 py-0 h-5 font-medium border-spatioo-green/30 text-spatioo-green bg-spatioo-green/10">
                      {location.price}
                    </Badge>
                  </div>
                </div>
                <div className="bg-spatioo-green/10 h-10 w-10 rounded-full flex items-center justify-center">
                  <Car className="h-5 w-5 text-spatioo-green" />
                </div>
              </CardContent>
            </Card>
          ))}
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
          {POPULAR_DESTINATIONS.map((destination) => (
            <Card 
              key={destination.id} 
              className="overflow-hidden cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => navigate(`/explore?destination=${destination.name}`)}
            >
              <CardContent className="p-3 space-y-2">
                <div className="bg-muted rounded-lg h-16 w-full flex items-center justify-center">
                  <Car className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-sm">{destination.name}</CardTitle>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <span>{destination.rating}</span>
                  </div>
                  <Badge variant="outline" className="rounded-full px-2 py-0 h-5">
                    {destination.spots} vagas
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
