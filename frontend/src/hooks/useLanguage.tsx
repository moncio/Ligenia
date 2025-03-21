import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definición de tipos para las traducciones
export interface Translations {
  // Auth
  login: string;
  signup: string;
  logout: string;
  email: string;
  password: string;
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
  forgotPassword: string;
  rememberMe: string;
  signIn: string;
  signUp: string;
  required: string;
  
  // Dashboard
  dashboard: string;
  statistics: string;
  competitions: string;
  settings: string;
  aiAssistant: string;
  profile: string;
  
  // Landing
  heroTitle: string;
  heroSubtitle: string;
  getStarted: string;
  learnMore: string;
  platformTagline: string;
  yourSportPlace: string;
  organizePadel: string;
  register: string;
  
  // Settings
  accountSettings: string;
  updatePersonalInfo: string;
  username: string;
  change: string;
  notificationPreferences: string;
  configureNotifications: string;
  emailNotifications: string;
  emailUpdates: string;
  tournamentReminders: string;
  tournamentAlerts: string;
  matchResults: string;
  matchResultNotifications: string;
  appearancePreferences: string;
  customizeAppearance: string;
  theme: string;
  fontSize: string;
  language: string;
  light: string;
  dark: string;
  system: string;
  privacyAndSecurity: string;
  managePrivacy: string;
  profileVisibility: string;
  twoFactorAuth: string;
  addSecurity: string;
  dataSharing: string;
  shareGameData: string;
  saveChanges: string;
  confirmChange: string;
  cancel: string;
  account: string;
  notifications: string;
  privacy: string;
  appearance: string;
  public: string;
  friends: string;
  private: string;
  
  // Errors and Auth messages
  authError: string;
  loginError: string;
  signupError: string;
  logoutError: string;
  
  // AI Assistant
  askQuestion: string;
  sendMessage: string;
  
  // Stats
  recentActivity: string;
  upcomingMatches: string;
  totalMatches: string;
  wins: string;
  losses: string;
  performanceStats: string;
  matchHistory: string;
  winRate: string;
  teams: string;
  viewAll: string;
  today: string;
  weeklyActivity: string;
  monthlyStats: string;
  yourPerformance: string;
  vs: string;
  won: string;
  lost: string;
  draw: string;
  goals: string;
  assists: string;
  userActivity: string;
  seasonProgress: string;
  playerRanking: string;
  searchPlayer: string;
  position: string;
  name: string;
  points: string;
  loading: string;
  noResults: string;
  victory: string;
  defeat: string;
  performance: string;
  matches: string;
  victoriesChart: string;
  defeatsChart: string;
  playerActivity: string;
  date: string;
  tournament: string;
  round: string;
  opponent: string;
  result: string;
  score: string;
}

