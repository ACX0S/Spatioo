import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate, useHref } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { Map, Calendar, ChevronLeft, Compass, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ParkingOwnerDashboard from "@/pages/ParkingOwnerDashboard";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [pageTitle, setPageTitle] = useState("Spatioo");

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith("/estacionamento-dashboard/")) {
      return "Dashboard do Estacionamento";
    }else if (pathname.startsWith("/parking/")) {
      return "Detalhes do Estacionamento";
    }
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
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Define se o texto da navegação deve ser escuro ou claro baseado no tema
  const getNavTextColor = (isActive: boolean) => {
    if (isActive) return "text-black dark:text-white";

    if (theme === "light") {
      return "text-black/60";
    } else if (theme === "dark") {
      return "text-white/50";
    } else {
      // Tema system - usa media query para detectar
      return "text-white/70 dark:text-white/70 light:text-black/80";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Corrigido para evitar deslocamento */}
      <header className="fixed top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="px-4 md:px-10 h-10 md:h-14 flex items-center justify-between">
          {/* Mantém largura fixa no lado esquerdo para evitar deslocamento */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Container com largura mínima para o botão voltar */}
            {(location.pathname == "/explore" || location.pathname.startsWith("/estacionamento-dashboard/")) && (
              <div className="w-0 p-0 transiton-all duration-500">
                <Button
                  variant="ghost"
                  size="icon"
                  className="scale-[1.39] md:scale-[1.5] w-5 p-0 pt-0.5 relative left-[-10px] rounded-s-none bg-transparent text-spatioo-primary dark:text-spatioo-secondary hover:bg-transparent hover:scale-150 transition-transform dark:hover:text-spatioo-green"
                  onClick={() => navigate(-1)}
                >
                  <ChevronLeft/>
                </Button>
              </div>
            )}
            {(location.pathname !== "/home" && (
              <h1 className="text-lg font-semibold truncate ">{pageTitle}</h1>)) 
            ||
            (theme === "light" && (<img src=".\Images\logos verdes\LOGO-COMPLETA-verde.svg"
                alt="Spatioo"
                className="h-6 md:h-10"
              />)) 
            ||
            (theme === "dark" && (<img src=".\Images\logos vclaras\LOGO-COMPLETA-vclaro.svg"
                alt="Spatioo"
                className="h-6 md:h-10"
              />))
            }
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-transparent border-none"
              onClick={() => navigate("/profile")}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-spatioo-green/20 text-spatioo-green text-xs">
                  {getInitials(profile?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`flex-1 pt-10 md:pt-14 ${
          location.pathname !== "/explore" ? "pb-16" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {/* Bottom Navigation Bar - Oculta na rota /explore */}
      {location.pathname !== "/explore" && (
        //tamanho do navigation bar
        <nav className="fixed bottom-0 z-40 backdrop-blur-md border-t-2 border-border h-12 md:h-14 w-full bg-background">
          {/* dimensao do navigation bar */}
          <div className="max-w-5xl mx-auto h-full grid grid-cols-4">
            <Link
              to="/home"
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                getNavTextColor(isActive("/home"))
              )}
            >
              <Map className="h-[18px] w-[18px] md:h-[20px] md:w-[20px]" />
              <span className="text-xs mt-1">Home</span>
            </Link>

            <Link
              to="/explore"
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                getNavTextColor(isActive("/explore"))
              )}
            >
              <Compass className="h-[18px] w-[18px] md:h-[20px] md:w-[20px]" />
              <span className="text-xs mt-1">Explorar</span>
            </Link>

            <Link
              to="/ofertar"
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                getNavTextColor(isActive("/ofertar"))
              )}
            >
              <Plus className="h-[18px] w-[18px] md:h-[20px] md:w-[20px]" />
              <span className="text-xs mt-1">Ofertar</span>
            </Link>

            <Link
              to="/dashboard"
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                getNavTextColor(isActive("/dashboard"))
              )}
            >
              <Calendar className="h-[18px] w-[18px] md:h-[20px] md:w-[20px]" />
              <span className="text-xs mt-1">Painel</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
