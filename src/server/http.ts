import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';
import { getRequestContext, type RequestContext } from './context';
import { assertCan, type Permission } from '@/lib/auth/rbac';

export interface ApiErrorShape {
  error: string;
  detail?: string;
  fields?: Record<string, string[]>;
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(status: number, error: string, detail?: string) {
  return NextResponse.json({ error, detail } satisfies ApiErrorShape, { status });
}

export function handleError(e: unknown) {
  if (e instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of e.issues) {
      const key = issue.path.join('.') || '_';
      (fields[key] ??= []).push(issue.message);
    }
    return NextResponse.json({ error: 'Invalid request.', fields } satisfies ApiErrorShape, { status: 422 });
  }
  const err = e as Error & { status?: number };
  const status = err?.status ?? 500;
  if (status >= 500) console.error('[meridian:api]', err);
  return NextResponse.json(
    { error: status >= 500 ? 'Something went wrong on our side.' : err.message } satisfies ApiErrorShape,
    { status },
  );
}

/** Wraps a route handler with authentication, permission check and error mapping. */
export function route<T>(
  handler: (ctx: RequestContext, req: Request) => Promise<T>,
  permission?: Permission,
) {
  return async (req: Request) => {
    try {
      const ctx = await getRequestContext();
      if (!ctx) return fail(401, 'You need to sign in to do that.');
      if (permission) assertCan(ctx.role, permission);
      const data = await handler(ctx, req);
      return NextResponse.json(data);
    } catch (e) {
      return handleError(e);
    }
  };
}

export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    const err = new Error('Request body must be valid JSON.') as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  return schema.parse(raw);
}

export function searchParams(req: Request): URLSearchParams {
  return new URL(req.url).searchParams;
}
