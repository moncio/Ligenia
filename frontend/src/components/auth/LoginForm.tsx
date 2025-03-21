
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Github, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from '@/hooks/useLanguage';

const LoginForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { translations } = useLanguage();

  // Limpiar mensajes de error al cambiar los inputs
  useEffect(() => {
    if (loginError && (email || password)) {
      setLoginError(null);
    }
  }, [email, password, loginError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor, introduce tu email y contraseña",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      setLoginError(null);
      
      console.log("Intentando iniciar sesión con:", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error("Error de autenticación:", error);
        
        // Mensaje de error más descriptivo basado en el tipo de error
        let errorMessage = "Credenciales inválidas. Verifica tu email y contraseña.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Credenciales inválidas. Verifica tu email y contraseña.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
        }
        
        setLoginError(errorMessage);
        throw error;
      }
      
      if (!data.session) {
        throw new Error("No se pudo obtener la sesión");
      }
      
      console.log("Inicio de sesión exitoso:", data.user?.email);
      
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente"
      });
      
      if (onSuccess) onSuccess();
      
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error("Error detallado:", error);
      
      toast({
        title: "Error al iniciar sesión",
        description: loginError || "Inténtalo de nuevo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión con Google",
        description: error.message || "Inténtalo de nuevo",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión con GitHub",
        description: error.message || "Inténtalo de nuevo",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Por favor, introduce tu email",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/dashboard`,
      });
      
      if (error) throw error;
      
      setIsResetSent(true);
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu contraseña",
      });
      
    } catch (error: any) {
      toast({
        title: "Error al enviar el correo",
        description: error.message || "Inténtalo de nuevo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="w-full space-y-5">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-sport-dark tracking-tight font-display">{translations.login.toUpperCase()}</h2>
        <p className="text-sm text-muted-foreground">Accede a tu cuenta para gestionar tus competiciones</p>
      </div>
      
      {loginError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-red-700">{loginError}</p>
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium">{translations.email}</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="pl-10 bg-gray-50 border-gray-200 focus:border-sport-blue focus:ring-2 focus:ring-sport-blue/20"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="font-medium">{translations.password}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="pl-10 bg-gray-50 border-gray-200 focus:border-sport-blue focus:ring-2 focus:ring-sport-blue/20"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <button 
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <div className="text-sm text-right">
          <button 
            type="button" 
            onClick={() => setIsResetOpen(true)} 
            className="text-sport-blue hover:text-sport-blue/80 font-medium hover:underline transition-colors"
          >
            {translations.forgotPassword}
          </button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold"
          variant="sport"
          disabled={isLoading}
        >
          {isLoading ? "Accediendo..." : translations.signIn.toUpperCase()}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-gray-500 uppercase tracking-widest">o continuar con</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="h-12 bg-white hover:bg-gray-50 border border-gray-200" 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Google
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="h-12 bg-white hover:bg-gray-50 border border-gray-200"
          onClick={handleGithubSignIn}
          disabled={isLoading}
        >
          <Github className="mr-2 h-5 w-5" />
          GitHub
        </Button>
      </div>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-display tracking-tight text-sport-dark">Recuperar contraseña</DialogTitle>
            <DialogDescription className="text-gray-600">
              Introduce tu email y te enviaremos instrucciones para restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>
          
          {isResetSent ? (
            <div className="space-y-4 py-4">
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                <p className="flex items-center text-green-700 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Correo enviado
                </p>
                <p className="text-green-600 mt-1">
                  Se ha enviado un enlace para restablecer tu contraseña.
                </p>
              </div>
              <p className="text-center text-sm text-gray-500">
                Si no lo encuentras, revisa la carpeta de spam.
              </p>
              <Button 
                className="w-full" 
                variant="sport"
                onClick={() => {
                  setIsResetOpen(false);
                  setIsResetSent(false);
                  setResetEmail('');
                }}
              >
                CERRAR
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="font-medium">Email</Label>
                <div className="relative">
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="tu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 bg-gray-50 border-gray-200 focus:border-sport-blue focus:ring-2 focus:ring-sport-blue/20"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsResetOpen(false)}
                  disabled={isLoading}
                  className="border-gray-200"
                >
                  {translations.cancel}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  variant="energy"
                >
                  {isLoading ? "Enviando..." : "ENVIAR ENLACE"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginForm;
