
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, Clock, CreditCard, MapPin, Search } from 'lucide-react';

const Home = () => {
  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background via-background to-secondary/20 relative overflow-hidden">
        <div className="container px-4 md:px-6 py-16 md:py-24 lg:py-32 flex flex-col items-center text-center relative z-10">
          <span className="inline-block bg-spatioo-green/10 text-spatioo-green px-3 py-1 rounded-full text-sm font-medium mb-6">
            Parking made simple
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 md:mb-8 lg:mb-10 text-foreground">
            Find and book the perfect <br className="hidden md:inline" />
            <span className="text-spatioo-green">parking spot</span> in seconds
          </h1>
          <p className="max-w-[800px] text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 lg:mb-12">
            Spatioo helps you discover nearby parking spaces at discounted rates. 
            Save time, money, and frustration on your next parking experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button asChild size="lg" className="bg-spatioo-green hover:bg-spatioo-green-dark text-white button-hover w-full">
              <Link to="/explore">
                <Search className="mr-2 h-5 w-5" />
                Find Parking
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="button-hover w-full">
              <Link to="/admin">
                For Parking Owners
              </Link>
            </Button>
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-spatioo-green/5 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -right-20 w-80 h-80 bg-spatioo-green/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-spatioo-green/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
              How Spatioo Works
            </h2>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Finding and booking a parking spot has never been easier. Save up to 50% compared to regular parking rates.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center text-center p-6 rounded-xl glass-card card-hover">
              <div className="bg-spatioo-green/10 p-4 rounded-full mb-6">
                <Search className="h-8 w-8 text-spatioo-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Search Locations</h3>
              <p className="text-muted-foreground">
                Enter your destination or browse the interactive map to find available parking spaces nearby.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl glass-card card-hover">
              <div className="bg-spatioo-green/10 p-4 rounded-full mb-6">
                <Clock className="h-8 w-8 text-spatioo-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Book Your Spot</h3>
              <p className="text-muted-foreground">
                Select your preferred parking location, choose the duration, and confirm your booking in seconds.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl glass-card card-hover">
              <div className="bg-spatioo-green/10 p-4 rounded-full mb-6">
                <Car className="h-8 w-8 text-spatioo-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Park with Ease</h3>
              <p className="text-muted-foreground">
                Follow the directions to your reserved spot, and enjoy stress-free parking at a fraction of the cost.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 space-y-6">
              <span className="inline-block bg-spatioo-green/10 text-spatioo-green px-3 py-1 rounded-full text-sm font-medium">
                Why choose Spatioo
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                The smarter way to park your vehicle
              </h2>
              <p className="text-lg text-muted-foreground">
                Spatioo brings innovation to parking, saving you time and money while reducing the stress of finding a spot.
              </p>
              
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="bg-spatioo-green/10 h-8 w-8 flex items-center justify-center rounded-full shrink-0">
                    <MapPin className="h-4 w-4 text-spatioo-green" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Interactive Maps</h3>
                    <p className="text-muted-foreground">See all available parking spots near your destination in real-time.</p>
                  </div>
                </li>
                
                <li className="flex gap-3">
                  <div className="bg-spatioo-green/10 h-8 w-8 flex items-center justify-center rounded-full shrink-0">
                    <CreditCard className="h-4 w-4 text-spatioo-green" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Save Money</h3>
                    <p className="text-muted-foreground">Pay less than standard rates with our exclusive discounted prices.</p>
                  </div>
                </li>
                
                <li className="flex gap-3">
                  <div className="bg-spatioo-green/10 h-8 w-8 flex items-center justify-center rounded-full shrink-0">
                    <Clock className="h-4 w-4 text-spatioo-green" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Flexible Duration</h3>
                    <p className="text-muted-foreground">Book for as little as an hour or as long as several days.</p>
                  </div>
                </li>
              </ul>
              
              <Button asChild className="bg-spatioo-green hover:bg-spatioo-green-dark text-white button-hover mt-4">
                <Link to="/explore">
                  Explore Parking Options
                </Link>
              </Button>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="w-full h-[400px] md:h-[500px] bg-spatioo-gray-light dark:bg-spatioo-gray-dark rounded-xl overflow-hidden neo-brutalism">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 rounded-xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-foreground font-medium">Interactive Map Preview</p>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-48 h-48 md:w-64 md:h-64 bg-spatioo-green/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
              What Our Users Say
            </h2>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Join thousands of satisfied users who have transformed their parking experience with Spatioo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl glass-card card-hover">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-spatioo-green/20 flex items-center justify-center mr-4">
                  <span className="text-spatioo-green font-bold">M</span>
                </div>
                <div>
                  <h4 className="font-bold">Michael Thomas</h4>
                  <p className="text-sm text-muted-foreground">Regular User</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Spatioo has been a game-changer for me. I used to waste so much time looking for parking, but now I just book in advance and save both time and money!"
              </p>
              <div className="flex mt-4">
                <div className="text-spatioo-green">★★★★★</div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl glass-card card-hover">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-spatioo-green/20 flex items-center justify-center mr-4">
                  <span className="text-spatioo-green font-bold">S</span>
                </div>
                <div>
                  <h4 className="font-bold">Sarah Johnson</h4>
                  <p className="text-sm text-muted-foreground">Business Traveler</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "As someone who travels for business frequently, finding reliable parking in different cities was always stressful. Spatioo makes it so easy and affordable."
              </p>
              <div className="flex mt-4">
                <div className="text-spatioo-green">★★★★★</div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl glass-card card-hover">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-spatioo-green/20 flex items-center justify-center mr-4">
                  <span className="text-spatioo-green font-bold">J</span>
                </div>
                <div>
                  <h4 className="font-bold">James Wilson</h4>
                  <p className="text-sm text-muted-foreground">Parking Owner</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "I've been able to maximize my parking lot's potential with Spatioo. The platform is easy to use and has significantly increased my revenue."
              </p>
              <div className="flex mt-4">
                <div className="text-spatioo-green">★★★★★</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 md:py-24 bg-spatioo-green relative overflow-hidden">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-white">
            Ready to transform your parking experience?
          </h2>
          <p className="max-w-[700px] text-lg text-white/80 mb-8">
            Join Spatioo today and say goodbye to parking stress. Find spots, save money, and park with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-white text-spatioo-green hover:bg-white/90 button-hover">
              <Link to="/explore">
                <Search className="mr-2 h-5 w-5" />
                Find Parking Now
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10 button-hover">
              <Link to="/admin">
                Register as Parking Owner
              </Link>
            </Button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
