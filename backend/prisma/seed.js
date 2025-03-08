const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Limpiar datos existentes (opcional)
    console.log('Limpiando datos existentes...');
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.statistic.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.tournament.deleteMany({});
    await prisma.league.deleteMany({});
    await prisma.chatbot.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.location.deleteMany({});

    console.log('Insertando ubicaciones...');
    // Crear ubicaciones
    const location1 = await prisma.location.create({
      data: {
        name: 'Club Deportivo Central',
        address: 'Calle Principal 123',
        city: 'Madrid',
        postalCode: '28001',
        country: 'España',
        coordinates: { lat: 40.416775, lng: -3.703790 },
        facilities: {
          courts: 6,
          indoorCourts: 2,
          outdoorCourts: 4,
          hasShowers: true,
          hasParking: true,
          hasRestaurant: true
        }
      }
    });

    const location2 = await prisma.location.create({
      data: {
        name: 'Polideportivo Municipal',
        address: 'Avenida del Deporte 45',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'España',
        coordinates: { lat: 41.385064, lng: 2.173404 },
        facilities: {
          courts: 8,
          indoorCourts: 0,
          outdoorCourts: 8,
          hasShowers: true,
          hasParking: true,
          hasRestaurant: false
        }
      }
    });

    const location3 = await prisma.location.create({
      data: {
        name: 'Pabellón Principal',
        address: 'Calle del Deporte 78',
        city: 'Valencia',
        postalCode: '46001',
        country: 'España',
        coordinates: { lat: 39.469907, lng: -0.376288 },
        facilities: {
          courts: 4,
          indoorCourts: 4,
          outdoorCourts: 0,
          hasShowers: true,
          hasParking: true,
          hasRestaurant: true
        }
      }
    });

    console.log('Insertando roles...');
    // Crear roles predefinidos
    const adminRole = await prisma.role.create({
      data: {
        name: 'ADMIN',
        description: 'Administrador del sistema con acceso completo',
        permissions: {
          canManageUsers: true,
          canManageLeagues: true,
          canManageTournaments: true,
          canManageTeams: true,
          canManageMatches: true,
          canViewStatistics: true,
          canManageSystem: true
        }
      }
    });

    const playerRole = await prisma.role.create({
      data: {
        name: 'PLAYER',
        description: 'Jugador que participa en torneos',
        permissions: {
          canJoinTeams: true,
          canViewTournaments: true,
          canViewMatches: true,
          canViewStatistics: true
        }
      }
    });

    const coachRole = await prisma.role.create({
      data: {
        name: 'COACH',
        description: 'Entrenador que puede gestionar equipos',
        permissions: {
          canManageTeams: true,
          canViewTournaments: true,
          canViewMatches: true,
          canViewStatistics: true,
          canAnalyzePerformance: true
        }
      }
    });

    const refereeRole = await prisma.role.create({
      data: {
        name: 'REFEREE',
        description: 'Árbitro que puede gestionar partidos',
        permissions: {
          canManageMatches: true,
          canViewTournaments: true,
          canViewTeams: true,
          canViewStatistics: true
        }
      }
    });

    console.log('Insertando usuarios...');
    // Crear usuarios
    const user1 = await prisma.user.create({
      data: {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'password123',
        roles: {
          connect: { id: playerRole.id }
        }
      },
    });

    const user2 = await prisma.user.create({
      data: {
        name: 'María García',
        email: 'maria@example.com',
        password: 'password123',
        roles: {
          connect: { id: playerRole.id }
        }
      },
    });

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        roles: {
          connect: { id: adminRole.id }
        }
      },
    });

    const user3 = await prisma.user.create({
      data: {
        name: 'Carlos Rodríguez',
        email: 'carlos@example.com',
        password: 'password123',
        roles: {
          connect: { id: playerRole.id }
        }
      },
    });

    const user4 = await prisma.user.create({
      data: {
        name: 'Ana Martínez',
        email: 'ana@example.com',
        password: 'password123',
        roles: {
          connect: { id: playerRole.id }
        }
      },
    });

    const user5 = await prisma.user.create({
      data: {
        name: 'Pedro Sánchez',
        email: 'pedro@example.com',
        password: 'password123',
        roles: {
          connect: { id: playerRole.id }
        }
      },
    });

    const user6 = await prisma.user.create({
      data: {
        name: 'Laura Gómez',
        email: 'laura@example.com',
        password: 'password123',
        roles: {
          connect: { id: playerRole.id }
        }
      },
    });

    const coach = await prisma.user.create({
      data: {
        name: 'Javier Entrenador',
        email: 'coach@example.com',
        password: 'coach123',
        roles: {
          connect: { id: coachRole.id }
        }
      },
    });

    const referee = await prisma.user.create({
      data: {
        name: 'Marta Árbitro',
        email: 'referee@example.com',
        password: 'referee123',
        roles: {
          connect: { id: refereeRole.id }
        }
      },
    });

    // Usuario con múltiples roles
    const multiRoleUser = await prisma.user.create({
      data: {
        name: 'Miguel Multiroles',
        email: 'miguel@example.com',
        password: 'password123',
        roles: {
          connect: [
            { id: playerRole.id },
            { id: coachRole.id }
          ]
        }
      },
    });

    console.log('Insertando liga...');
    // Crear liga
    const league = await prisma.league.create({
      data: {
        name: 'Liga de Padel 2024',
        adminId: admin.id,
        scoringType: 'STANDARD',
        description: 'Liga oficial de pádel para la temporada 2024',
        logoUrl: 'https://example.com/logos/liga2024.png',
        isPublic: true
      },
    });

    console.log('Insertando torneo...');
    // Crear torneo
    const tournament = await prisma.tournament.create({
      data: {
        name: 'Torneo Primavera',
        leagueId: league.id,
        description: 'Torneo de primavera con los mejores jugadores de la liga',
        modality: 'DOUBLES',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        rules: {
          matchFormat: 'Best of 3 sets',
          scoringSystem: 'Standard',
          tiebreakRules: 'At 6-6 in each set',
          substituteAllowed: false
        },
        prizes: {
          first: { money: 1000, trophy: true },
          second: { money: 500, trophy: true },
          third: { money: 250, trophy: false }
        },
        registrationFee: 50.00,
        maxTeams: 16,
        minTeams: 8,
        logoUrl: 'https://example.com/logos/primavera2024.png'
      },
    });

    // Crear un segundo torneo en estado DRAFT
    const tournamentDraft = await prisma.tournament.create({
      data: {
        name: 'Torneo Verano',
        leagueId: league.id,
        modality: 'DOUBLES',
        status: 'DRAFT',
        startDate: new Date(new Date().setMonth(new Date().getMonth() + 4)),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 7)),
      },
    });

    // Crear un torneo completado
    const tournamentCompleted = await prisma.tournament.create({
      data: {
        name: 'Torneo Invierno',
        leagueId: league.id,
        modality: 'DOUBLES',
        status: 'COMPLETED',
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        endDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      },
    });

    console.log('Insertando equipos...');
    // Crear equipos
    const team1 = await prisma.team.create({
      data: {
        tournamentId: tournament.id,
        player1Id: user1.id,
        player2Id: user2.id,
        name: 'Equipo Águilas',
        users: {
          connect: [{ id: user1.id }, { id: user2.id }],
        },
      },
    });

    const team2 = await prisma.team.create({
      data: {
        tournamentId: tournament.id,
        player1Id: user3.id,
        player2Id: user4.id,
        name: 'Equipo Tigres',
        users: {
          connect: [{ id: user3.id }, { id: user4.id }],
        },
      },
    });

    // Crear un tercer equipo para el torneo activo
    const team3 = await prisma.team.create({
      data: {
        tournamentId: tournament.id,
        player1Id: user5.id,
        player2Id: user6.id,
        name: 'Equipo Leones',
        users: {
          connect: [{ id: user5.id }, { id: user6.id }],
        },
      },
    });

    // Crear equipos para el torneo en estado DRAFT
    const teamDraft1 = await prisma.team.create({
      data: {
        tournamentId: tournamentDraft.id,
        player1Id: user1.id,
        player2Id: user3.id,
        name: 'Equipo Halcones',
        users: {
          connect: [{ id: user1.id }, { id: user3.id }],
        },
      },
    });

    const teamDraft2 = await prisma.team.create({
      data: {
        tournamentId: tournamentDraft.id,
        player1Id: user2.id,
        player2Id: user4.id,
        name: 'Equipo Panteras',
        users: {
          connect: [{ id: user2.id }, { id: user4.id }],
        },
      },
    });

    // Crear equipos para el torneo completado
    const teamCompleted1 = await prisma.team.create({
      data: {
        tournamentId: tournamentCompleted.id,
        player1Id: user1.id,
        player2Id: user4.id,
        name: 'Equipo Campeones',
        users: {
          connect: [{ id: user1.id }, { id: user4.id }],
        },
      },
    });

    const teamCompleted2 = await prisma.team.create({
      data: {
        tournamentId: tournamentCompleted.id,
        player1Id: user2.id,
        player2Id: user3.id,
        name: 'Equipo Subcampeones',
        users: {
          connect: [{ id: user2.id }, { id: user3.id }],
        },
      },
    });

    console.log('Insertando partido...');
    // Crear partido
    const match = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        team1Id: team1.id,
        team2Id: team2.id,
        result: { 
          sets: [
            { team1: 6, team2: 4 },
            { team1: 7, team2: 6 },
          ],
          winner: team1.id
        },
        date: new Date(),
        locationId: location1.id,
        notes: 'Partido muy reñido con gran nivel de juego',
        teams: {
          connect: [{ id: team1.id }, { id: team2.id }],
        },
      },
    });

    // Crear un segundo partido entre team1 y team3
    const match2 = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        team1Id: team1.id,
        team2Id: team3.id,
        result: { 
          sets: [
            { team1: 4, team2: 6 },
            { team1: 3, team2: 6 },
          ],
          winner: team3.id
        },
        date: new Date(new Date().setDate(new Date().getDate() + 7)),
        locationId: location2.id,
        notes: 'Dominio claro del Equipo Leones',
        teams: {
          connect: [{ id: team1.id }, { id: team3.id }],
        },
      },
    });

    // Crear un tercer partido entre team2 y team3
    const match3 = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        team1Id: team2.id,
        team2Id: team3.id,
        result: { 
          sets: [
            { team1: 7, team2: 5 },
            { team1: 4, team2: 6 },
            { team1: 7, team2: 6 },
          ],
          winner: team2.id
        },
        date: new Date(new Date().setDate(new Date().getDate() + 14)),
        locationId: location1.id,
        notes: 'Partido a tres sets con gran remontada del Equipo Tigres',
        teams: {
          connect: [{ id: team2.id }, { id: team3.id }],
        },
      },
    });

    // Crear partido para el torneo completado (final)
    const matchFinal = await prisma.match.create({
      data: {
        tournamentId: tournamentCompleted.id,
        team1Id: teamCompleted1.id,
        team2Id: teamCompleted2.id,
        result: { 
          sets: [
            { team1: 6, team2: 3 },
            { team1: 6, team2: 4 },
          ],
          winner: teamCompleted1.id
        },
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        locationId: location3.id,
        notes: 'Final del torneo con victoria clara del Equipo Campeones',
        teams: {
          connect: [{ id: teamCompleted1.id }, { id: teamCompleted2.id }],
        },
      },
    });

    console.log('Insertando estadísticas...');
    // Crear estadísticas
    await prisma.statistic.create({
      data: {
        playerId: user1.id,
        tournamentId: tournament.id,
        points: 15,
        wins: 1,
        losses: 1,
        matches: {
          connect: [{ id: match.id }, { id: match2.id }],
        },
        setsWon: 2,
        setsLost: 2,
        gamesWon: 20,
        gamesLost: 16,
        aces: 5,
        doubleFaults: 2,
        breakPointsSaved: 3,
        breakPointsFaced: 5,
        firstServePercentage: 68.5,
        secondServePercentage: 52.3,
        winningPercentage: 50.0,
        performanceRating: 7.5,
        advancedStats: {
          forehandWinners: 12,
          backhandWinners: 8,
          netPoints: 15,
          netPointsWon: 10
        }
      },
    });

    await prisma.statistic.create({
      data: {
        playerId: user2.id,
        tournamentId: tournament.id,
        points: 15,
        wins: 1,
        losses: 1,
        matches: {
          connect: [{ id: match.id }, { id: match2.id }],
        },
      },
    });

    await prisma.statistic.create({
      data: {
        playerId: user3.id,
        tournamentId: tournament.id,
        points: 15,
        wins: 1,
        losses: 1,
        matches: {
          connect: [{ id: match.id }, { id: match3.id }],
        },
      },
    });

    await prisma.statistic.create({
      data: {
        playerId: user4.id,
        tournamentId: tournament.id,
        points: 15,
        wins: 1,
        losses: 1,
        matches: {
          connect: [{ id: match.id }, { id: match3.id }],
        },
      },
    });

    // Estadísticas para los nuevos jugadores
    await prisma.statistic.create({
      data: {
        playerId: user5.id,
        tournamentId: tournament.id,
        points: 20,
        wins: 1,
        losses: 1,
        matches: {
          connect: [{ id: match2.id }, { id: match3.id }],
        },
      },
    });

    await prisma.statistic.create({
      data: {
        playerId: user6.id,
        tournamentId: tournament.id,
        points: 20,
        wins: 1,
        losses: 1,
        matches: {
          connect: [{ id: match2.id }, { id: match3.id }],
        },
      },
    });

    // Estadísticas para el torneo completado
    await prisma.statistic.create({
      data: {
        playerId: user1.id,
        tournamentId: tournamentCompleted.id,
        points: 30,
        wins: 3,
        losses: 0,
        matches: {
          connect: [{ id: matchFinal.id }],
        },
      },
    });

    await prisma.statistic.create({
      data: {
        playerId: user4.id,
        tournamentId: tournamentCompleted.id,
        points: 30,
        wins: 3,
        losses: 0,
        matches: {
          connect: [{ id: matchFinal.id }],
        },
      },
    });

    await prisma.statistic.create({
      data: {
        playerId: user2.id,
        tournamentId: tournamentCompleted.id,
        points: 20,
        wins: 2,
        losses: 1,
        matches: {
          connect: [{ id: matchFinal.id }],
        },
      },
    });

    await prisma.statistic.create({
      data: {
        playerId: user3.id,
        tournamentId: tournamentCompleted.id,
        points: 20,
        wins: 2,
        losses: 1,
        matches: {
          connect: [{ id: matchFinal.id }],
        },
      },
    });

    console.log('Insertando notificaciones...');
    // Crear notificaciones
    await prisma.notification.create({
      data: {
        type: 'MATCH_SCHEDULED',
        title: 'Nuevo partido programado',
        message: 'Tu próximo partido contra Equipo Tigres ha sido programado para el 15 de mayo a las 18:00.',
        userId: user1.id,
        relatedData: {
          matchId: match.id,
          tournamentId: tournament.id,
          date: new Date(new Date().setDate(new Date().getDate() + 7))
        }
      }
    });

    await prisma.notification.create({
      data: {
        type: 'MATCH_RESULT',
        title: 'Resultado de partido',
        message: 'Has ganado tu partido contra Equipo Tigres. ¡Felicidades!',
        isRead: true,
        userId: user1.id,
        relatedData: {
          matchId: match.id,
          tournamentId: tournament.id,
          result: { winner: team1.id }
        }
      }
    });

    await prisma.notification.create({
      data: {
        type: 'TOURNAMENT_UPDATE',
        title: 'Actualización del torneo',
        message: 'El Torneo Primavera ha sido actualizado con nuevas reglas.',
        userId: user2.id,
        relatedData: {
          tournamentId: tournament.id
        }
      }
    });

    console.log('Insertando registros de auditoría...');
    // Crear registros de auditoría
    await prisma.auditLog.create({
      data: {
        actionType: 'CREATE',
        entityType: 'Tournament',
        entityId: tournament.id,
        userId: admin.id,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: {
          name: 'Torneo Primavera',
          leagueId: league.id,
          modality: 'DOUBLES',
          status: 'ACTIVE'
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        actionType: 'UPDATE',
        entityType: 'Match',
        entityId: match.id,
        userId: admin.id,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: {
          field: 'result',
          oldValue: null,
          newValue: { winner: team1.id }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        actionType: 'LOGIN',
        entityType: 'User',
        entityId: user1.id,
        userId: user1.id,
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        details: {
          success: true,
          timestamp: new Date()
        }
      }
    });

    console.log('Insertando chatbots...');
    // Crear chatbots
    const ligeniaChatbot = await prisma.chatbot.create({
      data: {
        name: 'Ligenia Assistant',
        users: {
          connect: [{ id: admin.id }]
        }
      }
    });

    const statsChatbot = await prisma.chatbot.create({
      data: {
        name: 'Stats Analyzer',
        users: {
          connect: [{ id: user1.id }, { id: user2.id }]
        }
      }
    });

    console.log('Datos de prueba insertados correctamente');
  } catch (error) {
    console.error('Error al insertar datos de prueba:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 