
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LandingHero from '@/components/LandingHero';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Index = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  useAuthRedirect();

  useEffect(() => {
    // Verificar errores de autenticación en la URL hash
    const hashParams = window.location.hash;
    if (hashParams && hashParams.includes('error')) {
      const errorMsg = decodeURIComponent(hashParams.split('error_description=')[1]?.split('&')[0] || 'Error de autenticación');
      setAuthError(errorMsg);
      // Limpiar el hash
      window.history.replaceState(null, '', window.location.pathname);
    }
    
    console.log("Componente Index montado correctamente");
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {authError && (
        <div className="container mx-auto py-4 mt-20 z-20 relative">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {authError}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <LandingHero />
      
      <Footer />
    </div>
  );
};

export default Index;
