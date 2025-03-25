
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Car, 
  Clock, 
  Filter, 
  MapPin, 
  Search, 
  CalendarIcon, 
  Menu, 
  X, 
  ChevronLeft, 
  List, 
  Navigation, 
  Layers 
} from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@/styles/map.css';

// Mock parking data with real coordinates
const MOCK_PARKINGS = [
  {
    id: '1',
    name: 'Downtown Secure Parking',
    address: 'Rua Conselheiro Lafayette, 180, São Caetano do Sul',
    coordinates: [-46.5697, -23.6227] as [number, number], // Long, Lat for São Caetano do Sul
    distance: '0.3',
    price: '5.50',
    rating: 4.8,
    totalSpots: 45,
    availableSpots: 12,
  },
  {
    id: '2',
    name: 'Central Park & Go',
    address: 'Av. Goiás, 1500, São Caetano do Sul',
    coordinates: [-46.5750, -23.6180] as [number, number],
    distance: '0.7',
    price: '4.25',
    rating: 4.5,
    totalSpots: 60,
    availableSpots: 8,
  },
  {
    id: '3',
    name: 'Riverside Parking Complex',
    address: 'Rua Amazonas, 800, São Caetano do Sul',
    coordinates: [-46.5650, -23.6250] as [number, number],
    distance: '1.2',
    price: '3.75',
    rating: 4.2,
    totalSpots: 120,
    availableSpots: 35,
  },
  {
    id: '4',
    name: 'North Station Parking',
    address: 'Rua Manoel Coelho, 500, São Caetano do Sul',
    coordinates: [-46.5720, -23.6190] as [number, number],
    distance: '1.5',
    price: '4.00',
    rating: 4.4,
    totalSpots: 80,
    availableSpots: 22,
  },
];

