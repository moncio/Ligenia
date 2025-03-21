import { Container } from 'inversify';
import { IAuthService } from '../core/application/interfaces/auth';
import { SupabaseAuthService } from '../infrastructure/auth';

// Symbols for dependency injection
export const TYPES = {
  AuthService: Symbol.for('AuthService'),
};

// Create and configure container
const container = new Container();

// Register dependencies
container.bind<IAuthService>(TYPES.AuthService).to(SupabaseAuthService);

export { container }; 