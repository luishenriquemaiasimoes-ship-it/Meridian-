import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { COOKIE_OPTIONS, SESSION_COOKIE, WORKSPACE_COOKIE, sessionExpiry, signSession } from '@/lib/auth/session';
import { handleError, parseBody } from '@/server/http';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export async function POST(req: Request) {
  try {
    const { email, password } = await parseBody(req, schema);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { memberships: true },
    });

    // The same message either way: an attacker must not learn which emails exist.
    const invalid = () => NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    if (!user) {
      await verifyPassword(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali');
      return invalid();
    }
    const okPassword = await verifyPassword(password, user.passwordHash);
    if (!okPassword) return invalid();

    const membership = user.memberships[0];
    if (!membership) return NextResponse.json({ error: 'This account has no organization.' }, { status: 403 });

    const workspace = await prisma.workspace.findFirst({
      where: { organizationId: membership.organizationId },
      orderBy: { createdAt: 'asc' },
    });

    const expiresAt = sessionExpiry();
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: 'pending',
        expiresAt,
        userAgent: req.headers.get('user-agent')?.slice(0, 200) ?? null,
      },
    });
    const token = await signSession({
      userId: user.id, email: user.email, name: user.name,
      organizationId: membership.organizationId, role: membership.role, sessionId: session.id,
    });
    await prisma.session.update({ where: { id: session.id }, data: { token } });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    if (workspace) {
      await prisma.auditLog.create({
        data: {
          workspaceId: workspace.id, userId: user.id, actorName: user.name,
          action: 'LOGIN', entityType: 'User', entityId: user.id, entityLabel: user.name,
          summary: 'Signed in to the workspace.',
        },
      });
    }

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, onboarded: user.onboarded },
      redirect: user.onboarded ? '/home' : '/onboarding',
    });
    res.cookies.set(SESSION_COOKIE, token, { ...COOKIE_OPTIONS, expires: expiresAt });
    if (workspace) res.cookies.set(WORKSPACE_COOKIE, workspace.id, { ...COOKIE_OPTIONS, expires: expiresAt });
    return res;
  } catch (e) {
    return handleError(e);
  }
}
