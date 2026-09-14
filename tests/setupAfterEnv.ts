import { prisma } from '../src/config/prisma';
import { resetDb } from './helpers/resetDb';

beforeEach(async () => {
  await resetDb(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});
