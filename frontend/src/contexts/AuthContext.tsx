
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    let isMounted = true;

    // Set up auth state listener FIRST to catch any auth events during initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('AuthProvider: Auth state changed:', event);
        
        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('AuthProvider: Token refreshed successfully');
        }
        
        // Handle session expiration
        if (event === 'USER_UPDATED' && !newSession) {
          console.log('AuthProvider: Session expired');
          handleSessionExpired();
          return;
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          console.log('AuthProvider: Fetching profile for user:', newSession.user.id);
          try {
            setTimeout(() => {
              if (isMounted) {
                fetchProfile(newSession.user.id);
              }
            }, 0);
          } catch (error) {
            console.error('AuthProvider: Error fetching profile during auth change:', error);
          }
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Checking for existing session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
          if (isMounted) setIsLoading(false);
          return;
        }
        
        if (!isMounted) return;
        
        console.log('AuthProvider: Session state:', initialSession ? 'Session found' : 'No session');
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          console.log('AuthProvider: Fetching profile for initial user:', initialSession.user.id);
          try {
            fetchProfile(initialSession.user.id);
          } catch (error) {
            console.error('AuthProvider: Error fetching profile during initialization:', error);
          }
        }
        
        // Important: Always set loading to false, even if there's no session
        setIsLoading(false);
      } catch (error) {
        console.error('AuthProvider: Error during initialization:', error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Hubo un problema al inicializar la sesión",
            variant: "destructive"
          });
          setIsLoading(false);
        }
      }
    };

    // Add a session expiration check at a regular interval
    const sessionCheckInterval = setInterval(() => {
      if (session) {
        // Check if the session has expired (access token)
        const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
        const expiresAt = session.expires_at;
        
        if (expiresAt && currentTime >= expiresAt) {
          console.log('AuthProvider: Session expired, logging out user');
          handleSessionExpired();
        }
      }
    }, 60000); // Check every minute

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, [toast, navigate]);

  // Function to handle session expiration
  const handleSessionExpired = () => {
    // Clear local state
    setSession(null);
    setUser(null);
    setProfile(null);
    
    // Navigate to landing page
    navigate('/', { replace: true });
    
    // Show a toast notification
    toast({
      title: "Sesión expirada",
      description: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
      variant: "default"
    });
  };

  const fetchProfile = async (userId: string) => {
    try {
      console.log('AuthProvider: Fetching profile data...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Using maybeSingle instead of single to avoid errors

      if (error) {
        console.error('AuthProvider: Error fetching profile:', error);
        return;
      }

      console.log('AuthProvider: Profile data loaded successfully');
      setProfile(data);
    } catch (error) {
      console.error('AuthProvider: Error fetching profile:', error);
      throw error; // Re-throw so caller can handle if needed
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthProvider: Signing out...');
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear state immediately to avoid flashes of protected content
      setSession(null);
      setUser(null);
      setProfile(null);
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente'
      });
      
      // Navigate to landing page
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('AuthProvider: Error signing out:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sesión',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
