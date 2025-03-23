// Establecer entorno de prueba antes de cualquier importación
process.env.NODE_ENV = 'test';

// Importar dependencias
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import path from 'path';
import { Container } from 'inversify';
import { TYPES, container } from '../../src/config/di-container';
import { IAuthService } from '../../src/core/application/interfaces/auth-service.interface';
import { MockAuthService } from '../mocks/auth-service.mock';

// Cargar variables de entorno de prueba
config({ path: path.resolve(__dirname, '../../.env.test') });

// Configurar variables de entorno para pruebas
process.env.SUPABASE_URL = 'https://test-supabase-url.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-supabase-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-supabase-service-role-key';
process.env.JWT_SECRET = 'test-jwt-secret';

// Registrar el MockAuthService en el contenedor ANTES de importar app
container.bind<IAuthService>(TYPES.AuthService).to(MockAuthService).inSingletonScope();

// Ahora podemos importar app ya que el contenedor está configurado
import supertest from 'supertest';
import app from '../../src/app';

// Exportar el servicio de autenticación mock para usarlo en las pruebas
export const mockAuthService = container.get<IAuthService>(TYPES.AuthService);

// Crear un cliente Prisma para las pruebas
export const prisma = new PrismaClient();

// Crear un cliente de peticiones HTTP para las pruebas
export const request = supertest(app);

// Configuración global antes de todas las pruebas
beforeAll(async () => {
  try {
    // Limpiar tablas de prueba antes de cada suite de tests
    await prisma.$transaction([
      prisma.match.deleteMany(),
      prisma.player.deleteMany(),
      prisma.statistic.deleteMany(),
      prisma.tournament.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    // Aquí podrías añadir seeds para pruebas
  } catch (error) {
    console.error('Error en setup de pruebas:', error);
  }
});

// Configuración global después de todas las pruebas
afterAll(async () => {
  try {
    // Limpiar tablas después de completar las pruebas
    await prisma.$transaction([
      prisma.match.deleteMany(),
      prisma.player.deleteMany(),
      prisma.statistic.deleteMany(),
      prisma.tournament.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  } catch (error) {
    console.error('Error en teardown de pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
});

// Limpiar mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
});
