import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Bell, 
  Globe, 
  Lock, 
  PaintBucket, 
  Shield, 
  User, 
  Save, 
  Moon, 
  Sun,
  Laptop,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/hooks/useTheme";
import { useFontSize } from "@/hooks/useFontSize";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setUsername(profile?.username || user.email?.split("@")[0] || "");
    }
  }, [user, profile]);

  const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, { message: "La contraseña actual es obligatoria" }),
    newPassword: z.string()
      .min(6, { message: "La nueva contraseña debe tener al menos 6 caracteres" }),
    confirmPassword: z.string().min(1, { message: "La confirmación de contraseña es obligatoria" }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    setIsLoading(true);
    try {
      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email, // Using the email state we already have
        password: values.currentPassword,
      });

      if (signInError) {
        toast({
          title: "Error de verificación",
          description: "La contraseña actual es incorrecta",
          variant: "destructive",
        });
        return;
      }

      // If current password is correct, update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) throw updateError;

      // Success! Clear the form and show success message
      passwordForm.reset();
      setPasswordModalOpen(false);
      
      toast({
        title: "¡Éxito!",
        description: "Contraseña actualizada correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al actualizar la contraseña",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [tournamentReminders, setTournamentReminders] = useState(true);
  const [matchResults, setMatchResults] = useState(true);

  const [profileVisibility, setProfileVisibility] = useState("public");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  const handleCloseDialog = () => {
    passwordForm.reset();
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="w-full p-4 sm:p-6 space-y-6 flex flex-col min-h-[calc(100vh-64px)]">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Cuenta</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <PaintBucket className="h-4 w-4" />
              <span className="hidden sm:inline">Apariencia</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacidad</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Ajustes de Cuenta</CardTitle>
                <CardDescription>
                  Actualiza tu información personal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="flex gap-2">
                    <Input id="password" type="password" value="••••••••" disabled />
                    <Button variant="outline" onClick={() => setPasswordModalOpen(true)}>Cambiar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
                <CardDescription>
                  Configura cómo quieres recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Correo</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe actualizaciones por correo electrónico
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios de Torneos</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertas sobre próximos torneos
                    </p>
                  </div>
                  <Switch 
                    checked={tournamentReminders} 
                    onCheckedChange={setTournamentReminders} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resultados de Partidos</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones sobre resultados de partidos
                    </p>
                  </div>
                  <Switch 
                    checked={matchResults} 
                    onCheckedChange={setMatchResults} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Preferencias de Apariencia</CardTitle>
                <CardDescription>
                  Personaliza la apariencia de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <ToggleGroup type="single" value={theme} onValueChange={(value) => value && setTheme(value as 'light' | 'dark' | 'system')} className="justify-start">
                    <ToggleGroupItem value="light" aria-label="Claro">
                      <Sun className="h-4 w-4 mr-2" />
                      Claro
                    </ToggleGroupItem>
                    <ToggleGroupItem value="dark" aria-label="Oscuro">
                      <Moon className="h-4 w-4 mr-2" />
                      Oscuro
                    </ToggleGroupItem>
                    <ToggleGroupItem value="system" aria-label="Sistema">
                      <Laptop className="h-4 w-4 mr-2" />
                      Sistema
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Tamaño de Fuente</Label>
                    <span className="text-sm">{fontSize}px</span>
                  </div>
                  <Slider 
                    min={12} 
                    max={24} 
                    step={1} 
                    value={[fontSize]} 
                    onValueChange={(value) => setFontSize(value[0])} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Privacidad y Seguridad</CardTitle>
                <CardDescription>
                  Gestiona tu privacidad y configuración de seguridad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">Visibilidad del Perfil</Label>
                  <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                    <SelectTrigger id="profile-visibility">
                      <SelectValue placeholder="Seleccionar visibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="friends">Amigos</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">
                      Añade una capa adicional de seguridad
                    </p>
                  </div>
                  <Switch 
                    checked={twoFactorAuth} 
                    onCheckedChange={setTwoFactorAuth} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compartir Datos</Label>
                    <p className="text-sm text-muted-foreground">
                      Compartir estadísticas de juego con otros usuarios
                    </p>
                  </div>
                  <Switch 
                    checked={dataSharing} 
                    onCheckedChange={setDataSharing} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="w-full flex justify-center mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700" variant="sport">
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Dialog open={passwordModalOpen} onOpenChange={(open) => {
        if (!open) handleCloseDialog();
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Introduce tu contraseña actual y la nueva contraseña
            </DialogDescription>
          </DialogHeader>

          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña Actual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showCurrentPassword ? "text" : "password"}
                          {...field} 
                          disabled={isLoading}
                          className={passwordForm.formState.errors.currentPassword ? "border-red-500 pr-10" : "pr-10"} 
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showNewPassword ? "text" : "password"}
                          {...field} 
                          disabled={isLoading}
                          className={passwordForm.formState.errors.newPassword ? "border-red-500 pr-10" : "pr-10"} 
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"}
                          {...field} 
                          disabled={isLoading}
                          className={passwordForm.formState.errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"} 
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseDialog} 
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="sport" disabled={isLoading}>
                  <Lock className="mr-2 h-4 w-4" />
                  {isLoading ? "Actualizando..." : "Confirmar Cambio"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
