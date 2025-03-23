import { Container } from 'inversify';
import { IAuthService } from '../core/application/interfaces/auth';
import { SupabaseAuthService } from '../infrastructure/auth';

// Symbols for dependency injection
export const TYPES = {
  AuthService: Symbol.for('AuthService'),
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
}

export { container }; 