// Traducciones en español
const spanishTranslations: Translations = {
  // Auth
  login: 'Iniciar Sesión',
  signup: 'Registrarse',
  logout: 'Cerrar Sesión',
  email: 'Correo electrónico',
  password: 'Contraseña',
  confirmPassword: 'Confirmar contraseña',
  currentPassword: 'Contraseña actual',
  newPassword: 'Nueva contraseña',
  forgotPassword: '¿Olvidaste tu contraseña?',
  rememberMe: 'Recordarme',
  signIn: 'Iniciar sesión',
  signUp: 'Crear cuenta',
  required: 'es obligatorio',
  
  // Dashboard
  dashboard: 'Panel Principal',
  statistics: 'Estadísticas',
  competitions: 'Competiciones',
  settings: 'Ajustes',
  aiAssistant: 'Asistente IA',
  profile: 'Perfil',
  
  // Landing
  heroTitle: 'GESTIONA TUS COMPETICIONES CON INTELIGENCIA',
  heroSubtitle: 'Organiza torneos, analiza estadísticas y optimiza tu rendimiento con nuestra plataforma potenciada por IA',
  getStarted: 'COMENZAR AHORA',
  learnMore: 'Conoce más',
  platformTagline: 'Plataforma de Gestión de Torneos',
  yourSportPlace: 'tu lugar del deporte',
  organizePadel: 'Organiza, participa y disfruta de torneos de pádel con la plataforma más completa del mercado',
  register: 'Registrarse',
  
  // Settings
  accountSettings: 'Ajustes de la cuenta',
  updatePersonalInfo: 'Actualiza tu información personal',
  username: 'Nombre de usuario',
  change: 'Cambiar',
  notificationPreferences: 'Preferencias de notificaciones',
  configureNotifications: 'Configura cómo quieres recibir las notificaciones',
  emailNotifications: 'Notificaciones por email',
  emailUpdates: 'Recibe actualizaciones y noticias por correo',
  tournamentReminders: 'Recordatorios de torneos',
  tournamentAlerts: 'Alertas sobre próximos partidos y eventos',
  matchResults: 'Resultados de partidos',
  matchResultNotifications: 'Notificaciones sobre resultados de partidos',
  appearancePreferences: 'Preferencias de apariencia',
  customizeAppearance: 'Personaliza el aspecto de la aplicación',
  theme: 'Tema',
  fontSize: 'Tamaño de fuente',
  language: 'Idioma',
  light: 'Claro',
  dark: 'Oscuro',
  system: 'Sistema',
  privacyAndSecurity: 'Privacidad y seguridad',
  managePrivacy: 'Gestiona tu privacidad y configuración de seguridad',
  profileVisibility: 'Visibilidad del perfil',
  twoFactorAuth: 'Autenticación en dos pasos',
  addSecurity: 'Añade una capa extra de seguridad a tu cuenta',
  dataSharing: 'Compartir datos',
  shareGameData: 'Compartir datos de juego con otros usuarios',
  saveChanges: 'Guardar cambios',
  confirmChange: 'Confirmar cambio',
  cancel: 'Cancelar',
  account: 'Cuenta',
  notifications: 'Notificaciones',
  privacy: 'Privacidad',
  appearance: 'Apariencia',
  public: 'Público',
  friends: 'Amigos',
  private: 'Privado',
  
  // Errors and Auth messages
  authError: 'Error de autenticación',
  loginError: 'Error al iniciar sesión',
  signupError: 'Error al registrarse',
  logoutError: 'Error al cerrar sesión',
  
  // AI Assistant
  askQuestion: '¿En qué puedo ayudarte hoy?',
  sendMessage: 'Enviar mensaje',
  
  // Stats
  recentActivity: 'Actividad reciente',
  upcomingMatches: 'Próximos partidos',
  totalMatches: 'Partidos totales',
  wins: 'Victorias',
  losses: 'Derrotas',
  performanceStats: 'Estadísticas de rendimiento',
  matchHistory: 'Historial de partidos',
  winRate: 'Porcentaje de victorias',
  teams: 'Equipos',
  viewAll: 'Ver todo',
  today: 'Hoy',
  weeklyActivity: 'Actividad semanal',
  monthlyStats: 'Estadísticas mensuales',
  yourPerformance: 'Tu rendimiento',
  vs: 'vs',
  won: 'Ganado',
  lost: 'Perdido',
  draw: 'Empate',
  goals: 'Goles',
  assists: 'Asistencias',
  userActivity: 'Actividad del usuario',
  seasonProgress: 'Progreso de temporada',
  playerRanking: 'Ranking de jugadores',
  searchPlayer: 'Buscar jugador',
  position: 'Posición',
  name: 'Nombre',
  points: 'Puntos',
  loading: 'Cargando...',
  noResults: 'No se encontraron resultados',
  victory: 'Victoria',
  defeat: 'Derrota',
  performance: 'Rendimiento',
  matches: 'Partidos',
  victoriesChart: 'Victorias',
  defeatsChart: 'Derrotas',
  playerActivity: 'Actividad del jugador',
  date: 'Fecha',
  tournament: 'Torneo',
  round: 'Ronda',
  opponent: 'Oponente',
  result: 'Resultado',
  score: 'Puntuación'
};

