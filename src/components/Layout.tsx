import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Map, 
  Calendar, 
  ChevronLeft, 
  Compass,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [pageTitle, setPageTitle] = useState("Spatioo");

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case "/home":
        return "Spatioo";
      case "/explore":
        return "Explorar";
      case "/dashboard":
        return "Painel";
      case "/admin":
        return "Gerenciar vagas";
      case "/profile":
        return "Meu Perfil";
      case "/gerenciar-estacionamento":
        return "Gerenciar Estacionamento";
      case "/ofertar":
        return "Ofertar";
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
    if (path === "/ofertar" && location.pathname === "/ofertar") {
      return true;
    }
    return false;
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
            <ThemeToggle />
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => navigate('/profile')}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-spatioo-green/20 text-spatioo-green text-xs">
                  {getInitials(profile?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
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
        <div className="max-w-5xl mx-auto h-full grid grid-cols-4">
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
            to="/ofertar" 
            className={cn(
              "flex flex-col items-center justify-center",
              isActive("/ofertar") ? "text-spatioo-green" : "text-muted-foreground"
            )}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs mt-1">Ofertar</span>
          </Link>
          
          <Link 
            to="/dashboard" 
            className={cn(
              "flex flex-col items-center justify-center",
              isActive("/dashboard") ? "text-spatioo-green" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Painel</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;