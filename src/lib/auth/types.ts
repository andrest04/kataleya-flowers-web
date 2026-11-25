export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  secret: string;
  expiresAt: string;
}

export type AuthLoginResult =
  | { ok: true; userId: string; session: AuthSession }
  | { ok: false; code: 'INVALID_CREDENTIALS' | 'INTERNAL'; message: string };

export type AuthAttemptResult =
  | { ok: true }
  | { ok: false; code: 'INVALID_CREDENTIALS' | 'FORBIDDEN' | 'INTERNAL'; message: string };

export type PasswordRecoveryResult =
  | { ok: true }
  | { ok: false; code: 'INVALID_LINK' | 'WEAK_PASSWORD' | 'INTERNAL'; message: string };

export interface PasswordRecovery {
  requestPasswordRecovery(email: string, redirectUrl: string): Promise<void>;
  completePasswordRecovery(
    userId: string,
    secret: string,
    password: string,
  ): Promise<PasswordRecoveryResult>;
}

export interface AuthProvider extends PasswordRecovery {
  login(email: string, password: string): Promise<AuthLoginResult>;
  logout(sessionSecret: string): Promise<boolean>;
  getCurrentUser(sessionSecret: string): Promise<AuthUser | null>;
  isAdmin(userId: string): Promise<boolean>;
}

export interface SessionStore {
  get(): Promise<string | null>;
  set(session: AuthSession): Promise<void>;
  delete(): Promise<void>;
}

export interface AuthService extends PasswordRecovery {
  login(email: string, password: string): Promise<AuthAttemptResult>;
  logout(): Promise<void>;
  clearSession(): Promise<void>;
  requireAdmin(): Promise<AuthUser>;
}
