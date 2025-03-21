import 'reflect-metadata';
import { SupabaseAuthService } from '../../../../src/infrastructure/auth/supabase';
import { Result } from '../../../../src/shared/result';
import { EmailAlreadyInUseError, InvalidCredentialsError, InvalidTokenError, UserNotFoundError } from '../../../../src/shared/errors/auth.error';
import { createClient } from '@supabase/supabase-js';
import { ILoginCredentials, IRegistrationData } from '../../../../src/core/application/interfaces/auth';

// Mock environment variables
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-key';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      refreshSession: jest.fn(),
      getUser: jest.fn(),
      admin: {
        updateUserById: jest.fn(),
        deleteUser: jest.fn(),
      },
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    })),
  })),
}));

describe('SupabaseAuthService', () => {
  let authService: SupabaseAuthService;
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new SupabaseAuthService();
    mockSupabaseClient = (createClient as jest.Mock).mock.results[0].value;
  });

  describe('login', () => {
    it('should return token response on successful login', async () => {
      // Arrange
      const credentials: ILoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
      };

      const mockSession = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
      };

      const mockUserDetails = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PLAYER',
        emailVerified: true,
      };

      // Mock signInWithPassword
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      // Configurar el mock para getUserById (que usa from -> select -> eq -> single)
      const selectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserDetails,
            error: null,
          }),
        }),
      });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'PLAYER',
          emailVerified: true,
        },
      });
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('User');
      expect(selectMock).toHaveBeenCalledWith('id, email, name, role, emailVerified');
    });

    it('should return failure when credentials are invalid', async () => {
      // Arrange
      const credentials: ILoginCredentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBeInstanceOf(InvalidCredentialsError);
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
      });
    });
  });

  describe('register', () => {
    it('should return token response on successful registration', async () => {
      // Arrange
      const registrationData: IRegistrationData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'PLAYER',
      };

      const mockUser = {
        id: 'user456',
        email: 'newuser@example.com',
      };

      const mockSession = {
        access_token: 'access-token-456',
        refresh_token: 'refresh-token-456',
      };

      // Configurar desde cero todos los mocks para este test
      jest.clearAllMocks();

      // 1. Verificar si el email existe: retorna null (no existe)
      const checkEmailSelectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      // 2. Crear usuario: signUp
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      // 3. Insertar en la base de datos
      const insertMock = jest.fn().mockResolvedValue({
        error: null,
      });

      // Configurar el mock from para que retorne diferentes comportamientos
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'User') {
          return {
            select: checkEmailSelectMock,
            insert: insertMock,
          };
        }
        return {};
      });

      // Act
      const result = await authService.register(registrationData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        accessToken: 'access-token-456',
        refreshToken: 'refresh-token-456',
        user: {
          id: 'user456',
          email: 'newuser@example.com',
          name: 'New User',
          role: 'PLAYER',
          emailVerified: false,
        },
      });
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: registrationData.email,
        password: registrationData.password,
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('User');
      expect(insertMock).toHaveBeenCalled();
    });

    it('should return failure when email is already in use', async () => {
      // Arrange
      const registrationData: IRegistrationData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      // Configurar desde cero los mocks
      jest.clearAllMocks();

      // El email ya existe
      const checkEmailSelectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { email: 'existing@example.com' },
            error: null,
          }),
        }),
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'User') {
          return {
            select: checkEmailSelectMock,
          };
        }
        return {};
      });

      // Act
      const result = await authService.register(registrationData);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBeInstanceOf(EmailAlreadyInUseError);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('User');
      expect(checkEmailSelectMock).toHaveBeenCalledWith('email');
    });
  });

  describe('validateToken', () => {
    it('should return valid response with user for a valid token', async () => {
      // Arrange
      const token = 'valid-token-123';
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
      };

      const mockUserDetails = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PLAYER',
        emailVerified: true,
      };

      // Configurar desde cero todos los mocks para este test
      jest.clearAllMocks();

      // Mock para nueva instancia de Supabase con token
      (createClient as jest.Mock).mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn(),
      });

      // Mock para getUserById
      const selectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserDetails,
            error: null,
          }),
        }),
      });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      // Act
      const result = await authService.validateToken(token);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        valid: true,
        user: mockUserDetails,
      });
      expect(createClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          global: { headers: { Authorization: `Bearer ${token}` } },
        })
      );
    });

    it('should return invalid response for an invalid token', async () => {
      // Arrange
      const token = 'invalid-token';

      // Configurar desde cero todos los mocks para este test
      jest.clearAllMocks();

      // Mock para nueva instancia de Supabase con token
      (createClient as jest.Mock).mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid token' },
          }),
        },
        from: jest.fn(),
      });

      // Act
      const result = await authService.validateToken(token);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        valid: false,
      });
    });
  });

  describe('refreshToken', () => {
    it('should return new token response on successful refresh', async () => {
      // Arrange
      const refreshToken = 'refresh-token-123';
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
      };

      const mockSession = {
        access_token: 'new-access-token-123',
        refresh_token: 'new-refresh-token-123',
      };

      const mockUserDetails = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PLAYER',
        emailVerified: true,
      };

      // Configurar desde cero todos los mocks para este test
      jest.clearAllMocks();

      // Mock refreshSession
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      // Mock getUserById
      const selectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserDetails,
            error: null,
          }),
        }),
      });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      // Act
      const result = await authService.refreshToken(refreshToken);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        accessToken: 'new-access-token-123',
        refreshToken: 'new-refresh-token-123',
        user: mockUserDetails,
      });
      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: refreshToken,
      });
    });

    it('should return failure for an invalid refresh token', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';

      // Mock refreshSession con error
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid refresh token' },
      });

      // Act
      const result = await authService.refreshToken(refreshToken);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBeInstanceOf(InvalidTokenError);
      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: refreshToken,
      });
    });
  });

  describe('getUserById', () => {
    it('should return user details for existing user id', async () => {
      // Arrange
      const userId = 'user123';
      const mockUserDetails = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PLAYER',
        emailVerified: true,
      };

      // Configurar desde cero todos los mocks para este test
      jest.clearAllMocks();

      // Configurar mock para getUserById
      const selectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserDetails,
            error: null,
          }),
        }),
      });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      // Act
      const result = await authService.getUserById(userId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(mockUserDetails);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('User');
      expect(selectMock).toHaveBeenCalledWith('id, email, name, role, emailVerified');
    });

    it('should return failure for non-existent user id', async () => {
      // Arrange
      const userId = 'nonexistent-user';

      // Configurar desde cero todos los mocks para este test
      jest.clearAllMocks();

      // Configurar mock para getUserById - usuario no encontrado
      const selectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'No user found with this ID' },
          }),
        }),
      });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      // Act
      const result = await authService.getUserById(userId);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBeInstanceOf(UserNotFoundError);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('User');
    });
  });

  describe('updateUser', () => {
    it('should update user details successfully', async () => {
      // Arrange
      const userId = 'user123';
      const updateData = {
        name: 'Updated Name',
        role: 'ADMIN',
      };

      const originalUserDetails = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PLAYER',
        emailVerified: true,
      };

      const updatedUserDetails = {
        ...originalUserDetails,
        name: 'Updated Name',
        role: 'ADMIN',
      };

      // Configurar desde cero todos los mocks para este test
      jest.clearAllMocks();

      // 1. Mock para getUserById - verificar que el usuario existe
      const getUserSelectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: originalUserDetails,
            error: null,
          }),
        }),
      });

      // 2. Mock para el update
      const updateSelectMock = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: updatedUserDetails,
          error: null,
        }),
      });

      const updateEqMock = jest.fn().mockReturnValue({
        select: updateSelectMock,
      });

      const updateMock = jest.fn().mockReturnValue({
        eq: updateEqMock,
      });

      // Configurar el mock para diferentes llamadas
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'User') {
          return {
            select: getUserSelectMock,
            update: updateMock,
          };
        }
        return {};
      });

      // Act
      const result = await authService.updateUser(userId, updateData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(updatedUserDetails);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('User');
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining(updateData));
      expect(updateEqMock).toHaveBeenCalledWith('id', userId);
    });

    it('should return failure when user does not exist', async () => {
      // Arrange
      const userId = 'nonexistent-user';
      const updateData = {
        name: 'Updated Name',
      };

      // Configurar desde cero todos los mocks para este test
      jest.clearAllMocks();

      // Mock para getUserById - usuario no encontrado
      const getUserSelectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'No user found with this ID' },
          }),
        }),
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'User') {
          return {
            select: getUserSelectMock,
          };
        }
        return {};
      });

      // Act
      const result = await authService.updateUser(userId, updateData);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBeInstanceOf(UserNotFoundError);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('User');
    });

    it('should update email in both database and auth when email is provided', async () => {
      // Arrange
      const userId = 'user123';
      const updateData = {
        email: 'newemail@example.com',
        name: 'Updated Name',
      };

      const originalUserDetails = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PLAYER',
        emailVerified: true,
      };

      const updatedUserDetails = {
        ...originalUserDetails,
        email: 'newemail@example.com',
        name: 'Updated Name',
      };

      // Configurar desde cero todos los mocks para este test
      jest.clearAllMocks();

      // 1. Mock para getUserById - verificar que el usuario existe
      const getUserSelectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: originalUserDetails,
            error: null,
          }),
        }),
      });

      // 2. Mock para el update
      const updateSelectMock = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: updatedUserDetails,
          error: null,
        }),
      });

      const updateEqMock = jest.fn().mockReturnValue({
        select: updateSelectMock,
      });

      const updateMock = jest.fn().mockReturnValue({
        eq: updateEqMock,
      });

      // 3. Mock para updateUserById (actualizar email en auth)
      mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
        data: { user: { email: 'newemail@example.com' } },
        error: null,
      });

      // Configurar el mock para diferentes llamadas
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'User') {
          return {
            select: getUserSelectMock,
            update: updateMock,
          };
        }
        return {};
      });

      // Act
      const result = await authService.updateUser(userId, updateData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(updatedUserDetails);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('User');
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining(updateData));
      expect(mockSupabaseClient.auth.admin.updateUserById).toHaveBeenCalledWith(userId, {
        email: 'newemail@example.com',
      });
    });
  });
}); 