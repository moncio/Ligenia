/**
 * Claves de consulta para las operaciones de la API
 * Organizado por entidades para facilitar la invalidación de consultas relacionadas
 */

// Claves para consultas relacionadas con usuarios
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (userId: string) => [...userKeys.details(), userId] as const,
  current: () => [...userKeys.all, 'currentUser'] as const,
  stats: (userId?: string) => [...userKeys.all, 'stats', userId] as const,
};

// Claves para consultas relacionadas con partidos
export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...matchKeys.lists(), filters] as const,
  details: () => [...matchKeys.all, 'detail'] as const,
  detail: (matchId: string) => [...matchKeys.details(), matchId] as const,
  playerMatches: (playerId?: string) => [...matchKeys.all, 'player', playerId] as const,
  upcomingMatches: () => [...matchKeys.all, 'upcoming'] as const,
};

// Claves para consultas relacionadas con torneos
export const tournamentKeys = {
  all: ['tournaments'] as const,
  lists: () => [...tournamentKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...tournamentKeys.lists(), filters] as const,
  details: () => [...tournamentKeys.all, 'detail'] as const, 
  detail: (tournamentId: string) => [...tournamentKeys.details(), tournamentId] as const,
  standings: (tournamentId: string) => [...tournamentKeys.all, 'standings', tournamentId] as const,
};

// Claves para consultas relacionadas con notificaciones
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  count: () => [...notificationKeys.all, 'count'] as const,
};

// Claves para consultas relacionadas con estadísticas generales
export const statsKeys = {
  all: ['stats'] as const,
  dashboard: () => [...statsKeys.all, 'dashboard'] as const,
  leaderboard: () => [...statsKeys.all, 'leaderboard'] as const,
};

// Clave para consultas relacionadas con la salud del sistema
export const healthKey = () => ['health'] as const; 