
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy } from 'lucide-react';
import { Input } from "@/components/ui/input";

// Temporary public token - in production, this should be secured in environment variables
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZWRlbW8iLCJhIjoiY2x4aXp5OXZ3MDBxdjJrcXhrYmFyaGE0ZCJ9.cq3FnJqcw94nFd9Ej7mXJg';

// Define the interface for league data
interface League {
  id: number;
  nombre: string;
  inscrito: boolean;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

interface LeagueMapProps {
  leagues: League[];
  onInscribe: (ligaId: number) => void;
  ligasInscritas: number[];
  torneos: any[]; // Using any for brevity, but should define proper type
}

const LeagueMap: React.FC<LeagueMapProps> = ({ leagues, onInscribe, ligasInscritas, torneos }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapToken, setMapToken] = useState<string>(mapboxgl.accessToken);
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);

  // Add location data to the leagues
  const leaguesWithLocations = leagues.map(liga => ({
    ...liga,
    location: {
      lat: 40.416775 + (Math.random() - 0.5) * 0.2, // Random locations in Madrid area
      lng: -3.70379 + (Math.random() - 0.5) * 0.2,
      address: "Calle Ejemplo 123, Madrid"
    }
  }));

  const initializeMap = () => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = mapToken;
    
    if (map.current) map.current.remove();
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-3.70379, 40.416775], // Madrid center coordinates
        zoom: 10
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Add markers for each league
      map.current.on('load', () => {
        if (!map.current) return;
        
        // Clear any existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        
        // Add markers for each league
        leaguesWithLocations.forEach(liga => {
          if (!map.current || !liga.location) return;
          
          // Create a DOM element for the marker
          const el = document.createElement('div');
          el.className = 'league-marker';
          el.innerHTML = '<div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-600 transition-colors border-2 border-white shadow-lg">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>' +
          '</div>';
          
          el.addEventListener('click', () => {
            setSelectedLeague(liga);
          });
          
          // Create the marker instance
          const marker = new mapboxgl.Marker(el)
            .setLngLat([liga.location.lng, liga.location.lat])
            .addTo(map.current);
          
          markersRef.current.push(marker);
        });
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setShowTokenInput(true);
    }
  };

  useEffect(() => {
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapToken, leagues]);

  // Filter tournaments for the selected league
  const leagueTournaments = selectedLeague
    ? torneos.filter(torneo => torneo.liga === selectedLeague.nombre)
    : [];

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMapToken(e.target.value);
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initializeMap();
  };

  return (
    <div className="w-full">
      <div 
        ref={mapContainer} 
        className="h-[400px] w-full rounded-lg shadow-md mb-4"
        style={{ position: 'relative' }}
      />
      
      {/* Custom Mapbox token input when there's an error */}
      {showTokenInput && (
        <div className="my-4 p-4 border rounded-md bg-yellow-50">
          <h3 className="font-medium text-amber-800 mb-2">Mapbox API Token necesario</h3>
          <p className="text-sm text-amber-700 mb-3">
            El mapa no se puede mostrar porque el token de Mapbox no es válido. Por favor introduce un token válido de Mapbox:
          </p>
          <form onSubmit={handleTokenSubmit} className="flex gap-2">
            <Input 
              type="text" 
              value={mapToken} 
              onChange={handleTokenChange} 
              placeholder="Introduce tu token de Mapbox..." 
              className="flex-1"
            />
            <Button type="submit">Aplicar</Button>
          </form>
          <p className="text-xs text-amber-600 mt-2">
            Puedes obtener un token en <a href="https://account.mapbox.com" target="_blank" rel="noopener" className="underline">mapbox.com</a>
          </p>
        </div>
      )}
      
      {/* Add CSS style for markers */}
      <style dangerouslySetInnerHTML={{ __html: `
        .league-marker {
          cursor: pointer;
        }
      `}} />
      
      {/* League Details Dialog */}
      <Dialog open={selectedLeague !== null} onOpenChange={(open) => !open && setSelectedLeague(null)}>
        <DialogContent className="max-w-md">
          {selectedLeague && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-blue-500" />
                  {selectedLeague.nombre}
                </DialogTitle>
                <DialogDescription>
                  {selectedLeague.location?.address}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Detalles de la Liga</h3>
                    {ligasInscritas.includes(selectedLeague.id) && (
                      <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-100">
                        Ya estás inscrito
                      </Badge>
                    )}
                  </div>
                  <Button 
                    onClick={() => onInscribe(selectedLeague.id)}
                    disabled={ligasInscritas.includes(selectedLeague.id)}
                  >
                    {ligasInscritas.includes(selectedLeague.id) ? 'Inscrito' : 'Inscribirse'}
                  </Button>
                </div>
                
                {leagueTournaments.length > 0 ? (
                  <div>
                    <h4 className="text-md font-medium mb-2">Torneos en esta Liga:</h4>
                    <div className="space-y-2">
                      {leagueTournaments.map(torneo => (
                        <div key={torneo.id} className="p-2 border rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{torneo.nombre}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <span>{torneo.fechaInicio} - {torneo.fechaFin}</span>
                                <Badge className="ml-2" variant="outline">
                                  {torneo.estado}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay torneos activos en esta liga</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeagueMap;
