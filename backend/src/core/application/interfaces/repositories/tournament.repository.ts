import { Tournament, TournamentStatus, PlayerLevel } from '../../../domain/tournament/tournament.entity';

export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

export interface TournamentFilter {
  status?: TournamentStatus;
  category?: PlayerLevel;
  dateRange?: DateRangeFilter;
  searchTerm?: string;
}

export interface PaginationOptions {
  skip: number;
  limit: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface ITournamentRepository {
  findById(id: string): Promise<Tournament | null>;
  findAll(filter?: TournamentFilter, pagination?: PaginationOptions): Promise<Tournament[]>;
  count(filter?: TournamentFilter): Promise<number>;
  save(tournament: Tournament): Promise<void>;
  update(tournament: Tournament): Promise<void>;
  delete(id: string): Promise<void>;
  countParticipants(tournamentId: string): Promise<number>;
  registerParticipant(tournamentId: string, playerId: string): Promise<void>;
  unregisterParticipant(tournamentId: string, playerId: string): Promise<void>;
  isParticipantRegistered(tournamentId: string, playerId: string): Promise<boolean>;
  getParticipants(tournamentId: string, pagination?: PaginationOptions): Promise<string[]>;
  countParticipantsByTournamentId(tournamentId: string): Promise<number>;
} 