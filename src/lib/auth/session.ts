import { SignJWT, jwtVerify } from 'jose';

const ALG = 'HS256';

export const SESSION_COOKIE = 'meridian_session';
export const WORKSPACE_COOKIE = 'meridian_workspace';

export interface SessionClaims {
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  role: string;
  sessionId: string;
}

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'AUTH_SECRET is missing or shorter than 32 characters. Set it in .env before starting MERIDIAN.',
    );
  }
  return new TextEncoder().encode(secret);
}

export function sessionTtlHours(): number {
  const raw = Number(process.env.SESSION_TTL_HOURS ?? 168);
  return Number.isFinite(raw) && raw > 0 ? raw : 168;
}

export async function signSession(claims: SessionClaims): Promise<string> {
  const ttl = sessionTtlHours();
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setIssuer('meridian')
    .setAudience('meridian-app')
    .setExpirationTime(`${ttl}h`)
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: 'meridian',
      audience: 'meridian-app',
    });
    if (!payload.userId || !payload.sessionId) return null;
    return {
      userId: String(payload.userId),
      email: String(payload.email ?? ''),
      name: String(payload.name ?? ''),
      organizationId: String(payload.organizationId ?? ''),
      role: String(payload.role ?? 'VIEWER'),
      sessionId: String(payload.sessionId),
    };
  } catch {
    return null;
  }
}

export function sessionExpiry(): Date {
  return new Date(Date.now() + sessionTtlHours() * 3600 * 1000);
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
};
