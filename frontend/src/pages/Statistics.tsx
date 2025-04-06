import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

// Mockup data for player ranking
const PLAYERS_PER_PAGE = 10;

interface Player {
  id: string;
  name: string;
  points: number;
  userId?: string;
}

const Statistics = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Fetch the current user to highlight them in the table
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Mock data query - replace with actual Supabase query when database is set up
  const { data: playersData, isLoading } = useQuery({
    queryKey: ["players", searchQuery],
    queryFn: async () => {
      // This is a mockup. Replace with actual Supabase query
      // For now, we'll return mock data
      return [
        { id: "1", name: "Carlos Alcaraz", points: 9500, userId: "1" },
        { id: "2", name: "Rafael Nadal", points: 9200, userId: "2" },
        { id: "3", name: "Novak Djokovic", points: 8800, userId: currentUser?.id },
        { id: "4", name: "Roger Federer", points: 8600, userId: "4" },
        { id: "5", name: "Dominic Thiem", points: 8300, userId: "5" },
        { id: "6", name: "Alexander Zverev", points: 8100, userId: "6" },
        { id: "7", name: "Stefanos Tsitsipas", points: 7900, userId: "7" },
        { id: "8", name: "Daniil Medvedev", points: 7700, userId: "8" },
        { id: "9", name: "Andrey Rublev", points: 7500, userId: "9" },
        { id: "10", name: "Denis Shapovalov", points: 7300, userId: "10" },
        { id: "11", name: "Diego Schwartzman", points: 7100, userId: "11" },
        { id: "12", name: "Roberto Bautista", points: 6900, userId: "12" },
        { id: "13", name: "Pablo Carreño", points: 6700, userId: "13" },
        { id: "14", name: "Félix Auger-Aliassime", points: 6500, userId: "14" },
        { id: "15", name: "Karen Khachanov", points: 6300, userId: "15" },
        { id: "16", name: "Stan Wawrinka", points: 6100, userId: "16" },
        { id: "17", name: "David Goffin", points: 5900, userId: "17" },
        { id: "18", name: "Gael Monfils", points: 5700, userId: "18" },
        { id: "19", name: "Milos Raonic", points: 5500, userId: "19" },
        { id: "20", name: "Kei Nishikori", points: 5300, userId: "20" },
        { id: "21", name: "Matteo Berrettini", points: 5100, userId: "21" },
        { id: "22", name: "Cristian Garín", points: 4900, userId: "22" },
        { id: "23", name: "Alex de Minaur", points: 4700, userId: "23" },
        { id: "24", name: "John Isner", points: 4500, userId: "24" },
        { id: "25", name: "Nick Kyrgios", points: 4300, userId: "25" },
      ];
    },
  });

  // Filter players based on search query
  const filteredPlayers = playersData?.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE);
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * PLAYERS_PER_PAGE,
    currentPage * PLAYERS_PER_PAGE
  );

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
  const handlePlayerClick = (playerId: string) => {
    navigate(`/statistics/${playerId}`);
  };

  return (
    <DashboardLayout>
      <div className="w-full py-8 px-4 sm:px-6">
        <div className="mb-8 w-full">
          <h1 className="text-3xl font-bold mb-6">Ranking de jugadores</h1>
          
          {/* Search filter */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar jugador"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
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
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : paginatedPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      No se encontraron resultados
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPlayers.map((player, index) => {
                    const position = (currentPage - 1) * PLAYERS_PER_PAGE + index + 1;
                    const isCurrentUser = player.userId === currentUser?.id;
                    
                    return (
                      <TableRow 
                        key={player.id}
                        className={`cursor-pointer ${isCurrentUser ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-muted'}`}
                        onClick={() => handlePlayerClick(player.id)}
                      >
                        <TableCell className="text-center font-medium">
                          {position === 1 && <Badge variant="secondary" className="mr-2">🥇</Badge>}
                          {position === 2 && <Badge variant="warning" className="mr-2">🥈</Badge>}
                          {position === 3 && <Badge variant="info" className="mr-2">🥉</Badge>}
                          {position}
                        </TableCell>
                        <TableCell>
                          {player.name}
                          {isCurrentUser && (
                            <Badge variant="success" className="ml-2">
                              Tú
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
          {totalPages > 1 && (
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Statistics;