// Traducciones en inglés
const englishTranslations: Translations = {
  // Auth
  login: 'Login',
  signup: 'Sign Up',
  logout: 'Logout',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm password',
  currentPassword: 'Current password',
  newPassword: 'New password',
  forgotPassword: 'Forgot password?',
  rememberMe: 'Remember me',
  signIn: 'Sign in',
  signUp: 'Sign up',
  required: 'is required',
  
  // Dashboard
  dashboard: 'Dashboard',
  statistics: 'Statistics',
  competitions: 'Competitions',
  settings: 'Settings',
  aiAssistant: 'AI Assistant',
  profile: 'Profile',
  
  // Landing
  heroTitle: 'MANAGE YOUR COMPETITIONS WITH INTELLIGENCE',
  heroSubtitle: 'Organize tournaments, analyze statistics, and optimize your performance with our AI-powered platform',
  getStarted: 'GET STARTED',
  learnMore: 'Learn more',
  platformTagline: 'Tournament Management Platform',
  yourSportPlace: 'your sports place',
  organizePadel: 'Organize, participate, and enjoy padel tournaments with the most complete platform on the market',
  register: 'Register',
  
  // Settings
  accountSettings: 'Account Settings',
  updatePersonalInfo: 'Update your personal information',
  username: 'Username',
  change: 'Change',
  notificationPreferences: 'Notification Preferences',
  configureNotifications: 'Configure how you want to receive notifications',
  emailNotifications: 'Email notifications',
  emailUpdates: 'Receive updates and news via email',
  tournamentReminders: 'Tournament reminders',
  tournamentAlerts: 'Alerts about upcoming matches and events',
  matchResults: 'Match results',
  matchResultNotifications: 'Notifications about match results',
  appearancePreferences: 'Appearance Preferences',
  customizeAppearance: 'Customize the appearance of the application',
  theme: 'Theme',
  fontSize: 'Font size',
  language: 'Language',
  light: 'Light',
  dark: 'Dark',
  system: 'System',
  privacyAndSecurity: 'Privacy and Security',
  managePrivacy: 'Manage your privacy and security settings',
  profileVisibility: 'Profile visibility',
  twoFactorAuth: 'Two-factor authentication',
  addSecurity: 'Add an extra layer of security to your account',
  dataSharing: 'Data sharing',
  shareGameData: 'Share game data with other users',
  saveChanges: 'Save changes',
  confirmChange: 'Confirm change',
  cancel: 'Cancel',
  account: 'Account',
  notifications: 'Notifications',
  privacy: 'Privacy',
  appearance: 'Appearance',
  public: 'Public',
  friends: 'Friends',
  private: 'Private',
  
  // Errors and Auth messages
  authError: 'Authentication error',
  loginError: 'Login error',
  signupError: 'Signup error',
  logoutError: 'Logout error',
  
  // AI Assistant
  askQuestion: 'How can I help you today?',
  sendMessage: 'Send message',
  
  // Stats
  recentActivity: 'Recent Activity',
  upcomingMatches: 'Upcoming Matches',
  totalMatches: 'Total Matches',
  wins: 'Wins',
  losses: 'Losses',
  performanceStats: 'Performance Statistics',
  matchHistory: 'Match History',
  winRate: 'Win Rate',
  teams: 'Teams',
  viewAll: 'View All',
  today: 'Today',
  weeklyActivity: 'Weekly Activity',
  monthlyStats: 'Monthly Statistics',
  yourPerformance: 'Your Performance',
  vs: 'vs',
  won: 'Won',
  lost: 'Lost',
  draw: 'Draw',
  goals: 'Goals',
  assists: 'Assists',
  userActivity: 'User Activity',
  seasonProgress: 'Season Progress',
  playerRanking: 'Player Ranking',
  searchPlayer: 'Search player',
  position: 'Position',
  name: 'Name',
  points: 'Points',
  loading: 'Loading...',
  noResults: 'No results found',
  victory: 'Victory',
  defeat: 'Defeat',
  performance: 'Performance',
  matches: 'Matches',
  victoriesChart: 'Victories',
  defeatsChart: 'Defeats',
  playerActivity: 'Player Activity',
  date: 'Date',
  tournament: 'Tournament',
  round: 'Round',
  opponent: 'Opponent',
  result: 'Result',
  score: 'Score'
};

// Mapeo de idiomas a traducciones
const translationsMap: Record<string, Translations> = {
  es: spanishTranslations,
  en: englishTranslations
};

// Contexto para el idioma
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translations: Translations;
}

const defaultLanguage = 'es';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  translations: translationsMap[defaultLanguage]
});

// Proveedor del contexto de idioma
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState(() => {
    // Intenta obtener el idioma almacenado, o usa el predeterminado
    const storedLang = localStorage.getItem('language');
    return storedLang || defaultLanguage;
  });

  // Actualizador de idioma con persistencia
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Contexto a proveer
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    translations: translationsMap[language] || translationsMap[defaultLanguage]
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personalizado para usar el contexto de idioma
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  }
  return context;
};
