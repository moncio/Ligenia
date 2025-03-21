
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
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-4 text-center">
        Cuadro de Juego - {torneoNombre}
        <div className="text-xs sm:text-sm font-normal text-gray-500 mt-1">{torneoLiga}</div>
      </h2>
      
      <div className="bracket-container w-full overflow-x-auto overflow-y-auto pb-4 max-h-[calc(100vh-10rem)]">
        <div className="inline-flex flex-nowrap min-w-full space-x-2 md:space-x-4 lg:space-x-8 pb-4">
          {/* Ronda 1 - Cuartos de final */}
          <div className={`flex flex-col ${espaciadoClase} min-w-[170px] sm:min-w-[200px] md:min-w-[250px]`}>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 text-center mb-1 md:mb-2">Cuartos de Final</h3>
            {brackets[0]?.map((partido, idx) => (
              <motion.div
                key={`cuartos-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="border rounded-lg p-2 sm:p-3 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs text-gray-500 truncate">Partido {idx + 1}</span>
                  <Badge 
                    className={`text-[0.65rem] sm:text-xs px-1 py-0 sm:px-2 sm:py-0.5 ${partido.completado 
                      ? "bg-green-100 text-green-800" 
                      : "bg-blue-100 text-blue-800"}`}
                  >
                    {partido.completado ? "Completado" : "Pendiente"}
                  </Badge>
                </div>
                <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                  <div className={`text-xs sm:text-sm font-medium truncate ${partido.completado ? "text-gray-900" : "text-gray-700"}`}>
                    {partido.equipo1}
                  </div>
                  <div className={`text-xs sm:text-sm font-medium truncate ${partido.completado ? "text-gray-900" : "text-gray-700"}`}>
                    {partido.equipo2}
                  </div>
                </div>
                {partido.completado ? (
                  <div className="text-xs sm:text-sm bg-gray-50 text-center py-1 rounded font-medium text-gray-900 truncate">
                    {partido.resultado}
                  </div>
                ) : (
                  <div className="text-[0.65rem] sm:text-xs bg-gray-50 text-center py-1 rounded text-gray-500 flex items-center justify-center truncate">
                    <Clock className="h-2 w-2 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{partido.horario || "Horario por definir"}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Ronda 2 - Semifinales */}
          <div className={`flex flex-col ${espaciadoClase} min-w-[170px] sm:min-w-[200px] md:min-w-[250px] mt-4 sm:mt-8 md:mt-12`}>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 text-center mb-1 md:mb-2">Semifinales</h3>
            {brackets[1]?.map((partido, idx) => (
              <motion.div
                key={`semifinal-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.2 + idx * 0.05 }}
                className="border rounded-lg p-2 sm:p-3 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs text-gray-500 truncate">Semifinal {idx + 1}</span>
                  <Badge 
                    className={`text-[0.65rem] sm:text-xs px-1 py-0 sm:px-2 sm:py-0.5 ${partido.completado 
                      ? "bg-green-100 text-green-800" 
                      : "bg-blue-100 text-blue-800"}`}
                  >
                    {partido.completado ? "Completado" : "Pendiente"}
                  </Badge>
                </div>
                <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                  <div className={`text-xs sm:text-sm font-medium truncate ${partido.completado ? "text-gray-900" : "text-gray-700"}`}>
                    {partido.equipo1}
                  </div>
                  <div className={`text-xs sm:text-sm font-medium truncate ${partido.completado ? "text-gray-900" : "text-gray-700"}`}>
                    {partido.equipo2}
                  </div>
                </div>
                {partido.completado ? (
                  <div className="text-xs sm:text-sm bg-gray-50 text-center py-1 rounded font-medium text-gray-900 truncate">
                    {partido.resultado}
                  </div>
                ) : (
                  <div className="text-[0.65rem] sm:text-xs bg-gray-50 text-center py-1 rounded text-gray-500 flex items-center justify-center truncate">
                    <Clock className="h-2 w-2 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{partido.horario || "Horario por definir"}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Ronda 3 - Final */}
          <div className={`flex flex-col ${espaciadoClase} min-w-[170px] sm:min-w-[200px] md:min-w-[250px] mt-8 sm:mt-16 md:mt-24`}>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 text-center mb-1 md:mb-2">Final</h3>
            {brackets[2]?.map((partido, idx) => (
              <motion.div
                key={`final-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
                className="border rounded-lg p-2 sm:p-3 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs text-gray-500 truncate">Final</span>
                  <Badge 
                    className={`text-[0.65rem] sm:text-xs px-1 py-0 sm:px-2 sm:py-0.5 ${partido.completado 
                      ? "bg-green-100 text-green-800" 
                      : "bg-blue-100 text-blue-800"}`}
                  >
                    {partido.completado ? "Completado" : "Pendiente"}
                  </Badge>
                </div>
                <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                  <div className={`text-xs sm:text-sm font-medium truncate ${partido.completado ? "text-gray-900" : "text-gray-700"}`}>
                    {partido.equipo1}
                  </div>
                  <div className={`text-xs sm:text-sm font-medium truncate ${partido.completado ? "text-gray-900" : "text-gray-700"}`}>
                    {partido.equipo2}
                  </div>
                </div>
                {partido.completado ? (
                  <div className="text-xs sm:text-sm bg-gray-50 text-center py-1 rounded font-medium text-gray-900 truncate">
                    {partido.resultado}
                  </div>
                ) : (
                  <div className="text-[0.65rem] sm:text-xs bg-gray-50 text-center py-1 rounded text-gray-500 flex items-center justify-center truncate">
                    <Clock className="h-2 w-2 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{partido.horario || "Horario por definir"}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
