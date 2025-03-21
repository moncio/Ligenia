
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Info, Users, ChevronDown, Clock, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Interfaces for our data types
interface Liga {
  id: number;
  nombre: string;
  inscrito: boolean;
}

interface Torneo {
  id: number;
  nombre: string;
  liga: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "Inscripción abierta" | "Inscripción cerrada" | "En curso" | "Finalizado";
}

interface Partido {
  equipo1: string;
  equipo2: string;
  resultado: string;
  completado: boolean;
  horario?: string;
}

interface TournamentListProps {
  torneos: Torneo[];
  ligas: Liga[];
  ligasInscritas: number[];
  bracketsEjemplo: Partido[][];
  onInscripcionTorneo: (torneoId: number, ligaNombre: string) => void;
  puedeInscribirseATorneo: (ligaNombre: string) => boolean;
}

const TournamentList: React.FC<TournamentListProps> = ({
  torneos,
  ligas,
  ligasInscritas,
  bracketsEjemplo,
  onInscripcionTorneo,
  puedeInscribirseATorneo
}) => {
  const [filtroLiga, setFiltroLiga] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [detallesTorneo, setDetallesTorneo] = useState<number | null>(null);
  const [torneosInscripciones, setTorneosInscripciones] = useState<{ [key: number]: "none" | "pending" | "inscribed" }>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Función para manejar la inscripción a un torneo
  const handleInscripcionTorneo = (torneoId: number, ligaNombre: string) => {
    if (torneosInscripciones[torneoId] === "pending") {
      // Cancelar inscripción
      const updatedInscripciones = { ...torneosInscripciones };
      delete updatedInscripciones[torneoId];
      setTorneosInscripciones(updatedInscripciones);
    } else {
      // Solicitar inscripción
      setTorneosInscripciones({
        ...torneosInscripciones,
        [torneoId]: "pending"
      });
      onInscripcionTorneo(torneoId, ligaNombre);
    }
  };

  // Filter tournaments based on liga and search term
  const filteredTorneos = torneos.filter(torneo => {
    const matchesLiga = filtroLiga === "all" || torneo.liga === filtroLiga;
    const matchesSearch = searchTerm === "" || 
      torneo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      torneo.liga.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesLiga && matchesSearch;
  });

  // Determine current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTorneos = filteredTorneos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTorneos.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filtroLiga, searchTerm]);

  // Encontrar el torneo seleccionado para detalles
  const torneoSeleccionado = torneos.find(t => t.id === detallesTorneo);

  // Determinar el contenido del bracket basado en el estado del torneo
  const getBracketContent = () => {
    if (!torneoSeleccionado) return null;

    if (torneoSeleccionado.estado === "Inscripción cerrada") {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <Clock className="mx-auto h-8 w-8 text-blue-500 mb-2" />
            <p className="text-lg font-medium">Esperando al sorteo del cuadro final</p>
            <p className="text-sm text-gray-500">El cuadro se publicará pronto</p>
          </div>
        </div>
      );
    }

    if (torneoSeleccionado.estado === "Inscripción abierta") {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <Users className="mx-auto h-8 w-8 text-blue-500 mb-2" />
            <p className="text-lg font-medium">Periodo de inscripción abierto</p>
            <p className="text-sm text-gray-500">El cuadro se creará después del cierre de inscripciones</p>
          </div>
        </div>
      );
    }

    // Mostrar el bracket para torneos en curso o finalizados
    return (
      <div className="flex justify-around gap-6 overflow-x-auto pb-4">
        {/* Cuartos de final */}
        <div className="flex flex-col gap-6">
          <h4 className="text-sm font-medium text-center text-gray-500">Cuartos de Final</h4>
          {bracketsEjemplo[0].map((partido, idx) => (
            <div key={idx} className="border rounded-md p-3 w-64 bg-white shadow-sm">
              <div className="text-sm font-semibold mb-2 flex justify-between">
                <span>Partido {idx + 1}</span>
                {partido.completado ? (
                  <Badge className="bg-green-100 text-green-800">Completado</Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800">Pendiente</Badge>
                )}
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">{partido.equipo1}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">{partido.equipo2}</span>
              </div>
              {partido.completado ? (
                <div className="text-sm text-center py-1 bg-gray-50 rounded-md">
                  Resultado: {partido.resultado}
                </div>
              ) : (
                <div className="text-sm text-center py-1 bg-gray-50 rounded-md flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {partido.horario}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Semifinales */}
        <div className="flex flex-col gap-6 mt-12">
          <h4 className="text-sm font-medium text-center text-gray-500">Semifinales</h4>
          {bracketsEjemplo[1].map((partido, idx) => (
            <div key={idx} className="border rounded-md p-3 w-64 bg-white shadow-sm">
              <div className="text-sm font-semibold mb-2 flex justify-between">
                <span>Semifinal {idx + 1}</span>
                {partido.completado ? (
                  <Badge className="bg-green-100 text-green-800">Completado</Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800">Pendiente</Badge>
                )}
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">{partido.equipo1}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">{partido.equipo2}</span>
              </div>
              {partido.completado ? (
                <div className="text-sm text-center py-1 bg-gray-50 rounded-md">
                  Resultado: {partido.resultado}
                </div>
              ) : (
                <div className="text-sm text-center py-1 bg-gray-50 rounded-md flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {partido.horario}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Final */}
        <div className="flex flex-col gap-6 mt-24">
          <h4 className="text-sm font-medium text-center text-gray-500">Final</h4>
          {bracketsEjemplo[2].map((partido, idx) => (
            <div key={idx} className="border rounded-md p-3 w-64 bg-white shadow-sm">
              <div className="text-sm font-semibold mb-2 flex justify-between">
                <span>Final</span>
                {partido.completado ? (
                  <Badge className="bg-green-100 text-green-800">Completado</Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800">Pendiente</Badge>
                )}
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">{partido.equipo1}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">{partido.equipo2}</span>
              </div>
              {partido.completado ? (
                <div className="text-sm text-center py-1 bg-gray-50 rounded-md">
                  Resultado: {partido.resultado}
                </div>
              ) : (
                <div className="text-sm text-center py-1 bg-gray-50 rounded-md flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {partido.horario}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white shadow-sm rounded-lg">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium flex items-center">
                <Filter className="mr-2 h-5 w-5 text-blue-500" />
                Torneos Disponibles
              </h3>
              <p className="text-sm text-gray-500">
                Participa en los torneos de las ligas a las que estás inscrito
              </p>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Buscar por nombre o liga..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4 text-gray-500" />
              <Select
                value={filtroLiga}
                onValueChange={setFiltroLiga}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por liga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ligas</SelectItem>
                  {ligas.map(liga => (
                    <SelectItem key={liga.id} value={liga.nombre}>
                      {liga.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Torneo</TableHead>
                <TableHead>Liga</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTorneos.length > 0 ? (
                currentTorneos.map((torneo) => {
                  const puedeInscribirse = torneo.estado === "Inscripción abierta" && puedeInscribirseATorneo(torneo.liga);
                  const inscripcionPendiente = torneosInscripciones[torneo.id] === "pending";
                  
                  return (
                    <TableRow key={torneo.id}>
                      <TableCell className="font-medium">{torneo.nombre}</TableCell>
                      <TableCell>{torneo.liga}</TableCell>
                      <TableCell>{torneo.fechaInicio}</TableCell>
                      <TableCell>{torneo.fechaFin}</TableCell>
                      <TableCell>
                        <Badge className={
                          torneo.estado === "En curso" 
                            ? "bg-green-100 text-green-800" 
                            : torneo.estado === "Inscripción abierta" 
                              ? "bg-blue-100 text-blue-800" 
                              : torneo.estado === "Finalizado"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                        }>
                          {torneo.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetallesTorneo(torneo.id)}
                          >
                            <Info className="mr-1 h-4 w-4" />
                            Detalles
                          </Button>
                          
                          {inscripcionPendiente ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="group"
                              onClick={() => handleInscripcionTorneo(torneo.id, torneo.liga)}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              <span>Cancelar</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled={!puedeInscribirse}
                              onClick={() => handleInscripcionTorneo(torneo.id, torneo.liga)}
                            >
                              <Users className="mr-1 h-4 w-4" />
                              {puedeInscribirse ? 'Inscribirse' : 'No disponible'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No se encontraron torneos que coincidan con tu búsqueda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {filteredTorneos.length > itemsPerPage && (
          <div className="py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Show first page, last page, and pages around current page
                  let pageToShow;
                  if (totalPages <= 5) {
                    pageToShow = i + 1;
                  } else if (currentPage <= 3) {
                    pageToShow = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageToShow = totalPages - 4 + i;
                  } else {
                    pageToShow = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageToShow}>
                      <PaginationLink
                        isActive={pageToShow === currentPage}
                        onClick={() => paginate(pageToShow)}
                        className="cursor-pointer"
                      >
                        {pageToShow}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      
      {/* Modal de Detalles del Torneo */}
      <Dialog open={detallesTorneo !== null} onOpenChange={() => setDetallesTorneo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles del Torneo</DialogTitle>
            <DialogDescription>
              {torneoSeleccionado && (
                <span>
                  {torneoSeleccionado.nombre} ({torneoSeleccionado.liga}) - {torneoSeleccionado.estado}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4">Cuadro del Torneo</h3>
            {getBracketContent()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentList;
