import { Result } from '../../../src/shared/result';

describe('Result', () => {
  describe('ok', () => {
    it('should create a successful result', () => {
      const value = 'test';
      const result = Result.ok(value);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toBe(value);
      expect(() => result.getError()).toThrow();
    });
  });

  describe('fail', () => {
    it('should create a failed result', () => {
      const error = new Error('test error');
      const result = Result.fail(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(error);
      expect(() => result.getValue()).toThrow();
    });
  });
}); 