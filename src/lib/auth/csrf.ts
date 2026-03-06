import crypto from 'crypto';
import { cookies } from 'next/headers';

const CSRF_COOKIE = '__Host-csrf';
const CSRF_HEADER = 'x-csrf-token';

/**
 * NP-2034: Added CSRF protection to all state-mutating routes.
 * Uses the synchronizer token pattern: a per-session token is stored in
 * a HttpOnly, SameSite=Strict cookie and must be echoed in a request header.
 * Next.js API routes (tRPC mutations) validate this automatically via middleware.
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function setCsrfCookie(token: string) {
  cookies().set(CSRF_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export function validateCsrfToken(requestToken: string | null): boolean {
  if (!requestToken) return false;
  const cookieToken = cookies().get(CSRF_COOKIE)?.value;
  if (!cookieToken) return false;
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(requestToken),
    Buffer.from(cookieToken)
  );
}
