import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Match, MatchStatus } from '../../../domain/match/match.entity';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';
import { TournamentStatus } from '../../../domain/tournament/tournament.entity';

// Input validation schema
const CreateMatchInputSchema = z.object({
  tournamentId: z.string().uuid({
    message: 'Invalid tournament ID format',
  }),
  homePlayerOneId: z.string().uuid({
    message: 'Invalid home player one ID format',
  }),
  homePlayerTwoId: z.string().uuid({
    message: 'Invalid home player two ID format',
  }),
  awayPlayerOneId: z.string().uuid({
    message: 'Invalid away player one ID format',
  }),
  awayPlayerTwoId: z.string().uuid({
    message: 'Invalid away player two ID format',
  }),
  round: z.number().int().positive({
    message: 'Round must be a positive integer',
  }),
  date: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional()
    .nullable(),
  location: z.string().max(100).optional().nullable(),
  status: z
    .nativeEnum(MatchStatus, {
      errorMap: () => ({ message: 'Invalid match status' }),
    })
    .optional()
    .default(MatchStatus.PENDING),
});

type CreateMatchInput = z.infer<typeof CreateMatchInputSchema>;

export class CreateMatchUseCase extends BaseUseCase<CreateMatchInput, Match> {
  constructor(
    private matchRepository: IMatchRepository,
    private tournamentRepository: ITournamentRepository,
  ) {
    super();
  }

  protected async executeImpl(input: CreateMatchInput): Promise<Result<Match>> {
    try {
      // Validate input
      const validation = CreateMatchInputSchema.safeParse(input);
      if (!validation.success) {
        console.log('Validation failed:', validation.error.errors);
        return Result.fail<Match>(new Error(validation.error.errors[0].message));
      }

      console.log('Validated data:', validation.data);

      const validatedData = validation.data;

      // Convert string date to Date object if present
      const date = validatedData.date ? new Date(validatedData.date) : null;
      console.log('Parsed date:', date);

      // Validate tournament exists
      const tournament = await this.tournamentRepository.findById(validatedData.tournamentId);
      if (!tournament) {
        console.log('Tournament not found');
        return Result.fail<Match>(new Error('Tournament not found'));
      }

      console.log('Found tournament:', tournament);

      // Business rules validation
      // 1. Check for duplicate players
      const playerIds = [
        validatedData.homePlayerOneId,
        validatedData.awayPlayerOneId,
        validatedData.homePlayerTwoId,
        validatedData.awayPlayerTwoId,
      ];

      if (new Set(playerIds).size !== playerIds.length) {
        console.log('Duplicate players found');
        return Result.fail<Match>(new Error('Duplicate players are not allowed'));
      }

      // 2. Tournament should be in DRAFT state to create matches
      if (tournament.status !== TournamentStatus.DRAFT) {
        console.log('Tournament not in DRAFT status:', tournament.status);
        return Result.fail<Match>(
          new Error('Cannot create matches for tournaments that are not in DRAFT status')
        );
      }

      // Create the match entity
      const match = new Match(
        '', // ID will be assigned by repository
        validatedData.tournamentId,
        validatedData.homePlayerOneId,
        validatedData.homePlayerTwoId,
        validatedData.awayPlayerOneId,
        validatedData.awayPlayerTwoId,
        validatedData.round,
        date,
        validatedData.location || null,
        MatchStatus.PENDING,
        null, // homeScore
        null, // awayScore
      );

      console.log('Created match:', match);

      // Save match
      await this.matchRepository.save(match);
      console.log('Match saved successfully');
      return Result.ok<Match>(match);
    } catch (error) {
      console.error('Error creating match:', error);
      return Result.fail<Match>(
        error instanceof Error ? error : new Error('Failed to create match'),
      );
    }
  }
}
