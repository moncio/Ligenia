import React from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Calendar, MapPin, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const TournamentBracket = ({
  torneoNombre,
  torneoLiga,
  torneoEstado,
  brackets,
}: TournamentBracketProps) => {
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

  const getMatchStatusClass = (isCompleted: boolean, isScheduled: boolean) => {
    if (isCompleted) {
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    } else if (isScheduled) {
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
    } else {
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">{torneoNombre}</h2>
          <div className="flex items-center mt-1 text-muted-foreground">
            <Trophy className="h-4 w-4 mr-1" />
            <span>{torneoLiga}</span>
          </div>
        </div>
        <Badge className={getStatusClass(torneoEstado)}>
          {torneoEstado}
        </Badge>
      </div>

      {brackets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Cuadro no disponible</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {torneoEstado === "Inscripción abierta" 
              ? "Las inscripciones están abiertas. El cuadro de juego estará disponible cuando comience el torneo."
              : "El cuadro de juego para este torneo aún no está disponible."}
          </p>
        </div>
      ) : (
        <div className="flex flex-nowrap overflow-x-auto pb-4 gap-8">
          {brackets.map((ronda, rondaIndex) => (
            <div key={rondaIndex} className="flex-shrink-0 min-w-[280px] w-[280px]">
              <h3 className="font-semibold mb-3 text-center">
                {rondaIndex === brackets.length - 1
                  ? "Final"
                  : rondaIndex === brackets.length - 2
                  ? "Semifinales"
                  : rondaIndex === brackets.length - 3
                  ? "Cuartos de final"
                  : rondaIndex === 0
                  ? "Primera ronda"
                  : `Ronda ${rondaIndex + 1}`}
              </h3>
              <div className="space-y-4">
                {ronda.map((partido, partidoIndex) => {
                  const isScheduled = !!partido.horario;
                  const statusClass = getMatchStatusClass(partido.completado, isScheduled);
                  
                  return (
                    <Card 
                      key={partidoIndex} 
                      className="p-3 border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="mb-2">
                        <Badge className={statusClass}>
                          {partido.completado 
                            ? "Finalizado" 
                            : isScheduled 
                              ? "Programado" 
                              : "Pendiente"}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate max-w-[180px]" title={partido.equipo1}>
                            {partido.equipo1}
                          </span>
                          {partido.completado && (
                            <span className="text-sm font-semibold">
                              {partido.resultado.split('-')[0]}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate max-w-[180px]" title={partido.equipo2}>
                            {partido.equipo2}
                          </span>
                          {partido.completado && (
                            <span className="text-sm font-semibold">
                              {partido.resultado.split('-')[1]}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {isScheduled && (
                        <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{partido.horario}</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;
