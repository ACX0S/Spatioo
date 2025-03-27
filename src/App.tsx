
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Explore from "./pages/Explore";
import ParkingDetails from "./pages/ParkingDetails";
import Dashboard from "./pages/Dashboard";
import ParkingOwnerDashboard from "./pages/ParkingOwnerDashboard";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import Profile from "./pages/Profile";
import RequireAuth from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="spatioo-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Redirect root to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
                  <Route path="home" element={<Home />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="parking/:id" element={<ParkingDetails />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="admin" element={<ParkingOwnerDashboard />} />
                  <Route path="profile" element={<Profile />} />
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

export default App;
