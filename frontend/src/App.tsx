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
import { ThemeInitializer } from "./components/ThemeInitializer";

// Create a new query client
const queryClient = new QueryClient();

const App = () => {
  // Apply font size on app load (from localStorage)
  useEffect(() => {
    try {
      const root = window.document.documentElement;
      const savedFontSize = localStorage.getItem('fontSize');
      
      // Apply saved font size
      if (savedFontSize) {
        root.style.fontSize = `${savedFontSize}px`;
      }
      
      // Apply saved theme
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        root.classList.add(savedTheme === 'system' 
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : savedTheme
        );
      } else {
        // Default to light theme
        root.classList.add('light');
      }
    } catch (error) {
      console.error('Error initializing app appearance:', error);
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <SidebarProvider>
              <ThemeInitializer />
              <div className="min-h-screen w-full bg-background">
                <Toaster />
                <Sonner />
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
              </div>
            </SidebarProvider>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
