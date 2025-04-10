
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoginOpen(false);
  };

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: "url('/lovable-uploads/fd0eef1c-5d51-4255-afcf-04fcf4445208.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-700/70" />
      </div>

      {/* Center Sports Image - Now smaller */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1626568940906-7ad05bd846b3?q=80&w=2574&auto=format&fit=crop" 
          alt="Padel Sport" 
          className="w-full h-auto"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-3xl mx-auto md:mx-0">
          <div className={`opacity-0 ${isLoaded ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '0.2s' }}>
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
              Plataforma de Gestión de Torneos
            </span>
          </div>
          
          <h1 
            className={`text-4xl md:text-6xl font-bold text-white leading-tight mb-6 opacity-0 ${isLoaded ? 'animate-fade-in-up' : ''}`}
            style={{ animationDelay: '0.4s' }}
          >
            <span className="block">LIGENIA,</span>
            <span className="block">tu lugar del deporte</span>
          </h1>
          
          <p 
            className={`text-xl text-white/90 mb-10 max-w-2xl opacity-0 ${isLoaded ? 'animate-fade-in-up' : ''}`}
            style={{ animationDelay: '0.6s' }}
          >
            Organiza, participa y disfruta de torneos de pádel con la plataforma más completa del mercado.
          </p>
          
          <div 
            className={`flex flex-col sm:flex-row gap-4 opacity-0 ${isLoaded ? 'animate-fade-in-up' : ''}`}
            style={{ animationDelay: '0.8s' }}
          >
            <Button 
              className="btn-hover-effect py-6 px-8 bg-white text-blue-700 font-medium rounded-full flex items-center justify-center hover:bg-white/90"
              onClick={() => setIsRegisterOpen(true)}
            >
              Registrarse
              <ChevronRight size={20} className="ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="btn-hover-effect py-6 px-8 bg-white/10 backdrop-blur-md text-white font-medium rounded-full border border-white/30 hover:bg-white/20 transition-colors duration-300"
              onClick={() => setIsLoginOpen(true)}
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#ffffff" fillOpacity="1" d="M0,224L80,224C160,224,320,224,480,213.3C640,203,800,181,960,181.3C1120,181,1280,203,1360,213.3L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <LoginForm onSuccess={handleLoginSuccess} />
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <RegisterForm onSuccess={handleRegisterSuccess} />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hero;
