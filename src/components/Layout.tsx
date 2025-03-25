
import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Car, MapPin, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 font-semibold text-xl text-foreground"
            >
              <Car className="h-6 w-6 text-spatioo-green" />
              <span>Spatioo</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/explore" className="text-muted-foreground hover:text-foreground transition-colors">
              Explore
            </Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              Parking Owner
            </Link>
            <ThemeToggle />
            <Button className="bg-spatioo-green hover:bg-spatioo-green-dark text-white">
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          </nav>
          
          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMenuOpen(true)}
              className="rounded-full"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={cn(
            "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden transition-opacity duration-200",
            isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-background shadow-lg p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold text-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                <Car className="h-6 w-6 text-spatioo-green" />
                <span>Spatioo</span>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-6 flex-1">
              <Link 
                to="/" 
                className="text-lg font-medium text-foreground" 
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/explore" 
                className="text-lg font-medium text-foreground" 
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <Link 
                to="/dashboard" 
                className="text-lg font-medium text-foreground" 
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/admin" 
                className="text-lg font-medium text-foreground" 
                onClick={() => setIsMenuOpen(false)}
              >
                Parking Owner
              </Link>
            </nav>
            <div className="mt-auto pt-6">
              <Button className="w-full bg-spatioo-green hover:bg-spatioo-green-dark text-white">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-semibold text-xl">
                <Car className="h-6 w-6 text-spatioo-green" />
                <span>Spatioo</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Find and book parking spaces easily with Spatioo. Save time and money on your next parking.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-4">About</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">For Parking Owners</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">contact@spatioo.com</a></li>
                <li><a href="#" className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <MapPin className="h-4 w-4" /> Find us
                </a></li>
              </ul>
            </div>
          </div>
          <div className="flex justify-between items-center mt-8 pt-8 border-t text-sm text-muted-foreground">
            <p>© 2023 Spatioo. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
