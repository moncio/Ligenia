export interface PlayerStatistics {
  currentRanking: number;
  estimatedLevel: string;
  totalPoints: number;
  averagePointsPerMatch: number;
  winRate: string;
  wins: number;
  losses: number;
  totalMatches: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  homePlayerOneId: string;
  homePlayerTwoId: string;
  awayPlayerOneId: string;
  awayPlayerTwoId: string;
  round: number;
  date: string;
  location: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  homeScore: number | null;
  awayScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MatchHistory {
  matches: Match[];
}

export interface PerformanceData {
  month: string;
  victories: number;
  defeats: number;
}

export interface PerformanceHistory {
  performanceData: PerformanceData[];
}

export interface StatisticsResponse {
  status: string;
  data: {
    userId?: string;
    statistics: PlayerStatistics;
  };
}

export interface MatchHistoryResponse {
  status: string;
  data: {
    matches: Match[];
  };
}

export interface PerformanceHistoryResponse {
  status: string;
  data: {
    history: {
      date: string;
      points: number;
      currentRanking: number;
    }[];
  };
} 