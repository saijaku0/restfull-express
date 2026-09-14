import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../../src/app';
import { prisma } from '../../src/config/prisma';

let counter = 0;

export function uniqueEmail(prefix = 'user'): string {
  counter += 1;
  return `${prefix}.${Date.now()}.${counter}@example.com`;
}

export function extractCookie(res: request.Response, name: string): string {
  const raw = (res.headers['set-cookie'] ?? []) as unknown as string[];
  const found = raw.find((c) => c.startsWith(`${name}=`));
  if (!found) {
    throw new Error(`Cookie "${name}" not found in response`);
  }
  return found.split(';')[0];
}

export interface RegisteredUser {
  accessToken: string;
  refreshTokenCookie: string;
  password: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export async function registerUser(
  overrides: Partial<{ email: string; password: string; firstName: string; lastName: string }> = {},
): Promise<RegisteredUser> {
  const payload = {
    email: overrides.email ?? uniqueEmail(),
    password: overrides.password ?? 'password123',
    firstName: overrides.firstName ?? 'Test',
    lastName: overrides.lastName ?? 'User',
  };

  const res = await request(app).post('/api/auth/register').send(payload);

  if (res.status !== 201) {
    throw new Error(`registerUser failed with status ${res.status}: ${JSON.stringify(res.body)}`);
  }

  return {
    accessToken: res.body.accessToken,
    refreshTokenCookie: extractCookie(res, 'refreshToken'),
    password: payload.password,
    user: res.body.user,
  };
}

export async function createAdmin(
  overrides: Partial<{ email: string; password: string }> = {},
): Promise<RegisteredUser> {
  const email = overrides.email ?? uniqueEmail('admin');
  const password = overrides.password ?? 'adminpass123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    },
  });

  const res = await request(app).post('/api/auth/login').send({ email, password });

  if (res.status !== 200) {
    throw new Error(`createAdmin login failed with status ${res.status}: ${JSON.stringify(res.body)}`);
  }

  return {
    accessToken: res.body.accessToken,
    refreshTokenCookie: extractCookie(res, 'refreshToken'),
    password,
    user: res.body.user,
  };
}

export function bearer(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
