import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

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