import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      userId,
    },
  });

  return task;
}

interface ListTasksParams {
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  page: number;
  limit: number;
}

export async function listTasks(userId: string, params: ListTasksParams) {
  const where = {
    userId,
    ...(params.status ? { status: params.status } : {}),
    ...(params.priority ? { priority: params.priority } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.task.count({ where }),
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

async function findTaskWithAccess(taskId: string, userId: string, role: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  if (task.userId !== userId && role !== 'admin') {
    throw new AppError(403, 'Access denied');
  }

  return task;
}

export async function getTaskById(taskId: string, userId: string, role: string) {
  return findTaskWithAccess(taskId, userId, role);
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

export async function updateTask(
  taskId: string,
  userId: string,
  role: string,
  input: UpdateTaskInput,
) {
  await findTaskWithAccess(taskId, userId, role);

  const task = await prisma.task.update({
    where: { id: taskId },
    data: input,
  });

  return task;
}

export async function deleteTask(taskId: string, userId: string, role: string) {
  await findTaskWithAccess(taskId, userId, role);

  await prisma.task.delete({ where: { id: taskId } });
}