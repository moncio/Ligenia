import { api } from '../client';

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  registrationDeadline?: string;
  location?: string;
  format: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN';
  category: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt?: string;
  updatedAt?: string;
}

export interface TournamentWithStatus extends Tournament {
  userStatus?: 'NOT_REGISTERED' | 'REGISTERED' | 'ACTIVE' | 'COMPLETED';
  nextMatchDate?: string;
}

export interface TournamentFilters {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface Bracket {
  rounds: {
    matchups: {
      id: string;
      player1Name: string;
      player2Name: string;
      score?: string;
      isCompleted: boolean;
      scheduledTime?: string;
      winnerId?: string;
    }[];
  }[];
}

// Servicio para gestionar torneos
export const tournamentService = {
  /**
   * Obtener listado de torneos con filtros
   */
  getTournaments: async (filters?: TournamentFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    return api.get<{
      data: {
        tournaments: Tournament[];
        pagination: {
          total: number;
          page: number;
          limit: number;
        }
      }
    }>(`/api/tournaments?${params.toString()}`);
  },

  /**
   * Obtener torneos activos del jugador actual
   */
  getCurrentPlayerTournaments: async () => {
    return api.get<{
      data: {
        tournaments: TournamentWithStatus[];
      }
    }>('/api/players/me/tournaments');
  },
  
  /**
   * Obtener un torneo por ID
   */
  getTournamentById: async (tournamentId: string) => {
    return api.get<{
      data: {
        tournament: Tournament;
      }
    }>(`/api/tournaments/${tournamentId}`);
  },
  
  /**
   * Registrar al jugador actual en un torneo
   */
  registerForTournament: async (tournamentId: string) => {
    return api.post<{
      data: {
        success: boolean;
        message: string;
      }
    }>(`/api/tournaments/${tournamentId}/register`);
  },
  
  /**
   * Obtener el bracket de un torneo
   */
  getTournamentBracket: async (tournamentId: string) => {
    return api.get<{
      data: {
        bracket: Bracket;
      }
    }>(`/api/tournaments/${tournamentId}/bracket`);
  }
}; 