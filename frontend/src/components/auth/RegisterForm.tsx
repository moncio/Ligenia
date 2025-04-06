import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Github, Eye, EyeOff, User, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';

const RegisterForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{fullName?: string; email?: string; password?: string; confirmPassword?: string}>({});
  const [touchedFields, setTouchedFields] = useState<{fullName?: boolean; email?: boolean; password?: boolean; confirmPassword?: boolean}>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateField = (field: 'fullName' | 'email' | 'password' | 'confirmPassword', value: string) => {
    if (field === 'fullName') {
      if (!value) return "El nombre es obligatorio";
    }
    if (field === 'email') {
      if (!value) return "El correo electrónico es obligatorio";
      if (!/\S+@\S+\.\S+/.test(value)) return "Por favor, incluye un símbolo '@' en la dirección de correo electrónico";
    }
    if (field === 'password') {
      if (!value) return "La contraseña es obligatoria";
      if (value.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    }
    if (field === 'confirmPassword') {
      if (!value) return "La confirmación de contraseña es obligatoria";
      if (value !== password) return "Las contraseñas no coinciden";
    }
    return undefined;
  };

  const handleBlur = (field: 'fullName' | 'email' | 'password' | 'confirmPassword') => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    let fieldValue = '';
    if (field === 'fullName') fieldValue = fullName;
    if (field === 'email') fieldValue = email;
    if (field === 'password') fieldValue = password;
    if (field === 'confirmPassword') fieldValue = confirmPassword;
    
    const error = validateField(field, fieldValue);
    
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateForm = () => {
    const errors: {fullName?: string; email?: string; password?: string; confirmPassword?: string} = {};
    let isValid = true;

    const fullNameError = validateField('fullName', fullName);
    if (fullNameError) {
      errors.fullName = fullNameError;
      isValid = false;
    }

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

    const confirmPasswordError = validateField('confirmPassword', confirmPassword);
    if (confirmPasswordError) {
      errors.confirmPassword = confirmPasswordError;
      isValid = false;
    }

    setFormErrors(errors);
    // Marcar todos los campos como tocados cuando se envía el formulario
    setTouchedFields({ fullName: true, email: true, password: true, confirmPassword: true });
    return isValid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "¡Registro exitoso!",
        description: "Hemos enviado un correo de confirmación a tu email. Por favor, verifica tu cuenta para continuar."
      });
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message || "Inténtalo de nuevo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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

  const handleGithubSignUp = async () => {
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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Determinar si un campo debe mostrar error
  const shouldShowError = (field: 'fullName' | 'email' | 'password' | 'confirmPassword') => {
    return touchedFields[field] && formErrors[field];
  };

  return (
    <div className="w-full space-y-5">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-foreground tracking-tight font-display">CREAR CUENTA</h2>
        <p className="text-sm text-muted-foreground">Comienza a gestionar tus torneos deportivos</p>
      </div>
      
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="font-medium">Nombre completo</Label>
          <div className="relative">
            <Input
              id="fullName"
              placeholder="Tu nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => handleBlur('fullName')}
              disabled={isLoading}
              className={`pl-10 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                shouldShowError('fullName') ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''
              }`}
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          </div>
          {shouldShowError('fullName') && <p className="mt-1 text-xs text-destructive">{formErrors.fullName}</p>}
        </div>
        
        {/* Email Field */}
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
        
        {/* Password Field */}
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
        
        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-medium">Confirmar contraseña</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              disabled={isLoading}
              className={`pl-10 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                shouldShowError('confirmPassword') ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''
              }`}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </div>
          {shouldShowError('confirmPassword') && <p className="mt-1 text-xs text-destructive">{formErrors.confirmPassword}</p>}
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold mt-2"
          variant="sport"
          disabled={isLoading}
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>
      
      {/* Social Login Options */}
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
          className="w-full" 
          onClick={handleGoogleSignUp}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Google
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={handleGithubSignUp}
          disabled={isLoading}
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
      
      <p className="text-xs text-center text-muted-foreground mt-4">
        Al registrarte, aceptas nuestros <a href="#" className="text-primary hover:text-primary/90 hover:underline">términos y condiciones</a> y nuestra <a href="#" className="text-primary hover:text-primary/90 hover:underline">política de privacidad</a>.
      </p>
    </div>
  );
};

export default RegisterForm;
