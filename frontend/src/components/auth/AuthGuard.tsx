
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let authTimeout: NodeJS.Timeout | null = null;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthGuard: Auth state changed:', event);
        
        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          console.log('AuthGuard: User signed out');
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/', { replace: true });
          
          if (event === 'USER_DELETED') {
            toast({
              title: "Cuenta eliminada",
              description: "Tu cuenta ha sido eliminada correctamente",
            });
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('AuthGuard: User signed in or token refreshed');
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      }
    );
    
    // Then check for existing session
    const checkUser = async () => {
      try {
        console.log('AuthGuard: Checking user session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthGuard: Error checking session:', error);
          if (isMounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
            navigate('/', { replace: true });
            
            toast({
              title: "Error de autenticación",
              description: "Hubo un problema al verificar tu sesión",
              variant: "destructive"
            });
          }
          return;
        }
        
        if (!isMounted) return;
        
        if (!session || !session.user) {
          console.log('AuthGuard: No valid session found, redirecting to login');
          setIsAuthenticated(false);
          navigate('/', { replace: true });
          setIsLoading(false);
          return;
        }
        
        // Check if token is close to expiring (within 5 minutes)
        const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
        const expiresAt = session.expires_at;
        const timeToExpire = expiresAt ? expiresAt - currentTime : 0;
        
        if (expiresAt && timeToExpire < 300) { // less than 5 minutes
          console.log('AuthGuard: Token close to expiration, attempting refresh');
          try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
              throw error;
            }
            
            if (!data.session) {
              console.log('AuthGuard: Unable to refresh token, redirecting to login');
              if (isMounted) {
                setIsAuthenticated(false);
                navigate('/', { replace: true });
                
                toast({
                  title: "Sesión expirada",
                  description: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
                });
              }
              return;
            }
          } catch (refreshError) {
            console.error('AuthGuard: Error refreshing token:', refreshError);
          }
        }
        
        console.log('AuthGuard: Valid session found, user is authenticated');
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('AuthGuard: Error checking session:', error);
        if (isMounted) {
          toast({
            title: "Error de autenticación",
            description: "Hubo un problema al verificar tu sesión",
            variant: "destructive"
          });
          navigate('/', { replace: true });
          setIsLoading(false);
        }
      }
    };

    checkUser();
    
    // Set a maximum timeout to avoid infinite loading state
    authTimeout = setTimeout(() => {
      if (isLoading && isMounted) {
        console.log('AuthGuard: Maximum loading time reached, showing content');
        setIsLoading(false);
      }
    }, 3000);

    // Clean up subscription and timeout on unmount
    return () => {
      isMounted = false;
      if (authTimeout) clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-3 p-8">
        <Skeleton className="h-[250px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  // Only render children when authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;
