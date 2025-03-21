
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

  const handleLoginSuccess = () => {
    setIsLoginOpen(false);
  };

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false);
  };

  return (
    <section className="flex-1 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Imagen de fondo con superposición */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/lovable-uploads/18c5ba59-d312-4c88-a7f9-28837f003ea2.png')"
          }}
        />
        {/* Superposición ligera para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Contenido - Centrado horizontal y verticalmente */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="sport" className="px-3 py-1 text-sm mb-4 inline-block">
            Plataforma de Gestión de Torneos
          </Badge>
          
          <h1 
            className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4 font-display"
          >
            <span className="block tracking-wider">LIGENIA,</span>
            <span className="block">tu lugar del deporte</span>
          </h1>
          
          <p 
            className="text-xl text-white/90 mb-8 mx-auto"
          >
            Organiza, participa y disfruta de torneos de pádel con la plataforma más completa del mercado
          </p>
          
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              variant="sport"
              size="xl"
              className="rounded-full shadow-sport flex items-center justify-center"
              onClick={() => setIsRegisterOpen(true)}
              data-register-trigger
            >
              Registrarse
              <ChevronRight size={20} className="ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="rounded-full bg-white/20 backdrop-blur-md text-white font-medium border border-white/30 hover:bg-white/30 transition-colors duration-300"
              onClick={() => setIsLoginOpen(true)}
              data-login-trigger
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Diálogo de inicio de sesión */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <LoginForm onSuccess={handleLoginSuccess} />
        </DialogContent>
      </Dialog>

      {/* Diálogo de registro */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <RegisterForm onSuccess={handleRegisterSuccess} />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default LandingHero;
