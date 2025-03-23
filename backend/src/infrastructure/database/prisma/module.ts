import { ITournamentRepository } from '../../../core/application/interfaces/repositories/tournament.repository';
import { TournamentRepository } from './repositories/tournament.repository';
import { IMatchRepository } from '../../../core/application/interfaces/repositories/match.repository';
import { MatchRepository } from './repositories/match.repository';
import { IPlayerRepository } from '../../../core/application/interfaces/repositories/player.repository';
import { PlayerRepository } from './repositories/player.repository';
import { IUserRepository } from '../../../core/application/interfaces/repositories/user.repository';
import { UserRepository } from './repositories/user.repository';
import { IRankingRepository } from '../../../core/application/interfaces/repositories/ranking.repository';
import { RankingRepository } from './repositories/ranking.repository';
import { IPerformanceHistoryRepository } from '../../../core/application/interfaces/repositories/performance-history.repository';
import { PerformanceHistoryRepository } from './repositories/performance-history.repository';
import { IPreferenceRepository } from '../../../core/application/interfaces/repositories/preference.repository';
import { PreferenceRepository } from './repositories/preference.repository';
import { PrismaClient } from '@prisma/client';

// This would be replaced with proper DI container initialization in a real application
export class PrismaModule {
  private static prismaClient: PrismaClient = new PrismaClient();

  /**
   * Dictionary of repository factories
   */
  private static repositoryFactories = {
    tournamentRepository: () => new TournamentRepository(this.prismaClient),
    matchRepository: () => new MatchRepository(this.prismaClient),
    playerRepository: () => new PlayerRepository(this.prismaClient),
    userRepository: () => new UserRepository(this.prismaClient),
    rankingRepository: () => new RankingRepository(this.prismaClient),
    performanceHistoryRepository: () => new PerformanceHistoryRepository(this.prismaClient),
    preferenceRepository: () => new PreferenceRepository(this.prismaClient),
  };

  /**
   * Repository singletons
   */
  private static repositories: Record<string, any> = {};

  /**
   * Get the tournament repository
   * @returns Tournament repository implementation
   */
  static getTournamentRepository(): ITournamentRepository {
    if (!this.repositories['tournamentRepository']) {
      this.repositories['tournamentRepository'] = this.repositoryFactories.tournamentRepository();
    }
    return this.repositories['tournamentRepository'];
  }

  /**
   * Get the match repository
   * @returns Match repository implementation
   */
  static getMatchRepository(): IMatchRepository {
    if (!this.repositories['matchRepository']) {
      this.repositories['matchRepository'] = this.repositoryFactories.matchRepository();
    }
    return this.repositories['matchRepository'];
  }

  /**
   * Get the player repository
   * @returns Player repository implementation
   */
  static getPlayerRepository(): IPlayerRepository {
    if (!this.repositories['playerRepository']) {
      this.repositories['playerRepository'] = this.repositoryFactories.playerRepository();
    }
    return this.repositories['playerRepository'];
  }

  /**
   * Get the user repository
   * @returns User repository implementation
   */
  static getUserRepository(): IUserRepository {
    if (!this.repositories['userRepository']) {
      this.repositories['userRepository'] = this.repositoryFactories.userRepository();
    }
    return this.repositories['userRepository'];
  }

  /**
   * Get the ranking repository
   * @returns Ranking repository implementation
   */
  static getRankingRepository(): IRankingRepository {
    if (!this.repositories['rankingRepository']) {
      this.repositories['rankingRepository'] = this.repositoryFactories.rankingRepository();
    }
    return this.repositories['rankingRepository'];
  }

  /**
   * Get the performance history repository
   * @returns Performance history repository implementation
   */
  static getPerformanceHistoryRepository(): IPerformanceHistoryRepository {
    if (!this.repositories['performanceHistoryRepository']) {
      this.repositories['performanceHistoryRepository'] = this.repositoryFactories.performanceHistoryRepository();
    }
    return this.repositories['performanceHistoryRepository'];
  }

  /**
   * Get the preference repository
   * @returns Preference repository implementation
   */
  static getPreferenceRepository(): IPreferenceRepository {
    if (!this.repositories['preferenceRepository']) {
      this.repositories['preferenceRepository'] = this.repositoryFactories.preferenceRepository();
    }
    return this.repositories['preferenceRepository'];
  }

  /**
   * Reset all repositories (mainly for testing)
   */
  static reset(): void {
    this.repositories = {};
  }
}
