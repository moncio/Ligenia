
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import UserMenu from './auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-3 px-6 md:px-12",
        isScrolled ? "bg-sport-dark/80 backdrop-blur-md shadow-lg" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
        {/* Logo */}
        <Link to="/" className="relative z-10">
          <div className="text-3xl font-bold tracking-tight text-white font-display">
            LIGENIA
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Show login/register buttons if user is not logged in */}
          {!user && (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/" onClick={() => document.querySelector<HTMLButtonElement>('[data-login-trigger]')?.click()}>
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/" onClick={() => document.querySelector<HTMLButtonElement>('[data-register-trigger]')?.click()}>
                <Button variant="sport" className="rounded-full shadow-sport">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}

          {/* Show user menu if logged in */}
          {user && <UserMenu />}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative z-10 p-2 text-white"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-gradient-to-br from-sport-dark to-sport-blue z-0 flex flex-col justify-center items-center animate-fade-in">
            <div className="mt-8 flex flex-col space-y-4 w-full items-center">
              {!user ? (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-white text-xl hover:bg-white/10 w-2/3"
                    onClick={() => {
                      setIsMenuOpen(false);
                      document.querySelector<HTMLButtonElement>('[data-login-trigger]')?.click();
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    variant="sport" 
                    className="rounded-full shadow-sport text-xl w-2/3"
                    onClick={() => {
                      setIsMenuOpen(false);
                      document.querySelector<HTMLButtonElement>('[data-register-trigger]')?.click();
                    }}
                  >
                    Registrarse
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="w-2/3">
                    <Button variant="ghost" className="text-white text-xl hover:bg-white/10 w-full" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/settings" className="w-2/3">
                    <Button variant="ghost" className="text-white text-xl hover:bg-white/10 w-full" onClick={() => setIsMenuOpen(false)}>
                      Configuración
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    className="text-xl w-2/3"
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Handle logout
                    }}
                  >
                    Cerrar Sesión
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
