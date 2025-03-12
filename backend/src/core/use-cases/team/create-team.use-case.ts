import { Team } from '../../domain/entities/team.entity';
import { CreateTeamDto } from '../../domain/dtos/create-team.dto';
import { ITeamRepository } from '../../domain/interfaces/team-repository.interface';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para la creación de equipos
 */
export class CreateTeamUseCase implements IUseCase<CreateTeamDto, Team> {
  constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly tournamentRepository: ITournamentRepository,
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param data Datos para la creación del equipo
   * @returns Resultado con el equipo creado o un error
   */
  async execute(data: CreateTeamDto): Promise<Result<Team>> {
    try {
      // Verificar que el torneo existe
      const tournament = await this.tournamentRepository.findById(data.tournamentId);
      if (!tournament) {
        return Result.fail<Team>(new Error('El torneo especificado no existe'));
      }

      // Verificar que no existe un equipo con el mismo nombre en el mismo torneo
      const exists = await this.teamRepository.existsByNameInTournament(data.name, data.tournamentId);
      if (exists) {
        return Result.fail<Team>(new Error('Ya existe un equipo con ese nombre en el torneo'));
      }

      // Crear el equipo
      const team = new Team({
        id: uuidv4(),
        name: data.name,
        tournamentId: data.tournamentId,
        players: data.players,
        ranking: data.ranking,
        logoUrl: data.logoUrl,
      });

      // Validar los datos del equipo
      try {
        team.validate();
      } catch (error) {
        return Result.fail<Team>(error instanceof Error ? error : new Error('Error de validación'));
      }

      // Guardar el equipo
      const createdTeam = await this.teamRepository.create(team);

      return Result.ok<Team>(createdTeam);
    } catch (error) {
      return Result.fail<Team>(error instanceof Error ? error : new Error('Error al crear el equipo'));
    }
  }
} 