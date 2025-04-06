#!/usr/bin/env ts-node
import { PrismaClient, UserRole, TournamentFormat, MatchStatus, PlayerLevel, TournamentStatus } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function populateUserData(userId: string) {
    console.log('🧪 Generando datos de prueba para el usuario...');
    
    try {
        // 1. Verificar que el usuario existe y obtener su perfil de jugador
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            console.error('❌ Usuario no encontrado');
            return;
        }

        console.log(`✅ Usuario encontrado: ${user.name} (${user.email})`);

        // Buscar el perfil del jugador por separado
        let player = await prisma.player.findUnique({
            where: { userId: user.id }
        });

        // 2. Crear perfil de jugador si no existe
        if (!player) {
            player = await prisma.player.create({
                data: {
                    userId: user.id,
                    level: PlayerLevel.P3,
                    age: 25 + Math.floor(Math.random() * 15),
                    country: 'Spain',
                    avatar_url: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 10)}.jpg`,
                }
            });
            console.log('✅ Perfil de jugador creado');
        }

        // 3. Crear torneos en diferentes estados
        console.log('\n🏆 Generando torneos...');

        // Torneo pasado (completado)
        const pastDate = new Date();
        pastDate.setMonth(pastDate.getMonth() - 1);
        const pastTournament = await prisma.tournament.create({
            data: {
                name: 'Torneo de Primavera 2024',
                description: 'Torneo completado con victorias y derrotas',
                startDate: pastDate,
                endDate: new Date(pastDate.getTime() + 7 * 24 * 60 * 60 * 1000),
                registrationEndDate: new Date(pastDate.getTime() - 7 * 24 * 60 * 60 * 1000),
                location: 'Club Deportivo Madrid',
                category: PlayerLevel.P3,
                format: TournamentFormat.SINGLE_ELIMINATION,
                status: TournamentStatus.COMPLETED,
                participants: {
                    connect: [{ id: userId }]
                }
            }
        });

        // Torneo activo
        const activeTournament = await prisma.tournament.create({
            data: {
                name: 'Torneo de Verano 2024',
                description: 'Torneo en curso con partidos pendientes',
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                registrationEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                location: 'Club Deportivo Barcelona',
                category: PlayerLevel.P3,
                format: TournamentFormat.SINGLE_ELIMINATION,
                status: TournamentStatus.ACTIVE,
                participants: {
                    connect: [{ id: userId }]
                }
            }
        });

        // Torneo futuro
        const futureTournament = await prisma.tournament.create({
            data: {
                name: 'Torneo de Otoño 2024',
                description: 'Próximo torneo - Inscripciones abiertas',
                startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
                registrationEndDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                location: 'Club Deportivo Valencia',
                category: PlayerLevel.P3,
                format: TournamentFormat.SINGLE_ELIMINATION,
                status: TournamentStatus.DRAFT,  // Cambiado de OPEN a DRAFT
                participants: {
                    connect: [{ id: userId }]
                }
            }
        });

        console.log('✅ Torneos creados exitosamente');

        // 4. Crear partidos en diferentes estados
        console.log('\n🎮 Generando partidos...');

        // Partido completado (victoria)
        await prisma.match.create({
            data: {
                tournamentId: pastTournament.id,
                homePlayerOneId: userId,
                homePlayerTwoId: userId,  // Requerido por el schema
                awayPlayerOneId: userId,
                awayPlayerTwoId: userId,  // Requerido por el schema
                round: 1,
                date: pastDate,
                location: 'Pista Central',
                status: MatchStatus.COMPLETED,
                homeScore: 6,
                awayScore: 4,
            }
        });

        // Partido completado (derrota)
        await prisma.match.create({
            data: {
                tournamentId: pastTournament.id,
                homePlayerOneId: userId,
                homePlayerTwoId: userId,  // Requerido por el schema
                awayPlayerOneId: userId,
                awayPlayerTwoId: userId,  // Requerido por el schema
                round: 2,
                date: new Date(pastDate.getTime() + 24 * 60 * 60 * 1000),
                location: 'Pista 2',
                status: MatchStatus.COMPLETED,
                homeScore: 3,
                awayScore: 6,
            }
        });

        // Partido en progreso
        await prisma.match.create({
            data: {
                tournamentId: activeTournament.id,
                homePlayerOneId: userId,
                homePlayerTwoId: userId,  // Requerido por el schema
                awayPlayerOneId: userId,
                awayPlayerTwoId: userId,  // Requerido por el schema
                round: 1,
                date: new Date(),
                location: 'Pista Principal',
                status: MatchStatus.IN_PROGRESS,
                homeScore: 2,
                awayScore: 1,
            }
        });

        // Partido pendiente
        await prisma.match.create({
            data: {
                tournamentId: activeTournament.id,
                homePlayerOneId: userId,
                homePlayerTwoId: userId,  // Requerido por el schema
                awayPlayerOneId: userId,
                awayPlayerTwoId: userId,  // Requerido por el schema
                round: 2,
                date: new Date(Date.now() + 24 * 60 * 60 * 1000),
                location: 'Pista 3',
                status: MatchStatus.PENDING,
            }
        });

        console.log('✅ Partidos creados exitosamente');

        // 5. Crear estadísticas
        console.log('\n📊 Generando estadísticas...');

        // Estadísticas para torneo pasado
        await prisma.statistic.create({
            data: {
                userId: userId,
                tournamentId: pastTournament.id,
                matchesPlayed: 2,
                wins: 1,
                losses: 1,
                points: 15,
                rank: 2,
            }
        });

        // Estadísticas para torneo activo
        await prisma.statistic.create({
            data: {
                userId: userId,
                tournamentId: activeTournament.id,
                matchesPlayed: 1,
                wins: 0,
                losses: 0,
                points: 5,
                rank: 3,
            }
        });

        // Estadísticas iniciales para torneo futuro
        await prisma.statistic.create({
            data: {
                userId: userId,
                tournamentId: futureTournament.id,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                points: 0,
                rank: 0,
            }
        });

        console.log('✅ Estadísticas creadas exitosamente');

        console.log('\n✨ Datos de prueba generados exitosamente');
        
    } catch (error) {
        console.error('❌ Error generando datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// ID del usuario actual (el que obtuvimos del token)
const userId = '5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc';

// Ejecutar el script
populateUserData(userId)
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });