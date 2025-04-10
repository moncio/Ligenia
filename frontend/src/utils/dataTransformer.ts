/**
 * Transforms raw statistics data from the backend to a format expected by the frontend
 */
export function transformPlayerStatistics(statsArray: any[]) {
  if (!Array.isArray(statsArray)) {
    console.error('Expected statistics array but received:', statsArray);
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      totalPoints: 0,
      currentRanking: 'N/A',
      estimatedLevel: 'P3',
      winRate: '0%',
      averagePointsPerMatch: 0
    };
  }
  
  // Initialize aggregates
  let totalMatches = 0;
  let wins = 0;
  let losses = 0;
  let totalPoints = 0;
  let currentRanking = 9999;
  
  // Aggregate statistics from all tournaments
  statsArray.forEach(stat => {
    totalMatches += stat.matchesPlayed || 0;
    wins += stat.wins || 0;
    losses += stat.losses || 0;
    totalPoints += stat.points || 0;
    
    // Get best rank (lowest number is better)
    if (stat.rank && stat.rank < currentRanking && stat.rank > 0) {
      currentRanking = stat.rank;
    }
  });
  
  // If no real rank found, set to N/A
  if (currentRanking === 9999) {
    currentRanking = 'N/A';
  }
  
  // Get estimated level from first tournament or default to 'P3'
  const estimatedLevel = statsArray[0]?.tournament?.category || 'P3';
  
  // Calculate derived statistics
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) + '%' : '0%';
  const averagePointsPerMatch = totalMatches > 0 ? parseFloat((totalPoints / totalMatches).toFixed(2)) : 0;
  
  return {
    totalMatches,
    wins,
    losses,
    totalPoints,
    currentRanking,
    estimatedLevel,
    winRate,
    averagePointsPerMatch
  };
} 