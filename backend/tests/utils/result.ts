export class Result<T> {
  public readonly value: T | null;
  public readonly error: Error | null;

  private constructor(
    private readonly isSuccessful: boolean,
    error: Error | null = null,
    value: T | null = null,
  ) {
    this.error = error;
    this.value = value;
  }

  public isSuccess(): boolean {
    return this.isSuccessful;
  }

  public isFailure(): boolean {
    return !this.isSuccessful;
  }

  getValue(): T {
    if (!this.isSuccess()) {
      throw new Error('Cannot get value from a failed result');
    }
    return this.value as T;
  }

  getError(): Error {
    if (!this.error) {
      throw new Error('Cannot get error from a successful result');
    }
    return this.error;
  }

  static ok<U>(value: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  static fail<U>(error: Error | string): Result<U> {
    if (typeof error === 'string') {
      return new Result<U>(false, new Error(error));
    }
    return new Result<U>(false, error);
  }
} 