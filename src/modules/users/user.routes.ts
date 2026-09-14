import { Router } from 'express';
import { getMyProfile, updateMyProfile } from './user.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { updateProfileSchema } from './user.schema';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/profile', getMyProfile);
userRouter.put('/profile', validate(updateProfileSchema), updateMyProfile);