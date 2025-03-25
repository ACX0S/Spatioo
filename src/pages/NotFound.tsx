
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-full bg-spatioo-green/10 p-6 mb-6"
        >
          <MapPin className="h-12 w-12 text-spatioo-green" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl font-bold mb-4"
        >
          Página não encontrada
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground mb-8"
        >
          A página que você está procurando pode ter sido removida ou estar temporariamente indisponível.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4 w-full"
        >
          <Button asChild className="w-full h-12 rounded-full bg-spatioo-green hover:bg-spatioo-green-dark text-black">
            <Link to="/">
              <ArrowLeft className="mr-2 h-5 w-5" /> Voltar ao início
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
