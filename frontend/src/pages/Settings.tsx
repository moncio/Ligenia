
import React, { useState } from "react";
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
  Laptop
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { translations } = useLanguage();

  const [username, setUsername] = useState("usuario123");
  const [email, setEmail] = useState("usuario@ligenia.com");
  
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, { message: translations.currentPassword + " " + translations.required }),
    newPassword: z.string().min(8, { message: translations.newPassword + " " + translations.required }),
    confirmPassword: z.string().min(1, { message: translations.confirmPassword + " " + translations.required }),
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

  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    console.log("Changing password:", values);
    // Here you would typically call an API to change the password
    
    passwordForm.reset();
    setPasswordModalOpen(false);
    
    alert("Contraseña actualizada con éxito");
  };

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [tournamentReminders, setTournamentReminders] = useState(true);
  const [matchResults, setMatchResults] = useState(true);

  const [profileVisibility, setProfileVisibility] = useState("public");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  return (
    <DashboardLayout>
      <div className="w-full p-4 sm:p-6 space-y-6 flex flex-col min-h-[calc(100vh-64px)]">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold tracking-tight">{translations.settings}</h1>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{translations.account}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">{translations.notificationPreferences}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <PaintBucket className="h-4 w-4" />
              <span className="hidden sm:inline">{translations.appearancePreferences}</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{translations.privacyAndSecurity}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{translations.accountSettings}</CardTitle>
                <CardDescription>
                  {translations.updatePersonalInfo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{translations.username}</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{translations.email}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{translations.password}</Label>
                  <div className="flex gap-2">
                    <Input id="password" type="password" value="••••••••" disabled />
                    <Button variant="outline" onClick={() => setPasswordModalOpen(true)}>{translations.change}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{translations.notificationPreferences}</CardTitle>
                <CardDescription>
                  {translations.configureNotifications}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{translations.emailNotifications}</Label>
                    <p className="text-sm text-muted-foreground">
                      {translations.emailUpdates}
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{translations.tournamentReminders}</Label>
                    <p className="text-sm text-muted-foreground">
                      {translations.tournamentAlerts}
                    </p>
                  </div>
                  <Switch 
                    checked={tournamentReminders} 
                    onCheckedChange={setTournamentReminders} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{translations.matchResults}</Label>
                    <p className="text-sm text-muted-foreground">
                      {translations.matchResultNotifications}
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
                <CardTitle>{translations.appearancePreferences}</CardTitle>
                <CardDescription>
                  {translations.customizeAppearance}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{translations.theme}</Label>
                  <ToggleGroup type="single" value={theme} onValueChange={(value) => value && setTheme(value as 'light' | 'dark' | 'system')} className="justify-start">
                    <ToggleGroupItem value="light" aria-label={translations.light}>
                      <Sun className="h-4 w-4 mr-2" />
                      {translations.light}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="dark" aria-label={translations.dark}>
                      <Moon className="h-4 w-4 mr-2" />
                      {translations.dark}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="system" aria-label={translations.system}>
                      <Laptop className="h-4 w-4 mr-2" />
                      {translations.system}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{translations.fontSize}</Label>
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
                <div className="space-y-2">
                  <Label>{translations.language}</Label>
                  <div className="pt-2">
                    <LanguageSwitcher variant="dashboard" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{translations.privacyAndSecurity}</CardTitle>
                <CardDescription>
                  {translations.managePrivacy}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">{translations.profileVisibility}</Label>
                  <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                    <SelectTrigger id="profile-visibility">
                      <SelectValue placeholder="Seleccionar visibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{translations.public}</SelectItem>
                      <SelectItem value="friends">{translations.friends}</SelectItem>
                      <SelectItem value="private">{translations.private}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{translations.twoFactorAuth}</Label>
                    <p className="text-sm text-muted-foreground">
                      {translations.addSecurity}
                    </p>
                  </div>
                  <Switch 
                    checked={twoFactorAuth} 
                    onCheckedChange={setTwoFactorAuth} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{translations.dataSharing}</Label>
                    <p className="text-sm text-muted-foreground">
                      {translations.shareGameData}
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
            {translations.saveChanges}
          </Button>
        </div>
      </div>

      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{translations.change} {translations.password}</DialogTitle>
            <DialogDescription>
              {translations.currentPassword} y {translations.newPassword}
            </DialogDescription>
          </DialogHeader>

          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations.currentPassword}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
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
                    <FormLabel>{translations.newPassword}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
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
                    <FormLabel>{translations.confirmPassword}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setPasswordModalOpen(false)}>
                  {translations.cancel}
                </Button>
                <Button type="submit" variant="sport">
                  <Lock className="mr-2 h-4 w-4" />
                  {translations.confirmChange}
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
