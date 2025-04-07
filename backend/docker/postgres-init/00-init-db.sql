-- Asegurar que el usuario existe con los permisos correctos
CREATE USER ligenia_user WITH PASSWORD 'C0mpl3x_D8_P4ssw0rd_7531*';
ALTER USER ligenia_user WITH SUPERUSER;

-- Crear la base de datos si no existe
CREATE DATABASE db_ligenia;
GRANT ALL PRIVILEGES ON DATABASE db_ligenia TO ligenia_user; 