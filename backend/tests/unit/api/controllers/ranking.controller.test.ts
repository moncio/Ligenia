import { RankingController } from '../../../../src/api/controllers/ranking.controller';
import { ContainerRequest } from '../../../../src/api/middlewares/di.middleware';
import { Response } from 'express';
import { Result } from '../../../../src/shared/result';
import { PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';
import { GetGlobalRankingListUseCase, GetGlobalRankingListOutput } from '../../../../src/core/application/use-cases/ranking/get-global-ranking-list.use-case';
import { GetCategoryBasedRankingUseCase, GetCategoryBasedRankingOutput } from '../../../../src/core/application/use-cases/ranking/get-category-based-ranking.use-case';
import { UpdateRankingsAfterMatchUseCase, UpdateRankingsAfterMatchOutput } from '../../../../src/core/application/use-cases/ranking/update-rankings-after-match.use-case';
import { CalculatePlayerRankingsUseCase, CalculatePlayerRankingsOutput } from '../../../../src/core/application/use-cases/ranking/calculate-player-rankings.use-case';
import { Ranking } from '../../../../src/core/domain/ranking/ranking.entity';
import { Player } from '../../../../src/core/domain/player/player.entity';

describe('RankingController', () => {
  let rankingController: RankingController;
  let mockRequest: Partial<ContainerRequest>;
  let mockResponse: Partial<Response>;
  let mockGetGlobalRankingListUseCase: jest.Mocked<GetGlobalRankingListUseCase>;
  let mockGetCategoryBasedRankingUseCase: jest.Mocked<GetCategoryBasedRankingUseCase>;
  let mockUpdateRankingsAfterMatchUseCase: jest.Mocked<UpdateRankingsAfterMatchUseCase>;
  let mockCalculatePlayerRankingsUseCase: jest.Mocked<CalculatePlayerRankingsUseCase>;
  let mockContainer: any;

  const mockPlayerId = 'test-player-id';
  const mockMatchId = 'test-match-id';

  // Helper to create a Ranking entity
  const createMockRanking = (playerId: string, level: PlayerLevel, position: number = 1): Ranking => {
    return new Ranking(
      `ranking-${position}`,
      playerId,
      100 - (position * 10),  // Some calculation for points based on position
      position,
      position,
      level,
      null,
      0,
      new Date(),
      new Date(),
      new Date()
    );
  };

  // Helper to create a Player entity
  const createMockPlayer = (id: string, name: string): Player => {
    return new Player(
      id,
      `user-${id}`,  // userId
      PlayerLevel.P1,
      30,  // age
      'Spain',  // country
      null,  // avatarUrl
      new Date(),  // createdAt
      new Date()  // updatedAt
    );
  };

  // Helper to create success Result with isFailure=false
  const createSuccessResult = <T>(data: T) => {
    const result = Result.ok<T>(data);
    // Ensure isFailure is properly set to false
    Object.defineProperty(result, 'isFailure', {
      get: () => false
    });
    return result;
  };

  // Helper to create failure Result with isFailure=true
  const createFailureResult = <T>(error: Error) => {
    const result = Result.fail<T>(error);
    // Ensure isFailure is properly set to true
    Object.defineProperty(result, 'isFailure', {
      get: () => true
    });
    // Ensure error is properly set
    Object.defineProperty(result, 'error', {
      get: () => error
    });
    return result;
  };

  beforeEach(() => {
    // Set up mock use cases with proper typing
    mockGetGlobalRankingListUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetGlobalRankingListUseCase>;

    mockGetCategoryBasedRankingUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetCategoryBasedRankingUseCase>;

    mockUpdateRankingsAfterMatchUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateRankingsAfterMatchUseCase>;

    mockCalculatePlayerRankingsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculatePlayerRankingsUseCase>;

    // Set up mock container
    mockContainer = {
      get: jest.fn().mockImplementation((name: string) => {
        switch (name) {
          case 'getGlobalRankingListUseCase':
            return mockGetGlobalRankingListUseCase;
          case 'getCategoryBasedRankingUseCase':
            return mockGetCategoryBasedRankingUseCase;
          case 'updateRankingsAfterMatchUseCase':
            return mockUpdateRankingsAfterMatchUseCase;
          case 'calculatePlayerRankingsUseCase':
            return mockCalculatePlayerRankingsUseCase;
          default:
            return null;
        }
      }),
    };

    // Set up mock request
    mockRequest = {
      container: mockContainer,
      query: {},
      params: {},
      body: {},
    };

    // Set up mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Create controller instance
    rankingController = new RankingController();
  });

  describe('getGlobalRankingList', () => {
    it('should return global rankings with 200 status code on success', async () => {
      // Arrange
      const mockRanking = createMockRanking(mockPlayerId, PlayerLevel.P1);
      const mockPlayer = createMockPlayer(mockPlayerId, 'Test Player');
      
      // Add player to the ranking
      const rankingWithPlayer = { ...mockRanking, player: mockPlayer };

      const mockPagination = {
        total: 1,
        limit: 10,
        offset: 0,
        hasMore: false,
      };

      const mockResult: GetGlobalRankingListOutput = {
        rankings: [rankingWithPlayer as Ranking & { player?: Player }],
        pagination: mockPagination,
      };

      mockGetGlobalRankingListUseCase.execute.mockResolvedValue(
        createSuccessResult(mockResult)
      );

      // Act
      await rankingController.getGlobalRankingList(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockGetGlobalRankingListUseCase.execute).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        playerLevel: undefined,
        sortBy: 'globalPosition',
        sortOrder: 'asc',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle failure with 400 status code', async () => {
      // Arrange
      const error = new Error('Failed to get global rankings');
      mockGetGlobalRankingListUseCase.execute.mockResolvedValue(
        createFailureResult(error)
      );

      // Act
      await rankingController.getGlobalRankingList(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to get global rankings' });
    });

    it('should handle missing use case with 500 status code', async () => {
      // Arrange
      mockContainer.get.mockReturnValueOnce(null);

      // Act
      await rankingController.getGlobalRankingList(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Use case not available' });
    });
  });

  describe('getCategoryBasedRanking', () => {
    it('should return category-based rankings with 200 status code on success', async () => {
      // Arrange
      const mockRanking = createMockRanking(mockPlayerId, PlayerLevel.P1);
      const mockPlayer = createMockPlayer(mockPlayerId, 'Test Player');
      
      // Add player to the ranking
      const rankingWithPlayer = { ...mockRanking, player: mockPlayer };

      const mockPagination = {
        total: 1,
        limit: 10,
        offset: 0,
        hasMore: false,
      };

      const mockResult: GetCategoryBasedRankingOutput = {
        rankings: [rankingWithPlayer as Ranking & { player?: Player }],
        pagination: mockPagination,
        playerLevel: PlayerLevel.P1,
      };

      mockRequest.params = { categoryId: PlayerLevel.P1 };

      mockGetCategoryBasedRankingUseCase.execute.mockResolvedValue(
        createSuccessResult(mockResult)
      );

      // Act
      await rankingController.getCategoryBasedRanking(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockGetCategoryBasedRankingUseCase.execute).toHaveBeenCalledWith({
        playerLevel: PlayerLevel.P1,
        limit: 10,
        offset: 0,
        sortBy: 'categoryPosition',
        sortOrder: 'asc',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle failure with 400 status code', async () => {
      // Arrange
      mockRequest.params = { categoryId: PlayerLevel.P1 };
      const error = new Error('Failed to get category rankings');
      mockGetCategoryBasedRankingUseCase.execute.mockResolvedValue(
        createFailureResult(error)
      );

      // Act
      await rankingController.getCategoryBasedRanking(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to get category rankings' });
    });
  });

  describe('updateRankingsAfterMatch', () => {
    it('should update rankings after match with 200 status code on success', async () => {
      // Arrange
      mockRequest.params = { matchId: mockMatchId };
      const mockResult: UpdateRankingsAfterMatchOutput = {
        matchId: mockMatchId,
        playersUpdated: ['player-1', 'player-2']
      };
      
      mockUpdateRankingsAfterMatchUseCase.execute.mockResolvedValue(
        createSuccessResult(mockResult)
      );

      // Act
      await rankingController.updateRankingsAfterMatch(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockUpdateRankingsAfterMatchUseCase.execute).toHaveBeenCalledWith({
        matchId: mockMatchId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle not found with 404 status code', async () => {
      // Arrange
      mockRequest.params = { matchId: mockMatchId };
      const error = new Error('Match not found');
      mockUpdateRankingsAfterMatchUseCase.execute.mockResolvedValue(
        createFailureResult(error)
      );

      // Act
      await rankingController.updateRankingsAfterMatch(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Match not found' });
    });

    it('should handle validation failures with 400 status code', async () => {
      // Arrange
      mockRequest.params = { matchId: mockMatchId };
      const error = new Error('Cannot update rankings for a match that is not completed');
      mockUpdateRankingsAfterMatchUseCase.execute.mockResolvedValue(
        createFailureResult(error)
      );

      // Act
      await rankingController.updateRankingsAfterMatch(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Cannot update rankings for a match that is not completed' });
    });
  });

  describe('calculatePlayerRankings', () => {
    it('should calculate rankings for all players with 200 status code on success', async () => {
      // Arrange
      const mockRankings = [
        createMockRanking('player-1', PlayerLevel.P1, 1),
        createMockRanking('player-2', PlayerLevel.P1, 2)
      ];
      
      const mockResult: CalculatePlayerRankingsOutput = {
        updatedRankings: mockRankings
      };
      
      mockCalculatePlayerRankingsUseCase.execute.mockResolvedValue(
        createSuccessResult(mockResult)
      );

      // Act
      await rankingController.calculatePlayerRankings(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockCalculatePlayerRankingsUseCase.execute).toHaveBeenCalledWith({
        playerId: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should calculate rankings for specific player with 200 status code on success', async () => {
      // Arrange
      mockRequest.body = { playerId: mockPlayerId };
      
      const mockRanking = createMockRanking(mockPlayerId, PlayerLevel.P1);
      
      const mockResult: CalculatePlayerRankingsOutput = {
        updatedRankings: [mockRanking]
      };
      
      mockCalculatePlayerRankingsUseCase.execute.mockResolvedValue(
        createSuccessResult(mockResult)
      );

      // Act
      await rankingController.calculatePlayerRankings(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockCalculatePlayerRankingsUseCase.execute).toHaveBeenCalledWith({
        playerId: mockPlayerId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle player not found with 404 status code', async () => {
      // Arrange
      mockRequest.body = { playerId: mockPlayerId };
      const error = new Error('Player not found');
      mockCalculatePlayerRankingsUseCase.execute.mockResolvedValue(
        createFailureResult(error)
      );

      // Act
      await rankingController.calculatePlayerRankings(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Player not found' });
    });

    it('should handle statistics not found with 404 status code', async () => {
      // Arrange
      mockRequest.body = { playerId: mockPlayerId };
      const error = new Error('Statistics not found for this player');
      mockCalculatePlayerRankingsUseCase.execute.mockResolvedValue(
        createFailureResult(error)
      );

      // Act
      await rankingController.calculatePlayerRankings(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Statistics not found for this player' });
    });
  });

  describe('Legacy Methods', () => {
    it('getRankings should provide same functionality as getGlobalRankingList', async () => {
      // Arrange
      const mockRanking = createMockRanking(mockPlayerId, PlayerLevel.P1);
      const mockPlayer = createMockPlayer(mockPlayerId, 'Test Player');
      
      // Add player to the ranking
      const rankingWithPlayer = { ...mockRanking, player: mockPlayer };

      const mockPagination = {
        total: 1,
        limit: 10,
        offset: 0,
        hasMore: false,
      };

      const mockResult = {
        rankings: [rankingWithPlayer as Ranking & { player?: Player }],
        pagination: mockPagination,
      };

      mockGetGlobalRankingListUseCase.execute.mockResolvedValue(
        createSuccessResult(mockResult)
      );

      // Act
      await rankingController.getRankings(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockGetGlobalRankingListUseCase.execute).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        playerLevel: undefined,
        sortBy: 'globalPosition',
        sortOrder: 'asc',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('getRankingsByCategory should provide same functionality as getCategoryBasedRanking', async () => {
      // Arrange
      const mockRanking = createMockRanking(mockPlayerId, PlayerLevel.P1);
      const mockPlayer = createMockPlayer(mockPlayerId, 'Test Player');
      
      // Add player to the ranking
      const rankingWithPlayer = { ...mockRanking, player: mockPlayer };

      const mockPagination = {
        total: 1,
        limit: 10,
        offset: 0,
        hasMore: false,
      };

      const mockResult = {
        rankings: [rankingWithPlayer as Ranking & { player?: Player }],
        pagination: mockPagination,
        playerLevel: PlayerLevel.P1,
      };

      mockRequest.params = { categoryId: PlayerLevel.P1 };

      mockGetCategoryBasedRankingUseCase.execute.mockResolvedValue(
        createSuccessResult(mockResult)
      );
      
      // Act
      await rankingController.getRankingsByCategory(
        mockRequest as ContainerRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockGetCategoryBasedRankingUseCase.execute).toHaveBeenCalledWith({
        playerLevel: PlayerLevel.P1,
        limit: 10,
        offset: 0,
        sortBy: 'categoryPosition',
        sortOrder: 'asc',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });
}); 