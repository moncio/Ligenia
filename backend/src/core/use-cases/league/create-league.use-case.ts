import { League } from '../../domain/entities/league.entity';
import { CreateLeagueDto } from '../../domain/dtos/create-league.dto';
import { ILeagueRepository } from '../../domain/interfaces/league-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';

/**
 * Caso de uso para la creación de ligas
 */
export class CreateLeagueUseCase implements IUseCase<CreateLeagueDto, League> {
  constructor(private readonly leagueRepository: ILeagueRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param data Datos para la creación de la liga
   * @returns Resultado con la liga creada o un error
   */
  async execute(data: CreateLeagueDto): Promise<Result<League>> {
    try {
      // Validar que no exista una liga con el mismo nombre
      const exists = await this.leagueRepository.existsByName(data.name);
      if (exists) {
        return Result.fail<League>(new Error(`Ya existe una liga con el nombre "${data.name}"`));
      }

      // Crear la liga
      const now = new Date();
      const league = await this.leagueRepository.create({
        name: data.name,
        adminId: data.adminId,
        scoringType: data.scoringType,
        description: data.description,
        logoUrl: data.logoUrl,
        isPublic: data.isPublic,
        creationDate: new Date(),
        createdAt: now,
        updatedAt: now,
        validate: () => {}, // Esto es solo para satisfacer el tipo, la validación real se hace en el repositorio
      } as Omit<League, 'id'>);

      return Result.ok<League>(league);
    } catch (error) {
      return Result.fail<League>(error instanceof Error ? error : new Error('Error al crear la liga'));
    }
  }
} 