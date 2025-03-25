
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Car, 
  Check, 
  Clock, 
  CreditCard, 
  Loader2, 
  MapPin, 
  Phone,
  Shield, 
  Star, 
  Umbrella, 
  Wifi 
} from 'lucide-react';

const MOCK_PARKING = {
  id: '1',
  name: 'Downtown Secure Parking',
  address: '123 Main St, Downtown',
  description: 'Centrally located parking garage with 24/7 security and easy access to downtown attractions, shopping centers, and business districts.',
  rating: 4.8,
  reviewCount: 126,
  price: 5.50,
  totalSpots: 45,
  availableSpots: 12,
  openingHours: '6:00 AM - 12:00 AM',
  contactPhone: '(555) 123-4567',
  features: [
    { name: 'Covered Parking', icon: <Umbrella className="h-4 w-4" /> },
    { name: '24/7 Security', icon: <Shield className="h-4 w-4" /> },
    { name: 'WiFi Available', icon: <Wifi className="h-4 w-4" /> },
    { name: 'Easy Access', icon: <Car className="h-4 w-4" /> },
  ],
  images: [
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
  ],
  reviews: [
    { id: '1', author: 'John D.', date: '2 weeks ago', rating: 5, text: 'Great central location, easy to find and very secure.' },
    { id: '2', author: 'Mary S.', date: '1 month ago', rating: 4, text: 'Good value for the area. The entry/exit process was smooth.' },
    { id: '3', author: 'Robert M.', date: '2 months ago', rating: 5, text: 'Clean, well-lit, and felt safe even late at night. Will use again!' },
  ],
};

const ParkingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('12:00');
  const [hours, setHours] = useState(2);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  
  const handleBooking = () => {
    setIsBooking(true);
    // Simulate API call
    setTimeout(() => {
      setIsBooking(false);
      setIsBooked(true);
    }, 1500);
  };
  
  const totalPrice = MOCK_PARKING.price * hours;
  
  return (
    <div className="page-transition">
      <section className="py-8 md:py-12 bg-background">
        <div className="container px-4 md:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{MOCK_PARKING.name}</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Images */}
              <div className="aspect-video rounded-xl overflow-hidden neo-brutalism relative">
                <div className="absolute inset-0 bg-spatioo-gray-light dark:bg-spatioo-gray-dark"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-foreground font-medium">Parking Facility Image</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {MOCK_PARKING.name}
                  </h1>
                  <div className="flex items-center gap-1 text-sm bg-spatioo-green/10 text-spatioo-green px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-spatioo-green text-spatioo-green" />
                    <span className="font-medium">{MOCK_PARKING.rating}</span>
                    <span className="text-muted-foreground">({MOCK_PARKING.reviewCount})</span>
                  </div>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{MOCK_PARKING.address}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground">
                {MOCK_PARKING.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-background">
                  <div className="flex items-center text-foreground mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">Opening Hours</span>
                  </div>
                  <p className="text-muted-foreground">{MOCK_PARKING.openingHours}</p>
                </div>
                
                <div className="p-4 rounded-lg border bg-background">
                  <div className="flex items-center text-foreground mb-2">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="font-medium">Contact</span>
                  </div>
                  <p className="text-muted-foreground">{MOCK_PARKING.contactPhone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Amenities & Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {MOCK_PARKING.features.map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-center p-3 rounded-lg border bg-background"
                    >
                      <div className="mr-3 text-spatioo-green">
                        {feature.icon}
                      </div>
                      <span className="text-sm">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Location</h3>
                <div className="h-[300px] rounded-xl overflow-hidden neo-brutalism relative">
                  <div className="absolute inset-0 bg-spatioo-gray-light dark:bg-spatioo-gray-dark"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-foreground font-medium">Map Location</p>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="reviews">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="info">Additional Info</TabsTrigger>
                </TabsList>
                <TabsContent value="reviews" className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">User Reviews</h3>
                    <Button variant="outline" size="sm">
                      Write a Review
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {MOCK_PARKING.reviews.map(review => (
                      <div key={review.id} className="p-4 rounded-lg border bg-background">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-spatioo-green/20 flex items-center justify-center mr-3">
                              <span className="text-spatioo-green font-bold">
                                {review.author.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{review.author}</div>
                              <div className="text-xs text-muted-foreground">{review.date}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-spatioo-green">
                            {Array(review.rating).fill(0).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-spatioo-green" />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="info" className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium">Additional Information</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-background">
                      <h4 className="font-medium mb-2">Parking Instructions</h4>
                      <p className="text-muted-foreground">
                        Enter from Main Street and take a ticket at the barrier. Once parked, remember your level and space number. For pre-booked spaces, use the reserved section on Level 2.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-background">
                      <h4 className="font-medium mb-2">Cancellation Policy</h4>
                      <p className="text-muted-foreground">
                        Free cancellation up to 2 hours before your booking time. Cancellations made within 2 hours are subject to a 50% fee.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Booking Card */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl glass-card sticky top-4">
                <h3 className="text-xl font-bold mb-4 text-center">Book Your Spot</h3>
                
                {isBooked ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center text-green-600 dark:text-green-400 mb-2">
                        <Check className="h-5 w-5 mr-2" />
                        <span className="font-medium">Booking Confirmed!</span>
                      </div>
                      <p className="text-sm text-green-600/80 dark:text-green-400/80">
                        Your parking spot has been successfully reserved. A confirmation has been sent to your email.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between pb-2 border-b">
                        <span className="text-muted-foreground">Booking ID</span>
                        <span className="font-medium">SPT-{Math.floor(Math.random() * 10000)}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{date ? format(date, "MMM d, yyyy") : ""}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">{startTime} ({hours} hours)</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{MOCK_PARKING.name}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b">
                        <span className="text-muted-foreground">Total Paid</span>
                        <span className="font-medium text-lg text-spatioo-green">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-3">
                      <Button className="w-full bg-spatioo-green hover:bg-spatioo-green-dark text-white" asChild>
                        <Link to="/dashboard">
                          View in Dashboard
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
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
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Time</label>
                        <select 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        >
                          <option value="08:00">8:00 AM</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duration (hours)</label>
                        <select 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={hours}
                          onChange={(e) => setHours(parseInt(e.target.value))}
                        >
                          <option value="1">1 hour</option>
                          <option value="2">2 hours</option>
                          <option value="3">3 hours</option>
                          <option value="4">4 hours</option>
                          <option value="5">5 hours</option>
                          <option value="6">6 hours</option>
                          <option value="8">8 hours</option>
                          <option value="12">12 hours</option>
                          <option value="24">24 hours</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-secondary">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Price per hour</span>
                        <span className="font-medium">${MOCK_PARKING.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{hours} hours</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-medium">Total</span>
                        <span className="font-bold text-lg text-spatioo-green">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vehicle Type</label>
                      <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>Standard Car</option>
                        <option>SUV/Large Vehicle</option>
                        <option>Motorcycle</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">License Plate (optional)</label>
                      <Input placeholder="Enter license plate" />
                    </div>
                    
                    <Button 
                      className="w-full bg-spatioo-green hover:bg-spatioo-green-dark text-white"
                      onClick={handleBooking}
                      disabled={isBooking}
                    >
                      {isBooking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Book and Pay Now
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      By booking, you agree to our <a href="#" className="text-spatioo-green hover:underline">Terms of Service</a> and <a href="#" className="text-spatioo-green hover:underline">Cancellation Policy</a>.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-4 rounded-lg border bg-background">
                <h4 className="font-medium mb-3">Available Spots</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-spatioo-green"></div>
                    <span className="text-sm text-muted-foreground">Available</span>
                  </div>
                  <span className="font-medium">{MOCK_PARKING.availableSpots} spots</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ParkingDetails;
