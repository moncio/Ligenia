import { Container } from 'inversify';
import { IAuthService } from '../core/application/interfaces/auth-service.interface';
import { SupabaseAuthService } from '../infrastructure/auth';
import { TrackPerformanceTrendsUseCase } from '../core/application/use-cases/performance-history/track-performance-trends.use-case';
import { IPerformanceHistoryRepository } from '../core/application/interfaces/repositories/performance-history.repository';
import { IUserRepository } from '../core/application/interfaces/repositories/user.repository';
import { UserRepository } from '../infrastructure/database/prisma/repositories/user.repository';
import { PrismaClient } from '@prisma/client';
import { GetUserByIdUseCase } from '../core/application/use-cases/user/get-user-by-id.use-case';
import { ListUsersUseCase } from '../core/application/use-cases/user/list-users.use-case';
import { UpdateUserUseCase } from '../core/application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../core/application/use-cases/user/delete-user.use-case';
// Import tournament related modules
import { ITournamentRepository } from '../core/application/interfaces/repositories/tournament.repository';
import { TournamentRepository } from '../infrastructure/database/prisma/repositories/tournament.repository';
import { ListTournamentsUseCase } from '../core/application/use-cases/tournament/list-tournaments.use-case';
import { GetTournamentDetailsUseCase } from '../core/application/use-cases/tournament/get-tournament-details.use-case';
import { CreateTournamentUseCase } from '../core/application/use-cases/tournament/create-tournament.use-case';
import { UpdateTournamentUseCase } from '../core/application/use-cases/tournament/update-tournament.use-case';
import { CancelTournamentUseCase } from '../core/application/use-cases/tournament/cancel-tournament.use-case';
import { RegisterToTournamentUseCase } from '../core/application/use-cases/tournament/register-to-tournament.use-case';
import { GetTournamentBracketUseCase } from '../core/application/use-cases/tournament/get-tournament-bracket.use-case';
import { GetTournamentStandingsUseCase } from '../core/application/use-cases/tournament/get-tournament-standings.use-case';
import { UpdateTournamentMatchesAndStandingsUseCase } from '../core/application/use-cases/tournament/update-tournament-matches-and-standings.use-case';
import { StartTournamentUseCase } from '../core/application/use-cases/tournament/start-tournament.use-case';
import { GenerateTournamentBracketUseCase } from '../core/application/use-cases/tournament/generate-tournament-bracket.use-case';
// Import match repository
import { IMatchRepository } from '../core/application/interfaces/repositories/match.repository';
import { MatchRepository } from '../infrastructure/database/prisma/repositories/match.repository';
import { ListTournamentMatchesUseCase } from '../core/application/use-cases/match/list-tournament-matches.use-case';
import { GetMatchByIdUseCase } from '../core/application/use-cases/match/get-match-by-id.use-case';
import { CreateMatchUseCase } from '../core/application/use-cases/match/create-match.use-case';
import { UpdateMatchDetailsUseCase } from '../core/application/use-cases/match/update-match-details.use-case';
import { DeleteMatchUseCase } from '../core/application/use-cases/match/delete-match.use-case';
import { RecordMatchResultUseCase } from '../core/application/use-cases/match/record-match-result.use-case';
import { ListUserMatchesUseCase } from '../core/application/use-cases/match/list-user-matches.use-case';
// Import statistic related modules
import { IStatisticRepository } from '../core/application/interfaces/repositories/statistic.repository';
import { StatisticRepository } from '../infrastructure/database/prisma/repositories/statistic.repository';
import { GetPlayerStatisticsUseCase } from '../core/application/use-cases/statistic/get-player-statistics.use-case';
import { GetTournamentStatisticsUseCase } from '../core/application/use-cases/statistic/get-tournament-statistics.use-case';
import { ListGlobalStatisticsUseCase } from '../core/application/use-cases/statistic/list-global-statistics.use-case';
import { UpdateStatisticsAfterMatchUseCase } from '../core/application/use-cases/statistic/update-statistics-after-match.use-case';
import { CalculatePlayerStatisticsUseCase } from '../core/application/use-cases/statistic/calculate-player-statistics.use-case';
// Import ranking related modules
import { IRankingRepository } from '../core/application/interfaces/repositories/ranking.repository';
import { RankingRepository } from '../infrastructure/database/prisma/repositories/ranking.repository';
import { IPlayerRepository } from '../core/application/interfaces/repositories/player.repository';
import { PlayerRepository } from '../infrastructure/database/prisma/repositories/player.repository';
import { GetGlobalRankingListUseCase } from '../core/application/use-cases/ranking/get-global-ranking-list.use-case';
import { GetCategoryBasedRankingUseCase } from '../core/application/use-cases/ranking/get-category-based-ranking.use-case';
import { UpdateRankingsAfterMatchUseCase } from '../core/application/use-cases/ranking/update-rankings-after-match.use-case';
import { CalculatePlayerRankingsUseCase } from '../core/application/use-cases/ranking/calculate-player-rankings.use-case';
import { GetPlayerPerformanceHistoryUseCase } from '../core/application/use-cases/performance-history/get-player-performance-history.use-case';
import { GetPerformanceSummaryUseCase } from '../core/application/use-cases/performance-history/get-performance-summary.use-case';
import { RecordPerformanceEntryUseCase } from '../core/application/use-cases/performance-history/record-performance-entry.use-case';
import { PerformanceHistoryRepository } from '../infrastructure/database/prisma/repositories/performance-history.repository';
// Import preference related modules
import { IPreferenceRepository } from '../core/application/interfaces/repositories/preference.repository';
import { PreferenceRepository } from '../infrastructure/database/prisma/repositories/preference.repository';
import { GetUserPreferencesUseCase } from '../core/application/use-cases/preference/get-user-preferences.use-case';
import { UpdateUserPreferencesUseCase } from '../core/application/use-cases/preference/update-user-preferences.use-case';
import { ResetPreferencesUseCase } from '../core/application/use-cases/preference/reset-preferences.use-case';
import { RegisterUserUseCase } from '../core/application/use-cases/user/register-user.use-case';
// Import player use cases
import { ListPlayersUseCase } from '../core/application/use-cases/player/list-players.use-case';
import { GetPlayerByIdUseCase } from '../core/application/use-cases/player/get-player-by-id.use-case';
import { UpdatePlayerLevelUseCase } from '../core/application/use-cases/player/update-player-level.use-case';
import { CreatePlayerProfileUseCase } from '../core/application/use-cases/player/create-player-profile.use-case';
import { UpdatePlayerProfileUseCase } from '../core/application/use-cases/player/update-player-profile.use-case';
import { GetPlayerMatchesUseCase } from '../core/application/use-cases/player/get-player-matches.use-case';
import { GetPlayerTournamentsUseCase } from '../core/application/use-cases/player/get-player-tournaments.use-case';

