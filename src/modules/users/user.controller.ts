import { Request, Response, NextFunction } from 'express';
import { getProfile, updateProfile } from './user.service';

export async function getMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getProfile(req.user!.userId);
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await updateProfile(req.user!.userId, req.body);
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}