import { useState, useRef, useEffect } from 'react';
import { Bell, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from './auth/UserMenu';

export const DashboardHeader = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <header className="bg-background border-b border-border py-4 px-4 md:px-6 flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <a href="/dashboard" className="flex items-center">
          <div className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            LIGENIA
          </div>
        </a>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-3 h-3 bg-red-500 rounded-full text-[8px] text-white">
              2
            </span>
          </Button>
          
          {isNotificationsOpen && (
            <div className={`absolute mt-2 ${isMobile ? 'w-[calc(100vw-32px)] -right-16 max-w-[320px]' : 'right-0 w-80'} bg-popover rounded-md shadow-lg border border-border z-50`}>
              <div className="p-4">
                <h3 className="text-sm font-medium text-foreground">Notificaciones</h3>
                <div className="mt-2 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm break-words text-foreground">Próximos partidos <strong>Liga Madrid Primavera</strong> es mañana a las 18:00.</p>
                      <p className="text-xs text-muted-foreground mt-1">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-accent/10 rounded-full p-2 flex-shrink-0">
                      <Trophy className="h-4 w-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm break-words text-foreground">Has sido invitado a participar en el torneo <strong>Copa Regional Padel</strong>.</p>
                      <p className="text-xs text-muted-foreground mt-1">Hace 1 día</p>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full mt-3 text-sm text-primary">
                  Ver todo
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
};
