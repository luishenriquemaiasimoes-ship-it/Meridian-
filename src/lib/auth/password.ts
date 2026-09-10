import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export interface PasswordCheck { ok: boolean; problems: string[] }

/** Minimum policy enforced at sign-up and password change. */
export function checkPasswordStrength(password: string): PasswordCheck {
  const problems: string[] = [];
  if (password.length < 8) problems.push('Use at least 8 characters.');
  if (!/[a-zA-Z]/.test(password)) problems.push('Include at least one letter.');
  if (!/[0-9]/.test(password)) problems.push('Include at least one number.');
  return { ok: problems.length === 0, problems };
}
