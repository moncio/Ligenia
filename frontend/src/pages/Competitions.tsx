import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Filter, Calendar, Trophy, Search, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TournamentCarousel from "@/components/TournamentCarousel";
import { useIsDesktop, useIsTablet, useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useTournaments, useRegisterForTournament } from "@/hooks/api/useTournament";
import { Tournament } from "@/lib/api/services/tournamentService";
import { Skeleton } from "@/components/ui/skeleton";

type FilterType = "todos" | "proximos" | "activos" | "finalizados";

// Brackets de ejemplo que serán reemplazados por datos reales más adelante
const bracketsEjemplo = [[{
  equipo1: "García/Martínez",
  equipo2: "López/Fernández",
  resultado: "6-4, 7-5",
  completado: true
}, {
  equipo1: "Rodríguez/Pérez",
  equipo2: "Sánchez/Díaz",
  resultado: "3-6, 6-4, 7-6",
  completado: true
}, {
  equipo1: "González/Ruiz",
  equipo2: "Hernández/Torres",
  resultado: "6-3, 6-2",
  completado: true
}, {
  equipo1: "Ramírez/Flores",
  equipo2: "Morales/Ortega",
  resultado: "Por jugar",
  horario: "15/06/2023 - 18:00",
  completado: false
}], [{
  equipo1: "García/Martínez",
  equipo2: "Rodríguez/Pérez",
  resultado: "Por jugar",
  horario: "20/06/2023 - 17:00",
  completado: false
}, {
  equipo1: "González/Ruiz",
  equipo2: "Por definir",
  resultado: "Por jugar",
  horario: "20/06/2023 - 19:00",
  completado: false
}], [{
  equipo1: "Por definir",
  equipo2: "Por definir",
  resultado: "Por jugar",
  horario: "25/06/2023 - 18:00",
  completado: false
}]];

