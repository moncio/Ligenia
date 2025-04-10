import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Trophy, Users, Calendar, CheckCircle, XCircle, Info, Search, Filter, Award, BarChart, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useCurrentPlayerStats } from "@/hooks/api/usePlayer";
import { useUserStatisticsForCurrentUser } from "@/hooks/api/useStatistics";
import { useCurrentPlayerTournaments, useTournamentBracket, useRegisterForTournament, useActiveTournaments } from "@/hooks/api/useTournament";
import { useCurrentPlayerMatches } from "@/hooks/api/useMatch";
import { useCurrentUserRanking } from "@/hooks/api/useRankings";
import { TournamentWithStatus } from "@/lib/api/services/tournamentService";
import { Match } from "@/lib/api/services/matchService";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ErrorMessage } from "@/components/ui/error-message";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [selectedTournament, setSelectedTournament] = useState<TournamentWithStatus | null>(null);
  const [showBracket, setShowBracket] = useState(false);
  
  // Contexto de autenticación
  const authContext = useAuth();
  const currentUserId = authContext?.user?.id || "5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc";

  // Datos de la API - Estadísticas del jugador
  const { 
    data: statsData, 
    isLoading: isStatsLoading, 
    isError: isStatsError 
  } = useCurrentPlayerStats();
  
  // Datos de la API - Estadísticas de victorias del usuario
  const {
    data: userStatsData,
    isLoading: isUserStatsLoading,
    isError: isUserStatsError
  } = useUserStatisticsForCurrentUser();
  
  // Datos de la API - Ranking del usuario
  const {
    data: rankingData,
    isLoading: isRankingLoading,
    isError: isRankingError
  } = useCurrentUserRanking();
  
  // Datos de la API - Torneos activos
  const { 
    data: activeTournamentsData, 
    isLoading: isActiveTournamentsLoading, 
    isError: isActiveTournamentsError,
    refetch: refetchActiveTournaments
  } = useActiveTournaments();
  
  // Estado para el filtro de partidos
  const [matchFilter, setMatchFilter] = useState<'todos' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('todos');
  
  // Mapear el filtro UI a los estados de la API
  const getMatchStatusForFilter = (filter: string): 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | undefined => {
    switch (filter) {
      case 'COMPLETED': return 'COMPLETED';
      case 'PENDING': return 'PENDING';
      case 'CANCELLED': return 'CANCELLED';
      case 'IN_PROGRESS': return 'IN_PROGRESS';
      default: return undefined;
    }
  };
  
  // Datos de la API - Partidos recientes (con paginación)
  const [matchesPage, setMatchesPage] = useState(1);
  const matchStatus = getMatchStatusForFilter(matchFilter);
  const { 
    data: matchesData, 
    isLoading: isMatchesLoading, 
    isError: isMatchesError,
    refetch: refetchMatches
  } = useCurrentPlayerMatches(
    10,                    // limit: Partidos por página
    matchStatus,          // status: Estado filtrado (o undefined para todos)
    matchesPage           // page: Página actual
  );

  useEffect(() => {
    // Añadir log adicional para verificar qué datos de partidos estamos recibiendo
    console.log('🔎 Dashboard received matches data:', matchesData);
  }, [matchesData]);
  
  // Handler para cambiar de página
  const handlePageChange = (page: number) => {
    setMatchesPage(page);
  };
  
  // Bracket del torneo seleccionado
  const { 
    data: bracketData, 
    isLoading: isBracketLoading,
    isError: isBracketError,
    refetch: refetchBracket
  } = useTournamentBracket(
    selectedTournament?.id || '', 
    { 
      enabled: showBracket && !!selectedTournament,
      queryKey: ['tournament', 'bracket', selectedTournament?.id] 
    }
  );

  // Mutación para registrarse en un torneo
  const registerMutation = useRegisterForTournament();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Extraer datos de las respuestas API
  const userStats = statsData?.data?.statistics || {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: "0%",
    currentRanking: 0,
    estimatedLevel: "Principiante"
  };

  // Extraer datos de victorias del usuario directamente de la respuesta
  // Basado en la estructura vista en la respuesta curl: data.statistics
  const userVictoryStats = userStatsData?.data?.statistics || {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    averagePoints: 0
  };

  // Log para verificar los datos en la estructura exacta
  console.log('Dashboard - Raw userStatsData:', userStatsData);
  console.log('Dashboard - Raw activeTournamentsData:', activeTournamentsData);
  console.log('Dashboard - matches query state:', { 
    isLoading: isMatchesLoading, 
    isError: isMatchesError, 
    matchesData,
    matchesFilterStatus: matchStatus,
    matchesPage
  });
  console.log('Dashboard - Auth context:', authContext);
  
  // Extraer torneos activos de la respuesta de la API usando la misma estructura que Competitions.tsx
  const activeTournaments = activeTournamentsData?.data?.tournaments || [];
  const recentMatches = matchesData?.data?.matches || [];
  const matchesPagination = matchesData?.data?.pagination;
  const bracketRounds = bracketData?.data?.bracket?.rounds || [];
  
  // Log de partidos filtrados
  console.log('Dashboard - recentMatches (raw):', recentMatches);
  console.log('Dashboard - matchesPagination:', matchesPagination);
  console.log('Dashboard - matchesData completo:', matchesData);
  
  // Función para forzar la actualización de datos
  const handleRefresh = () => {
    console.log('Forzando actualización de datos...');
    refetchMatches();
  };
  
  // Filtrar partidos según el selector
  const filteredMatches = useMemo(() => {
    // Mostrar los partidos que ya vienen filtrados del backend
    console.log('🔍 [Dashboard] Matches recibidos para filtrar:', recentMatches);
    // Revisar longitud
    console.log('🔍 [Dashboard] Cantidad de partidos recibidos:', recentMatches?.length);
    // Revisar qué datos tiene
    console.log('🔍 [Dashboard] Datos completos recibidos:', matchesData);
    
    if (recentMatches.length > 0) {
      console.log('🔍 [Dashboard] Campos del primer partido:', 
        Object.keys(recentMatches[0]).join(', '));
      console.log('🔍 [Dashboard] Valores del primer partido:', recentMatches[0]);
    }
    return recentMatches;
  }, [recentMatches, matchesData]);

  // Usar la paginación directamente del backend sin limitaciones artificiales
  const totalMatches = matchesPagination?.totalItems || 0;
  const totalPages = matchesPagination?.totalPages || 1;
  const currentPage = matchesPagination?.currentPage || matchesPage;
  const hasNextPage = matchesPagination?.hasNextPage || false;
  const hasPreviousPage = matchesPagination?.hasPreviousPage || false;

  const handleTournamentClick = (tournament: TournamentWithStatus) => {
    setSelectedTournament(tournament);
  };

  const getCategoryBadgeVariant = (category?: string) => {
    switch(category) {
      case 'P1': return 'secondary';
      case 'P2': return 'warning';
      case 'P3': return 'info';
      default: return 'default';
    }
  };

  const handleInscripcionTorneo = async () => {
    if (selectedTournament) {
      try {
        registerMutation.mutate(selectedTournament.id, {
          onSuccess: (data) => {
            toast({
              title: "Éxito",
              description: "Te has inscrito correctamente en el torneo",
              variant: "default"
            });
            setSelectedTournament(null);
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: "No se pudo completar la inscripción",
              variant: "destructive"
            });
          }
        });
      } catch (error) {
        console.error('Error al inscribirse en el torneo:', error);
      }
    }
  };

  const isInscripcionAbierta = (tournament?: TournamentWithStatus) => {
    if (!tournament) return false;
    
    // Si ya está registrado o si el torneo no está abierto, no se permite inscripción
    if (tournament.userStatus === 'REGISTERED' || tournament.userStatus === 'ACTIVE') {
      return false;
    }
    
    // Verificar si el torneo está abierto para inscripciones
    return tournament.status === 'DRAFT';
  };

  const handleVerBracket = () => {
    setShowBracket(true);
  };

  // Función para obtener una representación de texto del resultado de un partido
  const getMatchResult = (match: Match) => {
    if (!match) return "Programado";
    
    // Determinar en qué equipo está el usuario actual
    const isUserInHomeTeam = match.homePlayerOneId === currentUserId || match.homePlayerTwoId === currentUserId;
    const isUserInAwayTeam = match.awayPlayerOneId === currentUserId || match.awayPlayerTwoId === currentUserId;
    
    if (match.status === 'COMPLETED') {
      // Para partidos completados con puntuación
      if (match.homeScore !== null && match.awayScore !== null) {
        if (isUserInHomeTeam) {
          return match.homeScore > match.awayScore ? "Victoria" : "Derrota";
        }
        if (isUserInAwayTeam) {
          return match.awayScore > match.homeScore ? "Victoria" : "Derrota";
        }
      }
      
      // Si hay un ganador definido
      if (match.winner) {
        const isWinner = match.winner === currentUserId || 
                         (isUserInHomeTeam && match.winner === 'home') || 
                         (isUserInAwayTeam && match.winner === 'away');
        return isWinner ? "Victoria" : "Derrota";
      }
      
      return "Completado";
    } else if (match.status === 'CANCELLED') {
      return "Cancelado";
    } else if (match.status === 'IN_PROGRESS') {
      return "En curso";
    } else {
      return "Pendiente";
    }
  };
  
  // Función para determinar el nombre del oponente basado en quién es el jugador actual
  const getOpponentName = (match: Match) => {
    if (!match) return "Oponente";
    
    // Para esta versión simplificada, mostraremos el tipo de partido según su ubicación
    if (match.homePlayerOneId === currentUserId || match.homePlayerTwoId === currentUserId) {
      return "Equipo visitante";
    } else if (match.awayPlayerOneId === currentUserId || match.awayPlayerTwoId === currentUserId) {
      return "Equipo local";
    } else if (match.player1Id === currentUserId) {
      return "Contrincante";
    } else if (match.player2Id === currentUserId) {
      return "Contrincante";
    }
    
    // Si no podemos determinar, mostrar un genérico
    return "Oponente";
  };

  return (
    <DashboardLayout>
      <div className="px-4 md:px-6 py-6 md:py-8 w-full">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-foreground mb-6 md:mb-8 transition-opacity duration-500 ease-in-out opacity-100">
            Mi Jugador
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 transition-all duration-500 ease-in-out w-full">
            <Card className="relative overflow-hidden border bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent hover:from-blue-500/20 hover:via-blue-500/10 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardDescription>Ranking Actual</CardDescription>
                {isRankingLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : isRankingError ? (
                <CardTitle className="text-3xl flex items-center text-blue-500">
                  #--
                  <Trophy className="ml-auto h-5 w-5 text-blue-500" />
                </CardTitle>
                ) : (
                <CardTitle className="text-3xl flex items-center text-blue-500">
                  #{rankingData?.data?.position || '--'}
                  <Trophy className="ml-auto h-5 w-5 text-blue-500" />
                </CardTitle>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Basado en resultados en torneos oficiales
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden border bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent hover:from-green-500/20 hover:via-green-500/10 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardDescription>Porcentaje de Victorias</CardDescription>
                <CardTitle className="text-3xl flex items-center text-green-500">
                  72%
                  <BarChart className="ml-auto h-5 w-5 text-green-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    13 victorias / 5 derrotas
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden border bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent hover:from-purple-500/20 hover:via-purple-500/10 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardDescription>Nivel Estimado</CardDescription>
                <CardTitle className="text-3xl flex items-center text-purple-500">
                  Intermedio
                  <Award className="ml-auto h-5 w-5 text-purple-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Basado en rendimiento y habilidades
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    Torneos Activos
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    </CardTitle>
                </div>
                <CardDescription>
                  Lista de torneos en estado activo en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isActiveTournamentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-16 w-full" />
                    ))}
                  </div>
                ) : isActiveTournamentsError ? (
                  <ErrorMessage 
                    message="Error al cargar los torneos. Intenta nuevamente." 
                    onRetry={() => refetchActiveTournaments()} 
                    title="No se pudieron cargar los torneos"
                  />
                ) : activeTournaments.length === 0 ? (
                  <ErrorMessage 
                    message="No hay torneos activos en este momento" 
                    showRetry={false}
                    variant="info"
                    icon={<Calendar className="h-10 w-10 mb-2 text-blue-500" />}
                  />
                ) : (
                  <div className="space-y-4">
                    {activeTournaments.map((tournament) => (
                      <div 
                        key={tournament.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => handleTournamentClick(tournament)}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{tournament.name}</span>
                            <Badge variant={getCategoryBadgeVariant(tournament.category)}>
                              {tournament.category}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                          </div>
                          {tournament.location && (
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {tournament.location}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">
                          ACTIVO
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-md font-bold">
                    PARTIDOS RECIENTES
                    </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={matchFilter} onValueChange={(value: any) => setMatchFilter(value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="COMPLETED">Completados</SelectItem>
                        <SelectItem value="PENDING">Pendientes</SelectItem>
                        <SelectItem value="IN_PROGRESS">En curso</SelectItem>
                        <SelectItem value="CANCELLED">Cancelados</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={handleRefresh} title="Actualizar datos">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isMatchesLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : isMatchesError ? (
                    <ErrorMessage 
                      message="Error al cargar los partidos. Intenta nuevamente." 
                      onRetry={() => refetchMatches()} 
                      title="No se pudieron cargar los partidos"
                    />
                  ) : (!filteredMatches || filteredMatches.length === 0) ? (
                    <ErrorMessage 
                      message={`No hay partidos ${matchFilter !== 'todos' ? 
                        (matchFilter === 'COMPLETED' ? 'completados' : 
                         matchFilter === 'PENDING' ? 'pendientes' : 
                         matchFilter === 'IN_PROGRESS' ? 'en curso' : 
                         matchFilter === 'CANCELLED' ? 'cancelados' : '') 
                        : ''} en este momento`}
                      showRetry={true}
                      onRetry={() => refetchMatches()}
                      variant="info"
                      icon={<Users className="h-10 w-10 mb-2 text-blue-500" />}
                    />
                  ) : (
                    <div>
                      <div className="overflow-y-auto scrollbar-thin">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Torneo</TableHead>
                              <TableHead>Oponente</TableHead>
                              <TableHead>Resultado</TableHead>
                              <TableHead>Fecha</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredMatches.map((match) => {
                              // Determinar el estado del partido según su status
                              let statusText = "Pendiente";
                              let statusColor = "text-blue-600 dark:text-blue-400";
                              
                              if (match.status === "COMPLETED") {
                                statusText = "Completado";
                                statusColor = "text-green-600 dark:text-green-400";
                              } else if (match.status === "IN_PROGRESS") {
                                statusText = "En curso";
                                statusColor = "text-yellow-600 dark:text-yellow-400";
                              } else if (match.status === "CANCELLED") {
                                statusText = "Cancelado";
                                statusColor = "text-red-600 dark:text-red-400";
                              } else if (match.status === "PENDING") {
                                statusText = "Pendiente";
                                statusColor = "text-blue-600 dark:text-blue-400";
                              }
                              
                              // Formatear la fecha
                              let formattedDate = "Fecha no disponible";
                              if (match.date) {
                                try {
                                  const date = new Date(match.date);
                                  formattedDate = date.toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  });
                                } catch (e) {
                                  console.error('Error formateando fecha:', e);
                                }
                              }
                              
                              // Determinar si el usuario actual está en el equipo local o visitante
                              const isUserInHomeTeam = match.homePlayerOneId === currentUserId || match.homePlayerTwoId === currentUserId;
                              const isUserInAwayTeam = match.awayPlayerOneId === currentUserId || match.awayPlayerTwoId === currentUserId;
                              
                              // Determinar resultado del partido para el usuario
                              let result = statusText;
                              if (match.status === "COMPLETED" && match.homeScore !== null && match.awayScore !== null) {
                                if (isUserInHomeTeam) {
                                  result = match.homeScore > match.awayScore ? "Victoria" : "Derrota";
                                } else if (isUserInAwayTeam) {
                                  result = match.awayScore > match.homeScore ? "Victoria" : "Derrota";
                                }
                              }
                              
                              // Obtener nombre del oponente
                              const opponent = getOpponentName(match);
                              
                              // Log individual de este partido para depuración
                              console.log(`🔍 Partido ${match.id}:`, {
                                tournamentName: match.tournamentName,
                                tournamentId: match.tournamentId,
                                status: match.status,
                                opponent,
                                result
                              });
                              
                              // Determinar color del resultado
                              let resultColor = statusColor;
                              if (result === "Victoria") {
                                resultColor = "text-green-600 dark:text-green-400";
                              } else if (result === "Derrota") {
                                resultColor = "text-red-600 dark:text-red-400";
                              }
                              
                              return (
                                <TableRow key={match.id}>
                                  <TableCell>
                                    <div className="font-medium text-primary">
                                      {match.tournamentName || `Torneo ${match.tournamentId ? match.tournamentId.substring(0, 8) + '...' : ''}`}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      ID: {match.id.substring(0, 8)}...
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">
                                      {opponent}
                                    </div>
                                    {match.location && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {match.location}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className={`font-medium ${resultColor}`}>
                                    {result}
                                    {match.status === "COMPLETED" && match.homeScore !== null && match.awayScore !== null && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {match.homeScore} - {match.awayScore}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex flex-col items-end justify-center">
                                      <span className={`font-bold ${statusColor}`}>
                                        {statusText}
                                      </span>
                                      <span className="text-xs text-muted-foreground mt-1">
                                        {formattedDate}
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Añadir un indicador del número de partidos */}
                      {matchesPagination && (
                        <div className="mt-3 text-xs text-muted-foreground text-center">
                          Mostrando {filteredMatches.length} {filteredMatches.length === 1 ? 'partido' : 'partidos'} 
                          {totalMatches > 0 ? ` de ${totalMatches} total` : ''}
                          {matchFilter !== 'todos' ? ` (filtro: ${matchFilter})` : ''}
                          <div className="mt-1 font-medium">
                            Página {currentPage} de {totalPages}
                          </div>
                          <div className="mt-1 text-xs text-blue-500">
                            La paginación muestra 5 partidos por página
                          </div>
                        </div>
                      )}
                      
                      {totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                          <Pagination>
                            <PaginationContent>
                              {hasPreviousPage && (
                                <PaginationItem>
                                  <PaginationPrevious 
                                    onClick={() => handlePageChange(matchesPage - 1)} 
                                    className="cursor-pointer" 
                                  />
                                </PaginationItem>
                              )}
                              
                              {(() => {
                                // Calculamos cuántas páginas mostrar
                                const maxVisiblePages = 5;
                                const pages = [];
                                let startPage = Math.max(1, matchesPage - Math.floor(maxVisiblePages / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                
                                // Ajustar startPage si estamos cerca del final
                                if (endPage - startPage < maxVisiblePages - 1) {
                                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                }
                                
                                // Mostrar primera página si no está en el rango
                                if (startPage > 1) {
                                  pages.push(
                                    <PaginationItem key={1}>
                                      <PaginationLink 
                                        onClick={() => handlePageChange(1)}
                                        className="cursor-pointer"
                                      >
                                        1
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                  
                                  // Añadir puntos suspensivos si hay un salto
                                  if (startPage > 2) {
                                    pages.push(
                                      <PaginationItem key="start-ellipsis">...</PaginationItem>
                                    );
                                  }
                                }
                                
                                // Añadir páginas del rango calculado
                                for (let i = startPage; i <= endPage; i++) {
                                  pages.push(
                                    <PaginationItem key={i}>
                                      <PaginationLink 
                                        isActive={i === matchesPage} 
                                        onClick={() => i !== matchesPage && handlePageChange(i)}
                                        className={i !== matchesPage ? "cursor-pointer" : ""}
                                      >
                                        {i}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                }
                                
                                // Mostrar última página si no está en el rango
                                if (endPage < totalPages) {
                                  // Añadir puntos suspensivos si hay un salto
                                  if (endPage < totalPages - 1) {
                                    pages.push(
                                      <PaginationItem key="end-ellipsis">...</PaginationItem>
                                    );
                                  }
                                  
                                  pages.push(
                                    <PaginationItem key={totalPages}>
                                      <PaginationLink 
                                        onClick={() => handlePageChange(totalPages)}
                                        className="cursor-pointer"
                                      >
                                        {totalPages}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                }
                                
                                return pages;
                              })()}
                              
                              {hasNextPage && (
                                <PaginationItem>
                                  <PaginationNext 
                                    onClick={() => handlePageChange(matchesPage + 1)} 
                                    className="cursor-pointer" 
                                  />
                                </PaginationItem>
                              )}
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Details Dialog */}
      <Dialog open={!!selectedTournament} onOpenChange={(open) => !open && setSelectedTournament(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTournament?.name}
              <Badge variant={getCategoryBadgeVariant(selectedTournament?.category)}>
                {selectedTournament?.category}
                </Badge>
              </DialogTitle>
            <DialogDescription>
              Detalles del torneo
            </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                <p className="text-sm font-medium">Fecha de inicio</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTournament?.startDate ? new Date(selectedTournament.startDate).toLocaleDateString() : '-'}
                </p>
                </div>
                <div>
                <p className="text-sm font-medium">Fecha de fin</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTournament?.endDate ? new Date(selectedTournament.endDate).toLocaleDateString() : '-'}
                </p>
                </div>
                <div>
                <p className="text-sm font-medium">Límite de inscripción</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTournament?.registrationDeadline ? new Date(selectedTournament.registrationDeadline).toLocaleDateString() : '-'}
                </p>
                </div>
                <div>
                <p className="text-sm font-medium">Ubicación</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTournament?.location || '-'}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium">Descripción</p>
              <p className="text-sm text-muted-foreground">
                {selectedTournament?.description || 'Sin descripción disponible'}
              </p>
            </div>
            
            <div className="flex justify-between pt-4">
              {isInscripcionAbierta(selectedTournament) ? (
                <Button 
                  onClick={handleInscripcionTorneo} 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? 'Inscribiendo...' : 'Inscribirse'}
                </Button>
              ) : (
                selectedTournament?.userStatus === 'ACTIVE' || selectedTournament?.userStatus === 'REGISTERED' ? (
                  <Button 
                    onClick={handleVerBracket}
                    variant="outline"
                  >
                    Ver bracket
                  </Button>
                ) : (
                  <Button disabled>
                    Inscripción cerrada
                  </Button>
                )
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setSelectedTournament(null)}
              >
                Cerrar
              </Button>
              </div>
            </div>
          </DialogContent>
      </Dialog>

      {/* Tournament Bracket Sheet */}
      <Sheet open={showBracket} onOpenChange={setShowBracket}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Bracket del Torneo</SheetTitle>
            <SheetDescription>
              {selectedTournament?.name}
            </SheetDescription>
          </SheetHeader>
          
          {isBracketLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32 w-full" />
              ))}
            </div>
          ) : isBracketError ? (
            <ErrorMessage 
              message="Error al cargar el bracket del torneo."
              title="No se pudo cargar el bracket"
              onRetry={() => refetchBracket()}
              variant="info"
            />
          ) : bracketRounds.length > 0 ? (
            <div className="space-y-8 overflow-x-auto bracket-container">
              <div className="min-w-[600px] pb-4">
                {bracketRounds.map((round, roundIndex) => (
                  <div key={roundIndex} className="flex">
                    <div className="text-sm font-medium text-muted-foreground w-20 pt-4">
                      {roundIndex === 0 ? "Octavos" : 
                       roundIndex === 1 ? "Cuartos" : 
                       roundIndex === 2 ? "Semifinal" : 
                       roundIndex === 3 ? "Final" : `Ronda ${roundIndex + 1}`}
                    </div>
                    <div className="flex-1">
                      <div className="space-y-4 py-2">
                        {round.matchups.map((match, matchIndex) => (
                          <div 
                            key={matchIndex}
                            className={`border rounded-md p-3 transition-all ${
                              match.isCompleted ? 'bg-muted' : 'bg-card'
                            }`}
                          >
                            <div className="flex justify-between text-sm mb-1">
                              <div className="font-medium">Partido {matchIndex + 1}</div>
                              {match.isCompleted && (
                                <Badge variant="outline" className="text-green-500">
                                  Completado
                                </Badge>
                              )}
                              </div>
                            <div className="space-y-2">
                              <div className={`flex items-center justify-between ${
                                match.isCompleted && match.winner === "player1" ? "font-bold text-green-600" : ""
                              }`}>
                                <span>{match.player1Name || "Por determinar"}</span>
                                <span>{match.player1Score !== undefined ? match.player1Score : "-"}</span>
                                  </div>
                              <div className={`flex items-center justify-between ${
                                match.isCompleted && match.winner === "player2" ? "font-bold text-green-600" : ""
                              }`}>
                                <span>{match.player2Name || "Por determinar"}</span>
                                <span>{match.player2Score !== undefined ? match.player2Score : "-"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ErrorMessage 
              message="El bracket de este torneo aún no está disponible."
              showRetry={false}
              variant="info"
              icon={<Trophy className="h-10 w-10 mb-2 text-blue-500" />}
            />
          )}
          
          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowBracket(false)}
            >
              Cerrar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default Dashboard;