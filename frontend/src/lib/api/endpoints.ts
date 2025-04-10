/**
 * API endpoints constants for the application
 * These should be used when making API requests to ensure consistency
 */

export const API_ENDPOINTS = {
  // Users and auth
  USERS: '/api/users',
  AUTH: '/api/auth',
  PROFILE: '/api/users/me',
  
  // Matches
  MATCHES: '/api/matches',
  PLAYER_MATCHES: '/api/players/me/matches',
  UPCOMING_MATCHES: '/api/players/me/matches/upcoming',
  
  // Tournaments
  TOURNAMENTS: '/api/tournaments',
  PLAYER_TOURNAMENTS: '/api/players/me/tournaments',
  TOURNAMENT_STANDINGS: '/api/tournaments/:id/standings',
  
  // Players
  PLAYERS: '/api/players',
  RANKINGS: '/api/rankings',
  
  // Statistics
  STATISTICS: '/api/statistics',
  USER_STATISTICS: '/api/users/:id/statistics',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
  UNREAD_NOTIFICATIONS: '/api/notifications/unread',
  
  // System
  HEALTH: '/api/health'
}; 