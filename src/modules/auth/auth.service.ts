import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { signAccessToken, signRefreshToken, TokenPayload } from '../../utils/token';
import { env } from '../../config/env';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'Email already in use');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    },
  });

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const decoded = jwt.decode(refreshToken) as { exp: number };
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw new AppError(401, 'Invalid credentials');
  }

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const decoded = jwt.decode(refreshToken) as { exp: number };
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}

export async function refreshTokens(oldRefreshToken: string) {
  if (!oldRefreshToken) {
    throw new AppError(401, 'Refresh token required');
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(oldRefreshToken, env.jwt.refreshSecret) as TokenPayload;
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
  });
  if (!stored) {
    throw new AppError(401, 'Refresh token not recognized');
  }

  await prisma.refreshToken.delete({ where: { token: oldRefreshToken } });

  const newPayload = { userId: payload.userId, role: payload.role };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = signRefreshToken(newPayload);

  const decoded = jwt.decode(refreshToken) as { exp: number };
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: payload.userId,
      expiresAt: new Date(decoded.exp * 1000),
    },
  });

  return { accessToken, refreshToken };
}

export async function logoutUser(refreshToken: string) {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
}