const Competitions = () => {
  const { toast } = useToast();
  const [filtroEstado, setFiltroEstado] = useState<FilterType>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [localTorneos, setLocalTorneos] = useState<Tournament[]>([]);
  const isDesktop = useIsDesktop();
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  
  // Obtener datos de torneos desde la API
  const { 
    data: tournamentsData, 
    isLoading: isLoadingTournaments, 
    isError: isErrorTournaments
  } = useTournaments(
    filtroEstado !== "finalizados" 
      ? { 
          status: filtroEstado === "proximos" 
            ? "DRAFT" 
            : filtroEstado === "activos" 
              ? "ACTIVE" 
              : undefined 
        }
      : undefined
  );

  // Query adicional para traer torneos COMPLETED
  const { 
    data: completedTournamentsData, 
    isLoading: isLoadingCompletedTournaments, 
    isError: isErrorCompletedTournaments
  } = useTournaments(
    filtroEstado === "finalizados" ? { status: "COMPLETED" } : undefined,
    { 
      enabled: filtroEstado === "finalizados",
      queryKey: ['tournaments', 'completed']
    }
  );

  // Query adicional para traer torneos CANCELLED
  const { 
    data: cancelledTournamentsData, 
    isLoading: isLoadingCancelledTournaments, 
    isError: isErrorCancelledTournaments
  } = useTournaments(
    filtroEstado === "finalizados" ? { status: "CANCELLED" } : undefined,
    { 
      enabled: filtroEstado === "finalizados",
      queryKey: ['tournaments', 'cancelled']
    }
  );

  // Combinar torneos finalizados (COMPLETED y CANCELLED)
  useEffect(() => {
    if (filtroEstado === "finalizados") {
      const completedTournaments = completedTournamentsData?.data?.tournaments || [];
      const cancelledTournaments = cancelledTournamentsData?.data?.tournaments || [];
      setLocalTorneos([...completedTournaments, ...cancelledTournaments]);
    } else {
      setLocalTorneos(tournamentsData?.data?.tournaments || []);
    }
  }, [
    filtroEstado, 
    tournamentsData, 
    completedTournamentsData, 
    cancelledTournamentsData
  ]);

  // Determinar si estamos cargando torneos
  const isLoading = 
    isLoadingTournaments || 
    (filtroEstado === "finalizados" && (isLoadingCompletedTournaments || isLoadingCancelledTournaments));

  // Determinar si hay error al cargar torneos
  const isError = 
    isErrorTournaments || 
    (filtroEstado === "finalizados" && (isErrorCompletedTournaments || isErrorCancelledTournaments));

  // Mutación para registrarse en un torneo
  const registerMutation = useRegisterForTournament();
  
  // Manejar la inscripción a un torneo
  const handleInscripcionTorneo = async (torneoId: string, torneoNombre: string) => {
    try {
      registerMutation.mutate(torneoId, {
        onSuccess: (data) => {
          toast({
            title: "Inscripción al torneo enviada",
            description: `Tu solicitud de inscripción al torneo ${torneoNombre} ha sido enviada.`,
            variant: "default"
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `No se pudo completar la inscripción: ${error.message}`,
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar la inscripción",
        variant: "destructive"
      });
    }
  };

  // Convertir los datos de la API al formato esperado por el componente
  const mapApiTournamentsToUI = (tournaments: Tournament[] = []) => {
    return tournaments.map(tournament => ({
      id: tournament.id,
      nombre: tournament.name,
      liga: "Liga General",
      fechaInicio: new Date(tournament.startDate).toLocaleDateString(),
      fechaFin: tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : "",
      fechaLimiteInscripcion: tournament.registrationDeadline ? 
        new Date(tournament.registrationDeadline).toLocaleDateString() : "",
      localizacion: tournament.location || "Por definir",
      categoria: (tournament.category as "P1" | "P2" | "P3") || "P1",
      estado: mapStatusToUIStatus(tournament.status),
      status: tournament.status
    }));
  };

  // Mapear estados de la API a estados de la UI
  const mapStatusToUIStatus = (
    status: Tournament['status']
  ): "Inscripción abierta" | "Inscripción cerrada" | "En curso" | "Finalizado" => {
    switch (status) {
      case 'DRAFT':
        return "Inscripción abierta";
      case 'ACTIVE':
        return "En curso";
      case 'COMPLETED':
        return "Finalizado";
      case 'CANCELLED':
        return "Finalizado";
      default:
        return "Inscripción cerrada";
    }
  };

  // Aplicar filtros a los torneos
  const filtrarTorneosPorEstado = (tournaments: Tournament[] = []) => {
    const torneosMapeados = mapApiTournamentsToUI(tournaments);
    let torneosFiltered = torneosMapeados;
    
    // Aplicar filtro de búsqueda por texto
    if (searchTerm.trim().length > 0) {
      torneosFiltered = torneosMapeados.filter(torneo => 
        torneo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        torneo.localizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        torneo.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Ordenar torneos por fecha (más recientes primero)
    return torneosFiltered.sort((a, b) => {
      return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
    });
  };

  // Memorizar la lista filtrada de torneos para evitar cálculos innecesarios
  const torneosFiltrados = useMemo(() => {
    if (isLoading || isError) return [];
    return filtrarTorneosPorEstado(localTorneos);
  }, [localTorneos, searchTerm, isLoading, isError]);

  const getNombreFiltro = () => {
    switch (filtroEstado) {
      case "proximos":
        return "Inscripción";
      case "activos":
        return "En curso";
      case "finalizados":
        return "Finalizados";
      default:
        return "Todos";
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-8 w-full">
        <div className="w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-6"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display">
              Torneos
            </h1>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Filtrar por:</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 bg-background rounded-xl shadow-sm p-4 border"
          >
            <div className="w-full">
              <Tabs value={filtroEstado} onValueChange={value => setFiltroEstado(value as FilterType)} className="w-full">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pb-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar torneo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  
                  <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    <TabsList className="inline-flex h-auto p-1 bg-muted rounded-lg w-full sm:w-auto min-w-[300px] sm:min-w-0">
                      <TabsTrigger value="todos" className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none whitespace-nowrap">Todos</TabsTrigger>
                      <TabsTrigger value="proximos" className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none whitespace-nowrap">Inscripción</TabsTrigger>
                      <TabsTrigger value="activos" className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none whitespace-nowrap">En curso</TabsTrigger>
                      <TabsTrigger value="finalizados" className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none whitespace-nowrap">Finalizados</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
                
                <TabsContent value="todos" className="mt-0">
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Mostrando todos los torneos ({isLoadingTournaments ? '...' : torneosFiltrados.length})</span>
                  </div>
                </TabsContent>
                
                <TabsContent value="proximos" className="mt-0">
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Mostrando torneos con inscripción abierta ({isLoadingTournaments ? '...' : torneosFiltrados.length})</span>
                  </div>
                </TabsContent>
                
                <TabsContent value="activos" className="mt-0">
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Mostrando torneos en curso ({isLoadingTournaments ? '...' : torneosFiltrados.length})</span>
                  </div>
                </TabsContent>
                
                <TabsContent value="finalizados" className="mt-0">
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Mostrando torneos finalizados ({isLoadingTournaments ? '...' : torneosFiltrados.length})</span>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl overflow-hidden bg-background shadow-sm border"
          >
            {isLoading ? (
              <div className="p-8">
                <div className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-32" />
                  </div>
                </div>
              </div>
            ) : isError ? (
              <div className="p-8 text-center w-full">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4"
                >
                  <Trophy className="h-8 w-8 text-destructive" />
                </motion.div>
                <h3 className="text-lg font-medium text-foreground mb-2">Error al cargar torneos</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Ocurrió un error al cargar los torneos. Por favor, intenta nuevamente.
                </p>
              </div>
            ) : torneosFiltrados.length === 0 ? (
              <div className="p-8 text-center w-full">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
                >
                  <Trophy className="h-8 w-8 text-primary" />
                </motion.div>
                <h3 className="text-lg font-medium text-foreground mb-2">No hay torneos disponibles</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No se encontraron torneos para el filtro "{getNombreFiltro()}". 
                  Prueba con otro filtro o vuelve más tarde.
                </p>
              </div>
            ) : (
              <div className="max-w-full overflow-hidden">
                <TournamentCarousel 
                  torneos={torneosFiltrados} 
                  bracketsEjemplo={bracketsEjemplo} 
                  onInscripcionTorneo={handleInscripcionTorneo} 
                  filterType={filtroEstado} 
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Competitions;
