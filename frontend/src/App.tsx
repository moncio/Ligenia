
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Competitions from "./pages/Competitions";
import Statistics from "./pages/Statistics";
import UserStatistics from "./pages/UserStatistics";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import AuthGuard from "./components/auth/AuthGuard";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";

// Crear un nuevo cliente de consulta
const queryClient = new QueryClient();

const App = () => {
  // Aplicar tema al cargar la aplicación
  useEffect(() => {
    try {
      const root = window.document.documentElement;
      const savedTheme = localStorage.getItem('theme');
      const savedFontSize = localStorage.getItem('fontSize');
      
      // Limpiar clases de tema anteriores
      root.classList.remove('light', 'dark');
      
      // Aplicar tema guardado o del sistema
      if (savedTheme === 'dark') {
        root.classList.add('dark');
      } else if (savedTheme === 'light') {
        root.classList.add('light');
      } else {
        // Si no hay tema guardado o es 'system', detectar preferencia del sistema
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(systemPreference ? 'dark' : 'light');
      }
      
      // Aplicar tamaño de fuente guardado
      if (savedFontSize) {
        root.style.fontSize = `${savedFontSize}px`;
      }
    } catch (error) {
      console.error('Error al inicializar el tema:', error);
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <SidebarProvider>
            <div className="min-h-screen w-full bg-background">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={
                    <AuthGuard>
                      <Dashboard />
                    </AuthGuard>
                  } />
                  <Route path="/torneos" element={
                    <AuthGuard>
                      <Competitions />
                    </AuthGuard>
                  } />
                  <Route path="/statistics" element={
                    <AuthGuard>
                      <Statistics />
                    </AuthGuard>
                  } />
                  <Route path="/statistics/:userId" element={
                    <AuthGuard>
                      <UserStatistics />
                    </AuthGuard>
                  } />
                  <Route path="/assistant" element={
                    <AuthGuard>
                      <AIAssistant />
                    </AuthGuard>
                  } />
                  <Route path="/settings" element={
                    <AuthGuard>
                      <Settings />
                    </AuthGuard>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
