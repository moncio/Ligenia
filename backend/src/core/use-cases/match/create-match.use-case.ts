import { Match } from '../../domain/entities/match.entity';
import { CreateMatchDto } from '../../domain/dtos/create-match.dto';
import { IMatchRepository } from '../../domain/interfaces/match-repository.interface';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';
import { ITeamRepository } from '../../domain/interfaces/team-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para la creación de partidos
 */
export class CreateMatchUseCase implements IUseCase<CreateMatchDto, Match> {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly tournamentRepository: ITournamentRepository,
    private readonly teamRepository: ITeamRepository,
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param data Datos para la creación del partido
   * @returns Resultado con el partido creado o un error
   */
  async execute(data: CreateMatchDto): Promise<Result<Match>> {
    try {
      // Verificar que el torneo existe
      const tournament = await this.tournamentRepository.findById(data.tournamentId);
      if (!tournament) {
        return Result.fail<Match>(new Error('El torneo especificado no existe'));
      }

      // Verificar que el equipo 1 existe
      const team1 = await this.teamRepository.findById(data.team1Id);
      if (!team1) {
        return Result.fail<Match>(new Error('El equipo 1 especificado no existe'));
      }

      // Verificar que el equipo 2 existe
      const team2 = await this.teamRepository.findById(data.team2Id);
      if (!team2) {
        return Result.fail<Match>(new Error('El equipo 2 especificado no existe'));
      }

      // Verificar que los equipos pertenecen al torneo
      if (team1.tournamentId !== data.tournamentId) {
        return Result.fail<Match>(new Error('El equipo 1 no pertenece al torneo especificado'));
      }

      if (team2.tournamentId !== data.tournamentId) {
        return Result.fail<Match>(new Error('El equipo 2 no pertenece al torneo especificado'));
      }

      // Crear el partido
      const match = new Match({
        id: uuidv4(),
        tournamentId: data.tournamentId,
        team1Id: data.team1Id,
        team2Id: data.team2Id,
        scheduledDate: data.scheduledDate,
        courtId: data.courtId,
        status: data.status,
        score: data.score,
        notes: data.notes,
        round: data.round,
        matchNumber: data.matchNumber,
      });

      // Validar los datos del partido
      try {
        match.validate();
      } catch (error) {
        return Result.fail<Match>(error instanceof Error ? error : new Error('Error de validación'));
      }

      // Guardar el partido
      const createdMatch = await this.matchRepository.create(match);

      return Result.ok<Match>(createdMatch);
    } catch (error) {
      return Result.fail<Match>(error instanceof Error ? error : new Error('Error al crear el partido'));
    }
  }
} 