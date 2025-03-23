import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  verifyEmailSchema,
  refreshTokenSchema
} from '../validations/user.validation';

const router = Router();
const authController = new AuthController();

// Ruta para registrar un nuevo usuario
router.post(
  '/register',
  validateBody(registerSchema),
  authController.register
);

// Ruta para iniciar sesión
router.post(
  '/login',
  validateBody(loginSchema),
  authController.login
);

// Ruta para cerrar sesión
router.post(
  '/logout',
  authenticate,
  authController.logout
);

// Ruta para refrescar el token
router.post(
  '/refresh-token',
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

// Ruta para obtener el perfil del usuario actual
router.get(
  '/me',
  authenticate,
  authController.getMe
);

// Ruta para solicitar restablecimiento de contraseña
router.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

// Ruta para restablecer contraseña
router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

// Ruta para verificar email
router.post(
  '/verify-email',
  validateBody(verifyEmailSchema),
  authController.verifyEmail
);

export default router; 