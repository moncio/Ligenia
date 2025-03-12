import { Router } from 'express';
import { leagueRouter } from './league.routes';
import { tournamentRouter } from './tournament.routes';
import { LeagueController } from '../controllers/league.controller';
import { TournamentController } from '../controllers/tournament.controller';
import { CreateLeagueUseCase } from '../../core/use-cases/league/create-league.use-case';
import { GetLeagueByIdUseCase } from '../../core/use-cases/league/get-league-by-id.use-case';
import { GetAllLeaguesUseCase } from '../../core/use-cases/league/get-all-leagues.use-case';
import { UpdateLeagueUseCase } from '../../core/use-cases/league/update-league.use-case';
import { DeleteLeagueUseCase } from '../../core/use-cases/league/delete-league.use-case';
import { CreateTournamentUseCase } from '../../core/use-cases/tournament/create-tournament.use-case';
import { GetTournamentByIdUseCase } from '../../core/use-cases/tournament/get-tournament-by-id.use-case';
import { GetAllTournamentsUseCase } from '../../core/use-cases/tournament/get-all-tournaments.use-case';
import { UpdateTournamentUseCase } from '../../core/use-cases/tournament/update-tournament.use-case';
import { DeleteTournamentUseCase } from '../../core/use-cases/tournament/delete-tournament.use-case';
import { LeagueRepository } from '../../infrastructure/database/repositories/league.repository';
import { TournamentRepository } from '../../infrastructure/database/repositories/tournament.repository';

/**
 * Configuración de las rutas de la API
 */
export const setupRoutes = (): Router => {
  const router = Router();

  // Repositorios
  const leagueRepository = new LeagueRepository();
  const tournamentRepository = new TournamentRepository();

  // Casos de uso de ligas
  const createLeagueUseCase = new CreateLeagueUseCase(leagueRepository);
  const getLeagueByIdUseCase = new GetLeagueByIdUseCase(leagueRepository);
  const getAllLeaguesUseCase = new GetAllLeaguesUseCase(leagueRepository);
  const updateLeagueUseCase = new UpdateLeagueUseCase(leagueRepository);
  const deleteLeagueUseCase = new DeleteLeagueUseCase(leagueRepository, tournamentRepository);

  // Casos de uso de torneos
  const createTournamentUseCase = new CreateTournamentUseCase(tournamentRepository, leagueRepository);
  const getTournamentByIdUseCase = new GetTournamentByIdUseCase(tournamentRepository);
  const getAllTournamentsUseCase = new GetAllTournamentsUseCase(tournamentRepository);
  const updateTournamentUseCase = new UpdateTournamentUseCase(tournamentRepository, leagueRepository);
  const deleteTournamentUseCase = new DeleteTournamentUseCase(tournamentRepository);

  // Controladores
  const leagueController = new LeagueController(
    createLeagueUseCase,
    getLeagueByIdUseCase,
    getAllLeaguesUseCase,
    updateLeagueUseCase,
    deleteLeagueUseCase
  );
  const tournamentController = new TournamentController(
    createTournamentUseCase,
    getTournamentByIdUseCase,
    getAllTournamentsUseCase,
    updateTournamentUseCase,
    deleteTournamentUseCase
  );

  // Rutas
  router.use('/leagues', leagueRouter(leagueController));
  router.use('/tournaments', tournamentRouter(tournamentController));

  return router;
}; 