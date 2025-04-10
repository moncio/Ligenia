// Establecer entorno de prueba antes de cualquier importación
process.env.NODE_ENV = 'test';

// Importar dependencias
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import path from 'path';
import supertest from 'supertest';
import app from '../../src/app';

// Cargar variables de entorno de prueba
config({ path: path.resolve(__dirname, '../../.env.test') });

// Sobreescribir DATABASE_URL manualmente para asegurar que usa la DB de test
process.env.DATABASE_URL = 'postgresql://ligenia_user_test:C0mpl3x_D8_P4ssw0rd_7531*@localhost:5433/db_ligenia_test';

// Verificar que estamos usando la base de datos de prueba
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || !dbUrl.includes('test')) {
  console.error('ERROR: No se está usando la base de datos de prueba');
  console.error('DATABASE_URL:', dbUrl);
  throw new Error('No se está usando la base de datos de prueba. Por favor, verifica las variables de entorno.');
}

// Crear un cliente Prisma para las pruebas con la URL específica de test
export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

// Log de la conexión a la base de datos
console.log(`Conectando a la base de datos de prueba: ${process.env.DATABASE_URL}`);

// Crear un cliente de peticiones HTTP para las pruebas
export const request = supertest(app);

// Configuración global antes de todas las pruebas
beforeAll(async () => {
  try {
    // Verificar la conexión a la base de datos
    await prisma.$connect();
    console.log('Conexión a la base de datos de prueba establecida');
    
    // Limpiar tablas de prueba antes de cada suite de tests
    // Limpieza no destructiva - mantiene las tablas pero elimina los datos
    // Verificamos qué modelos existen en prisma antes de intentar usarlos
    const deleteOperations = [];
    
    // Verificar cada modelo antes de usarlo
    if ('match' in prisma) deleteOperations.push(prisma.match.deleteMany());
    if ('player' in prisma) deleteOperations.push(prisma.player.deleteMany());
    if ('statistic' in prisma) deleteOperations.push(prisma.statistic.deleteMany());
    if ('tournament' in prisma) deleteOperations.push(prisma.tournament.deleteMany());
    if ('user' in prisma) deleteOperations.push(prisma.user.deleteMany());
    
    // Solo si hay operaciones, ejecutamos la transacción
    if (deleteOperations.length > 0) {
      await prisma.$transaction(deleteOperations);
    }

    console.log('Base de datos de prueba limpiada correctamente');
  } catch (error) {
    console.error('Error en setup de pruebas:', error);
    throw error; // Lanzar el error para detener los tests si no se puede conectar a la DB
  }
});

// Configuración global después de todas las pruebas
afterAll(async () => {
  try {
    // Limpiar tablas después de completar las pruebas
    const deleteOperations = [];
    
    // Verificar cada modelo antes de usarlo
    if ('match' in prisma) deleteOperations.push(prisma.match.deleteMany());
    if ('player' in prisma) deleteOperations.push(prisma.player.deleteMany());
    if ('statistic' in prisma) deleteOperations.push(prisma.statistic.deleteMany());
    if ('tournament' in prisma) deleteOperations.push(prisma.tournament.deleteMany());
    if ('user' in prisma) deleteOperations.push(prisma.user.deleteMany());
    
    // Solo si hay operaciones, ejecutamos la transacción
    if (deleteOperations.length > 0) {
      await prisma.$transaction(deleteOperations);
    }
    
    console.log('Base de datos de prueba limpiada después de los tests');
  } catch (error) {
    console.error('Error en teardown de pruebas:', error);
  } finally {
    // Desconectar cliente Prisma
    await prisma.$disconnect();
    console.log('Desconexión de la base de datos de prueba');
  }
});