const Explore = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [priceRange, setPriceRange] = useState([0, 10]);
  const [distance, setDistance] = useState([0, 5]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedParking, setSelectedParking] = useState<typeof MOCK_PARKINGS[0] | null>(null);
  const [showList, setShowList] = useState(false);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Reference to São Caetano do Sul (Rua Conselheiro Lafayette, 180)
    const centerCoordinates: [number, number] = [-46.5697, -23.6227];
    
    // Initialize the map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // Using OpenStreetMap style (free)
      style: 'https://demotiles.maplibre.org/style.json',
      center: centerCoordinates,
      zoom: 14
    });
    
    // Add navigation controls
    map.current.addControl(
      new maplibregl.NavigationControl(),
      'bottom-right'
    );
    
    // Add geolocate control
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }),
      'bottom-right'
    );
    
    // Add fullscreen control
    map.current.addControl(
      new maplibregl.FullscreenControl(),
      'bottom-right'
    );
    
    // Add all parking markers when map loads
    map.current.on('load', () => {
      addParkingMarkers();
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Function to add parking markers to the map
  const addParkingMarkers = () => {
    if (!map.current) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Add markers for each parking
    MOCK_PARKINGS.forEach(parking => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'parking-marker';
      el.innerHTML = `
        <div class="w-8 h-8 bg-spatioo-green rounded-full flex items-center justify-center text-white text-xs shadow-lg transform transition-transform hover:scale-110">
          $${parking.price}
        </div>
      `;
      
      // Add click event to marker
      el.addEventListener('click', () => {
        setSelectedParking(parking);
        if (map.current) {
          map.current.flyTo({
            center: parking.coordinates,
            zoom: 16
          });
        }
      });
      
      // Add marker to map
      const marker = new maplibregl.Marker(el)
        .setLngLat(parking.coordinates)
        .addTo(map.current);
      
      markers.current.push(marker);
    });
  };
  
  // Fly to a parking location when selected from the list
  const flyToParking = (parking: typeof MOCK_PARKINGS[0]) => {
    if (!map.current) return;
    
    setSelectedParking(parking);
    map.current.flyTo({
      center: parking.coordinates,
      zoom: 16
    });
    
    // On mobile, close the list view
    if (window.innerWidth < 768) {
      setShowList(false);
    }
  };
  
  // Close parking details
  const closeDetails = () => {
    setSelectedParking(null);
  };
  
  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-background/90 backdrop-blur-md p-3 flex items-center justify-between border-b z-10">
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden" 
          onClick={() => setShowFilters(!showFilters)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 px-2 max-w-xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Enter destination or parking name" 
              className="pl-9 pr-9 py-5 w-full rounded-full bg-background border-muted"
            />
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground md:hidden" 
              onClick={() => setShowFilters(!showFilters)}
            />
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowList(!showList)}
        >
          <List className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Map Container */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Filters Sidebar - Shown on desktop or when toggled on mobile */}
        <div className={`${showFilters ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 absolute md:relative z-20 w-full md:w-1/4 lg:w-1/5 h-full bg-background transition-transform duration-300 ease-in-out overflow-y-auto`}>
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">Filters</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setShowFilters(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option>12:00 PM</option>
                    <option>1:00 PM</option>
                    <option>2:00 PM</option>
                    <option>3:00 PM</option>
                    <option>4:00 PM</option>
                    <option>5:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Price Range ($/hr)</label>
                  <span className="text-sm text-muted-foreground">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 10]}
                  max={20}
                  step={0.5}
                  value={priceRange}
                  onValueChange={setPriceRange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Distance (miles)</label>
                  <span className="text-sm text-muted-foreground">
                    {distance[0]} - {distance[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 5]}
                  max={10}
                  step={0.1}
                  value={distance}
                  onValueChange={setDistance}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Features</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="covered" className="mr-2" />
                    <label htmlFor="covered" className="text-sm">Covered</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="security" className="mr-2" />
                    <label htmlFor="security" className="text-sm">24/7 Security</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="ev" className="mr-2" />
                    <label htmlFor="ev" className="text-sm">EV Charging</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="accessible" className="mr-2" />
                    <label htmlFor="accessible" className="text-sm">Accessible</label>
                  </div>
                </div>
              </div>
              
              <Button className="w-full bg-spatioo-green hover:bg-spatioo-green-dark text-white">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Map View */}
        <div className="flex-1 relative">
          {/* Map container */}
          <div ref={mapContainer} className="absolute inset-0 bg-gray-100" />
          
          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button variant="secondary" size="icon" className="rounded-full shadow-md">
              <Layers className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full shadow-md">
              <Navigation className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Parking List Overlay - Mobile only */}
          <div className={`${showList ? 'translate-y-0' : 'translate-y-full'} md:hidden fixed inset-x-0 bottom-0 h-2/3 bg-background rounded-t-xl transition-transform duration-300 ease-in-out z-20 overflow-hidden shadow-lg`}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">Available Parking Spots</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowList(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">{MOCK_PARKINGS.length} spots found</p>
                <select className="text-sm bg-transparent border rounded p-1">
                  <option>Sort by: Price</option>
                  <option>Sort by: Distance</option>
                  <option>Sort by: Rating</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-4rem)] p-4 space-y-4">
              {MOCK_PARKINGS.map((parking) => (
                <div 
                  key={parking.id}
                  className="p-4 rounded-lg border glass-card cursor-pointer transition-colors hover:bg-secondary/40"
                  onClick={() => flyToParking(parking)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-bold">{parking.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{parking.address}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm">{parking.distance} miles</span>
                        <span className="text-sm">
                          <span className="text-spatioo-green">★</span> {parking.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-spatioo-green">${parking.price}/hr</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {parking.availableSpots}/{parking.totalSpots} spots
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Parking Details Panel */}
          {selectedParking && (
            <div className="absolute bottom-4 left-0 right-0 mx-auto w-5/6 max-w-md bg-background rounded-xl shadow-lg p-4 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{selectedParking.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{selectedParking.address}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={closeDetails}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 my-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Price</div>
                  <div className="font-bold text-spatioo-green">${selectedParking.price}/hr</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Rating</div>
                  <div className="font-bold">★ {selectedParking.rating}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Available</div>
                  <div className="font-bold">{selectedParking.availableSpots} spots</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button asChild className="flex-1 bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium">
                  <Link to={`/parking/${selectedParking.id}`}>
                    Book Now
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1">
                  <Navigation className="mr-2 h-4 w-4" />
                  Directions
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Desktop Parking List */}
        <div className="hidden md:block md:w-1/3 lg:w-1/4 h-full border-l bg-background overflow-y-auto">
          <div className="p-4 border-b sticky top-0 z-10 bg-background">
            <h3 className="font-medium text-lg">Available Parking Spots</h3>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-muted-foreground">{MOCK_PARKINGS.length} spots found</p>
              <select className="text-sm bg-transparent border rounded p-1">
                <option>Sort by: Price</option>
                <option>Sort by: Distance</option>
                <option>Sort by: Rating</option>
              </select>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {MOCK_PARKINGS.map((parking) => (
              <div 
                key={parking.id}
                className={`p-4 rounded-lg border ${selectedParking?.id === parking.id ? 'bg-secondary' : ''} glass-card cursor-pointer transition-colors hover:bg-secondary/40`}
                onClick={() => flyToParking(parking)}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-bold">{parking.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{parking.address}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm">{parking.distance} miles</span>
                      <span className="text-sm">
                        <span className="text-spatioo-green">★</span> {parking.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-spatioo-green">${parking.price}/hr</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {parking.availableSpots}/{parking.totalSpots} spots
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button asChild size="sm" className="flex-1 bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium text-xs">
                    <Link to={`/parking/${parking.id}`}>
                      Book Now
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Navigation className="mr-1 h-3 w-3" />
                    Directions
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
