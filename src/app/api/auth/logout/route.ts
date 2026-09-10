import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { SESSION_COOKIE, WORKSPACE_COOKIE } from '@/lib/auth/session';

export async function POST() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  const res = NextResponse.json({ ok: true, redirect: '/login' });
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(WORKSPACE_COOKIE);
  return res;
}
