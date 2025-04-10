import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useGlobalRankings } from "@/hooks/api/useRankings";
import { useCurrentUserRanking } from "@/hooks/api/useRankings";
import { Player } from "@/lib/api/services/rankingService";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { Search, Trophy, Users, Info, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";

// Number of players to show per page
const PLAYERS_PER_PAGE = 10;

const Statistics = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch the current user to highlight them in the table
  const { data: currentUserData, isLoading: isLoadingCurrentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await api.get('/api/auth/me');
      return response.data.user;
    },
  });

  // Fetch the current user's ranking position
  const { 
    data: userRankingData, 
    isLoading: isLoadingUserRanking,
    isError: isErrorUserRanking
  } = useCurrentUserRanking();

  // Use our hook to fetch player rankings
  const { 
    data: rankingsData, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useGlobalRankings(currentPage, PLAYERS_PER_PAGE, searchQuery);

  // Calculate user's page based on their position
  useEffect(() => {
    if (!isLoadingUserRanking && userRankingData?.data?.position && !initialLoadDone) {
      const userPosition = userRankingData.data.position;
      const userPage = Math.ceil(userPosition / PLAYERS_PER_PAGE);
      
      console.log(`Auto-navigating to user's position. Position: ${userPosition}, Page: ${userPage}, Current page: ${currentPage}`);
      
      if (userPage > 0) {
        setCurrentPage(userPage);
        
        // Notificar al usuario que se ha navegado a su posición
        toast({
          title: "Tu posición en el ranking",
          description: `Te encuentras en la posición #${userPosition}`,
          variant: "default",
        });
        
        setInitialLoadDone(true);
      }
    }
  }, [isLoadingUserRanking, userRankingData, toast, initialLoadDone, currentPage]);

  // Get players and pagination metadata from the response
  const players = rankingsData?.data?.rankings || [];
  const pagination = rankingsData?.data?.pagination || {};
  const totalPages = Math.ceil((pagination.total || 1) / (pagination.limit || PLAYERS_PER_PAGE));
  const totalItems = pagination.total || 0;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPageButtons = 5; // Show 5 page buttons max
    
    if (totalPages <= totalPageButtons) {
      // If we have 5 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Add first page
      pageNumbers.push(1);
      
      // Add middle pages
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (startPage > 2) {
        pageNumbers.push("ellipsis-start");
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis-end");
      }
      
      // Add last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Handle clicking on a player to navigate to their stats page
  const handlePlayerClick = (player: Player) => {
    navigate(`/statistics/${player.id}`, {
      state: {
        playerName: player.name,
        playerRank: (currentPage - 1) * PLAYERS_PER_PAGE + players.indexOf(player) + 1,
        playerPoints: player.points
      }
    });
  };

  // Handle search clear
  const clearSearch = () => {
    setSearchQuery("");
    // Reset to first page when clearing search
    setCurrentPage(1);
    setInitialLoadDone(false); // Allow jumping to user's position again
  };

  // Go to user's position in ranking
  const goToUserPosition = () => {
    if (userRankingData?.data?.position) {
      const userPage = Math.ceil(userRankingData.data.position / PLAYERS_PER_PAGE);
      if (userPage > 0) {
        setCurrentPage(userPage);
        // Clear search if present
        if (searchQuery) {
          setSearchQuery("");
        }
        
        // Notificar al usuario
        toast({
          title: "Navegando a tu posición",
          description: `Te encuentras en la posición #${userRankingData.data.position}`,
          variant: "default",
        });
      }
    }
  };

  // Get user position information
  const userPosition = userRankingData?.data?.position;
  const showUserPositionButton = !isLoadingUserRanking && userPosition && (searchQuery || currentPage !== Math.ceil(userPosition / PLAYERS_PER_PAGE));

  return (
    <DashboardLayout>
      <div className="w-full py-8 px-4 sm:px-6">
        <div className="mb-8 w-full">
          <h1 className="text-3xl font-bold mb-6">Ranking de jugadores</h1>
          
          {/* Search and user position */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar jugador"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <button 
                  className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={clearSearch}
                >
                  ×
                </button>
              )}
            </div>
            
            {/* User position info */}
            {!isLoadingUserRanking && userPosition && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  Tu posición: <span className="font-semibold text-foreground">{userPosition}</span>
                </div>
                
                {showUserPositionButton && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goToUserPosition}
                    className="flex items-center gap-1"
                  >
                    <User className="h-3.5 w-3.5" />
                    Ver mi posición
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Player Ranking Table */}
          <div className="rounded-md border w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24 text-center">Posición</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Puntos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading state with skeletons
                  Array.from({ length: PLAYERS_PER_PAGE }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell className="text-center">
                        <Skeleton className="h-5 w-10 mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-36" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-12 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10">
                      <ErrorMessage 
                        message={`Error al cargar los datos: ${error?.message || 'Intente nuevamente'}`}
                        title="No se pudo cargar el ranking"
                        onRetry={() => refetch()}
                        variant="default"
                      />
                    </TableCell>
                  </TableRow>
                ) : players.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10">
                      <ErrorMessage 
                        message={searchQuery ? `No se encontraron jugadores que coincidan con "${searchQuery}"` : "No hay jugadores en el ranking todavía"}
                        showRetry={!!searchQuery}
                        retryText="Limpiar búsqueda"
                        onRetry={clearSearch}
                        variant="info"
                        icon={<Info className="h-10 w-10 mb-2 text-blue-500" />}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  players.map((player: Player, index) => {
                    const position = (currentPage - 1) * PLAYERS_PER_PAGE + index + 1;
                    // Comprobar si este jugador es el usuario actual usando los datos del ranking
                    const isCurrentUser = userRankingData?.data?.player?.id === player.id;
                    
                    return (
                      <TableRow 
                        key={player.id}
                        className={`cursor-pointer transition-colors ${isCurrentUser 
                          ? 'bg-primary/20 hover:bg-primary/30 border-l-4 border-primary' 
                          : 'hover:bg-muted'}`}
                        onClick={() => handlePlayerClick(player)}
                      >
                        <TableCell className="text-center font-medium">
                          {position === 1 && <Badge variant="secondary" className="mr-2">🥇</Badge>}
                          {position === 2 && <Badge variant="default" className="mr-2">🥈</Badge>}
                          {position === 3 && <Badge variant="outline" className="mr-2">🥉</Badge>}
                          {position}
                        </TableCell>
                        <TableCell className={`${isCurrentUser ? 'font-semibold' : ''}`}>
                          {player.name}
                          {isCurrentUser && (
                            <Badge variant="default" className="ml-2 bg-primary text-primary-foreground">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Tú
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {player.points}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {!isLoading && !isError && players.length > 0 && totalPages > 1 && (
            <div className="mt-6 w-full flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === "ellipsis-start" || page === "ellipsis-end" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          
          {/* Results counter */}
          {!isLoading && !isError && players.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Mostrando {players.length} de {totalItems} jugadores
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Statistics;
