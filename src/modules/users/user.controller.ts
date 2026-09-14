import { Request, Response, NextFunction } from 'express';
import { getProfile, updateProfile, changePassword, listUsers } from './user.service';

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

export async function changeMyPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await changePassword(req.user!.userId, req.body.oldPassword, req.body.newPassword);
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listUsers(req.query as any);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}