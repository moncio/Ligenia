// Configuración global para pruebas
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env.test si existe, o .env como fallback
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

// Aumentar el timeout para pruebas que pueden tardar más (como las de integración)
jest.setTimeout(30000);

// Limpiar todos los mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
}); 