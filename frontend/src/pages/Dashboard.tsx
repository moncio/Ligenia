import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Trophy, Users, Calendar, CheckCircle, XCircle, Info, Search, Filter, Award, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showBracket, setShowBracket] = useState(false);
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Datos de ejemplo para el dashboard
  const userStats = {
    matchesPlayed: 24,
    wins: 18,
    losses: 6,
    winRate: "75%",
    currentRanking: 42,
    estimatedLevel: "Avanzado"
  };

  const activeTournaments = [
    { 
      id: 1, 
      name: "Liga Madrid Primavera", 
      category: "P1", 
      nextMatch: "12/06/2023", 
      status: "Activo",
      fechaInicio: "01/06/2023",
      fechaFin: "30/06/2023",
      fechaLimiteInscripcion: "25/05/2023",
      localizacion: "Club de Padel Madrid Centro"
    },
    { 
      id: 2, 
      name: "Torneo Benéfico Anual", 
      category: "P2", 
      nextMatch: "20/06/2023", 
      status: "Inscrito",
      fechaInicio: "15/06/2023",
      fechaFin: "30/06/2023",
      fechaLimiteInscripcion: "08/06/2023",
      localizacion: "Fundación Deportiva Municipal"
    },
    { 
      id: 3, 
      name: "Copa Regional Padel", 
      category: "P3", 
      nextMatch: "02/07/2023", 
      status: "Próximo",
      fechaInicio: "01/07/2023", 
      fechaFin: "15/07/2023",
      fechaLimiteInscripcion: "24/06/2023",
      localizacion: "Padel Indoor Alcalá"
    },
  ];

  const recentMatches = [
    { id: 1, tournament: "Liga Madrid Primavera", category: "P1", opponent: "García/Martínez", result: "Victoria", score: "6-4, 7-5", date: "05/06/2023" },
    { id: 2, tournament: "Torneo Municipal", category: "P1", opponent: "López/Sánchez", result: "Derrota", score: "3-6, 4-6", date: "28/05/2023" },
    { id: 3, tournament: "Liga Madrid Primavera", category: "P2", opponent: "Rodríguez/Fernández", result: "Victoria", score: "6-3, 6-2", date: "21/05/2023" },
    { id: 4, tournament: "Copa Verano", category: "P3", opponent: "Díaz/López", result: "Victoria", score: "7-5, 6-2", date: "10/05/2023" },
    { id: 5, tournament: "Torneo Elite", category: "P1", opponent: "Fernández/Ruiz", result: "Derrota", score: "4-6, 5-7", date: "01/05/2023" },
  ];

  const bracketsEjemplo = [
    [
      { equipo1: "García/Martínez", equipo2: "López/Fernández", resultado: "6-4, 7-5", completado: true },
      { equipo1: "Rodríguez/Pérez", equipo2: "Sánchez/Díaz", resultado: "3-6, 6-4, 7-6", completado: true },
      { equipo1: "González/Ruiz", equipo2: "Hernández/Torres", resultado: "6-3, 6-2", completado: true },
      { equipo1: "Ramírez/Flores", equipo2: "Morales/Ortega", resultado: "Por jugar", horario: "15/06/2023 - 18:00", completado: false },
    ],
    [
      { equipo1: "García/Martínez", equipo2: "Rodríguez/Pérez", resultado: "Por jugar", horario: "20/06/2023 - 17:00", completado: false },
      { equipo1: "González/Ruiz", equipo2: "Por definir", resultado: "Por jugar", horario: "20/06/2023 - 19:00", completado: false },
    ],
    [
      { equipo1: "Por definir", equipo2: "Por definir", resultado: "Por jugar", horario: "25/06/2023 - 18:00", completado: false },
    ]
  ];

  // Modified filter function to handle the "all" selection properly
  const filteredMatches = recentMatches.filter(match => {
    const matchSearchTerm = searchTerm.toLowerCase();
    const matchesTourney = match.tournament.toLowerCase().includes(matchSearchTerm);
    const matchesOpponent = match.opponent.toLowerCase().includes(matchSearchTerm);
    
    // When "all" is selected, show all categories
    const categoryMatches = filterCategory === "all" ? true : match.category === filterCategory;
    
    // When "all" is selected, show all dates
    const dateMatches = filterDate === "all" ? true : match.date.includes(filterDate);
    
    return (matchesTourney || matchesOpponent) && categoryMatches && dateMatches;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMatches = filteredMatches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);

  const handleTournamentClick = (tournament) => {
    setSelectedTournament(tournament);
  };

  const getCategoryBadgeVariant = (category) => {
    switch(category) {
      case 'P1': return 'secondary';
      case 'P2': return 'warning';
      case 'P3': return 'info';
      default: return 'default';
    }
  };

  const handleInscripcionTorneo = () => {
    if (selectedTournament) {
      console.log(`Inscripción enviada para el torneo ${selectedTournament.name}`);
    }
  };

  const isInscripcionAbierta = (tournament) => {
    if (!tournament) return false;
    
    const fechaLimite = tournament.fechaLimiteInscripcion.split('/').reverse().join('-');
    const fechaActual = new Date().toISOString().split('T')[0];
    
    return fechaActual <= fechaLimite;
  };

  const handleVerBracket = () => {
    setShowBracket(true);
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
                <CardTitle className="text-3xl flex items-center text-blue-500">
                  #{userStats.currentRanking}
                  <Trophy className="ml-auto h-5 w-5 text-blue-500" />
                </CardTitle>
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
                  {userStats.winRate}
                  <BarChart className="ml-auto h-5 w-5 text-green-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {userStats.wins} victorias / {userStats.losses} derrotas
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden border bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent hover:from-purple-500/20 hover:via-purple-500/10 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardDescription>Nivel Estimado</CardDescription>
                <CardTitle className="text-3xl flex items-center text-purple-500">
                  {userStats.estimatedLevel}
                  <Award className="ml-auto h-5 w-5 text-purple-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Basado en victorias y categoría de torneos
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-8 transition-all duration-500 ease-in-out w-full">
            <Card className="col-span-1 lg:col-span-2 w-full">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Torneos activos
                    </CardTitle>
                    <CardDescription>
                      Torneos en los que estás participando actualmente
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Torneo</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Próximo Partido</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeTournaments.map((tournament) => (
                      <TableRow 
                        key={tournament.id}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleTournamentClick(tournament)}
                      >
                        <TableCell className="font-medium">{tournament.name}</TableCell>
                        <TableCell>
                          <Badge variant={getCategoryBadgeVariant(tournament.category)}>
                            {tournament.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{tournament.nextMatch}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tournament.status === 'Activo' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                              : tournament.status === 'Inscrito' 
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {tournament.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-primary/10 to-primary/20 text-foreground shadow-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  ¿Sabías que?
                  <Info className="ml-2 h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Los jugadores que participan en al menos 5 torneos al año mejoran su ranking más rápidamente.</p>
                <p>Tu participación actual te coloca entre el 25% de jugadores más activos.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="transition-all duration-500 ease-in-out w-full">
            <Card className="bg-background shadow-sm w-full">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center">
                      Últimos Resultados
                      <Users className="ml-2 h-5 w-5 text-primary" />
                    </CardTitle>
                    <CardDescription>Resultados de tus partidos más recientes</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar por torneo/oponente..."
                        className="pl-8 h-9 w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full sm:w-32 h-9">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="P1">P1</SelectItem>
                        <SelectItem value="P2">P2</SelectItem>
                        <SelectItem value="P3">P3</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterDate} onValueChange={setFilterDate}>
                      <SelectTrigger className="w-full sm:w-32 h-9">
                        <SelectValue placeholder="Fecha" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="06/2023">Junio 2023</SelectItem>
                        <SelectItem value="05/2023">Mayo 2023</SelectItem>
                        <SelectItem value="04/2023">Abril 2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Torneo</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Oponentes</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Puntuación</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMatches.length > 0 ? (
                      currentMatches.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell className="font-medium">{match.tournament}</TableCell>
                          <TableCell>
                            <Badge variant={getCategoryBadgeVariant(match.category)}>
                              {match.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{match.opponent}</TableCell>
                          <TableCell>
                            <Badge variant={match.result === 'Victoria' ? 'success' : 'destructive'}>
                              {match.result}
                            </Badge>
                          </TableCell>
                          <TableCell>{match.score}</TableCell>
                          <TableCell>{match.date}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No se encontraron resultados que coincidan con los filtros
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination for results table */}
                {filteredMatches.length > itemsPerPage && (
                  <div className="mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i + 1}>
                            <PaginationLink 
                              isActive={currentPage === i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={selectedTournament !== null} onOpenChange={(open) => !open && setSelectedTournament(null)}>
        {selectedTournament && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center">
                {selectedTournament.name}
                <Badge variant={getCategoryBadgeVariant(selectedTournament.category)} className="ml-2">
                  {selectedTournament.category}
                </Badge>
              </DialogTitle>
              <DialogDescription>Detalles del torneo</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Localización</p>
                  <p className="text-sm">{selectedTournament.localizacion}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p className="text-sm">{selectedTournament.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de inicio</p>
                  <p className="text-sm">{selectedTournament.fechaInicio}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de fin</p>
                  <p className="text-sm">{selectedTournament.fechaFin}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Límite de inscripción</p>
                  <p className="text-sm">{selectedTournament.fechaLimiteInscripcion}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleVerBracket}
                >
                  Ver cuadro
                </Button>
                {isInscripcionAbierta(selectedTournament) && (
                  <Button 
                    variant="default" 
                    onClick={handleInscripcionTorneo}
                  >
                    Inscribirse
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Sheet open={showBracket} onOpenChange={setShowBracket}>
        <SheetContent side="right" className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Cuadro del torneo</SheetTitle>
            <SheetDescription>
              {selectedTournament && selectedTournament.name}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {bracketsEjemplo.map((ronda, rondaIndex) => (
              <div key={`ronda-${rondaIndex}`} className="mb-6">
                <h3 className="font-semibold mb-3">
                  {rondaIndex === 0 ? 'Cuartos de final' : 
                   rondaIndex === 1 ? 'Semifinales' : 
                   'Final'}
                </h3>
                <div className="space-y-3">
                  {ronda.map((partido, partidoIndex) => (
                    <div key={`partido-${rondaIndex}-${partidoIndex}`} className="border rounded-md p-3 bg-white">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">{partido.equipo1}</div>
                        <div className="font-medium">{partido.equipo2}</div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        {partido.completado ? (
                          <div className="bg-gray-100 w-full text-center py-1 rounded">
                            <span className="font-medium">Resultado: {partido.resultado}</span>
                          </div>
                        ) : (
                          <div className="bg-blue-50 w-full text-center py-1 rounded text-blue-800">
                            <span className="font-medium">{partido.horario}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default Dashboard;
