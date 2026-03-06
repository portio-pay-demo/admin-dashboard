import { getServerSession } from 'next-auth';
import { authOptions } from './options';

/**
 * NP-2035: Fixed session expiry losing in-progress work.
 * Sessions now refresh automatically on activity (sliding expiry).
 * Hard limit of 8h enforced server-side regardless of activity.
 * Client receives a 15-minute warning before expiry via EventSource.
 */
export const SESSION_MAX_AGE = 8 * 60 * 60;       // 8 hours hard limit
export const SESSION_IDLE_TIMEOUT = 60 * 60;        // 1 hour idle timeout
export const SESSION_WARNING_BEFORE = 15 * 60;      // warn 15 min before expiry

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export function shouldWarnExpiry(expiresAt: Date): boolean {
  const msUntilExpiry = expiresAt.getTime() - Date.now();
  return msUntilExpiry <= SESSION_WARNING_BEFORE * 1000;
}
