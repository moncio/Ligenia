import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Filter, Calendar, Trophy, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TournamentCarousel from "@/components/TournamentCarousel";
import { useIsDesktop, useIsTablet, useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

type EstadoTorneo = "Inscripción abierta" | "Inscripción cerrada" | "En curso" | "Finalizado";
type CategoriaTorneo = "P1" | "P2" | "P3";
type FilterType = "todos" | "proximos" | "activos" | "finalizados";

const torneos = [{
  id: 1,
  nombre: "Torneo Apertura",
  liga: "Liga Madrid Primavera",
  fechaInicio: "15/06/2023",
  fechaFin: "30/06/2023",
  fechaLimiteInscripcion: "08/06/2023",
  localizacion: "Club de Padel Madrid Centro",
  categoria: "P1" as CategoriaTorneo,
  estado: "Inscripción abierta" as EstadoTorneo
}, {
  id: 2,
  nombre: "Copa Verano",
  liga: "Liga Nacional Amateur",
  fechaInicio: "01/07/2023",
  fechaFin: "15/07/2023",
  fechaLimiteInscripcion: "24/06/2023",
  localizacion: "Padel Indoor Alcalá",
  categoria: "P2" as CategoriaTorneo,
  estado: "En curso" as EstadoTorneo
}, {
  id: 3,
  nombre: "Grand Slam Local",
  liga: "Copa Regional Padel",
  fechaInicio: "20/07/2023",
  fechaFin: "05/08/2023",
  fechaLimiteInscripcion: "13/07/2023",
  localizacion: "Club Deportivo El Estudiante",
  categoria: "P1" as CategoriaTorneo,
  estado: "Inscripción cerrada" as EstadoTorneo
}, {
  id: 4,
  nombre: "Torneo Femenino",
  liga: "Liga Femenina Elite",
  fechaInicio: "10/08/2023",
  fechaFin: "25/08/2023",
  fechaLimiteInscripcion: "03/08/2023",
  localizacion: "Polideportivo San José",
  categoria: "P2" as CategoriaTorneo,
  estado: "Inscripción abierta" as EstadoTorneo
}, {
  id: 5,
  nombre: "Copa Otoño",
  liga: "Liga Nacional Amateur",
  fechaInicio: "01/09/2023",
  fechaFin: "15/09/2023",
  fechaLimiteInscripcion: "25/08/2023",
  localizacion: "Centro Deportivo Alameda",
  categoria: "P3" as CategoriaTorneo,
  estado: "Inscripción cerrada" as EstadoTorneo
}, {
  id: 6,
  nombre: "Torneo Municipal",
  liga: "Torneo Municipal",
  fechaInicio: "01/06/2023",
  fechaFin: "10/06/2023",
  fechaLimiteInscripcion: "25/05/2023",
  localizacion: "Polideportivo Municipal",
  categoria: "P3" as CategoriaTorneo,
  estado: "Finalizado" as EstadoTorneo
}, {
  id: 7,
  nombre: "Torneo Primavera",
  liga: "Liga Madrid Primavera",
  fechaInicio: "15/03/2023",
  fechaFin: "30/04/2023",
  fechaLimiteInscripcion: "08/03/2023",
  localizacion: "Madrid Arena",
  categoria: "P1" as CategoriaTorneo,
  estado: "Finalizado" as EstadoTorneo
}, {
  id: 8,
  nombre: "Torneo Invitacional",
  liga: "Liga Nacional Amateur",
  fechaInicio: "10/05/2023",
  fechaFin: "25/05/2023",
  fechaLimiteInscripcion: "03/05/2023",
  localizacion: "Club de Campo Villa de Madrid",
  categoria: "P2" as CategoriaTorneo,
  estado: "Finalizado" as EstadoTorneo
}, {
  id: 9,
  nombre: "Copa Elite",
  liga: "Liga Femenina Elite",
  fechaInicio: "05/07/2023",
  fechaFin: "20/07/2023",
  fechaLimiteInscripcion: "28/06/2023",
  localizacion: "Centro Deportivo Vallehermoso",
  categoria: "P1" as CategoriaTorneo,
  estado: "Inscripción abierta" as EstadoTorneo
}, {
  id: 10,
  nombre: "Torneo Regional",
  liga: "Copa Regional Padel",
  fechaInicio: "01/08/2023",
  fechaFin: "15/08/2023",
  fechaLimiteInscripcion: "25/07/2023",
  localizacion: "Club Padel Las Rozas",
  categoria: "P3" as CategoriaTorneo,
  estado: "Inscripción abierta" as EstadoTorneo
}, {
  id: 11,
  nombre: "Campeonato Nacional",
  liga: "Liga Nacional Amateur",
  fechaInicio: "10/06/2023",
  fechaFin: "30/06/2023",
  fechaLimiteInscripcion: "03/06/2023",
  localizacion: "Centro Deportivo Nacional",
  categoria: "P1" as CategoriaTorneo,
  estado: "En curso" as EstadoTorneo
}, {
  id: 12,
  nombre: "Torneo Clasificatorio",
  liga: "Liga Madrid Primavera",
  fechaInicio: "01/07/2023",
  fechaFin: "10/07/2023",
  fechaLimiteInscripcion: "24/06/2023",
  localizacion: "Club Padel Madrid Norte",
  categoria: "P2" as CategoriaTorneo,
  estado: "Inscripción cerrada" as EstadoTorneo
}];

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
  const isDesktop = useIsDesktop();
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  
  const handleInscripcionTorneo = (torneoId: number, torneoNombre: string) => {
    toast({
      title: "Inscripción al torneo enviada",
      description: `Tu solicitud de inscripción al torneo ${torneoNombre} ha sido enviada.`,
      variant: "default"
    });
  };

  const filtrarTorneosPorEstado = () => {
    const fechaActual = new Date();
    const formatearFecha = (fechaString: string) => {
      const [dia, mes, anio] = fechaString.split('/');
      return new Date(`${anio}-${mes}-${dia}`);
    };
    
    let torneosFiltered = torneos;
    
    if (searchTerm.trim().length > 0) {
      torneosFiltered = torneosFiltered.filter(torneo => 
        torneo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        torneo.liga.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return torneosFiltered.filter(torneo => {
      const fechaInicio = formatearFecha(torneo.fechaInicio);
      const fechaFin = formatearFecha(torneo.fechaFin);
      switch (filtroEstado) {
        case "proximos":
          return fechaInicio > fechaActual;
        case "activos":
          return fechaInicio <= fechaActual && fechaFin >= fechaActual || torneo.estado === "Inscripción abierta" || torneo.estado === "En curso";
        case "finalizados":
          return fechaFin < fechaActual || torneo.estado === "Finalizado";
        default:
          return true;
      }
    }).sort((a, b) => {
      const fechaA = a.fechaInicio.split('/').reverse().join('-');
      const fechaB = b.fechaInicio.split('/').reverse().join('-');
      return new Date(fechaB).getTime() - new Date(fechaA).getTime();
    });
  };

  const torneosFiltrados = filtrarTorneosPorEstado();

  const getNombreFiltro = () => {
    switch (filtroEstado) {
      case "proximos":
        return "Próximos";
      case "activos":
        return "Activos";
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
                      <TabsTrigger value="proximos" className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none whitespace-nowrap">Próximos</TabsTrigger>
                      <TabsTrigger value="activos" className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none whitespace-nowrap">Activos</TabsTrigger>
                      <TabsTrigger value="finalizados" className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none whitespace-nowrap">Finalizados</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
                
                <TabsContent value="todos" className="mt-0">
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Mostrando todos los torneos ({torneosFiltrados.length})</span>
                  </div>
                </TabsContent>
                
                <TabsContent value="proximos" className="mt-0">
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Mostrando torneos próximos ({torneosFiltrados.length})</span>
                  </div>
                </TabsContent>
                
                <TabsContent value="activos" className="mt-0">
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Mostrando torneos activos ({torneosFiltrados.length})</span>
                  </div>
                </TabsContent>
                
                <TabsContent value="finalizados" className="mt-0">
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Mostrando torneos finalizados ({torneosFiltrados.length})</span>
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
            {torneosFiltrados.length === 0 ? (
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
