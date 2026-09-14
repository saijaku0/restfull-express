import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import bcrypt from 'bcryptjs';

const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

interface ListUsersParams {
  page: number;
  limit: number;
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: publicUserSelect,
  });

  return user;
}

export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const matches = await bcrypt.compare(oldPassword, user.password);
  if (!matches) {
    throw new AppError(401, 'Old password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  await prisma.refreshToken.deleteMany({ where: { userId } });
}

export async function listUsers(params: ListUsersParams) {
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      select: publicUserSelect,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return {
    items,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}