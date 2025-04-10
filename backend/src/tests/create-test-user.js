const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUserManually() {
  try {
    const user = await prisma.user.create({
      data: {
        id: 'dcf0122d-380c-4308-a63d-64bd90fe94cf',
        email: 'test@test.es',
        name: 'prueba',
        role: 'PLAYER',
        password: '**SUPABASE_AUTH**',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    console.log('Usuario creado con éxito:', user);
  } catch (error) {
    console.error('Error creando usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUserManually(); 