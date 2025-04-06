import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { Users, Trophy, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import TournamentBracket from "@/components/TournamentBracket";

interface Tournament {
  id: number;
  nombre: string;
  liga: string;
  fechaInicio: string;
  fechaFin: string;
  fechaLimiteInscripcion: string;
  localizacion: string;
  categoria: "P1" | "P2" | "P3";
  estado: "Inscripción abierta" | "Inscripción cerrada" | "En curso" | "Finalizado";
}

interface Partido {
  equipo1: string;
  equipo2: string;
  resultado: string;
  completado: boolean;
  horario?: string;
}

interface TournamentCarouselProps {
  torneos: Tournament[];
  bracketsEjemplo: Partido[][];
  onInscripcionTorneo: (torneoId: number, torneoNombre: string) => void;
  filterType: string;
}

const OPTIONS = { loop: true, align: 'center' as const };
const SLIDE_COUNT = 5
const SLIDES = Array.from(Array(SLIDE_COUNT).keys())

const TournamentCarousel = ({ 
  torneos, 
  bracketsEjemplo, 
  onInscripcionTorneo, 
  filterType 
}: TournamentCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [bracketOpen, setBracketOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
  }, [emblaApi])

  const handleInscription = (torneoId: number, torneoNombre: string) => {
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

  const renderTorneoCard = (torneo: Tournament, index: number) => {
    const isCenterSlide = index === selectedIndex;
    const cardClass = isCenterSlide ? 'embla__slide--current' : '';
    const slideStyles = {
      paddingLeft: index === 0 ? '0' : undefined,
      paddingRight: index === torneos.length - 1 ? '0' : undefined,
    };

    const buttonSection = (
      <div className="flex flex-col mt-auto pt-3 space-y-2 w-full">
        {torneo.estado === "Inscripción abierta" && (
          <Button
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleInscription(torneo.id, torneo.nombre);
            }}
          >
            <Users className="mr-1 h-3.5 w-3.5" />
            Inscribirse
          </Button>
        )}
        
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenBracket(torneo);
          }}
        >
          <Trophy className="mr-1 h-3.5 w-3.5" />
          Cuadro de juego
        </Button>
      </div>
    );
    
    return (
      <div
        key={torneo.id}
        className={`flex flex-col tournament-card rounded-xl shadow-md overflow-hidden border-t-4 h-full min-h-[400px] transition-all duration-300 ${cardClass}`}
        style={slideStyles}
        onClick={() => handleSlideClick(index)}
      >
        <div className="relative h-28 md:h-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/40"></div>
          <div className="absolute top-0 right-0 p-2">
            <Badge className={getStatusClass(torneo.estado)}>{torneo.estado}</Badge>
          </div>
          <div className="absolute bottom-0 left-0 p-3 text-foreground">
            <h3 className="font-semibold text-lg md:text-xl">{torneo.nombre}</h3>
            <p className="text-sm text-muted-foreground">{torneo.liga}</p>
          </div>
        </div>
        
        <div className="flex flex-col flex-grow p-3 pb-4 bg-background justify-between">
          <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
            <div className="text-muted-foreground">Inicio:</div>
            <div className="text-right">{torneo.fechaInicio}</div>
            
            <div className="text-muted-foreground">Fin:</div>
            <div className="text-right">{torneo.fechaFin}</div>
            
            {torneo.estado === "Inscripción abierta" && (
              <>
                <div className="text-muted-foreground font-medium text-primary">Límite inscripción:</div>
                <div className="text-right font-medium text-primary">{torneo.fechaLimiteInscripcion}</div>
              </>
            )}
            
            <div className="text-muted-foreground">Categoría:</div>
            <div className="text-right">
              <Badge className={getCategoryClass(torneo.categoria)}>{torneo.categoria}</Badge>
            </div>
            
            <div className="text-muted-foreground">Ubicación:</div>
            <div className="text-right truncate" title={torneo.localizacion}>{torneo.localizacion}</div>
          </div>
          
          {buttonSection}
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {torneos.map((torneo, index) => (
              <div key={torneo.id} className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_33.33%] lg:flex-[0_0_33.33%] relative h-[400px] sm:h-[420px]">
                {renderTorneoCard(torneo, index)}
              </div>
            ))}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm z-10 rounded-full shadow-md border-0 ml-1 md:ml-2 w-8 h-8 md:w-10 md:h-10 hover:bg-white hidden md:flex"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
        >
          <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm z-10 rounded-full shadow-md border-0 mr-1 md:mr-2 w-8 h-8 md:w-10 md:h-10 hover:bg-white hidden md:flex"
          onClick={scrollNext}
          disabled={!canScrollNext}
        >
          <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
      </div>
      
      <Sheet open={bracketOpen} onOpenChange={setBracketOpen}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-md md:max-w-xl lg:max-w-2xl p-0 overflow-hidden"
        >
          <div className="h-full flex flex-col overflow-hidden">
            <SheetHeader className="px-4 pt-4 pb-2">
              <SheetTitle className="text-lg md:text-xl">
                {selectedTournament?.nombre || "Cuadro de Juego"}
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex-grow overflow-auto">
              {selectedTournament && (
                <TournamentBracket 
                  torneoNombre={selectedTournament.nombre}
                  torneoLiga={selectedTournament.liga}
                  torneoEstado={selectedTournament.estado}
                  brackets={bracketsEjemplo}
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TournamentCarousel;
