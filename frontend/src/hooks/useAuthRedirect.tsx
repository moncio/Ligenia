
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkUser = async () => {
      try {
        // Only execute this check if we're on the index page to prevent redirection loops
        if (location.pathname !== '/') {
          setIsCheckingSession(false);
          return;
        }
        
        console.log('useAuthRedirect: Checking user session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useAuthRedirect: Error checking session:', error);
          if (isMounted) setIsCheckingSession(false);
          return;
        }
        
        if (!isMounted) return;
        
        // Only redirect if we have a valid session AND we're on the index page
        if (session?.user?.id && location.pathname === '/') {
          console.log('useAuthRedirect: Valid session found, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        }
        
        // Important: Always set checking to false, even if there's no session
        setIsCheckingSession(false);
        console.log('useAuthRedirect: Session check complete, isAuthenticated:', !!session?.user);
      } catch (error) {
        console.error('useAuthRedirect: Error checking session:', error);
        if (isMounted) setIsCheckingSession(false);
      }
    };

    // We only want to set up auth listeners on the index page
    const setupAuthListener = () => {
      // Only set up listener if we're on the index page
      if (location.pathname === '/') {
        console.log('useAuthRedirect: Setting up auth listener on index page');
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('useAuthRedirect: Auth state changed:', event);
            
            // Only redirect on explicit sign in events, not on initial load
            if (event === 'SIGNED_IN' && session?.user?.id) {
              console.log('useAuthRedirect: User signed in, redirecting to dashboard');
              navigate('/dashboard', { replace: true });
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      }
      
      return () => {};
    };

    // Execute checkUser with a small delay to avoid race conditions
    const timeoutId = setTimeout(checkUser, 300);
    const unsubscribe = setupAuthListener();
    
    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [navigate, location.pathname]);

  return { isCheckingSession };
};
