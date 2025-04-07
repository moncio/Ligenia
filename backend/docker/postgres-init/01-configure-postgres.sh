#!/bin/bash
set -e

# Modifica pg_hba.conf para permitir conexiones desde cualquier dirección IP con contraseña
cat > /var/lib/postgresql/data/pg_hba.conf << EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             0.0.0.0/0               md5
host    all             all             ::/0                    md5
EOF

# Modifica postgresql.conf para escuchar en todas las interfaces
cat >> /var/lib/postgresql/data/postgresql.conf << EOF
listen_addresses = '*'
EOF 