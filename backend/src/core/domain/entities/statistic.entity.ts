/**
 * Entidad Statistic que representa las estadísticas de un jugador en un torneo
 */
export class Statistic {
  id: string;
  playerId: string;
  tournamentId: string;
  points: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  aces: number;
  doubleFaults: number;
  breakPointsSaved: number;
  breakPointsFaced: number;
  firstServePercentage?: number;
  secondServePercentage?: number;
  winningPercentage?: number;
  performanceRating?: number;
  advancedStats?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    playerId: string;
    tournamentId: string;
    points?: number;
    wins?: number;
    losses?: number;
    setsWon?: number;
    setsLost?: number;
    gamesWon?: number;
    gamesLost?: number;
    aces?: number;
    doubleFaults?: number;
    breakPointsSaved?: number;
    breakPointsFaced?: number;
    firstServePercentage?: number;
    secondServePercentage?: number;
    winningPercentage?: number;
    performanceRating?: number;
    advancedStats?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.playerId = data.playerId;
    this.tournamentId = data.tournamentId;
    this.points = data.points ?? 0;
    this.wins = data.wins ?? 0;
    this.losses = data.losses ?? 0;
    this.setsWon = data.setsWon ?? 0;
    this.setsLost = data.setsLost ?? 0;
    this.gamesWon = data.gamesWon ?? 0;
    this.gamesLost = data.gamesLost ?? 0;
    this.aces = data.aces ?? 0;
    this.doubleFaults = data.doubleFaults ?? 0;
    this.breakPointsSaved = data.breakPointsSaved ?? 0;
    this.breakPointsFaced = data.breakPointsFaced ?? 0;
    this.firstServePercentage = data.firstServePercentage;
    this.secondServePercentage = data.secondServePercentage;
    this.winningPercentage = data.winningPercentage;
    this.performanceRating = data.performanceRating;
    this.advancedStats = data.advancedStats;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  /**
   * Valida que los datos de las estadísticas sean correctos
   * @throws Error si los datos no son válidos
   */
  validate(): void {
    if (!this.playerId) {
      throw new Error('El jugador es obligatorio');
    }

    if (!this.tournamentId) {
      throw new Error('El torneo es obligatorio');
    }

    if (this.points < 0) {
      throw new Error('Los puntos no pueden ser negativos');
    }

    if (this.wins < 0) {
      throw new Error('Las victorias no pueden ser negativas');
    }

    if (this.losses < 0) {
      throw new Error('Las derrotas no pueden ser negativas');
    }

    if (this.setsWon < 0) {
      throw new Error('Los sets ganados no pueden ser negativos');
    }

    if (this.setsLost < 0) {
      throw new Error('Los sets perdidos no pueden ser negativos');
    }
  }

  /**
   * Calcula el porcentaje de victorias
   * @returns Porcentaje de victorias o undefined si no hay partidos jugados
   */
  calculateWinningPercentage(): number | undefined {
    const totalMatches = this.wins + this.losses;
    if (totalMatches === 0) return undefined;
    return (this.wins / totalMatches) * 100;
  }

  /**
   * Actualiza el porcentaje de victorias
   */
  updateWinningPercentage(): void {
    this.winningPercentage = this.calculateWinningPercentage();
  }
} 