
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would authenticate the user
    // For now, we just navigate to the home page
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex flex-col items-center"
        >
          <Car className="h-16 w-16 text-spatioo-green mb-4" />
          <h1 className="text-3xl font-bold tracking-tight mb-1">Spatioo</h1>
          <p className="text-muted-foreground mb-8">Estacionamento inteligente</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base bg-card border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base bg-card border-border"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium rounded-full transition-all duration-300"
            >
              <LogIn className="mr-2 h-5 w-5" /> Entrar
            </Button>
            
            <div className="text-center">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Esqueceu sua senha?
              </a>
            </div>
          </form>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-background text-muted-foreground">Ou continue com</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-12 text-sm rounded-full border-border bg-card"
                onClick={() => navigate("/")}
              >
                Google
              </Button>
              <Button
                variant="outline"
                className="h-12 text-sm rounded-full border-border bg-card"
                onClick={() => navigate("/")}
              >
                Apple
              </Button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <a href="#" className="text-spatioo-green hover:underline">
                Cadastre-se
              </a>
            </p>
          </div>
        </motion.div>
      </div>
      
      <footer className="py-6 px-6 border-t border-border">
        <div className="text-center text-xs text-muted-foreground">
          &copy; 2023 Spatioo. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Login;
