
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Car, Clock, Filter, MapPin, Search, CalendarIcon } from 'lucide-react';

// Mock parking data
const MOCK_PARKINGS = [
  {
    id: '1',
    name: 'Downtown Secure Parking',
    address: '123 Main St, Downtown',
    distance: '0.3',
    price: '5.50',
    rating: 4.8,
    totalSpots: 45,
    availableSpots: 12,
  },
  {
    id: '2',
    name: 'Central Park & Go',
    address: '456 Oak Ave, Central District',
    distance: '0.7',
    price: '4.25',
    rating: 4.5,
    totalSpots: 60,
    availableSpots: 8,
  },
  {
    id: '3',
    name: 'Riverside Parking Complex',
    address: '789 River Rd, East Side',
    distance: '1.2',
    price: '3.75',
    rating: 4.2,
    totalSpots: 120,
    availableSpots: 35,
  },
  {
    id: '4',
    name: 'North Station Parking',
    address: '234 Station Blvd, North District',
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
  
  return (
    <div className="page-transition">
      <section className="py-8 md:py-12 bg-gradient-to-b from-background via-background to-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Search & Filters */}
            <div className="md:w-1/3 space-y-6">
              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Find Parking Near You
                </h1>
                <p className="text-muted-foreground">
                  Search for available parking spots by location, date, and price.
                </p>
              </div>
              
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Enter location" 
                    className="pl-8"
                  />
                </div>
                <Button className="bg-spatioo-green hover:bg-spatioo-green-dark text-white">
                  Search
                </Button>
              </div>
              
              <div className="space-y-4 p-4 rounded-lg border bg-background/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Filters</h3>
                  <Button variant="ghost" size="sm" className="h-8 text-spatioo-green">
                    Reset
                  </Button>
                </div>
                
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
                      {/* Add more time options */}
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
            
            {/* Map */}
            <div className="md:w-2/3">
              <div className="h-[600px] rounded-xl overflow-hidden neo-brutalism relative">
                <div className="absolute inset-0 bg-spatioo-gray-light dark:bg-spatioo-gray-dark"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-foreground font-medium">Interactive Map Interface</p>
                  <p className="text-sm text-muted-foreground">(Placeholder for actual map implementation)</p>
                </div>
                
                {/* Map Controls Mockup */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button size="icon" variant="outline" className="w-8 h-8 rounded-full bg-background">
                    <span>+</span>
                  </Button>
                  <Button size="icon" variant="outline" className="w-8 h-8 rounded-full bg-background">
                    <span>-</span>
                  </Button>
                </div>
                
                {/* Map Markers Mockup */}
                <div className="absolute top-1/3 left-1/4 w-8 h-8 flex items-center justify-center">
                  <div className="w-6 h-6 bg-spatioo-green rounded-full flex items-center justify-center text-white text-xs">
                    $5
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 w-8 h-8 flex items-center justify-center">
                  <div className="w-6 h-6 bg-spatioo-green rounded-full flex items-center justify-center text-white text-xs">
                    $4
                  </div>
                </div>
                <div className="absolute bottom-1/3 right-1/3 w-8 h-8 flex items-center justify-center">
                  <div className="w-6 h-6 bg-spatioo-green rounded-full flex items-center justify-center text-white text-xs">
                    $6
                  </div>
                </div>
              </div>
              
              {/* Parking List */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">Available Parking Spots</h3>
                  <select className="text-sm border rounded-md p-1">
                    <option>Sort by: Price (Low to High)</option>
                    <option>Sort by: Distance</option>
                    <option>Sort by: Rating</option>
                  </select>
                </div>
                
                <div className="space-y-4">
                  {MOCK_PARKINGS.map(parking => (
                    <div key={parking.id} className="p-4 rounded-lg border glass-card card-hover">
                      <div className="flex flex-col md:flex-row gap-4 md:items-center">
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground">{parking.name}</h4>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{parking.address}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-muted-foreground">{parking.distance} miles away</span>
                            <span className="text-sm text-muted-foreground">
                              <span className="text-spatioo-green">★</span> {parking.rating}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {parking.availableSpots}/{parking.totalSpots} spots available
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end gap-2">
                          <div className="font-bold text-xl text-spatioo-green">${parking.price}/hr</div>
                          <Button asChild className="bg-spatioo-green hover:bg-spatioo-green-dark text-white">
                            <Link to={`/parking/${parking.id}`}>
                              Book Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Explore;
