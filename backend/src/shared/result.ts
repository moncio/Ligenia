/**
 * Generic class to handle operation results
 * that can be successful or failed
 */
export class Result<T> {
  private constructor(
    private readonly isSuccessful: boolean,
    private readonly error: Error | null = null,
    private readonly value: T | null = null,
  ) {}

  /**
   * Indicates if the result is successful
   */
  get isSuccess(): boolean {
    return this.isSuccessful;
  }

  /**
   * Indicates if the result is failed
   */
  get isFailure(): boolean {
    return !this.isSuccessful;
  }

  /**
   * Gets the value of the result if successful
   * @throws Error if the result is failed
   */
  getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value from a failed result');
    }
    return this.value as T;
  }

  /**
   * Gets the error of the result if failed
   * @throws Error if the result is successful
   */
  getError(): Error {
    if (!this.error) {
      throw new Error('Cannot get error from a successful result');
    }
    return this.error;
  }

  /**
   * Creates a successful result
   * @param value Result value
   */
  static ok<U>(value: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  /**
   * Creates a failed result
   * @param error Error that caused the failure
   */
  static fail<U>(error: Error | string): Result<U> {
    if (typeof error === 'string') {
      return new Result<U>(false, new Error(error));
    }
    return new Result<U>(false, error);
  }
}
