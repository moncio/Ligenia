import { Theme } from './theme.enum';

export class UserPreference {
  constructor(
    public readonly userId: string,
    public readonly theme: Theme,
    public readonly fontSize: number
  ) {}

  static create(userId: string, theme: Theme, fontSize: number): UserPreference {
    return new UserPreference(userId, theme, fontSize);
  }
} 