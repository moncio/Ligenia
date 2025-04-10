
import { 
  Home, 
  Trophy, 
  BarChart, 
  MessageSquare, 
  Settings, 
  LogOut
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar";
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  // Function to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Function to handle navigation on mobile
  const handleNavigation = (path: string) => {
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate(path);
  };

  // Handle logout - updated to match UserMenu implementation
  const handleSignOut = async () => {
    try {
      if (isMobile) {
        setOpenMobile(false);
      }
      
      await signOut();
      
      // After successful signOut, redirect to landing page
      navigate('/', { replace: true });
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente'
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sesión',
        variant: 'destructive'
      });
    }
  };
  
  // Main menu items
  const mainMenuItems = [
    {
      title: "Inicio",
      path: "/dashboard",
      icon: Home,
    },
    {
      title: "Competiciones",
      path: "/torneos",
      icon: Trophy,
    },
    {
      title: "Estadísticas",
      path: "/statistics",
      icon: BarChart,
    },
    {
      title: "Asistente IA",
      path: "/assistant",
      icon: MessageSquare,
    },
  ];
  
  // Secondary menu items
  const secondaryMenuItems = [
    {
      title: "Configuración",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center p-2">
          <div className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            LIGENIA
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    onClick={(e) => {
                      if (isMobile) {
                        e.preventDefault();
                        handleNavigation(item.path);
                      }
                    }}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>Cuenta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    onClick={(e) => {
                      if (isMobile) {
                        e.preventDefault();
                        handleNavigation(item.path);
                      }
                    }}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Cerrar sesión"
                  onClick={handleSignOut}
                >
                  <LogOut />
                  <span>Cerrar sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="px-3 py-2">
          <div className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} LIGENIA
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
