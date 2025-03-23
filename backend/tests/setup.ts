import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { setupSupabaseMock, mockSupabaseModule } from './utils/supabaseMock';
import { resolve } from 'path';

// Load test environment variables
config({ path: resolve(__dirname, '../.env.test') });

// Create a new PrismaClient instance for testing
export const prisma = new PrismaClient();

// Global setup
beforeAll(() => {
  // Mock del módulo de Supabase
  mockSupabaseModule();
  
  // Configurar el entorno de prueba
  process.env.NODE_ENV = 'test';
  
  // Forzar que Jest use las rutas correctas
  jest.mock('@supabase/supabase-js', () => require('./mocks/supabase.mock'));
  
  // Configurar mocks de servicios externos
  setupSupabaseMock();
});

// Global teardown
afterAll(async () => {
  await prisma.$disconnect();
});

// Configuración global para pruebas
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env.test si existe, o .env como fallback
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

// Limpiar todos los mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
});
