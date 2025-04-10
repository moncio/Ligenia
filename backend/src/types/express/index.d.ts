import { Container } from 'inversify';
import { UserRole } from '../../core/domain/user/user.entity';

declare global {
  namespace Express {
    interface Request {
      container?: Container;
      user?: {
        id: string;
        email: string;
        name?: string;
        role: UserRole;
      };
    }
  }
} 