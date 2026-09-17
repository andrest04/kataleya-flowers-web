export class AuthError extends Error {
  public readonly code: 'UNAUTHENTICATED' | 'FORBIDDEN';

  constructor(code: 'UNAUTHENTICATED' | 'FORBIDDEN', message: string) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}
