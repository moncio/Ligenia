import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';
import { Tournament } from '../../domain/entities/tournament.entity';
import { PaginationOptions } from '../../domain/interfaces/repository.interface';

export interface GetAllTournamentsInput {
  pagination?: PaginationOptions;
  leagueId?: string;
}

export interface GetAllTournamentsOutput {
  data: Tournament[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class GetAllTournamentsUseCase implements IUseCase<GetAllTournamentsInput, GetAllTournamentsOutput> {
  constructor(private readonly tournamentRepository: ITournamentRepository) {}

  /**
   * Obtiene todos los torneos con paginación y filtrado opcional por liga
   * @param input Opciones de paginación y filtrado
   * @returns Result con los torneos y la información de paginación
   */
  async execute(input?: GetAllTournamentsInput): Promise<Result<GetAllTournamentsOutput>> {
    try {
      const { pagination = { page: 1, limit: 10 }, leagueId } = input || {};

      let result;
      
      if (leagueId) {
        // Si se proporciona un leagueId, filtramos por liga
        const tournaments = await this.tournamentRepository.findByLeague(leagueId);
        
        // Aplicamos paginación manual a los resultados
        const startIndex = (pagination.page! - 1) * pagination.limit!;
        const endIndex = startIndex + pagination.limit!;
        const paginatedData = tournaments.slice(startIndex, endIndex);
        
        result = {
          data: paginatedData,
          pagination: {
            total: tournaments.length,
            page: pagination.page!,
            limit: pagination.limit!,
            totalPages: Math.ceil(tournaments.length / pagination.limit!),
          },
        };
      } else {
        // Si no hay filtro por liga, usamos la paginación del repositorio
        result = await this.tournamentRepository.findAllPaginated(pagination);
      }

      return Result.ok<GetAllTournamentsOutput>(result);
    } catch (error: any) {
      return Result.fail<GetAllTournamentsOutput>(new Error(`Error al obtener los torneos: ${error.message}`));
    }
  }
} 