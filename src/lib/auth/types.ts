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

export interface AuthProvider {
  login(email: string, password: string): Promise<AuthLoginResult>;
  logout(sessionSecret: string): Promise<void>;
  getCurrentUser(sessionSecret: string): Promise<AuthUser | null>;
  isAdmin(userId: string): Promise<boolean>;
}
