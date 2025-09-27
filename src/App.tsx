
// Importações de componentes de UI e providers.
import { Toaster } from "@/components/ui/toaster"; // Componente para exibir notificações (toasts).
import { Toaster as Sonner } from "@/components/ui/sonner"; // Outro componente de notificações, renomeado para evitar conflito.
import { TooltipProvider } from "@/components/ui/tooltip"; // Provider para habilitar tooltips em toda a aplicação.

// Importações para gerenciamento de estado de dados e roteamento.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Ferramentas para caching e fetching de dados.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Componentes para gerenciar o roteamento da aplicação.

// Importações de providers e páginas da aplicação.
import { ThemeProvider } from "@/components/theme-provider"; // Provider para gerenciamento de temas (dark/light).
import Home from "./pages/Home";
import Login from "./pages/Login";
import Explore from "./pages/Explore";
import ParkingDetails from "./pages/ParkingDetails";
import Dashboard from "./pages/Dashboard";
import UserPanel from "./pages/UserPanel";
import ParkingOwnerDashboard from "./pages/ParkingOwnerDashboard";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext"; // Provider para gerenciamento de autenticação.
import Profile from "./pages/Profile";
import GerenciarEstacionamento from "./pages/GerenciarEstacionamento";
import EstacionamentoDashboard from "./pages/EstacionamentoDashboard";
import Ofertar from "./pages/Ofertar";
import RequireAuth from "./components/RequireAuth"; // Componente para proteger rotas que exigem autenticação.

// Cria uma instância do QueryClient para ser usada em toda a aplicação.
const queryClient = new QueryClient();

/**
 * Componente principal da aplicação (App).
 * Configura todos os providers globais e o sistema de rotas.
 */
const App = () => {
  return (
    // Provider do React Query para gerenciamento de estado de servidor.
    <QueryClientProvider client={queryClient}>
      {/* Provider de tema, com tema padrão 'dark' e chave de armazenamento local. */}
      <ThemeProvider defaultTheme="dark" storageKey="spatioo-theme">
        {/* Provider para habilitar tooltips. */}
        <TooltipProvider>
          {/* Componentes para exibir notificações. */}
          <Toaster />
          <Sonner />
          {/* Provider de roteamento que gerencia o histórico de navegação. */}
          <BrowserRouter>
            {/* Provider de autenticação que disponibiliza o contexto de usuário. */}
            <AuthProvider>
              {/* Componente que define as rotas da aplicação. */}
              <Routes>
                {/* Redireciona a rota raiz ('/') para a página de login. */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                {/* Rota para a página de login. */}
                <Route path="/login" element={<Login />} />
                
                {/* Grupo de rotas protegidas que exigem autenticação e usam o Layout padrão. */}
                <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
                  <Route path="home" element={<Home />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="parking/:id" element={<ParkingDetails />} />
                  <Route path="dashboard" element={<UserPanel />} />
                  <Route path="dashboard/reservas" element={<Dashboard />} />
                  <Route path="admin" element={<ParkingOwnerDashboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="gerenciar-estacionamento" element={<GerenciarEstacionamento />} />
                  <Route path="estacionamento-dashboard/:id" element={<EstacionamentoDashboard />} />
                  <Route path="ofertar" element={<Ofertar />} />
                  
                  {/* Rota para páginas não encontradas (404). */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Exporta o componente App como padrão.
export default App;
