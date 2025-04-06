import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import LandingHero from '@/components/LandingHero';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isCheckingSession } = useAuthRedirect();
  
  useEffect(() => {
    // Mark component as loaded to prevent flashing
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    // Check for authentication errors in URL hash
    const hashParams = window.location.hash;
    if (hashParams && hashParams.includes('error')) {
      const errorMsg = decodeURIComponent(hashParams.split('error_description=')[1]?.split('&')[0] || '');
      setAuthError(errorMsg || 'Error de autenticación');
      // Clear the hash
      window.history.replaceState(null, '', window.location.pathname);
    }
    
    console.log("Index component mounted successfully");
    
    return () => clearTimeout(timer);
  }, []);

  // Show a loading state during the initial auth check
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Comprobando sesión...</p>
      </div>
    );
  }

  // Use conditional rendering to prevent flash before redirect
  if (!isLoaded) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-900">
      {authError && (
        <div className="container mx-auto py-2 z-20 relative">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {authError}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <LandingHero />
      
      <Footer className="shrink-0" />
    </div>
  );
};

export default Index;
