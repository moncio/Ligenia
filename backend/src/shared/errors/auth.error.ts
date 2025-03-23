/**
 * Base class for authentication errors
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Error for invalid credentials
 */
export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * Error for email already in use
 */
export class EmailAlreadyInUseError extends AuthError {
  constructor() {
    super('Email already in use');
    this.name = 'EmailAlreadyInUseError';
  }
}

/**
 * Error for invalid token
 */
export class InvalidTokenError extends AuthError {
  constructor() {
    super('Invalid or expired token');
    this.name = 'InvalidTokenError';
  }
}

/**
 * Error for user not found
 */
export class UserNotFoundError extends AuthError {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

/**
 * Error for unauthorized access
 */
export class UnauthorizedError extends AuthError {
  constructor() {
    super('Unauthorized access');
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error for email not verified
 */
export class EmailNotVerifiedError extends AuthError {
  constructor() {
    super('Email not verified');
    this.name = 'EmailNotVerifiedError';
  }
}
