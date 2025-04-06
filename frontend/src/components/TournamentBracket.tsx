import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface Partido {
  equipo1: string;
  equipo2: string;
  resultado: string;
  completado: boolean;
  horario?: string;
}

interface TournamentBracketProps {
  torneoNombre: string;
  torneoLiga: string;
  torneoEstado: string;
  brackets: Partido[][];
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  torneoNombre,
  torneoLiga,
  torneoEstado,
  brackets
}) => {
  // Si no hay brackets o están vacíos
  if (!brackets || brackets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72">
        <Trophy className="h-12 w-12 text-sport-blue mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cuadro disponible</h3>
        <p className="text-gray-500 max-w-md text-center">
          El cuadro de juego para este torneo aún no está disponible.
        </p>
      </div>
    );
  }

  // Si el torneo está en inscripción abierta
  if (torneoEstado === "Inscripción abierta") {
    return (
      <div className="flex flex-col items-center justify-center h-72">
        <Clock className="h-12 w-12 text-sport-blue mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Inscripciones abiertas</h3>
        <p className="text-gray-500 max-w-md text-center">
          El cuadro de juego se creará cuando finalice el periodo de inscripción.
        </p>
      </div>
    );
  }

  // Adaptar el espacio vertical según el número de partidos
  const maxPartidosPorRonda = Math.max(...brackets.map(ronda => ronda.length));
  const espaciadoClase = maxPartidosPorRonda > 4 
    ? "space-y-2" 
    : "space-y-4";

  return (
    <div className="py-2 px-1 md:py-4 md:px-2 w-full">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-2 md:mb-4 text-center">
        Cuadro de Juego - {torneoNombre}
        <div className="text-xs sm:text-sm font-normal text-muted-foreground mt-1">{torneoLiga}</div>
      </h2>
      
      <div className="bracket-container w-full overflow-x-auto overflow-y-auto pb-4 max-h-[calc(100vh-10rem)]">
        <div className="inline-flex flex-nowrap min-w-full space-x-2 md:space-x-4 lg:space-x-8 pb-4">
          {/* Ronda 1 - Cuartos de final */}
          <div className={`flex flex-col ${espaciadoClase} min-w-[170px] sm:min-w-[200px] md:min-w-[250px]`}>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground text-center mb-1 md:mb-2">Cuartos de Final</h3>
            
            {brackets[0].map((partido, index) => (
              <motion.div
                key={`cuartos-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-3 rounded-lg border bg-card shadow-sm ${index > 0 ? 'mt-2 md:mt-4' : ''}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="text-xs sm:text-sm truncate-team-name">{partido.equipo1}</div>
                  <div className="text-xs sm:text-sm truncate-team-name">{partido.equipo2}</div>
                  
                  {partido.completado ? (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{partido.resultado}</span>
                      <Badge variant="success" className="text-[10px] h-4">
                        Completado
                      </Badge>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {partido.horario}
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-4">
                        Pendiente
                      </Badge>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Ronda 2 - Semifinales */}
          <div className={`flex flex-col ${espaciadoClase} min-w-[170px] sm:min-w-[200px] md:min-w-[250px]`}>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground text-center mb-1 md:mb-2">Semifinales</h3>
            
            {brackets[1].map((partido, index) => (
              <motion.div
                key={`semifinal-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`relative p-3 rounded-lg border bg-card shadow-sm ${index > 0 ? 'mt-2 md:mt-4' : ''}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="text-xs sm:text-sm truncate-team-name">{partido.equipo1}</div>
                  <div className="text-xs sm:text-sm truncate-team-name">{partido.equipo2}</div>
                  
                  {partido.completado ? (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{partido.resultado}</span>
                      <Badge variant="success" className="text-[10px] h-4">
                        Completado
                      </Badge>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {partido.horario}
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-4">
                        Pendiente
                      </Badge>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Ronda 3 - Final */}
          <div className={`flex flex-col ${espaciadoClase} min-w-[170px] sm:min-w-[200px] md:min-w-[250px]`}>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground text-center mb-1 md:mb-2">Final</h3>
            
            {brackets[2].map((partido, index) => (
              <motion.div
                key={`final-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`relative p-3 rounded-lg border bg-card shadow-sm ${index > 0 ? 'mt-2 md:mt-4' : ''}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="text-xs sm:text-sm truncate-team-name">{partido.equipo1}</div>
                  <div className="text-xs sm:text-sm truncate-team-name">{partido.equipo2}</div>
                  
                  {partido.completado ? (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{partido.resultado}</span>
                      <Badge variant="success" className="text-[10px] h-4">
                        Completado
                      </Badge>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {partido.horario}
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-4">
                        Pendiente
                      </Badge>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
