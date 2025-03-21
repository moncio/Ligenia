
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Calendar, Filter, Trophy, TrendingUp, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";

const mockUserData = {
  name: "Carlos Rodríguez",
  matches: 26,
  wins: 18,
  losses: 4,
  ranking: 3,
  winRate: 69,
};

const mockMatchHistory = [
  { id: 1, date: "2023-10-15", opponent: "Juan López", result: "Victoria", score: "6-4, 7-5", tournament: "Torneo Primavera", round: "Semifinal" },
  { id: 2, date: "2023-10-08", opponent: "Miguel Torres", result: "Derrota", score: "3-6, 4-6", tournament: "Copa Madrid", round: "Cuartos de final" },
  { id: 3, date: "2023-09-30", opponent: "Andrés García", result: "Victoria", score: "6-3, 6-2", tournament: "Liga Municipal", round: "Jornada 5" },
  { id: 4, date: "2023-09-22", opponent: "Fernando Martín", result: "Empate", score: "6-7, 7-6, 1-1", tournament: "Torneo Regional", round: "Fase de grupos" },
  { id: 5, date: "2023-09-15", opponent: "Diego Sánchez", result: "Victoria", score: "6-4, 6-3", tournament: "Torneo Primavera", round: "Cuartos de final" },
  { id: 6, date: "2023-09-07", opponent: "Rafael Díaz", result: "Victoria", score: "7-5, 6-4", tournament: "Liga Municipal", round: "Jornada 3" },
  { id: 7, date: "2023-08-30", opponent: "Carlos Gómez", result: "Derrota", score: "4-6, 3-6", tournament: "Copa Madrid", round: "Octavos de final" },
  { id: 8, date: "2023-08-22", opponent: "Javier Ruiz", result: "Victoria", score: "6-2, 6-1", tournament: "Torneo Regional", round: "Fase de grupos" },
  { id: 9, date: "2022-12-10", opponent: "Pablo Martínez", result: "Victoria", score: "6-3, 6-1", tournament: "Torneo Invierno", round: "Final" },
  { id: 10, date: "2022-11-25", opponent: "Roberto Gil", result: "Victoria", score: "7-6, 6-4", tournament: "Copa Madrid", round: "Semifinal" },
  { id: 11, date: "2022-10-18", opponent: "Luis Fernández", result: "Derrota", score: "3-6, 4-6", tournament: "Liga Municipal", round: "Jornada 8" },
  { id: 12, date: "2022-09-05", opponent: "Jorge Navarro", result: "Victoria", score: "6-4, 7-5", tournament: "Torneo Otoño", round: "Cuartos de final" },
];

// Performance data for different years
const performanceData2023 = [
  { month: "Ene", victories: 3, defeats: 1 },
  { month: "Feb", victories: 2, defeats: 1 },
  { month: "Mar", victories: 4, defeats: 1 },
  { month: "Abr", victories: 2, defeats: 1 },
  { month: "May", victories: 1, defeats: 2 },
  { month: "Jun", victories: 3, defeats: 2 },
  { month: "Jul", victories: 2, defeats: 0 },
  { month: "Ago", victories: 1, defeats: 0 },
];

const performanceData2022 = [
  { month: "Ene", victories: 2, defeats: 2 },
  { month: "Feb", victories: 1, defeats: 1 },
  { month: "Mar", victories: 3, defeats: 0 },
  { month: "Abr", victories: 1, defeats: 2 },
  { month: "May", victories: 2, defeats: 1 },
  { month: "Jun", victories: 2, defeats: 1 },
  { month: "Jul", victories: 1, defeats: 2 },
  { month: "Ago", victories: 3, defeats: 1 },
];

const performanceDataByYear = {
  "2023": performanceData2023,
  "2022": performanceData2022,
};

const getAvailableYears = () => {
  const years = new Set<string>();
  mockMatchHistory.forEach(match => {
    const year = match.date.split('-')[0];
    years.add(year);
  });
  return Array.from(years).sort().reverse();
};

const UserStatistics = () => {
  const { userId } = useParams();
  const isMobile = useIsMobile();
  const { translations } = useLanguage();
  const availableYears = getAvailableYears();
  const [selectedYear, setSelectedYear] = useState<string>(availableYears[0]);
  const [performanceYear, setPerformanceYear] = useState<string>(availableYears[0]);

  const filteredMatches = mockMatchHistory.filter(match => 
    match.date.startsWith(selectedYear)
  );

  const getResultClass = (result: string) => {
    if (result === "Victoria" || result === translations.victory) return "text-green-600 font-medium";
    if (result === "Derrota" || result === translations.defeat) return "text-red-600 font-medium";
    return "text-blue-600 font-medium";
  };

  const translateResult = (result: string) => {
    if (result === "Victoria") return translations.victory;
    if (result === "Derrota") return translations.defeat;
    if (result === "Empate") return translations.draw;
    return result;
  };

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{translations.statistics} - {mockUserData.name}</h1>
          <p className="text-muted-foreground">
            {translations.performance}
          </p>
        </div>
        
        <div className="space-y-6 w-full">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{translations.matches}</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUserData.matches}</div>
                <p className="text-xs text-muted-foreground">
                  +5 respecto al mes anterior
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{translations.winRate}</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUserData.winRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +3% respecto al mes anterior
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{translations.position}</CardTitle>
                <Trophy className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#{mockUserData.ranking}</div>
                <p className="text-xs text-muted-foreground">
                  Top 5 en Liga Primavera
                </p>
              </CardContent>
            </Card>
          </div>
            
          <Card className="col-span-1 w-full">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>{translations.performance}</CardTitle>
                <CardDescription>
                  {translations.victoriesChart} y {translations.defeatsChart}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={performanceYear}
                  onValueChange={setPerformanceYear}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="w-full overflow-auto bracket-container">
                <div className={isMobile ? "min-w-[600px] h-[250px]" : "w-full h-[250px]"}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceDataByYear[performanceYear] || performanceData2023}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <Tooltip contentStyle={{ fontSize: isMobile ? '11px' : '12px' }} />
                      <Legend wrapperStyle={{ fontSize: isMobile ? '11px' : '12px' }} />
                      <Bar 
                        dataKey="victories" 
                        fill="#22C55E" 
                        name={translations.victoriesChart} 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="defeats" 
                        fill="#EF4444" 
                        name={translations.defeatsChart}
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
            
          <Card className="w-full">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>{translations.playerActivity}</CardTitle>
                <CardDescription>
                  {translations.matches}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedYear}
                  onValueChange={(value) => setSelectedYear(value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-auto bracket-container">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs md:text-sm">{translations.date}</TableHead>
                        <TableHead className="text-xs md:text-sm">{translations.tournament}</TableHead>
                        <TableHead className="text-xs md:text-sm">{translations.round}</TableHead>
                        <TableHead className="text-xs md:text-sm">{translations.opponent}</TableHead>
                        <TableHead className="text-xs md:text-sm">{translations.result}</TableHead>
                        <TableHead className="text-xs md:text-sm">{translations.score}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMatches.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell className="text-xs md:text-sm">{match.date}</TableCell>
                          <TableCell className="text-xs md:text-sm">{match.tournament}</TableCell>
                          <TableCell className="text-xs md:text-sm">{match.round}</TableCell>
                          <TableCell className="text-xs md:text-sm">{match.opponent}</TableCell>
                          <TableCell className={`${getResultClass(match.result)} text-xs md:text-sm`}>
                            {translateResult(match.result)}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm">{match.score}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserStatistics;
