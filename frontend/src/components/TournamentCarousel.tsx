import React, { useState, useEffect, useCallback, useMemo } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { Users, Trophy, Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import TournamentBracket from "@/components/TournamentBracket";
import { useTournamentBracket } from "@/hooks/api/useTournament";
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, MapPin } from "lucide-react";

interface Tournament {
  id: string;
  nombre: string;
  liga: string;
  fechaInicio: string;
  fechaFin: string;
  fechaLimiteInscripcion: string;
  localizacion: string;
  categoria: "P1" | "P2" | "P3";
  estado: "Inscripción abierta" | "Inscripción cerrada" | "En curso" | "Finalizado";
  status?: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED"; // Adding original status from API
}

interface Partido {
  equipo1: string;
  equipo2: string;
  resultado: string;
  completado: boolean;
  horario?: string;
}

interface BracketMatch {
  equipo1: string;
  equipo2: string;
  resultado: string;
  horario?: string;
  completado: boolean;
}

interface TournamentCarouselProps {
  torneos: Tournament[];
  bracketsEjemplo: BracketMatch[][];
  onInscripcionTorneo: (torneoId: string, torneoNombre: string) => void;
  filterType: string;
}

const OPTIONS = { loop: true, align: 'center' as const };

const TournamentCarousel = ({ 
  torneos, 
  bracketsEjemplo, 
  onInscripcionTorneo, 
  filterType 
}: TournamentCarouselProps) => {
  // Tournament carousel configuration and state
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Bracket display state
  const [bracketOpen, setBracketOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isBracketDialogOpen, setIsBracketDialogOpen] = useState(false);

  // Registration Logic:
  // A tournament is open for registration if:
  // 1. It has a registration deadline date in the future
  // 2. Its status is either DRAFT or OPEN
  // This is determined by the isRegistrationOpen variable in renderTorneoCard

  // Datos del bracket desde la API
  const { 
    data: bracketData, 
    isLoading: isBracketLoading,
    isError: isBracketError
  } = useTournamentBracket(
    selectedTournament ? selectedTournament.id : '', 
    { 
      enabled: bracketOpen && !!selectedTournament,
      queryKey: ['tournament', 'bracket', selectedTournament?.id]
    } as UseQueryOptions<{ data: { bracket: any } }, ApiError>
  );

  // Convertir el bracket de la API al formato de la UI
  const mapApiBracketToUI = (): Partido[][] => {
    if (!bracketData || !bracketData.data || !bracketData.data.bracket || !bracketData.data.bracket.rounds) {
      return bracketsEjemplo;
    }

    const apiBracket = bracketData.data.bracket;
    
    return apiBracket.rounds.map(round => {
      return round.matchups.map(matchup => ({
        equipo1: matchup.player1Name || "Por definir",
        equipo2: matchup.player2Name || "Por definir",
        resultado: matchup.score || "Por jugar",
        completado: matchup.isCompleted,
        horario: matchup.scheduledTime ? new Date(matchup.scheduledTime).toLocaleString() : undefined
      }));
    });
  };

  // Bracket procesado para usar en la UI
  const bracketProcessed = bracketOpen && !isBracketLoading && !isBracketError 
    ? mapApiBracketToUI() 
    : bracketsEjemplo;

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
  }, [emblaApi])

  const handleInscription = (torneoId: string, torneoNombre: string) => {
    onInscripcionTorneo(torneoId, torneoNombre);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Inscripción abierta":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "Inscripción cerrada":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "En curso":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "Finalizado":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case "P1":
        return "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground";
      case "P2":
        return "bg-gradient-to-r from-orange-500 to-amber-500 text-white dark:text-white";
      case "P3":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white dark:text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleOpenBracket = (torneo: Tournament) => {
    setSelectedTournament(torneo);
    setBracketOpen(true);
  };

  const handleSlideClick = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    const intervalId = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [emblaApi]);

  const isRegistrationOpen = useMemo(() => {
    // If status is DRAFT, registration is always open
    if (selectedTournament?.status === "DRAFT") {
      return true;
    }
    
    // For other statuses, check if current date is before registration end date
    if (selectedTournament?.fechaLimiteInscripcion) {
      const today = new Date();
      const registrationEndDate = new Date(selectedTournament.fechaLimiteInscripcion);
      return today <= registrationEndDate;
    }
    
    return false;
  }, [selectedTournament?.status, selectedTournament?.fechaLimiteInscripcion]);

  const handleVerBracket = (torneo: Tournament, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTournament(torneo);
    setIsBracketDialogOpen(true);
  };

  // Función para generar un bracket aleatorio basado en el ID del torneo
  const getBracketForTournament = (tournamentId: string) => {
    // Usar el ID del torneo como semilla para generar un bracket único
    const seed = tournamentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Decidir el número de rondas (2-4) basado en el seed
    const rounds = 1 + (seed % 3);
    
    // Generar bracket basado en el seed
    const bracket: BracketMatch[][] = [];
    
    // Equipos para usar en el bracket
    const equipos = [
      "García/Martínez", "López/Fernández", "Rodríguez/Pérez", 
      "Sánchez/Díaz", "González/Ruiz", "Hernández/Torres",
      "Ramírez/Flores", "Morales/Ortega", "Castro/Guerrero",
      "Romero/Vargas", "Ortiz/Cruz", "Medina/Ramos"
    ];
    
    // Primera ronda
    const primerRonda: BracketMatch[] = [];
    const matchesInFirstRound = Math.min(2 ** rounds, 8); // Máximo 8 partidos en primera ronda
    
    for (let i = 0; i < matchesInFirstRound; i++) {
      const equipo1Index = (seed + i) % equipos.length;
      const equipo2Index = (seed + i + matchesInFirstRound) % equipos.length;
      
      // Determinar si el partido está completado
      const completado = (seed + i) % 3 !== 0; // Aproximadamente 2/3 de los partidos completados
      
      primerRonda.push({
        equipo1: equipos[equipo1Index],
        equipo2: equipos[equipo2Index],
        resultado: completado 
          ? `${1 + (seed + i) % 7}-${(seed + i + 2) % 7}, ${2 + (seed + i) % 6}-${(seed + i + 1) % 6}` 
          : "Por jugar",
        horario: completado ? undefined : `${10 + (seed + i) % 15}/0${1 + (seed + i) % 9}/2023 - ${10 + (seed + i) % 8}:00`,
        completado
      });
    }
    bracket.push(primerRonda);
    
    // Rondas subsiguientes
    for (let r = 1; r < rounds; r++) {
      const ronda: BracketMatch[] = [];
      const matchesInRound = Math.max(1, primerRonda.length / (2 ** r));
      
      for (let i = 0; i < matchesInRound; i++) {
        const completado = (seed + r + i) % (r + 2) === 0; // Menos partidos completados en rondas avanzadas
        
        if (r === rounds - 1 && matchesInRound === 1) {
          // Final
          ronda.push({
            equipo1: "Finalista 1",
            equipo2: "Finalista 2",
            resultado: "Por jugar",
            horario: `${15 + (seed) % 10}/0${1 + (seed) % 9}/2023 - 18:00`,
            completado: false
          });
        } else if (completado) {
          ronda.push({
            equipo1: equipos[(seed + r + i) % equipos.length],
            equipo2: equipos[(seed + r + i + 3) % equipos.length],
            resultado: `${1 + (seed + r + i) % 7}-${(seed + r + i + 2) % 7}`,
            completado
          });
        } else {
          ronda.push({
            equipo1: "Por definir",
            equipo2: "Por definir",
            resultado: "Por jugar",
            horario: `${15 + (seed + r + i) % 10}/0${1 + (seed + r + i) % 9}/2023 - ${14 + (seed + r + i) % 6}:00`,
            completado
          });
        }
      }
      
      bracket.push(ronda);
    }
    
    return bracket;
  };

  const renderTorneoCard = (torneo: Tournament, index: number) => {
    const isCenterSlide = index === selectedIndex;
    const cardClass = isCenterSlide ? 'embla__slide--current' : '';
    const slideStyles = {
      paddingLeft: index === 0 ? '0' : undefined,
      paddingRight: index === torneos.length - 1 ? '0' : undefined,
    };
    
    // Display status as is, without additional checks
    const displayStatus = torneo.estado;
    
    // Define border color based on tournament status
    const borderColorClass = torneo.status === "DRAFT" 
      ? 'border-t-blue-500' 
      : torneo.status === "ACTIVE" 
        ? 'border-t-green-500' 
        : torneo.status === "COMPLETED" 
          ? 'border-t-gray-400' 
          : 'border-t-amber-500';
    
    // Función para determinar si la inscripción está abierta para un torneo
    const isInscripcionAbierta = () => {
      return torneo.estado === "Inscripción abierta" && filterType !== "finalizados";
    };

    // Función para determinar si un torneo está finalizado
    const isTorneoFinalizado = () => {
      return torneo.estado === "Finalizado" || torneo.status === "COMPLETED" || torneo.status === "CANCELLED";
    };

    return (
      <Card className="overflow-hidden bg-card rounded-xl border transition-all duration-300 hover:shadow-md h-full">
        <CardHeader className="p-5 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex justify-between items-start mb-2">
            <Badge 
              variant={
                torneo.categoria === "P1" ? "default" : 
                torneo.categoria === "P2" ? "secondary" : 
                "outline"
              }
            >
              {torneo.categoria}
            </Badge>
            <Badge 
              variant={
                torneo.estado === "Inscripción abierta" ? "success" : 
                torneo.estado === "En curso" ? "warning" : 
                torneo.estado === "Finalizado" ? "destructive" :
                "outline"
              }
            >
              {torneo.estado}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold">{torneo.nombre}</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                <span className="font-medium">Fechas:</span>{" "}
                {torneo.fechaInicio} al {torneo.fechaFin}
              </span>
            </div>
            
            {torneo.fechaLimiteInscripcion && (
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  <span className="font-medium">Límite inscripción:</span>{" "}
                  {torneo.fechaLimiteInscripcion}
                </span>
              </div>
            )}
            
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                <span className="font-medium">Ubicación:</span>{" "}
                {torneo.localizacion}
              </span>
            </div>
            
            <div className="flex justify-between mt-4 pt-3 border-t">
              {isInscripcionAbierta() ? (
                <>
                  <Button 
                    variant="default"
                    onClick={() => onInscripcionTorneo(torneo.id, torneo.nombre)}
                    disabled={isTorneoFinalizado()}
                  >
                    Inscribirse
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVerBracket(torneo, e);
                    }}
                    className="group flex items-center gap-1.5"
                  >
                    <Trophy className="h-4 w-4 group-hover:text-primary transition-colors" />
                    Cuadro de juego
                  </Button>
                </>
              ) : (
                <Button 
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerBracket(torneo, e);
                  }}
                  className="group flex items-center gap-1.5"
                >
                  <Trophy className="h-4 w-4 group-hover:text-primary transition-colors" />
                  Cuadro de juego
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Si no hay torneos, mostrar mensaje
  if (torneos.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No hay torneos disponibles</h3>
        <p className="text-muted-foreground">
          No se encontraron torneos para los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="tournament-container">
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {torneos.map((torneo, index) => (
                <div 
                  key={torneo.id} 
                  className="flex-[0_0_90%] sm:flex-[0_0_50%] md:flex-[0_0_40%] lg:flex-[0_0_30%] min-w-0 pl-4 pr-4 py-2"
                >
                  {renderTorneoCard(torneo, index)}
                </div>
              ))}
            </div>
          </div>
          
          {torneos.length > 1 && (
            <>
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full shadow-md h-10 w-10"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full shadow-md h-10 w-10"
                onClick={scrollNext}
                disabled={!canScrollNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Bracket Dialog */}
      <Dialog open={isBracketDialogOpen} onOpenChange={setIsBracketDialogOpen}>
        <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Cuadro de juego - {selectedTournament?.nombre}
            </DialogTitle>
            <DialogDescription>
              Resultados y próximos enfrentamientos del torneo
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 pb-6 pt-2">
            <div className="bg-muted/50 p-4 rounded-lg mb-4 flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-primary flex-shrink-0" />
              <span>
                Los partidos se actualizan en tiempo real a medida que avanzan las rondas.
                {selectedTournament?.estado === "En curso" && " El torneo está actualmente en curso."}
                {selectedTournament?.estado === "Finalizado" && " El torneo ha finalizado."}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <div className="bracket-container min-w-[700px] flex gap-4 p-4">
                {selectedTournament && getBracketForTournament(selectedTournament.id).map((ronda, roundIndex) => (
                  <div key={roundIndex} className="bracket-round flex-1">
                    <h3 className="text-center text-sm font-medium mb-4 text-primary">
                      {roundIndex === 0 ? "Octavos" : 
                       roundIndex === 1 ? "Cuartos" : 
                       roundIndex === 2 ? "Semifinal" : 
                       roundIndex === 3 ? "Final" : `Ronda ${roundIndex + 1}`}
                    </h3>
                    
                    <div className="space-y-4">
                      {ronda.map((partido, matchIndex) => (
                        <div 
                          key={matchIndex}
                          className={`bracket-match p-3 border rounded-md transition-all ${
                            partido.completado 
                              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 completed' 
                              : 'border-muted-foreground/20'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <Badge 
                              variant={partido.completado ? "success" : "outline"}
                              className="text-xs px-1.5 py-0"
                            >
                              {partido.completado ? "Completado" : "Pendiente"}
                            </Badge>
                            
                            {partido.horario && (
                              <span className="text-xs text-muted-foreground">
                                {partido.horario}
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className={`flex justify-between items-center ${
                              partido.completado && partido.resultado.startsWith("6") 
                                ? "font-medium text-green-600 dark:text-green-400" 
                                : ""
                            }`}>
                              <span className="text-sm">{partido.equipo1}</span>
                              {partido.completado && (
                                <span className="text-sm">{partido.resultado.split(", ")[0].split("-")[0]}</span>
                              )}
                            </div>
                            
                            <div className={`flex justify-between items-center ${
                              partido.completado && !partido.resultado.startsWith("6") 
                                ? "font-medium text-green-600 dark:text-green-400" 
                                : ""
                            }`}>
                              <span className="text-sm">{partido.equipo2}</span>
                              {partido.completado && (
                                <span className="text-sm">{partido.resultado.split(", ")[0].split("-")[1]}</span>
                              )}
                            </div>
                          </div>
                          
                          {partido.completado && (
                            <div className="mt-2 pt-2 border-t border-muted-foreground/10 text-center">
                              <span className="text-xs text-muted-foreground">
                                {partido.resultado}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <Button 
                onClick={() => setIsBracketDialogOpen(false)}
                variant="outline"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TournamentCarousel;
