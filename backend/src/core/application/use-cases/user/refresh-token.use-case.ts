import { BaseUseCase } from '../../base/base.use-case';
import { IUseCase } from '../../interfaces/use-case.interface';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { IAuthService } from '../../interfaces/auth-service.interface';
import { ITokenResponse } from '../../interfaces/auth.types';

// Define input schema using Zod
const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().min(10),
});

type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;

type RefreshTokenOutput = Result<{ newToken: string }>;

export class RefreshTokenUseCase extends BaseUseCase<RefreshTokenInput, ITokenResponse> {
  constructor(private authService: IAuthService) {
    super();
  }

  protected async executeImpl(input: RefreshTokenInput): Promise<Result<ITokenResponse>> {
    const validation = RefreshTokenInputSchema.safeParse(input);
    if (!validation.success) {
      return Result.fail<ITokenResponse>(new Error(validation.error.errors[0].message));
    }

    try {
      const { refreshToken } = input;
      const result = await this.authService.refreshToken(refreshToken);
      return result;
    } catch (error) {
      return Result.fail<ITokenResponse>(
        error instanceof Error ? error : new Error('Token refresh failed'),
      );
    }
  }
}
