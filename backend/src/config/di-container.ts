import { Container } from 'inversify';
import { IAuthService } from '../core/application/interfaces/auth-service.interface';
import { SupabaseAuthService } from '../infrastructure/auth';
import { TrackPerformanceTrendsUseCase } from '../core/application/use-cases/performance-history/track-performance-trends.use-case';
import { IPerformanceHistoryRepository } from '../core/application/interfaces/repositories/performance-history.repository';

// Symbols for dependency injection
export const TYPES = {
  AuthService: Symbol.for('AuthService'),
  PerformanceHistoryRepository: Symbol.for('PerformanceHistoryRepository')
};

// Create and configure container
let container: Container;

// En entorno de pruebas, el contenedor se configura externamente
if (process.env.NODE_ENV === 'test') {
  container = new Container();
} else {
  // En entorno de producción o desarrollo, configuramos normalmente
  container = new Container();
  container.bind<IAuthService>(TYPES.AuthService).to(SupabaseAuthService);
  
  // Register use cases
  container.bind('trackPerformanceTrendsUseCase').toDynamicValue(() => {
    const repository = container.get<IPerformanceHistoryRepository>(TYPES.PerformanceHistoryRepository);
    return new TrackPerformanceTrendsUseCase(repository);
  });
}

export { container }; 