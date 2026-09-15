import { appwriteAuthProvider } from './appwriteProvider';
import { cookieSessionStore } from './cookieSessionStore';
import { createAuthService } from './service';
import type { AuthProvider, SessionStore } from './types';

export const authProvider: AuthProvider = appwriteAuthProvider;
export const sessionStore: SessionStore = cookieSessionStore;
export const auth = createAuthService(authProvider, sessionStore);

export { AuthError } from './errors';
export { createAuthService } from './service';
export { SESSION_COOKIE_NAME } from './sessionCookie';
export type {
  AuthAttemptResult,
  AuthLoginResult,
  AuthProvider,
  AuthService,
  AuthSession,
  AuthUser,
  SessionStore,
} from './types';
