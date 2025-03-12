import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { ILeagueRepository } from '../../domain/interfaces/league-repository.interface';
import { League } from '../../domain/entities/league.entity';
import { UpdateLeagueDto } from '../../domain/dtos/update-league.dto';

/**
 * Caso de uso para actualizar una liga
 */
export class UpdateLeagueUseCase implements IUseCase<[string, UpdateLeagueDto], League> {
  constructor(private readonly leagueRepository: ILeagueRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param input Array con el ID de la liga y los datos para actualizarla
   * @returns Resultado con la liga actualizada o un error
   */
  async execute(input: [string, UpdateLeagueDto]): Promise<Result<League>> {
    try {
      const [id, data] = input;
      
      // Verificar si la liga existe
      const existingLeague = await this.leagueRepository.findById(id);
      if (!existingLeague) {
        return Result.fail(new Error('La liga no existe'));
      }

      // Si se está actualizando el nombre, verificar que no exista otra liga con ese nombre
      if (data.name && data.name !== existingLeague.name) {
        const nameExists = await this.leagueRepository.existsByName(data.name);
        if (nameExists) {
          return Result.fail(new Error('Ya existe una liga con el nombre proporcionado'));
        }
      }

      // Actualizar la liga
      const updatedLeague = await this.leagueRepository.update(id, data as Partial<League>);
      if (!updatedLeague) {
        return Result.fail(new Error('No se pudo actualizar la liga'));
      }

      return Result.ok(updatedLeague);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Error al actualizar la liga')
      );
    }
  }
} 