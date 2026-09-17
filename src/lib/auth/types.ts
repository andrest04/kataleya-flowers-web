export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  secret: string;
  expiresAt: string;
}

export type AuthLoginResult =
  | { ok: true; session: AuthSession }
  | { ok: false; code: 'INVALID_CREDENTIALS' | 'INTERNAL'; message: string };

export type AuthAttemptResult =
  | { ok: true }
  | { ok: false; code: 'INVALID_CREDENTIALS' | 'INTERNAL'; message: string };

export interface AuthProvider {
  login(email: string, password: string): Promise<AuthLoginResult>;
  logout(sessionSecret: string): Promise<void>;
  getCurrentUser(sessionSecret: string): Promise<AuthUser | null>;
  isAdmin(userId: string): Promise<boolean>;
}

export interface SessionStore {
  get(): Promise<string | null>;
  set(session: AuthSession): Promise<void>;
  delete(): Promise<void>;
}

export interface AuthService {
  login(email: string, password: string): Promise<AuthAttemptResult>;
  logout(): Promise<void>;
  requireAdmin(): Promise<AuthUser>;
}
