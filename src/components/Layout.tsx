
import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Car, 
  Map, 
  User, 
  Calendar, 
  Settings, 
  Menu, 
  X, 
  ChevronLeft, 
  Search, 
  Bell,
  HelpCircle,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [pageTitle, setPageTitle] = useState("Spatioo");

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case "/home":
        return "Spatioo";
      case "/explore":
        return "Explorar";
      case "/dashboard":
        return "Meus agendamentos";
      case "/admin":
        return "Gerenciar vagas";
      default:
        if (pathname.includes("/parking/")) {
          return "Detalhes do Estacionamento";
        }
        return "Spatioo";
    }
  };

  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === "/home" && location.pathname === "/home") {
      return true;
    }
    if (path === "/explore" && location.pathname === "/explore") {
      return true;
    }
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    if (path === "/login" && location.pathname === "/login") {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header 
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-200",
          isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background"
        )}
      >
        <div className="container px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {location.pathname !== "/home" && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full" 
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            
            <ThemeToggle />
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-background border-border">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-8">
                    <Car className="h-8 w-8 text-spatioo-green" />
                    <span className="font-semibold text-xl">Spatioo</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Link 
                      to="/home" 
                      className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-accent transition-colors"
                    >
                      <Map className="h-5 w-5 text-spatioo-green" />
                      <span>Home</span>
                    </Link>
                    <Link 
                      to="/explore" 
                      className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-accent transition-colors"
                    >
                      <Compass className="h-5 w-5 text-spatioo-green" />
                      <span>Explorar</span>
                    </Link>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-accent transition-colors"
                    >
                      <Calendar className="h-5 w-5 text-spatioo-green" />
                      <span>Meus agendamentos</span>
                    </Link>
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-accent transition-colors"
                    >
                      <Car className="h-5 w-5 text-spatioo-green" />
                      <span>Gerenciar vagas</span>
                    </Link>
                    <hr className="my-2 border-border" />
                    <Link 
                      to="/settings" 
                      className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-accent transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Configurações</span>
                    </Link>
                    <Link 
                      to="/login" 
                      className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-accent transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span>Minha conta</span>
                    </Link>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="bg-card rounded-lg p-4 border border-border">
                      <h3 className="font-medium mb-2">Precisa de ajuda?</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Nossa equipe está pronta para te ajudar com qualquer dúvida.
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 rounded-md"
                      >
                        <HelpCircle className="h-4 w-4" />
                        Central de ajuda
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Bottom Navigation Bar */}
      <nav className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-md border-t border-border h-16 w-full">
        <div className="h-full grid grid-cols-4">
          <Link 
            to="/home" 
            className={cn(
              "flex flex-col items-center justify-center",
              isActive("/home") ? "text-spatioo-green" : "text-muted-foreground"
            )}
          >
            <Map className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link 
            to="/explore" 
            className={cn(
              "flex flex-col items-center justify-center",
              isActive("/explore") ? "text-spatioo-green" : "text-muted-foreground"
            )}
          >
            <Compass className="h-5 w-5" />
            <span className="text-xs mt-1">Explorar</span>
          </Link>
          
          <Link 
            to="/dashboard" 
            className={cn(
              "flex flex-col items-center justify-center",
              isActive("/dashboard") ? "text-spatioo-green" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Reservas</span>
          </Link>
          
          <Link 
            to="/login" 
            className={cn(
              "flex flex-col items-center justify-center",
              isActive("/login") ? "text-spatioo-green" : "text-muted-foreground"
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
      
      {/* Floating Help Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg bg-spatioo-green text-black hover:bg-spatioo-green-dark"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Layout;
