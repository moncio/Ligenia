import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Award, Percent, Calendar, CalendarIcon } from "lucide-react";
import { useCurrentPlayer } from "@/hooks/api/usePlayer";
import { useCurrentUserRanking } from "@/hooks/api/useRankings";
import { useUserStatistics, useMockPlayerStatistics } from "@/hooks/api/useStatistics";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { useMemo, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlayerStatistic {
  id: string;
  tournamentId: string;
  userId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  rank: number;
  tournament: {
    id: string;
    name: string;
    category: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PlayerStatisticsResponse {
  status: string;
  data: {
    statistics: PlayerStatistic[];
  };
}

interface PlayerData {
  player: {
    id: string;
    name: string;
    level: string;
    userId: string;
    avatar?: string;
  };
}

interface UserData {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const UserStatistics = () => {
  const { userId: urlUserId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isViewingOtherPlayer = !!urlUserId;
  
  // Get state passed from rankings table if available
  const playerFromState = location.state as { 
    playerName?: string;
    playerRank?: number;
    playerPoints?: number;
  } | null;
  
  // Tab state for match history
  const [activeTab, setActiveTab] = useState("performance");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2].map(y => y.toString());
  }, []);
  
  // Get auth state from context
  const { user, loading: isLoadingAuth } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      navigate('/login');
    }
  }, [isLoadingAuth, user, navigate]);

  // Obtener información del jugador que se está viendo (puede ser el actual u otro)
  const targetUserId = isViewingOtherPlayer ? urlUserId : user?.id;

  // Use mock player statistics with data passed from rankings table if available
  const { 
    data: playerStatsMockData, 
    isLoading: isLoadingPlayerStatsMock,
    isError: isErrorPlayerStatsMock
  } = useMockPlayerStatistics(
    targetUserId || '',
    playerFromState?.playerName,
    playerFromState?.playerRank,
    playerFromState?.playerPoints,
    { 
      enabled: !!targetUserId && !isLoadingAuth,
      queryKey: ["playerStatisticsMock", targetUserId]
    }
  );

  // Combinar loading states
  const isInitialLoading = isLoadingAuth || isLoadingPlayerStatsMock;
    
  // Combinar error states
  const hasError = isErrorPlayerStatsMock;

  // Debug logging
  console.log('Target User ID:', targetUserId);
  console.log('Player Data from State:', playerFromState);
  console.log('Mock Player Statistics Data:', playerStatsMockData);

  // Show loading state while checking auth
  if (isLoadingAuth) {
    return (
      <DashboardLayout>
        <div className="w-full px-4 sm:px-6 py-8">
          <Skeleton className="h-8 w-[200px] mb-4" />
          <Skeleton className="h-4 w-[300px] mb-8" />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[100px]" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // Show error if not authenticated
  if (!user) {
    return (
      <DashboardLayout>
        <div className="w-full px-4 sm:px-6 py-8">
          <ErrorMessage message="Por favor inicia sesión para ver las estadísticas" />
        </div>
      </DashboardLayout>
    );
  }

  // Show loading state while fetching player data
  if (isLoadingPlayerStatsMock) {
    return (
      <DashboardLayout>
        <div className="w-full px-4 sm:px-6 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-[300px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-[80px] mb-1" />
                  <Skeleton className="h-4 w-[140px]" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-[300px] w-full mb-8" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Extract player data from mock data
  const playerName = playerStatsMockData?.data?.player?.name || 'Jugador';
  const playerLevel = playerStatsMockData?.data?.player?.level || 'P3';
  
  // Extract statistics
  const playerStats = playerStatsMockData?.data?.statistics || {};
  const totalMatches = playerStats.totalMatches || 0;
  const wins = playerStats.wins || 0;
  const losses = playerStats.losses || 0;
  const totalPoints = playerStats.totalPoints || 0;
  const winRate = playerStats.winRate || 0;
  const rank = playerStats.rank || 0;
  
  // Format ranking display
  const rankingDisplay = rank > 0 ? `#${rank}` : 'Sin clasificar';
  
  // Filter match history by selected year
  const filteredMatches = playerStats.matchHistory?.filter((match: any) => {
    return new Date(match.date).getFullYear().toString() === selectedYear;
  }) || [];

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              Estadísticas - {playerName}
              <Badge 
                variant={
                  playerLevel === "P1" ? "default" : 
                  playerLevel === "P2" ? "secondary" : 
                  "outline"
                }
                className="ml-2"
              >
                {playerLevel}
              </Badge>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Resumen de rendimiento y estadísticas
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {/* Tarjeta 1: Ranking */}
          <Card className="overflow-hidden border bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent hover:from-blue-500/20 hover:via-blue-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ranking Global</CardTitle>
              <Trophy className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {rankingDisplay}
              </div>
              <p className="text-xs text-muted-foreground">
                Nivel: {playerLevel}
              </p>
            </CardContent>
          </Card>
          
          {/* Tarjeta 2: Puntuación */}
          <Card className="overflow-hidden border bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent hover:from-purple-500/20 hover:via-purple-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Puntuación</CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">
                {totalPoints}
              </div>
              <p className="text-xs text-muted-foreground">
                Puntos acumulados en {totalMatches} partidos
              </p>
            </CardContent>
          </Card>
          
          {/* Tarjeta 3: Porcentaje de victorias */}
          <Card className="overflow-hidden border bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent hover:from-green-500/20 hover:via-green-500/10 transition-all duration-300 sm:col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Victorias</CardTitle>
              <Percent className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {winRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                {wins} victorias, {losses} derrotas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Performance and Match History */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="performance">Rendimiento</TabsTrigger>
                <TabsTrigger value="matches">Historial de Partidos</TabsTrigger>
              </TabsList>
              
              {activeTab === "matches" && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Año:</span>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder={selectedYear} />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <TabsContent value="performance" className="space-y-6">
              <div className="bg-card border rounded-lg p-6 overflow-hidden">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Rendimiento Mensual
                </h2>
                <div className="overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="min-w-[800px] h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={playerStats.monthlyPerformance || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis 
                          dataKey="month" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70} 
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                        />
                        <YAxis 
                          width={40}
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--background)', 
                            borderColor: 'var(--border)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}
                          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                          itemStyle={{ padding: '2px 0' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '10px' }}
                          formatter={(value) => <span style={{ fontSize: '12px', color: 'var(--foreground)' }}>{value}</span>}
                        />
                        <Bar 
                          dataKey="wins" 
                          name="Victorias" 
                          fill="#22c55e" 
                          radius={[4, 4, 0, 0]} 
                          barSize={30}
                          opacity={0.85}
                        />
                        <Bar 
                          dataKey="losses" 
                          name="Derrotas" 
                          fill="#ef4444" 
                          radius={[4, 4, 0, 0]} 
                          barSize={30}
                          opacity={0.85}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="pt-2 text-center text-xs text-muted-foreground md:hidden">
                  Desliza horizontalmente para ver el gráfico completo
                </div>
              </div>
            </TabsContent>

            <TabsContent value="matches" className="space-y-4">
              {filteredMatches.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-lg border">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No hay partidos registrados</h3>
                  <p className="text-sm text-muted-foreground">
                    No se encontraron partidos para el año {selectedYear}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <Table className="min-w-[800px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[10%] min-w-[90px]">Fecha</TableHead>
                          <TableHead className="w-[25%] min-w-[200px]">Torneo</TableHead>
                          <TableHead className="w-[15%] min-w-[140px]">Ronda</TableHead>
                          <TableHead className="w-[20%] min-w-[100px]">Oponente</TableHead>
                          <TableHead className="text-center w-[20%] min-w-[150px]">Resultado</TableHead>
                          <TableHead className="text-right w-[10%] min-w-[70px]">Puntos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMatches.map((match: any) => {
                          // Extract category from tournament name (P1, P2, P3)
                          const tournamentCategory = match.tournamentName.match(/P[1-3]/) 
                            ? match.tournamentName.match(/P[1-3]/)[0] 
                            : '';
                          
                          // Format the score for better display
                          const scoreArray = match.score.split(', ');
                          const formattedScoreSets = scoreArray.map((set: string, index: number) => (
                            <span 
                              key={index} 
                              className={`px-1.5 py-0.5 rounded ${index === scoreArray.length - 1 ? 'font-medium' : ''}`}
                            >
                              {set}
                            </span>
                          ));
                            
                          return (
                            <TableRow key={match.id} className="group transition-colors hover:bg-muted/50">
                              <TableCell className="font-medium whitespace-nowrap">{match.date}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="truncate max-w-[180px]">{match.tournamentName}</span>
                                  {tournamentCategory && (
                                    <Badge 
                                      variant={
                                        tournamentCategory === "P1" ? "default" : 
                                        tournamentCategory === "P2" ? "secondary" : 
                                        "outline"
                                      }
                                      className="text-xs shrink-0"
                                    >
                                      {tournamentCategory}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`text-sm font-medium px-2 py-1 rounded-md whitespace-nowrap inline-block ${
                                  match.round === "Final" 
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" 
                                  : match.round === "Semifinal" 
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  : match.round === "Cuartos de final"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                  : "bg-muted/50 text-muted-foreground"
                                }`}>
                                  {match.round}
                                </span>
                              </TableCell>
                              <TableCell className="truncate max-w-[120px]">{match.opponent}</TableCell>
                              <TableCell>
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <Badge 
                                    variant={match.result === 'Victoria' ? 'success' : 'destructive'}
                                    className="w-20 justify-center"
                                  >
                                    {match.result}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs font-mono mt-1">
                                    {formattedScoreSets}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <span className={`font-medium ${match.result === 'Victoria' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {match.result === 'Victoria' ? '+' : ''}
                                  {match.points}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="p-2 text-center text-xs text-muted-foreground md:hidden">
                    Desliza horizontalmente para ver todos los datos
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserStatistics;
