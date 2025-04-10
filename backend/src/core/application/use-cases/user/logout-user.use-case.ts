import { BaseUseCase } from '../../base/base.use-case';
import { IUseCase } from '../../interfaces/use-case.interface';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { IAuthService } from '../../interfaces/auth-service.interface';

// Define input schema using Zod
const LogoutUserInputSchema = z.object({
  token: z.string().min(10),
});

type LogoutUserInput = z.infer<typeof LogoutUserInputSchema>;

export class LogoutUserUseCase extends BaseUseCase<LogoutUserInput, void> {
  constructor(private authService: IAuthService) {
    super();
  }

  protected async executeImpl(input: LogoutUserInput): Promise<Result<void>> {
    const validation = LogoutUserInputSchema.safeParse(input);
    if (!validation.success) {
      return Result.fail<void>(new Error(validation.error.errors[0].message));
    }

    const { token } = input;

    try {
      // Validate the token first
      const tokenValidation = await this.authService.validateToken(token);

      if (tokenValidation.isFailure()) {
        return Result.fail<void>(new Error('Invalid token'));
      }

      // Implement actual logout logic here
      // This would typically involve blacklisting the token or removing from active sessions

      return Result.ok<void>(undefined);
    } catch (error) {
      return Result.fail<void>(error instanceof Error ? error : new Error('Logout failed'));
    }
  }
}
