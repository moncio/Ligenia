import { Tournament } from '../../domain/entities/tournament.entity';
import { CreateTournamentDto } from '../../domain/dtos/create-tournament.dto';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';
import { ILeagueRepository } from '../../domain/interfaces/league-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';

/**
 * Caso de uso para la creación de torneos
 */
export class CreateTournamentUseCase implements IUseCase<CreateTournamentDto, Tournament> {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly leagueRepository: ILeagueRepository,
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param data Datos para la creación del torneo
   * @returns Resultado con el torneo creado o un error
   */
  async execute(data: CreateTournamentDto): Promise<Result<Tournament>> {
    try {
      // Verificar que la liga existe
      const league = await this.leagueRepository.findById(data.leagueId);
      if (!league) {
        return Result.fail<Tournament>(new Error('La liga especificada no existe'));
      }

      // Validar que no exista un torneo con el mismo nombre en la misma liga
      const exists = await this.tournamentRepository.existsByNameInLeague(data.name, data.leagueId);
      if (exists) {
        return Result.fail<Tournament>(
          new Error(`Ya existe un torneo con el nombre "${data.name}" en la liga especificada`)
        );
      }

      // Crear el torneo
      const now = new Date();
      const tournament = await this.tournamentRepository.create({
        name: data.name,
        leagueId: data.leagueId,
        format: data.format,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        maxParticipants: data.maxParticipants,
        minParticipants: data.minParticipants,
        registrationDeadline: data.registrationDeadline,
        createdAt: now,
        updatedAt: now,
        validate: () => {}, // Esto es solo para satisfacer el tipo, la validación real se hace en el repositorio
      } as Omit<Tournament, 'id'>);

      return Result.ok<Tournament>(tournament);
    } catch (error) {
      return Result.fail<Tournament>(error instanceof Error ? error : new Error('Error al crear el torneo'));
    }
  }
} 