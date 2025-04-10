import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../src/core/domain/user/user.entity';

// Mock data
export const mockUsers = {
  admin: {
    id: 'admin-uuid',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    emailVerified: true,
    password: 'password123',
  },
  player: {
    id: 'player-uuid',
    email: 'player@example.com',
    name: 'Player User',
    role: 'player',
    emailVerified: true,
    password: 'password123',
  },
  nonExistent: {
    email: 'nonexistent@example.com',
    password: 'wrongpassword',
  },
};

export const mockTokens = {
  valid: 'valid-token',
  invalid: 'invalid-token',
  expired: 'expired-token',
};

export const mockSessions = {
  valid: {
    access_token: mockTokens.valid,
    refresh_token: 'valid-refresh-token',
    expires_at: Date.now() + 3600000, // 1 hour from now
  },
};

/**
 * Generate a test token for a user
 * @param user User data to include in the token
 * @returns JWT token string
 */
export function generateTestToken(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) {
  // Map the role string to UserRole enum
  const userRole = user.role.toUpperCase() === 'ADMIN' 
    ? UserRole.ADMIN 
    : UserRole.PLAYER;

  // Create a payload with the user data
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: userRole,
    // Add any other fields needed for testing
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
  };

  // Use a fixed secret for testing
  const secret = 'test-secret';

  // Generate and return the token
  return jwt.sign(payload, secret);
}

/**
 * Parse a token and return the user data
 * @param token JWT token string
 * @returns User data from the token
 */
export function parseTestToken(token: string) {
  try {
    // Use the same fixed secret used for generation
    const secret = 'test-secret';
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return null;
  }
}

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
                  role: mockUsers.admin.role,
                },
              },
              session: mockSessions.valid,
            },
            error: null,
          };
        } else if (email === mockUsers.player.email && password === mockUsers.player.password) {
          return {
            data: {
              user: {
                id: mockUsers.player.id,
                email: mockUsers.player.email,
                user_metadata: {
                  name: mockUsers.player.name,
                  role: mockUsers.player.role,
                },
              },
              session: mockSessions.valid,
            },
            error: null,
          };
        } else {
          return {
            data: { user: null, session: null },
            error: {
              message: 'Invalid login credentials',
              status: 400,
            },
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
              status: 400,
            },
          };
        }

        // Create new user
        const newUser = {
          id: `new-user-${Date.now()}`,
          email,
          user_metadata: options?.data || {},
        };

        return {
          data: {
            user: newUser,
            session: {
              access_token: generateTestToken({
                id: newUser.id,
                email: newUser.email,
                name: newUser.user_metadata.name || 'New User',
                role: newUser.user_metadata.role || 'player',
              }),
              refresh_token: 'new-refresh-token',
              expires_at: Date.now() + 3600000,
            },
          },
          error: null,
        };
      }),
      getUser: jest.fn().mockImplementation(token => {
        if (token === mockTokens.valid) {
          return {
            data: {
              user: {
                id: mockUsers.admin.id,
                email: mockUsers.admin.email,
                user_metadata: {
                  name: mockUsers.admin.name,
                  role: mockUsers.admin.role,
                },
              },
            },
            error: null,
          };
        } else {
          return {
            data: { user: null },
            error: {
              message: 'Invalid token',
              status: 401,
            },
          };
        }
      }),
      getSession: jest.fn().mockImplementation(() => {
        return {
          data: {
            session: mockSessions.valid,
          },
          error: null,
        };
      }),
      admin: {
        deleteUser: jest.fn().mockImplementation(id => {
          if (id === mockUsers.admin.id || id === mockUsers.player.id) {
            return {
              data: { user: { id } },
              error: null,
            };
          } else {
            return {
              data: { user: null },
              error: {
                message: 'User not found',
                status: 404,
              },
            };
          }
        }),
      },
      setSession: jest.fn().mockImplementation(currentSession => {
        if (currentSession.refresh_token === 'valid-refresh-token') {
          return {
            data: {
              session: {
                ...mockSessions.valid,
                access_token: 'new-access-token',
              },
            },
            error: null,
          };
        } else {
          return {
            data: { session: null },
            error: {
              message: 'Invalid refresh token',
              status: 401,
            },
          };
        }
      }),
    },
    from: jest.fn().mockImplementation(table => {
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          if (table === 'User') {
            return {
              data: {
                id: mockUsers.admin.id,
                email: mockUsers.admin.email,
                name: mockUsers.admin.name,
                role: mockUsers.admin.role,
                emailVerified: true,
              },
              error: null,
            };
          } else {
            return { data: null, error: null };
          }
        }),
      };
    }),
  };
};

// Mock Supabase client creation
export const mockCreateClient = jest.fn().mockImplementation(() => createMockSupabaseClient());

// Export as the default and named export
export { mockCreateClient as createClient };
export default mockCreateClient;

// Setup function to be called in test setup
export const setupSupabaseMock = () => {
  // Mock the createClient function to return our mock client
  jest.mock('@supabase/supabase-js', () => {
    const originalModule = jest.requireActual('@supabase/supabase-js');
    
    return {
      ...originalModule,
      createClient: jest.fn().mockImplementation(() => {
        const mockClient = createMockSupabaseClient();
        
        // Automatically sync users created in Auth to the database
        const originalSignUp = mockClient.auth.signUp;
        mockClient.auth.signUp = jest.fn().mockImplementation(async (credentials) => {
          const result = await originalSignUp(credentials);
          
          // If signup was successful, ensure user is created in database
          if (result.data?.user && !result.error) {
            // Get user repository to sync user
            // This is a mock implementation for tests
            const newUserId = result.data.user.id;
            const userEmail = result.data.user.email || '';
            const userName = result.data.user.user_metadata?.name || userEmail.split('@')[0] || 'User';
            const userRole = result.data.user.user_metadata?.role || 'PLAYER';
            
            // Mock the database insertion (we're not actually creating the user in the DB during tests)
            console.log(`[TEST] Mock sync: Created user ${newUserId} (${userEmail}) in local database`);
            
            // In a real application, you'd call user repository here to create the user
            // userRepository.create({...});
          }
          
          return result;
        });
        
        return mockClient;
      }),
    };
  });
  
  // Return a mock instance that can be used directly
  return createMockSupabaseClient();
};
