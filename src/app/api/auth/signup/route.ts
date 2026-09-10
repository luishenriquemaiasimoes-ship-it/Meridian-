import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { checkPasswordStrength, hashPassword } from '@/lib/auth/password';
import { COOKIE_OPTIONS, SESSION_COOKIE, WORKSPACE_COOKIE, sessionExpiry, signSession } from '@/lib/auth/session';
import { handleError, parseBody } from '@/server/http';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name.').max(80),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
  organizationName: z.string().min(2, 'Name your organization.').max(80),
});

function slugify(input: string): string {
  return input.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'workspace';
}

export async function POST(req: Request) {
  try {
    const body = await parseBody(req, schema);
    const strength = checkPasswordStrength(body.password);
    if (!strength.ok) {
      return NextResponse.json({ error: strength.problems.join(' ') }, { status: 422 });
    }

    const email = body.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account already exists for that email address.' }, { status: 409 });
    }

    const baseSlug = slugify(body.organizationName);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) slug = `${baseSlug}-${++n}`;

    const org = await prisma.organization.create({
      data: { name: body.organizationName.trim(), slug, kind: 'ASSET_MANAGEMENT', plan: 'TRIAL', baseCurrency: 'BRL' },
    });
    const user = await prisma.user.create({
      data: {
        email, name: body.name.trim(), passwordHash: await hashPassword(body.password),
        theme: 'dark', locale: 'pt-BR', onboarded: false, lastLoginAt: new Date(),
      },
    });
    await prisma.membership.create({ data: { userId: user.id, organizationId: org.id, role: 'ADMIN' } });

    const benchmark = await prisma.benchmark.findUnique({ where: { code: 'IBOV' } });
    const workspace = await prisma.workspace.create({
      data: {
        organizationId: org.id, name: 'Research', slug: 'research', kind: 'RESEARCH',
        market: 'BRAZIL', baseCurrency: 'BRL', benchmarkId: benchmark?.id ?? null,
        riskFreeRate: 0.105, equityRiskPremium: 0.055, statutoryTaxRate: 0.34, isDemo: false,
      },
    });

    const expiresAt = sessionExpiry();
    const session = await prisma.session.create({ data: { userId: user.id, token: 'pending', expiresAt } });
    const token = await signSession({
      userId: user.id, email: user.email, name: user.name,
      organizationId: org.id, role: 'ADMIN', sessionId: session.id,
    });
    await prisma.session.update({ where: { id: session.id }, data: { token } });

    const res = NextResponse.json({ user: { id: user.id, email, name: user.name }, redirect: '/onboarding' });
    res.cookies.set(SESSION_COOKIE, token, { ...COOKIE_OPTIONS, expires: expiresAt });
    res.cookies.set(WORKSPACE_COOKIE, workspace.id, { ...COOKIE_OPTIONS, expires: expiresAt });
    return res;
  } catch (e) {
    return handleError(e);
  }
}
