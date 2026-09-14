import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

export default async function globalSetup(): Promise<void> {
  const envPath = path.resolve(__dirname, '../.env.test');
  const parsed = dotenv.config({ path: envPath, override: true }).parsed ?? {};

  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, ...parsed },
    stdio: 'inherit',
  });
}
