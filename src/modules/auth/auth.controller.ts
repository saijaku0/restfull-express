import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from './auth.service';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken, user } = await registerUser(req.body);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });

    return res.status(201).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken, user } = await loginUser(req.body);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });

    return res.status(200).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}