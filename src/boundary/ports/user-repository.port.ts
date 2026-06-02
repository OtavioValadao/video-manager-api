export const USER_REPOSITORY_PORT = Symbol("USER_REPOSITORY_PORT");

export interface IUserRepositoryPort {
  ensureExists(userId: string, email: string): Promise<void>;
}