// Symbols for dependency injection
export const TYPES = {
  AuthService: Symbol.for('AuthService'),
  PerformanceHistoryRepository: Symbol.for('PerformanceHistoryRepository'),
  UserRepository: Symbol.for('UserRepository'),
  PrismaClient: Symbol.for('PrismaClient'),
  TournamentRepository: Symbol.for('TournamentRepository'),
  MatchRepository: Symbol.for('MatchRepository'),
  StatisticRepository: Symbol.for('StatisticRepository'),
  RankingRepository: Symbol.for('RankingRepository'),
  PlayerRepository: Symbol.for('PlayerRepository'),
  PreferenceRepository: Symbol.for('PreferenceRepository'),
  StatisticService: Symbol.for('StatisticService'),
};

// Create and configure container
let container: Container;

// En entorno de pruebas, el contenedor se configura externamente
if (process.env.NODE_ENV === 'test') {
  container = new Container();
} else {
  // En entorno de producción o desarrollo, configuramos normalmente
  container = new Container();
  
  // Database
  const prismaClient = new PrismaClient();
  container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prismaClient);
  
  // Services
  container.bind<IAuthService>(TYPES.AuthService).to(SupabaseAuthService);
  container.bind<IAuthService>('AuthService').to(SupabaseAuthService);
  
  // Repositories
  container.bind<IUserRepository>(TYPES.UserRepository).toDynamicValue(() => {
    return new UserRepository(prismaClient);
  }).inSingletonScope();
  container.bind<ITournamentRepository>(TYPES.TournamentRepository).toDynamicValue(() => {
    return new TournamentRepository(prismaClient);
  }).inSingletonScope();
  container.bind<IMatchRepository>(TYPES.MatchRepository).toDynamicValue(() => {
    return new MatchRepository(prismaClient);
  }).inSingletonScope();
  container.bind<IStatisticRepository>(TYPES.StatisticRepository).toDynamicValue(() => {
    return new StatisticRepository(prismaClient);
  }).inSingletonScope();
  container.bind<IRankingRepository>(TYPES.RankingRepository).toDynamicValue(() => {
    return new RankingRepository(prismaClient);
  }).inSingletonScope();
  container.bind<IPlayerRepository>(TYPES.PlayerRepository).toDynamicValue(() => {
    return new PlayerRepository(prismaClient);
  }).inSingletonScope();
  container.bind<IPerformanceHistoryRepository>(TYPES.PerformanceHistoryRepository).toDynamicValue(() => {
    return new PerformanceHistoryRepository(prismaClient);
  }).inSingletonScope();
  container.bind<IPreferenceRepository>(TYPES.PreferenceRepository).toDynamicValue(() => {
    return new PreferenceRepository(prismaClient);
  }).inSingletonScope();

  // Register use cases
  container.bind('trackPerformanceTrendsUseCase').toDynamicValue(() => {
    const repository = container.get<IPerformanceHistoryRepository>(
      TYPES.PerformanceHistoryRepository,
    );
    return new TrackPerformanceTrendsUseCase(repository);
  });
  
  container.bind('getPlayerPerformanceHistoryUseCase').toDynamicValue(() => {
    const repository = container.get<IPerformanceHistoryRepository>(
      TYPES.PerformanceHistoryRepository,
    );
    return new GetPlayerPerformanceHistoryUseCase(repository);
  });
  
  container.bind('getPerformanceSummaryUseCase').toDynamicValue(() => {
    const repository = container.get<IPerformanceHistoryRepository>(
      TYPES.PerformanceHistoryRepository,
    );
    return new GetPerformanceSummaryUseCase(repository);
  });
  
  container.bind('recordPerformanceEntryUseCase').toDynamicValue(() => {
    const repository = container.get<IPerformanceHistoryRepository>(
      TYPES.PerformanceHistoryRepository,
    );
    return new RecordPerformanceEntryUseCase(repository);
  });
  
  // Preference use cases
  container.bind('getUserPreferencesUseCase').toDynamicValue(() => {
    const repository = container.get<IPreferenceRepository>(TYPES.PreferenceRepository);
    return new GetUserPreferencesUseCase(repository);
  });
  
  container.bind('updateUserPreferencesUseCase').toDynamicValue(() => {
    const repository = container.get<IPreferenceRepository>(TYPES.PreferenceRepository);
    return new UpdateUserPreferencesUseCase(repository);
  });
  
  container.bind('resetPreferencesUseCase').toDynamicValue(() => {
    const repository = container.get<IPreferenceRepository>(TYPES.PreferenceRepository);
    return new ResetPreferencesUseCase(repository);
  });
  
  // Add binding with PascalCase to match what's used in the controller
  container.bind('ResetPreferencesUseCase').toDynamicValue(() => {
    const repository = container.get<IPreferenceRepository>(TYPES.PreferenceRepository);
    return new ResetPreferencesUseCase(repository);
  });
  
  // User use cases
  container.bind('getUserByIdUseCase').toDynamicValue(() => {
    const repository = container.get<IUserRepository>(TYPES.UserRepository);
    return new GetUserByIdUseCase(repository);
  });
  
  container.bind('listUsersUseCase').toDynamicValue(() => {
    const repository = container.get<IUserRepository>(TYPES.UserRepository);
    return new ListUsersUseCase(repository);
  });
  
  container.bind('updateUserUseCase').toDynamicValue(() => {
    const repository = container.get<IUserRepository>(TYPES.UserRepository);
    const authService = container.get<IAuthService>(TYPES.AuthService);
    return new UpdateUserUseCase(repository, authService);
  });
  
  container.bind('deleteUserUseCase').toDynamicValue(() => {
    const repository = container.get<IUserRepository>(TYPES.UserRepository);
    const authService = container.get<IAuthService>(TYPES.AuthService);
    return new DeleteUserUseCase(repository, authService);
  });
  
  container.bind('registerUserUseCase').toDynamicValue(() => {
    const repository = container.get<IUserRepository>(TYPES.UserRepository);
    const authService = container.get<IAuthService>(TYPES.AuthService);
    return new RegisterUserUseCase(repository, authService);
  });
  
  // Tournament use cases
  container.bind('listTournamentsUseCase').toDynamicValue(() => {
    const repository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    return new ListTournamentsUseCase(repository);
  });
  
  container.bind('getTournamentDetailsUseCase').toDynamicValue(() => {
    const repository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    return new GetTournamentDetailsUseCase(repository);
  });
  
  container.bind('createTournamentUseCase').toDynamicValue(() => {
    const repository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    return new CreateTournamentUseCase(repository);
  });
  
  container.bind('updateTournamentUseCase').toDynamicValue(() => {
    const repository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    return new UpdateTournamentUseCase(repository);
  });
  
  container.bind('cancelTournamentUseCase').toDynamicValue(() => {
    const repository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
    return new CancelTournamentUseCase(repository, userRepository);
  });
  
  container.bind('registerToTournamentUseCase').toDynamicValue(() => {
    const repository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
    return new RegisterToTournamentUseCase(repository, userRepository);
  });
  
  container.bind('getTournamentBracketUseCase').toDynamicValue(() => {
    const repository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    return new GetTournamentBracketUseCase(repository, matchRepository);
  });
  
  container.bind('getTournamentStandingsUseCase').toDynamicValue(() => {
    const repository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    return new GetTournamentStandingsUseCase(repository, matchRepository);
  });
  
  container.bind('updateTournamentMatchesAndStandingsUseCase').toDynamicValue(() => {
    const repository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    return new UpdateTournamentMatchesAndStandingsUseCase(repository, matchRepository);
  });
  
  container.bind('listTournamentMatchesUseCase').toDynamicValue(() => {
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    const tournamentRepository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    return new ListTournamentMatchesUseCase(matchRepository, tournamentRepository);
  });
  
  // Match use cases
  container.bind('getMatchByIdUseCase').toDynamicValue(() => {
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    return new GetMatchByIdUseCase(matchRepository);
  });
  
  container.bind('createMatchUseCase').toDynamicValue(() => {
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    const tournamentRepository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    return new CreateMatchUseCase(matchRepository, tournamentRepository);
  });
  
  container.bind('updateMatchDetailsUseCase').toDynamicValue(() => {
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    return new UpdateMatchDetailsUseCase(matchRepository);
  });
  
  container.bind('recordMatchResultUseCase').toDynamicValue(() => {
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    return new RecordMatchResultUseCase(matchRepository);
  });
  
  container.bind('deleteMatchUseCase').toDynamicValue(() => {
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    const tournamentRepository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    return new DeleteMatchUseCase(matchRepository, tournamentRepository);
  });
  
  container.bind('listUserMatchesUseCase').toDynamicValue(() => {
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
    return new ListUserMatchesUseCase(matchRepository, userRepository);
  });

  // Statistic use cases
  container.bind('getPlayerStatisticsUseCase').toDynamicValue(() => {
    const statisticRepository = container.get<IStatisticRepository>(TYPES.StatisticRepository);
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    return new GetPlayerStatisticsUseCase(statisticRepository, playerRepository);
  });

  container.bind('getTournamentStatisticsUseCase').toDynamicValue(() => {
    const statisticRepository = container.get<IStatisticRepository>(TYPES.StatisticRepository);
    const tournamentRepository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    return new GetTournamentStatisticsUseCase(statisticRepository, tournamentRepository, playerRepository);
  });

  container.bind('listGlobalStatisticsUseCase').toDynamicValue(() => {
    const statisticRepository = container.get<IStatisticRepository>(TYPES.StatisticRepository);
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    return new ListGlobalStatisticsUseCase(statisticRepository, playerRepository);
  });

  container.bind('updateStatisticsAfterMatchUseCase').toDynamicValue(() => {
    const statisticRepository = container.get<IStatisticRepository>(TYPES.StatisticRepository);
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    return new UpdateStatisticsAfterMatchUseCase(statisticRepository, matchRepository);
  });

  container.bind('calculatePlayerStatisticsUseCase').toDynamicValue(() => {
    const statisticRepository = container.get<IStatisticRepository>(TYPES.StatisticRepository);
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    return new CalculatePlayerStatisticsUseCase(statisticRepository, playerRepository, matchRepository);
  });

  // Ranking use cases
  container.bind('calculatePlayerRankingsUseCase').toDynamicValue(() => {
    const rankingRepository = container.get<IRankingRepository>(TYPES.RankingRepository);
    const statisticRepository = container.get<IStatisticRepository>(TYPES.StatisticRepository);
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    return new CalculatePlayerRankingsUseCase(rankingRepository, statisticRepository, playerRepository);
  });

  container.bind('updateRankingsAfterMatchUseCase').toDynamicValue(() => {
    const rankingRepository = container.get<IRankingRepository>(TYPES.RankingRepository);
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    const calculatePlayerRankingsUseCase = container.get<CalculatePlayerRankingsUseCase>('calculatePlayerRankingsUseCase');
    return new UpdateRankingsAfterMatchUseCase(rankingRepository, matchRepository, calculatePlayerRankingsUseCase);
  });

  container.bind('getGlobalRankingListUseCase').toDynamicValue(() => {
    const rankingRepository = container.get<IRankingRepository>(TYPES.RankingRepository);
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    return new GetGlobalRankingListUseCase(rankingRepository, playerRepository);
  });

  container.bind('getCategoryBasedRankingUseCase').toDynamicValue(() => {
    const rankingRepository = container.get<IRankingRepository>(TYPES.RankingRepository);
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    return new GetCategoryBasedRankingUseCase(rankingRepository, playerRepository);
  });

  // Add the missing GenerateTournamentBracketUseCase binding
  container.bind('generateTournamentBracketUseCase').toDynamicValue(() => {
    const tournamentRepository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
    return new GenerateTournamentBracketUseCase(tournamentRepository, matchRepository, userRepository);
  });
  
  // Add the missing StartTournamentUseCase binding
  container.bind('startTournamentUseCase').toDynamicValue(() => {
    const tournamentRepository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
    const generateTournamentBracketUseCase = container.get<GenerateTournamentBracketUseCase>('generateTournamentBracketUseCase');
    return new StartTournamentUseCase(tournamentRepository, userRepository, generateTournamentBracketUseCase);
  });

  // Player use cases
  container.bind('listPlayersUseCase').toDynamicValue(() => {
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    return new ListPlayersUseCase(playerRepository);
  });

  container.bind('getPlayerByIdUseCase').toDynamicValue(() => {
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    return new GetPlayerByIdUseCase(playerRepository);
  });
  
  container.bind('createPlayerProfileUseCase').toDynamicValue(() => {
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
    return new CreatePlayerProfileUseCase(playerRepository, userRepository);
  });
  
  container.bind('updatePlayerProfileUseCase').toDynamicValue(() => {
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
    return new UpdatePlayerProfileUseCase(playerRepository, userRepository);
  });
  
  container.bind('getPlayerMatchesUseCase').toDynamicValue(() => {
    const matchRepository = container.get<IMatchRepository>(TYPES.MatchRepository);
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    return new GetPlayerMatchesUseCase(matchRepository, playerRepository);
  });
  
  container.bind('getPlayerTournamentsUseCase').toDynamicValue(() => {
    const tournamentRepository = container.get<ITournamentRepository>(TYPES.TournamentRepository);
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    return new GetPlayerTournamentsUseCase(tournamentRepository, playerRepository);
  });
  
  container.bind('updatePlayerLevelUseCase').toDynamicValue(() => {
    const playerRepository = container.get<IPlayerRepository>(TYPES.PlayerRepository);
    return new UpdatePlayerLevelUseCase(playerRepository);
  });

  // Performance use cases con nombres correctos (PascalCase) - para corregir los errores
  container.bind('GetPlayerPerformanceHistoryUseCase').toDynamicValue(() => {
    const repository = container.get<IPerformanceHistoryRepository>(
      TYPES.PerformanceHistoryRepository,
    );
    return new GetPlayerPerformanceHistoryUseCase(repository);
  });
  
  container.bind('GetPerformanceSummaryUseCase').toDynamicValue(() => {
    const repository = container.get<IPerformanceHistoryRepository>(
      TYPES.PerformanceHistoryRepository,
    );
    return new GetPerformanceSummaryUseCase(repository);
  });
  
  container.bind('TrackPerformanceTrendsUseCase').toDynamicValue(() => {
    const repository = container.get<IPerformanceHistoryRepository>(
      TYPES.PerformanceHistoryRepository,
    );
    return new TrackPerformanceTrendsUseCase(repository);
  });
  
  container.bind('RecordPerformanceEntryUseCase').toDynamicValue(() => {
    const repository = container.get<IPerformanceHistoryRepository>(
      TYPES.PerformanceHistoryRepository,
    );
    return new RecordPerformanceEntryUseCase(repository);
  });
}

export { container };
