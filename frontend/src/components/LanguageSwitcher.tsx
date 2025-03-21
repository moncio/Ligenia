
import { Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/hooks/useLanguage';

interface LanguageSwitcherProps {
  variant?: 'header' | 'dashboard' | 'mobile';
}

const LanguageSwitcher = ({ variant = 'header' }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  // Get language display name
  const getLanguageName = (lang: string) => {
    switch (lang) {
      case 'es':
        return 'Español';
      case 'en':
        return 'English';
      default:
        return lang;
    }
  };

  // For mobile menu, we render buttons instead of dropdown
  if (variant === 'mobile') {
    return (
      <div className="flex flex-col space-y-4 w-full items-center">
        <button
          className={`w-64 py-3 px-6 rounded-full ${language === 'es' ? 'bg-white/40' : 'bg-white/20'} text-white font-medium hover:bg-white/30 transition-colors duration-200`}
          onClick={() => setLanguage('es')}
        >
          Español
        </button>
        <button
          className={`w-64 py-3 px-6 rounded-full ${language === 'en' ? 'bg-white/40' : 'bg-white/20'} text-white font-medium hover:bg-white/30 transition-colors duration-200`}
          onClick={() => setLanguage('en')}
        >
          English
        </button>
      </div>
    );
  }

  // For header and dashboard, we use a dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant === 'dashboard' ? "outline" : "ghost"} 
          size={variant === 'dashboard' ? "default" : "icon"} 
          className={variant === 'dashboard' ? "text-foreground flex items-center gap-2" : "text-white hover:bg-white/10 mr-2"}
        >
          <Globe size={variant === 'dashboard' ? 16 : 20} />
          {variant === 'dashboard' && <span>{getLanguageName(language)}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        <DropdownMenuItem 
          onClick={() => setLanguage('es')}
          className={language === 'es' ? 'bg-accent' : ''}
        >
          Español
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-accent' : ''}
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
