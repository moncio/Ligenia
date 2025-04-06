import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import { Badge } from './ui/badge';

const LandingHero = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Handle form transitions more gracefully
  const handleLoginClick = () => {
    if (isRegisterOpen) {
      setIsRegisterOpen(false);
      setTimeout(() => setIsLoginOpen(true), 100);
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleRegisterClick = () => {
    if (isLoginOpen) {
      setIsLoginOpen(false);
      setTimeout(() => setIsRegisterOpen(true), 100);
    } else {
      setIsRegisterOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginOpen(false);
  };

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false);
  };

  return (
    <section className="h-screen w-full flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: "url('/padel-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Dark overlay for better text readability in both light and dark modes */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/20 dark:from-black/60 dark:via-black/50 dark:to-black/40" />
      </div>

      {/* Content - horizontally and vertically centered */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex-shrink-0">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="sport" className="px-3 py-1 text-sm mb-4 inline-block">
            Plataforma de Gestión de Torneos
          </Badge>
          
          <h1 
            className="text-3xl sm:text-4xl md:text-6xl font-bold text-white dark:text-white leading-tight mb-4 font-display"
          >
            <span className="block tracking-wider">LIGENIA,</span>
            <span className="block">tu lugar del deporte</span>
          </h1>
          
          <p 
            className="text-base sm:text-lg md:text-xl text-white/90 dark:text-white/90 mb-6 md:mb-8 mx-auto max-w-2xl"
          >
            Organiza, participa y disfruta de torneos de pádel con la plataforma más completa del mercado
          </p>
          
          <div 
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center"
          >
            <Button 
              variant="sport"
              size="xl"
              className="rounded-full shadow-sport flex items-center justify-center text-base sm:text-lg font-semibold px-6 py-3 sm:py-4"
              onClick={handleRegisterClick}
              data-register-trigger
            >
              Registrarse
              <ChevronRight size={20} className="ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 dark:hover:bg-white/20 transition-colors duration-300 text-base sm:text-lg px-6 py-3 sm:py-4"
              onClick={handleLoginClick}
              data-login-trigger
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Separate Dialogs for Login and Register to improve transitions */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <LoginForm onSuccess={handleLoginSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <RegisterForm onSuccess={handleRegisterSuccess} />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default LandingHero;
