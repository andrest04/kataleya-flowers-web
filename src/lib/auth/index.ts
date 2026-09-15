import { appwriteAuthProvider } from './appwriteProvider';
import type { AuthProvider } from './types';

export const authProvider: AuthProvider = appwriteAuthProvider;

export type { AuthLoginResult, AuthProvider, AuthSession, AuthUser } from './types';
