import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { IMatchRepository } from '../../domain/interfaces/match-repository.interface';
import { Match } from '../../domain/entities/match.entity';

export class GetMatchByIdUseCase implements IUseCase<string, Match> {
  constructor(private matchRepository: IMatchRepository) {}

  async execute(id: string): Promise<Result<Match>> {
    try {
      const match = await this.matchRepository.findById(id);

      if (!match) {
        return Result.fail<Match>(new Error('Partido no encontrado'));
      }

      return Result.ok<Match>(match);
    } catch (error: any) {
      return Result.fail<Match>(new Error(`Error al obtener el partido: ${error.message}`));
    }
  }
} 