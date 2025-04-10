import { Router } from 'express';
import { Request, Response } from 'express';
import { container } from '../../config/di-container';
import { TYPES } from '../../config/di-container';
import { IAuthService } from '../../core/application/interfaces/auth-service.interface';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Debug
 *   description: Diagnostic endpoints (only for development)
 */

/**
 * @swagger
 * /api/debug/token-validation:
 *   post:
 *     summary: Validate a token and show detailed diagnostics
 *     description: For debugging authentication issues
 *     tags: [Debug]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Detailed token validation results
 *       500:
 *         description: Server error
 */
router.post('/token-validation', async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      status: 'error',
      message: 'Token is required'
    });
  }

  try {
    // Step 1: Get AuthService from container
    console.log('Getting AuthService from container...');
    let authService;
    try {
      authService = container.get<IAuthService>(TYPES.AuthService);
      console.log('AuthService obtained successfully');
    } catch (containerError) {
      console.error('Error getting AuthService from container:', containerError);
      return res.status(500).json({
        status: 'error',
        message: 'Error getting AuthService',
        error: containerError instanceof Error ? containerError.message : String(containerError)
      });
    }

    // Step 2: Decode token structure (without validation)
    console.log('Decoding token structure...');
    const decodedToken = jwt.decode(token, { complete: true });
    
    // Log detallado del contenido del token
    console.log('Token Header:', JSON.stringify(decodedToken?.header, null, 2));
    console.log('Token Payload:', JSON.stringify(decodedToken?.payload, null, 2));
    
    // Step 3: Call validateToken method
    console.log('Calling validateToken method from AuthService...');
    const result = await authService.validateToken(token);
    console.log('validateToken result:', JSON.stringify(result, null, 2));

    if (!result.isSuccess()) {
      console.error('Error from validateToken:', result.getError());
      return res.status(400).json({
        status: 'error',
        message: 'Token validation failed',
        error: result.getError()
      });
    }

    const validation = result.getValue();
    console.log('Token validation result:', JSON.stringify(validation, null, 2));

    // Step 4: Return validation result with token structure
    return res.status(200).json({
      status: 'success',
      data: {
        tokenStructure: decodedToken,
        validationResult: validation
      }
    });
  } catch (error) {
    console.error('Unexpected error in token validation endpoint:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected error validating token',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * @swagger
 * /api/debug/token-decode:
 *   post:
 *     summary: Decode a JWT token without validation
 *     description: Shows the structure of a JWT token
 *     tags: [Debug]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Decoded token information
 *       400:
 *         description: Invalid token format
 */
router.post('/token-decode', (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      status: 'error',
      message: 'Token is required'
    });
  }

  try {
    // Try to decode the token without verification
    console.log('Attempting to decode token...');
    const decodedToken = jwt.decode(token, { complete: true });
    console.log('Token decoded successfully.');
    
    // Extraer información relevante
    const tokenHeader = decodedToken?.header;
    const tokenPayload = decodedToken?.payload;
    
    // Log detallado del contenido del token
    console.log('Token Header:', JSON.stringify(tokenHeader, null, 2));
    console.log('Token Payload:', JSON.stringify(tokenPayload, null, 2));
    
    // Verificar campos importantes del payload
    if (tokenPayload && typeof tokenPayload === 'object') {
      console.log('Token issuer (iss):', tokenPayload.iss);
      console.log('Token subject (sub):', tokenPayload.sub);
      console.log('Token audience (aud):', tokenPayload.aud);
      
      if (tokenPayload.exp) {
        console.log('Token expiration (exp):', new Date(tokenPayload.exp * 1000).toISOString());
      }
      
      if (tokenPayload.iat) {
        console.log('Token issued at (iat):', new Date(tokenPayload.iat * 1000).toISOString());
      }
    }

    return res.status(200).json({
      status: 'success',
      data: {
        decoded: decodedToken
      }
    });
  } catch (error) {
    console.error('Error decoding token:', error);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid token format',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router; 