const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Número de rondas de hashing (mayor número = más seguro pero más lento)
const SALT_ROUNDS = 12;

// Middleware para hashear contraseñas antes de crear o actualizar usuarios
prisma.$use(async (params, next) => {
  // Solo aplicar a operaciones en el modelo User
  if (params.model === 'User') {
    // Hashear contraseña en operaciones create
    if (params.action === 'create' && params.args.data.password) {
      const hashedPassword = await bcrypt.hash(params.args.data.password, SALT_ROUNDS);
      params.args.data.password = hashedPassword;
    }
    
    // Hashear contraseña en operaciones update si se está actualizando la contraseña
    if (params.action === 'update' && params.args.data.password) {
      const hashedPassword = await bcrypt.hash(params.args.data.password, SALT_ROUNDS);
      params.args.data.password = hashedPassword;
    }
    
    // Hashear contraseña en operaciones updateMany (menos común)
    if (params.action === 'updateMany' && params.args.data.password) {
      const hashedPassword = await bcrypt.hash(params.args.data.password, SALT_ROUNDS);
      params.args.data.password = hashedPassword;
    }
  }
  
  return next(params);
});

// Función para verificar contraseñas
async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  prisma,
  verifyPassword
}; 