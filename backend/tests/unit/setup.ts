import { config } from 'dotenv';
import path from 'path';
import { Container } from 'inversify';
import { IAuthService } from '../../src/core/application/interfaces/auth';
import { TYPES } from '../../src/config/di-container';

// Configurar variables de entorno para pruebas
config({ path: path.resolve(__dirname, '../../.env.test') });

// Configurar variables de entorno para Supabase
process.env.SUPABASE_URL = 'https://test-supabase-url.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-supabase-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-supabase-service-role-key';
process.env.JWT_SECRET = 'test-jwt-secret';

// Mock para Supabase
jest.mock('@supabase/supabase-js', () => {
  const { createMockSupabaseClient } = require('../utils/supabaseMock');
  return {
    createClient: jest.fn().mockImplementation(() => createMockSupabaseClient())
  };
});

// Crear un contenedor de inyección de dependencias para pruebas
export const testContainer = new Container();

// Configurar mocks antes de cada test
beforeEach(() => {
  // Limpiar mocks
  jest.clearAllMocks();
});

// Limpiar después de cada test
afterEach(() => {
  // Limpiar mocks
  jest.clearAllMocks();
});
