
// Importações de componentes de UI e providers.
import { Toaster } from "@/components/ui/toaster"; // Componente para exibir notificações (toasts).
import { Toaster as Sonner } from "@/components/ui/sonner"; // Outro componente de notificações, renomeado para evitar conflito.
import { TooltipProvider } from "@/components/ui/tooltip"; // Provider para habilitar tooltips em toda a aplicação.

// Importações para gerenciamento de estado de dados e roteamento.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Ferramentas para caching e fetching de dados.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Componentes para gerenciar o roteamento da aplicação.

// Importações de providers e páginas da aplicação.
import { ThemeProvider } from "@/components/theme-provider"; // Provider para gerenciamento de temas (dark/light).
import { Suspense, lazy } from "react";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext"; // Provider para gerenciamento de autenticação.
import RequireAuth from "./components/RequireAuth"; // Componente para proteger rotas que exigem autenticação.
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const ParkingDetails = lazy(() => import("./pages/ParkingDetails"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserPanel = lazy(() => import("./pages/UserPanel"));
const ParkingOwnerDashboard = lazy(() => import("./pages/ParkingOwnerDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const EstacionamentoDashboard = lazy(() => import("./pages/EstacionamentoDashboard"));
const ResidentialDashboard = lazy(() => import("./pages/ResidentialDashboard"));
const Ofertar = lazy(() => import("./pages/Ofertar"));

// Cria uma instância do QueryClient para ser usada em toda a aplicação.
const queryClient = new QueryClient();

/**
 * Componente principal da aplicação (App).
 * Configura todos os providers globais e o sistema de rotas.
 */
const App = () => {
  return (
    <ErrorBoundary>
      {/* Provider do React Query para gerenciamento de estado de servidor. */}
      <QueryClientProvider client={queryClient}>
        {/* Provider de tema, com tema padrão 'system' e chave de armazenamento local. */}
        <ThemeProvider defaultTheme="system" storageKey="spatioo-theme">
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
                <Suspense fallback={<LoadingSpinner />}>
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
                      <Route path="estacionamento-dashboard/:id" element={<EstacionamentoDashboard />} />
                      <Route path="residential-dashboard/:id" element={<ResidentialDashboard />} />
                      <Route path="ofertar" element={<Ofertar />} />
                      
                      {/* Rota para páginas não encontradas (404). */}
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// Exporta o componente App como padrão.
export default App;
