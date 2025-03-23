import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Mock data
export const mockUsers = {
  admin: {
    id: 'admin-uuid',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    emailVerified: true,
    password: 'password123'
  },
  player: {
    id: 'player-uuid',
    email: 'player@example.com',
    name: 'Player User',
    role: 'player',
    emailVerified: true,
    password: 'password123'
  },
  nonExistent: {
    email: 'nonexistent@example.com',
    password: 'wrongpassword'
  }
};

export const mockTokens = {
  valid: 'valid-token',
  invalid: 'invalid-token',
  expired: 'expired-token'
};

export const mockSessions = {
  valid: {
    access_token: mockTokens.valid,
    refresh_token: 'valid-refresh-token',
    expires_at: Date.now() + 3600000 // 1 hour from now
  }
};

// Helper to generate test tokens for users with specific roles
export const generateTestToken = (
  user: { id: string; email: string; role: string },
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

// Create mock Supabase client
export const createMockSupabaseClient = () => {
  return {
    auth: {
      signInWithPassword: jest.fn().mockImplementation(({ email, password }) => {
        if (email === mockUsers.admin.email && password === mockUsers.admin.password) {
          return {
            data: {
              user: {
                id: mockUsers.admin.id,
                email: mockUsers.admin.email,
                user_metadata: {
                  name: mockUsers.admin.name,
                  role: mockUsers.admin.role
                }
              },
              session: mockSessions.valid
            },
            error: null
          };
        } else if (email === mockUsers.player.email && password === mockUsers.player.password) {
          return {
            data: {
              user: {
                id: mockUsers.player.id,
                email: mockUsers.player.email,
                user_metadata: {
                  name: mockUsers.player.name,
                  role: mockUsers.player.role
                }
              },
              session: mockSessions.valid
            },
            error: null
          };
        } else {
          return {
            data: { user: null, session: null },
            error: {
              message: 'Invalid login credentials',
              status: 400
            }
          };
        }
      }),
      signUp: jest.fn().mockImplementation(({ email, password, options }) => {
        // Simulate user already exists
        if (email === mockUsers.admin.email || email === mockUsers.player.email) {
          return {
            data: { user: null, session: null },
            error: {
              message: 'User already registered',
              status: 400
            }
          };
        }

        // Create new user
        const newUser = {
          id: `new-user-${Date.now()}`,
          email,
          user_metadata: options?.data || {}
        };

        return {
          data: {
            user: newUser,
            session: {
              access_token: generateTestToken({
                id: newUser.id,
                email: newUser.email,
                role: newUser.user_metadata.role || 'player'
              }),
              refresh_token: 'new-refresh-token',
              expires_at: Date.now() + 3600000
            }
          },
          error: null
        };
      }),
      getUser: jest.fn().mockImplementation((token) => {
        if (token === mockTokens.valid) {
          return {
            data: {
              user: {
                id: mockUsers.admin.id,
                email: mockUsers.admin.email,
                user_metadata: {
                  name: mockUsers.admin.name,
                  role: mockUsers.admin.role
                }
              }
            },
            error: null
          };
        } else {
          return {
            data: { user: null },
            error: {
              message: 'Invalid token',
              status: 401
            }
          };
        }
      }),
      getSession: jest.fn().mockImplementation(() => {
        return {
          data: {
            session: mockSessions.valid
          },
          error: null
        };
      }),
      admin: {
        deleteUser: jest.fn().mockImplementation((id) => {
          if (id === mockUsers.admin.id || id === mockUsers.player.id) {
            return {
              data: { user: { id } },
              error: null
            };
          } else {
            return {
              data: { user: null },
              error: {
                message: 'User not found',
                status: 404
              }
            };
          }
        })
      },
      setSession: jest.fn().mockImplementation((currentSession) => {
        if (currentSession.refresh_token === 'valid-refresh-token') {
          return {
            data: {
              session: {
                ...mockSessions.valid,
                access_token: 'new-access-token'
              }
            },
            error: null
          };
        } else {
          return {
            data: { session: null },
            error: {
              message: 'Invalid refresh token',
              status: 401
            }
          };
        }
      })
    },
    from: jest.fn().mockImplementation((table) => {
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          if (table === 'users') {
            return {
              data: {
                id: mockUsers.admin.id,
                email: mockUsers.admin.email,
                name: mockUsers.admin.name,
                role: mockUsers.admin.role
              },
              error: null
            };
          } else {
            return { data: null, error: null };
          }
        })
      };
    })
  };
};

// Mock Supabase client creation
export const mockCreateClient = jest.fn().mockImplementation(() => createMockSupabaseClient());

// Export as the default and named export
export { mockCreateClient as createClient };
export default mockCreateClient;

// Mock the supabase module
export const mockSupabaseModule = () => {
  jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn().mockImplementation(() => createMockSupabaseClient())
  }));
};

// Setup function to initialize the Supabase mock
export const setupSupabaseMock = () => {
  mockSupabaseModule();
}; 