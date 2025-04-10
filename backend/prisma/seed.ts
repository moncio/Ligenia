import { PrismaClient, UserRole, TournamentFormat, MatchStatus, PlayerLevel, TournamentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  try {
    // Limpiar datos existentes
    await prisma.performanceHistory.deleteMany({});
    await prisma.userPreference.deleteMany({});
    await prisma.userToken.deleteMany({});
    await prisma.statistic.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.tournament.deleteMany({});
    await prisma.user.deleteMany({});

    // Crear usuarios de prueba
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Usuario administrador
    const admin = await prisma.user.create({
      data: {
        email: 'admin@ligenia.com',
        password: adminPassword,
        name: 'Carlos Fernández Sánchez',
        role: UserRole.ADMIN,
        emailVerified: true
      }
    });

    // Jugadores con diferentes niveles y edades
    const user1 = await prisma.user.create({
      data: {
        email: 'rafael.gomez@gmail.com',
        password: userPassword,
        name: 'Rafael Gómez Martínez',
        emailVerified: true
      }
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'alejandro.diaz@hotmail.com',
        password: userPassword,
        name: 'Alejandro Díaz Serrano',
        emailVerified: true
      }
    });

    const user3 = await prisma.user.create({
      data: {
        email: 'laura.torres@outlook.com',
        password: userPassword,
        name: 'Laura Torres Jiménez',
        emailVerified: false
      }
    });

    const user4 = await prisma.user.create({
      data: {
        email: 'marta.lopez@gmail.com',
        password: userPassword,
        name: 'Marta López Ruiz',
        emailVerified: true
      }
    });

    // Crear jugadores adicionales
    const user5 = await prisma.user.create({
      data: {
        email: 'javier.martinez@yahoo.es',
        password: userPassword,
        name: 'Javier Martínez García',
        emailVerified: true
      }
    });

    const user6 = await prisma.user.create({
      data: {
        email: 'sofia.rodriguez@gmail.com',
        password: userPassword,
        name: 'Sofía Rodríguez Navarro',
        emailVerified: true
      }
    });

    const user7 = await prisma.user.create({
      data: {
        email: 'pablo.moreno@outlook.com',
        password: userPassword,
        name: 'Pablo Moreno Ortega',
        emailVerified: false
      }
    });

    const user8 = await prisma.user.create({
      data: {
        email: 'elena.sanchez@gmail.com',
        password: userPassword,
        name: 'Elena Sánchez Castro',
        emailVerified: false
      }
    });

    // Otro administrador
    const admin2 = await prisma.user.create({
      data: {
        email: 'director@ligenia.com',
        password: adminPassword,
        name: 'Lucía Herrera Molina',
        role: UserRole.ADMIN,
        emailVerified: true
      }
    });

    // Crear perfiles de jugador usando Prisma con datos más realistas
    await prisma.player.create({
      data: {
        userId: admin.id,
        level: PlayerLevel.P1,
        age: 35,
        country: 'España',
        avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
    });

    await prisma.player.create({
      data: {
        userId: user1.id,
        level: PlayerLevel.P1,
        age: 29,
        country: 'España',
        avatar_url: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
    });

    await prisma.player.create({
      data: {
        userId: user2.id,
        level: PlayerLevel.P1,
        age: 31,
        country: 'Argentina',
        avatar_url: 'https://randomuser.me/api/portraits/men/3.jpg',
      },
    });

    await prisma.player.create({
      data: {
        userId: user3.id,
        level: PlayerLevel.P2,
        age: 27,
        country: 'España',
        avatar_url: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
    });

    await prisma.player.create({
      data: {
        userId: user4.id,
        level: PlayerLevel.P2,
        age: 24,
        country: 'Colombia',
        avatar_url: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
    });

    // Crear perfiles de jugador para los nuevos usuarios
    await prisma.player.create({
      data: {
        userId: user5.id,
        level: PlayerLevel.P2,
        age: 33,
        country: 'España',
        avatar_url: 'https://randomuser.me/api/portraits/men/4.jpg',
      },
    });

    await prisma.player.create({
      data: {
        userId: user6.id,
        level: PlayerLevel.P3,
        age: 26,
        country: 'México',
        avatar_url: 'https://randomuser.me/api/portraits/women/3.jpg',
      },
    });

    await prisma.player.create({
      data: {
        userId: user7.id,
        level: PlayerLevel.P3,
        age: 22,
        country: 'Chile',
        avatar_url: 'https://randomuser.me/api/portraits/men/5.jpg',
      },
    });

    await prisma.player.create({
      data: {
        userId: user8.id,
        level: PlayerLevel.P3,
        age: 30,
        country: 'España',
        avatar_url: 'https://randomuser.me/api/portraits/women/4.jpg',
      },
    });

    // Crear preferencias de usuario para probar esa entidad
    const allUsers = [admin, user1, user2, user3, user4, user5, user6, user7, user8];
    const themes = ['light', 'dark', 'system'];
    const fontSizes = [14, 16, 18, 20];
    
    for (let i = 0; i < allUsers.length; i++) {
      await prisma.userPreference.create({
        data: {
          userId: allUsers[i].id,
          theme: themes[i % themes.length],
          fontSize: fontSizes[i % fontSizes.length],
        },
      });
    }

    // Crear historial de rendimiento para algunos jugadores
    const currentYear = new Date().getFullYear();
    const selectedUsers = [admin, user1, user2, user4, user5];
    
    for (const user of selectedUsers) {
      // Historial anual
      await prisma.performanceHistory.create({
        data: {
          userId: user.id,
          year: currentYear - 1,
          matchesPlayed: Math.floor(Math.random() * 20) + 10,
          wins: Math.floor(Math.random() * 15),
          losses: Math.floor(Math.random() * 10),
          points: Math.floor(Math.random() * 100) + 50,
        },
      });
      
      // Historial mensual (últimos 3 meses)
      for (let i = 1; i <= 3; i++) {
        await prisma.performanceHistory.create({
          data: {
            userId: user.id,
            year: currentYear,
            month: i,
            matchesPlayed: Math.floor(Math.random() * 5) + 2,
            wins: Math.floor(Math.random() * 4),
            losses: Math.floor(Math.random() * 3),
            points: Math.floor(Math.random() * 30) + 10,
          },
        });
      }
    }

    // Crear tokens para usuarios (para verificación de email, reset password, etc.)
    // Crear un token de verificación de email para usuarios no verificados
    const emailVerificationDate = new Date();
    emailVerificationDate.setDate(emailVerificationDate.getDate() + 3); // Expira en 3 días
    
    const unverifiedUsers = [user3, user7, user8];
    for (const user of unverifiedUsers) {
      await prisma.userToken.create({
        data: {
          userId: user.id,
          token: `email_verify_${Math.random().toString(36).substring(2, 15)}`,
          type: 'email_verification',
          expiresAt: emailVerificationDate,
        },
      });
    }
    
    // Crear algunos tokens de refresh para usuarios que han iniciado sesión
    const refreshTokenDate = new Date();
    refreshTokenDate.setDate(refreshTokenDate.getDate() + 30); // Expira en 30 días
    
    const loginUsers = [admin, user1, user2, user4, user5, user6];
    for (const user of loginUsers) {
      await prisma.userToken.create({
        data: {
          userId: user.id,
          token: `refresh_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          type: 'refresh_token',
          expiresAt: refreshTokenDate,
        },
      });
    }
    
    // Simular un token de restablecimiento de contraseña
    const resetPasswordDate = new Date();
    resetPasswordDate.setHours(resetPasswordDate.getHours() + 1); // Expira en 1 hora
    
    await prisma.userToken.create({
      data: {
        userId: user2.id,
        token: `reset_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        type: 'reset_password',
        expiresAt: resetPasswordDate,
      },
    });

    // Crear varios torneos
    
    // Torneo 1: Nivel avanzado que ya pasó
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    
    const pastEndDate = new Date(pastDate);
    pastEndDate.setDate(pastEndDate.getDate() + 2);
    
    const pastRegistrationEndDate = new Date(pastDate);
    pastRegistrationEndDate.setDate(pastRegistrationEndDate.getDate() - 7);

    const pastTournament = await prisma.tournament.create({
      data: {
        name: 'Torneo Maestros Madrid 2025',
        description: 'Competición exclusiva para jugadores avanzados en el Club Deportivo Madrid',
        startDate: pastDate,
        endDate: pastEndDate,
        registrationEndDate: pastRegistrationEndDate,
        location: 'Club Deportivo Madrid - Pistas Centrales',
        category: PlayerLevel.P1,
        format: TournamentFormat.SINGLE_ELIMINATION,
        status: TournamentStatus.COMPLETED,
      },
    });
    
    // Torneo 2: Nivel intermedio próximo
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14); 
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);
    
    const registrationEndDate = new Date(startDate);
    registrationEndDate.setDate(registrationEndDate.getDate() - 7);

    const tournament = await prisma.tournament.create({
      data: {
        name: 'Copa Primavera Barcelona 2025',
        description: 'Torneo de nivel intermedio con grandes premios para los finalistas',
        startDate: startDate,
        endDate: endDate,
        registrationEndDate: registrationEndDate,
        location: 'Club de Pádel Barcelona - Zona Olímpica',
        category: PlayerLevel.P2,
        format: TournamentFormat.SINGLE_ELIMINATION,
        status: TournamentStatus.ACTIVE,
      },
    });
    
    // Torneo 3: Nivel principiante en el futuro
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    
    const futureEndDate = new Date(futureDate);
    futureEndDate.setDate(futureEndDate.getDate() + 3);
    
    const futureRegistrationEndDate = new Date(futureDate);
    futureRegistrationEndDate.setDate(futureRegistrationEndDate.getDate() - 10);

    const futureTournament = await prisma.tournament.create({
      data: {
        name: 'Torneo de Verano Málaga 2025',
        description: 'Evento para jugadores principiantes en un entorno festivo y familiar',
        startDate: futureDate,
        endDate: futureEndDate,
        registrationEndDate: futureRegistrationEndDate,
        location: 'Club Social Málaga - Costa del Sol',
        category: PlayerLevel.P3,
        format: TournamentFormat.SINGLE_ELIMINATION,
        status: TournamentStatus.DRAFT,
      },
    });

    // Conectar participantes a los torneos
    
    // Torneo pasado (jugadores nivel P1)
    await prisma.tournament.update({
      where: { id: pastTournament.id },
      data: {
        participants: {
          connect: [
            { id: admin.id },
            { id: user1.id },
            { id: user2.id },
          ],
        },
      },
    });
    
    // Torneo activo (jugadores nivel P2)
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        participants: {
          connect: [
            { id: user3.id },
            { id: user4.id },
            { id: user5.id },
            { id: user6.id },
          ],
        },
      },
    });
    
    // Torneo futuro (jugadores nivel P3)
    await prisma.tournament.update({
      where: { id: futureTournament.id },
      data: {
        participants: {
          connect: [
            { id: user6.id },
            { id: user7.id },
            { id: user8.id },
          ],
        },
      },
    });

    // Generar partidos para los torneos
    
    // Partidos para el torneo pasado (resultados completos)
    await prisma.match.create({
      data: {
        tournamentId: pastTournament.id,
        homePlayerOneId: admin.id,
        homePlayerTwoId: user1.id,
        awayPlayerOneId: user1.id,
        awayPlayerTwoId: user2.id,
        round: 1,
        date: pastDate,
        location: 'Pista 1',
        status: MatchStatus.COMPLETED,
        homeScore: 6,
        awayScore: 4,
      },
    });
    
    // Partidos para el torneo activo
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        homePlayerOneId: user3.id,
        homePlayerTwoId: user4.id,
        awayPlayerOneId: user5.id,
        awayPlayerTwoId: user6.id,
        round: 1,
        date: startDate,
        location: 'Pista Central',
        status: MatchStatus.PENDING,
      },
    });
    
    // Partido adicional para el torneo activo (más pruebas de relaciones)
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        homePlayerOneId: user5.id,
        homePlayerTwoId: user3.id,
        awayPlayerOneId: user6.id,
        awayPlayerTwoId: user4.id,
        round: 2,
        date: new Date(startDate.getTime() + 24 * 60 * 60 * 1000), // Un día después
        location: 'Pista B',
        status: MatchStatus.PENDING,
      },
    });
    
    // Partido de prueba en estado IN_PROGRESS
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        homePlayerOneId: user4.id,
        homePlayerTwoId: user6.id,
        awayPlayerOneId: user3.id,
        awayPlayerTwoId: user5.id,
        round: 1,
        date: new Date(), // Hoy
        location: 'Pista Auxiliar',
        status: MatchStatus.IN_PROGRESS,
        homeScore: 3,
        awayScore: 2,
      },
    });

    // Crear estadísticas para los jugadores del torneo pasado
    await prisma.statistic.create({
      data: {
        userId: admin.id,
        tournamentId: pastTournament.id,
        matchesPlayed: 1,
        wins: 1,
        losses: 0,
        points: 10,
        rank: 1,
      },
    });
    
    await prisma.statistic.create({
      data: {
        userId: user1.id,
        tournamentId: pastTournament.id,
        matchesPlayed: 1,
        wins: 0,
        losses: 1,
        points: 5,
        rank: 2,
      },
    });
    
    await prisma.statistic.create({
      data: {
        userId: user2.id,
        tournamentId: pastTournament.id,
        matchesPlayed: 1,
        wins: 0,
        losses: 1,
        points: 3,
        rank: 3,
      },
    });

    // Estadísticas iniciales para el torneo activo - vamos a asignar valores manualmente
    await prisma.statistic.create({
      data: {
        userId: user3.id,
        tournamentId: tournament.id,
        matchesPlayed: 1,
        wins: 0,
        losses: 1,
        points: 2,
        rank: 4,
      },
    });
    
    await prisma.statistic.create({
      data: {
        userId: user4.id,
        tournamentId: tournament.id,
        matchesPlayed: 1,
        wins: 1,
        losses: 0,
        points: 5,
        rank: 1,
      },
    });
    
    await prisma.statistic.create({
      data: {
        userId: user5.id,
        tournamentId: tournament.id,
        matchesPlayed: 1,
        wins: 0,
        losses: 0,
        points: 0,
        rank: 2,
      },
    });
    
    await prisma.statistic.create({
      data: {
        userId: user6.id,
        tournamentId: tournament.id,
        matchesPlayed: 1,
        wins: 0,
        losses: 0,
        points: 0,
        rank: 3,
      },
    });
    
    // Estadísticas iniciales para el torneo futuro
    for (const user of [user6, user7, user8]) {
      await prisma.statistic.create({
        data: {
          userId: user.id,
          tournamentId: futureTournament.id,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          points: 0,
          rank: 0,
        },
      });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 