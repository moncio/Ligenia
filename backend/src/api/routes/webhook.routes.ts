import { Router } from 'express';
import { Request, Response } from 'express';
import { container } from '../../config/di-container';
import { TYPES } from '../../config/di-container';
import { IUserRepository } from '../../core/application/interfaces/repositories/user.repository';
import { UserRole } from '../../core/domain/user/user.entity';
import { logWithRequestId } from '../../config/logger';
import { User } from '../../core/domain/user/user.entity';
import { UserRepository } from '../../infrastructure/database/prisma/repositories/user.repository';
import { PrismaClient } from '@prisma/client';

const router = Router();
// Create a PrismaClient instance to use directly if there are dependency injection issues
const prismaClient = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Supabase webhook endpoints
 */

/**
 * @swagger
 * /api/webhooks/supabase/user:
 *   post:
 *     summary: Webhook for Supabase user events
 *     description: Receives user events from Supabase (signup, login, etc.)
 *     tags: [Webhooks]
 *     security: []
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Event processed successfully
 *       500:
 *         description: Server error
 */
router.post('/supabase/user', async (req: Request, res: Response) => {
  const log = logWithRequestId(req);
  try {
    // Log the full request body for diagnostic purposes
    log.info(`Webhook received - Complete body: ${JSON.stringify(req.body)}`);
    
    // Extract the event from the request body
    const event = req.body;
    
    // Try to determine the event type and user data in various possible formats
    let isUserCreationEvent = false;
    let userData: any = null;
    
    // 1. Standard Supabase webhook format for DB changes
    if (event.type === 'INSERT') {
      log.info('Detected INSERT event type');
      
      // Check common Supabase format
      if (
        (event.table === 'auth.users' || 
         (event.table === 'users' && event.schema === 'auth') ||
         event.table === 'users')
      ) {
        isUserCreationEvent = true;
        userData = event.record;
        log.info(`User creation event detected in table ${event.table}`);
      }
    } 
    // 2. Auth Webhook format (may vary)
    else if (event.type === 'signup' || event.event === 'signup' || event.event === 'user.created') {
      log.info('Detected signup/user creation event');
      isUserCreationEvent = true;
      userData = event.user || event.record || event.data;
    } 
    // 3. Custom event or alternative format
    else if (event.user || event.record) {
      log.info('Detected possible user event in custom format');
      isUserCreationEvent = true;
      userData = event.user || event.record;
    }
    // 4. Test if the event is the user object directly (without wrapper)
    else if (event.id && (event.email || event.user_metadata)) {
      log.info('The event appears to be a user object directly');
      isUserCreationEvent = true;
      userData = event;
    }
    
    if (isUserCreationEvent && userData) {
      log.info(`Processing user creation event with data:`, { userData: JSON.stringify(userData) });
      
      // Confirm we have a user ID
      const userId = userData.id || userData.user_id;
      
      if (!userId) {
        log.error('User ID not found in webhook data');
        return res.status(400).json({ 
          status: 'error',
          message: 'User ID not found in webhook' 
        });
      }
      
      let userRepository: IUserRepository;
      
      try {
        // Try to get the repository from the container
        userRepository = container.get<IUserRepository>(TYPES.UserRepository);
        log.info('UserRepository successfully obtained from container');
      } catch (error) {
        // If it fails, create one manually
        log.warn('Error getting UserRepository from container, creating direct instance', { error });
        userRepository = new UserRepository(prismaClient);
      }
      
      log.info(`Checking if user ${userId} already exists in local database`);
      
      // Check if user already exists in our database
      const existingUser = await userRepository.findById(userId);
      
      if (existingUser) {
        log.info(`User ${userId} already exists in local database`);
        return res.status(200).json({ 
          status: 'success',
          message: 'User already synchronized' 
        });
      }
      
      // Create user in our database
      log.info(`Creating new user in local database with ID: ${userId}`);
      
      // Extract user data in different possible formats
      const email = userData.email || userData.user_metadata?.email || '';
      const name = userData.user_metadata?.name || 
                   userData.raw_user_meta_data?.name ||
                   userData.name || 
                   (email ? email.split('@')[0] : 'User');
      
      const emailVerified = userData.email_confirmed_at || 
                           userData.confirmed_at || 
                           userData.email_verified || 
                           false;
      
      const newUser = new User(
        userId,
        email,
        '**hashed**', // This would actually be hashed, but we're delegating authentication to Supabase
        name,
        UserRole.PLAYER, // Default role
        !!emailVerified, // Convert to explicit boolean
        new Date(),
        new Date()
      );
      
      log.info(`User object created, about to save to database: ${JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      })}`);
      
      try {
        await userRepository.save(newUser);
        log.info(`User successfully saved to local database: ${newUser.id}`);
        
        // Create default preferences for the new user
        try {
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          await prisma.userPreference.create({
            data: {
              userId: newUser.id,
              theme: 'light',
              fontSize: 16,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          });
          
          // Create a Player profile for the new user
          try {
            await prisma.player.create({
              data: {
                userId: newUser.id,
                level: 'P3', // Default level P3
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            });
            log.info(`Player profile created for user: ${newUser.id}`);
            
            // Create default empty statistics for the player
            try {
              // Find a global tournament or create one if needed
              const globalTournament = await prisma.tournament.findFirst({
                where: {
                  name: 'Global Rankings',
                }
              });
              
              let tournamentId;
              if (globalTournament) {
                tournamentId = globalTournament.id;
              } else {
                // If no global tournament exists, we can't create statistics yet
                // as they require a tournament ID in the schema
                log.info(`No global tournament found for initial statistics. Statistics creation skipped.`);
              }
              
              // Only create statistics if we have a tournament
              if (tournamentId) {
                await prisma.statistic.create({
                  data: {
                    userId: newUser.id,
                    tournamentId: tournamentId,
                    matchesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    points: 0,
                    rank: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }
                });
                log.info(`Initial statistics created for user: ${newUser.id} in tournament: ${tournamentId}`);
              }
            } catch (statError) {
              log.error(`Error creating initial statistics: ${statError instanceof Error ? statError.message : 'Unknown error'}`, {
                error: statError instanceof Error ? statError.stack : 'No stack trace',
                userId: newUser.id,
              });
              // Continue anyway as the user and player are already created
            }
          } catch (playerError) {
            log.error(`Error creating player profile: ${playerError instanceof Error ? playerError.message : 'Unknown error'}`, {
              error: playerError instanceof Error ? playerError.stack : 'No stack trace',
              userId: newUser.id,
            });
            // Continue anyway as the user is already created
          }
          
          await prisma.$disconnect();
          log.info(`Default preferences created for user: ${newUser.id}`);
        } catch (prefError) {
          log.error(`Error creating default preferences: ${prefError instanceof Error ? prefError.message : 'Unknown error'}`, {
            error: prefError instanceof Error ? prefError.stack : 'No stack trace',
            userId: newUser.id,
          });
          // We continue anyway as the user is already created
        }
      } catch (saveError) {
        log.error(`Error saving user to database: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`, { 
          error: saveError instanceof Error ? saveError.stack : 'No stack trace',
          userData: JSON.stringify(newUser)
        });
        throw saveError;
      }
      
      return res.status(200).json({ 
        status: 'success',
        message: 'User synchronized from Supabase' 
      });
    }
    
    // Default response for unhandled events
    log.info('Event received but no action taken', { 
      eventType: event.type || event.event, 
      table: event.table, 
      schema: event.schema 
    });
    
    return res.status(200).json({ 
      status: 'success',
      message: 'Event received but no action taken' 
    });
    
  } catch (error) {
    log.error('Error processing Supabase webhook:', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return res.status(500).json({ 
      status: 'error',
      message: 'Error processing webhook' 
    });
  }
});

export default router; 