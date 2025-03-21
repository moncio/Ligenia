
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
import { useLanguage } from '@/hooks/useLanguage';

export const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const { translations, language } = useLanguage();
  
  // Función para determinar si un enlace está activo
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Función para manejar la navegación en móvil
  const handleNavigation = (path: string) => {
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate(path);
  };
  
  // Traducciones adicionales para el sidebar
  const sidebarTranslations = {
    es: {
      general: "General",
      home: "Inicio",
      tournaments: "Torneos",
      statistics: "Estadísticas",
      chatbot: "Chatbot IA",
      account: "Cuenta",
      settings: "Configuración",
      logout: "Cerrar Sesión"
    },
    en: {
      general: "General",
      home: "Home",
      tournaments: "Tournaments",
      statistics: "Statistics",
      chatbot: "AI Chatbot",
      account: "Account",
      settings: "Settings",
      logout: "Logout"
    }
  };
  
  const t = sidebarTranslations[language];
  
  // Elementos del menú principal
  const mainMenuItems = [
    {
      title: t.home,
      path: "/dashboard",
      icon: Home,
    },
    {
      title: t.tournaments,
      path: "/torneos",
      icon: Trophy,
    },
    {
      title: t.statistics,
      path: "/statistics",
      icon: BarChart,
    },
    {
      title: t.chatbot,
      path: "/assistant",
      icon: MessageSquare,
    },
  ];
  
  // Elementos del menú secundario
  const secondaryMenuItems = [
    {
      title: t.settings,
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
          <SidebarGroupLabel>{t.general}</SidebarGroupLabel>
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
          <SidebarGroupLabel>{t.account}</SidebarGroupLabel>
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
                  asChild 
                  tooltip={t.logout}
                  onClick={(e) => {
                    if (isMobile) {
                      e.preventDefault();
                      setOpenMobile(false);
                      navigate("/");
                    }
                  }}
                >
                  <Link to="/">
                    <LogOut />
                    <span>{t.logout}</span>
                  </Link>
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
