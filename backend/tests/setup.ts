import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Create a new PrismaClient instance for testing
export const prisma = new PrismaClient();

// Global setup
beforeAll(async () => {
  // Add any global setup here
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
