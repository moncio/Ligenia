const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el directorio raíz
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  // Otras variables de entorno que necesites
}; 