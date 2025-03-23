import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { IAuthService } from '../../interfaces/auth-service.interface';
import { ILoginCredentials, ITokenResponse } from '../../interfaces/auth.types';

// Define input schema using Zod
const LoginUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

type LoginUserInput = z.infer<typeof LoginUserInputSchema>;

export class LoginUserUseCase extends BaseUseCase<LoginUserInput, ITokenResponse> {
  constructor(private authService: IAuthService) {
    super();
  }

  protected async executeImpl(input: LoginUserInput): Promise<Result<ITokenResponse>> {
    // Validate input
    const validation = LoginUserInputSchema.safeParse(input);
    if (!validation.success) {
      return Result.fail<ITokenResponse>(new Error(validation.error.errors[0].message));
    }

    try {
      // Use validated data as ILoginCredentials
      const credentials: ILoginCredentials = {
        email: input.email,
        password: input.password
      };
      
      // Delegate login process to authService
      const result = await this.authService.login(credentials);
      return result;
    } catch (error) {
      return Result.fail<ITokenResponse>(
        error instanceof Error ? error : new Error('Authentication failed')
      );
    }
  }
} 