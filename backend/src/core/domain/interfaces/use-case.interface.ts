/**
 * Interfaz genérica para casos de uso
 */
export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<Result<TOutput>>;
}

/**
 * Interfaz para casos de uso que no requieren entrada
 */
export interface IUseCaseWithoutInput<TOutput> {
  execute(): Promise<Result<TOutput>>;
}

/**
 * Clase para representar el resultado de un caso de uso
 */
export class Result<T> {
  private readonly _isSuccess: boolean;
  private readonly _error: Error | null;
  private readonly _value: T | null;

  private constructor(isSuccess: boolean, error: Error | null, value: T | null) {
    this._isSuccess = isSuccess;
    this._error = error;
    this._value = value;
  }

  /**
   * Indica si el resultado es exitoso
   */
  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * Indica si el resultado es un error
   */
  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Obtiene el valor del resultado
   * @throws Error si el resultado es un error
   */
  public getValue(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value of an error result');
    }
    return this._value as T;
  }

  /**
   * Obtiene el error del resultado
   * @throws Error si el resultado es exitoso
   */
  public getError(): Error {
    if (this._isSuccess) {
      throw new Error('Cannot get error of a success result');
    }
    return this._error as Error;
  }

  /**
   * Crea un resultado exitoso
   */
  public static ok<U>(value: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  /**
   * Crea un resultado de error
   */
  public static fail<U>(error: Error): Result<U> {
    return new Result<U>(false, error, null);
  }
} 