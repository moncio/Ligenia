import { Match } from '../../domain/entities/match.entity';
import { UpdateMatchDto } from '../../domain/dtos/update-match.dto';
import { IMatchRepository } from '../../domain/interfaces/match-repository.interface';
import { ITeamRepository } from '../../domain/interfaces/team-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';

/**
 * Caso de uso para actualizar un partido
 */
export class UpdateMatchUseCase implements IUseCase<[string, UpdateMatchDto], Match> {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly teamRepository: ITeamRepository,
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param input Array con el ID del partido y los datos a actualizar
   * @returns Resultado con el partido actualizado o un error
   */
  async execute(input: [string, UpdateMatchDto]): Promise<Result<Match>> {
    try {
      const [id, data] = input;
      
      // Verificar si el partido existe
      const existingMatch = await this.matchRepository.findById(id);
      if (!existingMatch) {
        return Result.fail<Match>(new Error('El partido no existe'));
      }

      // Si se está actualizando el equipo 1, verificar que existe
      if (data.team1Id) {
        const team1 = await this.teamRepository.findById(data.team1Id);
        if (!team1) {
          return Result.fail<Match>(new Error('El equipo 1 especificado no existe'));
        }

        // Verificar que el equipo pertenece al torneo
        if (team1.tournamentId !== existingMatch.tournamentId) {
          return Result.fail<Match>(new Error('El equipo 1 no pertenece al torneo del partido'));
        }
      }

      // Si se está actualizando el equipo 2, verificar que existe
      if (data.team2Id) {
        const team2 = await this.teamRepository.findById(data.team2Id);
        if (!team2) {
          return Result.fail<Match>(new Error('El equipo 2 especificado no existe'));
        }

        // Verificar que el equipo pertenece al torneo
        if (team2.tournamentId !== existingMatch.tournamentId) {
          return Result.fail<Match>(new Error('El equipo 2 no pertenece al torneo del partido'));
        }
      }

      // Verificar que los equipos no son iguales
      const team1Id = data.team1Id || existingMatch.team1Id;
      const team2Id = data.team2Id || existingMatch.team2Id;
      if (team1Id === team2Id) {
        return Result.fail<Match>(new Error('Los equipos no pueden ser iguales'));
      }

      // Actualizar el partido
      const updatedMatch = await this.matchRepository.update(id, data);
      if (!updatedMatch) {
        return Result.fail<Match>(new Error('No se pudo actualizar el partido'));
      }

      return Result.ok<Match>(updatedMatch);
    } catch (error: any) {
      return Result.fail<Match>(new Error(`Error al actualizar el partido: ${error.message}`));
    }
  }
} 