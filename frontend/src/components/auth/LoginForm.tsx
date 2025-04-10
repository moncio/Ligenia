import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Github, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const LoginForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({});
  const [touchedFields, setTouchedFields] = useState<{email?: boolean; password?: boolean}>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (loginError && (email || password)) {
      setLoginError(null);
    }
  }, [email, password, loginError]);

  const validateField = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      if (!value) return "El correo electrónico es obligatorio";
      if (!/\S+@\S+\.\S+/.test(value)) return "Formato de correo electrónico inválido";
    }
    if (field === 'password') {
      if (!value) return "La contraseña es obligatoria";
    }
    return undefined;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    let fieldValue = '';
    if (field === 'email') fieldValue = email;
    if (field === 'password') fieldValue = password;
    
    const error = validateField(field, fieldValue);
    
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    let isValid = true;

    const emailError = validateField('email', email);
    if (emailError) {
      errors.email = emailError;
      isValid = false;
    }

    const passwordError = validateField('password', password);
    if (passwordError) {
      errors.password = passwordError;
      isValid = false;
    }

    setFormErrors(errors);
    // Marcar todos los campos como tocados cuando se envía el formulario
    setTouchedFields({ email: true, password: true });
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
        
        let errorMessage = "Credenciales inválidas";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Correo o contraseña incorrectos";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Correo electrónico no confirmado";
        }
        
        setLoginError(errorMessage);
        throw error;
      }
      
      if (!data.session) {
        throw new Error("No se pudo establecer sesión");
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

  const validateResetEmail = () => {
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "El correo electrónico es obligatorio",
        variant: "destructive"
      });
      return false;
    } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      toast({
        title: "Error",
        description: "Formato de correo electrónico inválido",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateResetEmail()) {
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
        description: "Se ha enviado un enlace para restablecer la contraseña",
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

  // Determinar si un campo debe mostrar error
  const shouldShowError = (field: 'email' | 'password') => {
    return touchedFields[field] && formErrors[field];
  };

  return (
    <div className="w-full space-y-5">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-foreground tracking-tight font-display">
          INICIAR SESIÓN
        </h2>
        <p className="text-sm text-muted-foreground">Accede a tu cuenta para gestionar tus torneos</p>
      </div>
      
      {loginError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {loginError}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              disabled={isLoading}
              className={`pl-10 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                shouldShowError('email') ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''
              }`}
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          </div>
          {shouldShowError('email') && <p className="mt-1 text-xs text-destructive">{formErrors.email}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="font-medium">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              disabled={isLoading}
              className={`pl-10 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                shouldShowError('password') ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''
              }`}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <button 
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {shouldShowError('password') && <p className="mt-1 text-xs text-destructive">{formErrors.password}</p>}
        </div>
        
        <Button
          type="button"
          variant="link"
          className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto font-normal"
          onClick={() => setIsResetOpen(true)}
        >
          ¿Olvidaste tu contraseña?
        </Button>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O continúa con
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleGithubSignIn}
          disabled={isLoading}
          className="w-full"
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="w-full space-y-5">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-foreground tracking-tight font-display">
                Restablecer contraseña
              </h2>
              <p className="text-sm text-muted-foreground">
                Ingresa tu correo electrónico para recibir un enlace de restablecimiento
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
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
                    className="pl-10 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isResetSent}
              >
                {isLoading ? "Enviando..." : isResetSent ? "Enlace enviado" : "Enviar enlace"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginForm;
