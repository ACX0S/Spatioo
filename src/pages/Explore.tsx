
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Navigation } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { fetchAllParkingSpots, searchParkingSpots, PublicParkingData } from '@/services/parkingService';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@/styles/map.css';
import AutocompleteSearch from '@/components/AutocompleteSearch';

const Explore = () => {
  const location = useLocation();
  const [parkingSpots, setParkingSpots] = useState<PublicParkingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [sortedParkingSpots, setSortedParkingSpots] = useState<(PublicParkingData & { distance?: number })[]>([]);
  const initialSearch = location.state?.search || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  
  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
        },
        (error) => {
          console.error('Error getting user location:', error);
          toast({
            title: "Localização não disponível",
            description: "Não foi possível acessar sua localização. As distâncias não serão exibidas.",
            variant: "destructive"
          });
          // Don't set a default location if we can't get user's real location
          setUserLocation(null);
        }
      );
    }
  }, []);
  
  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };
  
  // Fetch parking spots
  useEffect(() => {
    const loadParkingSpots = async () => {
      try {
        setLoading(true);
        const data = await fetchAllParkingSpots();
        setParkingSpots(data);
      } catch (error) {
        console.error('Error fetching parking spots:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os estacionamentos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadParkingSpots();
  }, []);
  
  // Sort parking spots by distance when user location or parking spots change
  useEffect(() => {
    if (parkingSpots.length === 0) return;
    
    const spotsWithDistance = parkingSpots.map(spot => {
      if (userLocation && spot.latitude && spot.longitude) {
        // Calculate real distance using coordinates
        const distance = calculateDistance(
          userLocation[1], // latitude
          userLocation[0], // longitude
          spot.latitude,
          spot.longitude
        );
        return { ...spot, distance };
      } else {
        // No distance calculation possible
        return { ...spot, distance: undefined };
      }
    });
    
    // Sort by distance (closest first), spots without distance go to the end
    const sorted = [...spotsWithDistance].sort((a, b) => {
      if (a.distance === undefined && b.distance === undefined) return 0;
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
    
    setSortedParkingSpots(sorted);
  }, [userLocation, parkingSpots]);
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };
  
  // Handle direct navigation to spot details
  const handleParkingSelect = (spot: PublicParkingData) => {
    window.location.href = `/parking/${spot.id}`;
  };
  
  // Filter spots based on search term
  const filteredSpots = sortedParkingSpots.filter(spot => 
    searchTerm ? (
      spot.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.endereco.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true
  );
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Encontre Estacionamentos Próximos</h1>
      
      {/* Search Bar with Autocomplete */}
      <div className="mb-6">
        <AutocompleteSearch 
          onSearch={handleSearch}
          onParkingSelect={handleParkingSelect}
          placeholder="Buscar por nome ou endereço"
        />
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!loading && filteredSpots.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Nenhum estacionamento encontrado.</p>
        </div>
      )}
      
      {/* Parking Spots List */}
      {!loading && (
        <div className="space-y-4">
          {filteredSpots.map((spot) => (
            <Card key={spot.id} className="w-full hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between">
                <div>
                    <h3 className="font-semibold text-lg">{spot.nome}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{spot.endereco}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {spot.distance !== undefined ? (
                        <span className="text-sm">{spot.distance.toFixed(1)} km</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Distância não disponível</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600">R${spot.preco}/h</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {spot.numero_vagas} vagas disponíveis
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  <Link to={`/parking/${spot.id}`}>
                    Reservar Agora
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const url = `https://www.google.com/maps/search/${encodeURIComponent(spot.endereco)}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Rota
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
