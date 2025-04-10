export enum ErrorType {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly type: ErrorType,
    public readonly statusCode: number,
    public readonly isOperational: boolean = true,
    public readonly data: any = null
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
} 