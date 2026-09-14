import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

export default async function globalTeardown(): Promise<void> {
  dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true });

  const prisma = new PrismaClient();
  await prisma.$disconnect();
}
