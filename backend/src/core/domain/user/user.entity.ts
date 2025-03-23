export class User {
  constructor(
    public id: string,
    public email: string,
    public password: string,
    public name: string,
    public role: UserRole,
    public emailVerified: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  // Add methods related to User behavior here
  public hasRole(role: string): boolean {
    return this.role === role;
  }
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PLAYER = 'PLAYER',
}
