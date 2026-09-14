import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { authenticate } from './middleware/authenticate';
import { userRouter } from './modules/users/user.routes';

export const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'You are in', user: req.user });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.use(errorHandler);