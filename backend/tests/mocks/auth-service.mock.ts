import { IAuthService, IAuthUser, ILoginCredentials, IRegistrationData, ITokenResponse, ITokenValidationResponse } from '../../src/core/application/interfaces/auth';
import { Result } from '../../src/shared/result';
import { UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Definición de tipos para los usuarios mock
type MockUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  password: string;
};

// Definimos los datos mock directamente en este archivo para evitar problemas de importación
const mockUserData: { admin: MockUser; player: MockUser } = {
  admin: {
    id: 'admin-uuid',
    email: 'admin@example.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    emailVerified: true,
    password: 'password123'
  },
  player: {
    id: 'player-uuid',
    email: 'player@example.com',
    name: 'Player User',
    role: UserRole.PLAYER,
    emailVerified: true,
    password: 'password123'
  }
};

// Helper para generar tokens JWT para pruebas
const generateTestToken = (
  user: { id: string; email: string; role: UserRole },
  expiresIn = '1h'
): string => {
  const secret = process.env.JWT_SECRET || 'test-secret-key';
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
    },
    secret
  );
};

/**
 * Mock para el servicio de autenticación
 */
export class MockAuthService implements IAuthService {
  private users: Record<string, IAuthUser> = {
    [mockUserData.admin.id]: {
      id: mockUserData.admin.id,
      email: mockUserData.admin.email,
      name: mockUserData.admin.name,
      role: mockUserData.admin.role,
      emailVerified: true
    },
    [mockUserData.player.id]: {
      id: mockUserData.player.id,
      email: mockUserData.player.email,
      name: mockUserData.player.name,
      role: mockUserData.player.role,
      emailVerified: true
    }
  };

  async login(credentials: ILoginCredentials): Promise<Result<ITokenResponse>> {
    if (credentials.email === mockUserData.admin.email && credentials.password === mockUserData.admin.password) {
      const token = generateTestToken({
        id: mockUserData.admin.id,
        email: mockUserData.admin.email,
        role: mockUserData.admin.role
      });
      
      return Result.ok({
        accessToken: token,
        refreshToken: 'admin-refresh-token',
        user: {
          id: mockUserData.admin.id,
          email: mockUserData.admin.email,
          name: mockUserData.admin.name,
          role: mockUserData.admin.role,
          emailVerified: true
        }
      });
    }
    
    if (credentials.email === mockUserData.player.email && credentials.password === mockUserData.player.password) {
      const token = generateTestToken({
        id: mockUserData.player.id,
        email: mockUserData.player.email,
        role: mockUserData.player.role
      });
      
      return Result.ok({
        accessToken: token,
        refreshToken: 'player-refresh-token',
        user: {
          id: mockUserData.player.id,
          email: mockUserData.player.email,
          name: mockUserData.player.name,
          role: mockUserData.player.role,
          emailVerified: true
        }
      });
    }
    
    return Result.fail(new Error('Invalid credentials'));
  }

  async register(data: IRegistrationData): Promise<Result<ITokenResponse>> {
    // Verificar si el correo ya está registrado
    const existingUser = Object.values(this.users).find(user => user.email === data.email);
    if (existingUser) {
      return Result.fail(new Error('Email already in use'));
    }
    
    // Crear un nuevo usuario y asegurar que el rol es un valor válido de UserRole
    const newUserId = `user-${Date.now()}`;
    
    // Asegurar que el rol es un valor válido del enum UserRole
    let userRole: UserRole;
    if (data.role === UserRole.ADMIN) {
      userRole = UserRole.ADMIN;
    } else {
      userRole = UserRole.PLAYER;
    }
      
    const newUser: IAuthUser = {
      id: newUserId,
      email: data.email,
      name: data.name,
      role: userRole,
      emailVerified: false
    };
    
    this.users[newUserId] = newUser;
    
    const token = generateTestToken({
      id: newUserId,
      email: newUser.email,
      role: userRole
    });
    
    return Result.ok({
      accessToken: token,
      refreshToken: 'new-refresh-token',
      user: newUser
    });
  }

  async validateToken(token: string): Promise<Result<ITokenValidationResponse>> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key');
      if (typeof decoded === 'object' && decoded.sub) {
        const userId = decoded.sub as string;
        const user = this.users[userId];
        
        if (user) {
          return Result.ok({
            valid: true,
            user
          });
        }
      }
      return Result.ok({ valid: false });
    } catch (error) {
      return Result.ok({ valid: false });
    }
  }

  async getUserById(userId: string): Promise<Result<IAuthUser>> {
    const user = this.users[userId];
    if (!user) {
      return Result.fail(new Error('User not found'));
    }
    
    return Result.ok(user);
  }

  async updateUser(userId: string, data: Partial<IAuthUser>): Promise<Result<IAuthUser>> {
    const user = this.users[userId];
    if (!user) {
      return Result.fail(new Error('User not found'));
    }
    
    // Asegurar que si el rol se actualiza, sea un valor válido
    let updatedRole = user.role;
    if (data.role) {
      if (data.role === UserRole.ADMIN || data.role === UserRole.PLAYER) {
        updatedRole = data.role;
      }
    }
    
    // Actualizar usuario asegurando tipos correctos
    const updatedUser: IAuthUser = {
      ...user,
      ...data,
      role: updatedRole
    };
    
    this.users[userId] = updatedUser;
    
    return Result.ok(this.users[userId]);
  }

  async refreshToken(refreshToken: string): Promise<Result<ITokenResponse>> {
    if (refreshToken === 'admin-refresh-token') {
      const token = generateTestToken({
        id: mockUserData.admin.id,
        email: mockUserData.admin.email,
        role: mockUserData.admin.role
      });
      
      return Result.ok({
        accessToken: token,
        refreshToken: 'new-admin-refresh-token',
        user: this.users[mockUserData.admin.id]
      });
    }
    
    if (refreshToken === 'player-refresh-token') {
      const token = generateTestToken({
        id: mockUserData.player.id,
        email: mockUserData.player.email,
        role: mockUserData.player.role
      });
      
      return Result.ok({
        accessToken: token,
        refreshToken: 'new-player-refresh-token',
        user: this.users[mockUserData.player.id]
      });
    }
    
    return Result.fail(new Error('Invalid refresh token'));
  }
}

// Exportamos las constantes para que los tests puedan acceder a ellas
export const mockUsers = mockUserData; 