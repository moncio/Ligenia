import { Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("bg-gradient-to-r from-blue-50 to-blue-100 py-4 shadow-xl relative z-20", className)}>
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo and About */}
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sport-blue to-sport-purple mb-2 font-display">
                LIGENIA
              </div>
              <p className="text-gray-600 text-sm max-w-xs mx-auto md:mx-0">
                La plataforma líder en gestión de torneos de pádel.
              </p>
            </div>

            {/* Links - Simplified */}
            <div className="text-center">
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-sport-blue hover:text-sport-purple transition-colors p-2 rounded-full hover:bg-blue-50">
                  <Facebook size={18} />
                </a>
                <a href="#" className="text-sport-blue hover:text-sport-purple transition-colors p-2 rounded-full hover:bg-blue-50">
                  <Instagram size={18} />
                </a>
                <a href="#" className="text-sport-blue hover:text-sport-purple transition-colors p-2 rounded-full hover:bg-blue-50">
                  <Twitter size={18} />
                </a>
                <a href="#" className="text-sport-blue hover:text-sport-purple transition-colors p-2 rounded-full hover:bg-blue-50">
                  <Youtube size={18} />
                </a>
              </div>
            </div>

            {/* Contact - Simplified */}
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end">
                <Mail size={16} className="text-sport-blue mr-2" />
                <a href="mailto:info@ligenia.com" className="text-gray-600 text-sm hover:text-sport-blue transition-colors">
                  info@ligenia.com
                </a>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} LIGENIA. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
