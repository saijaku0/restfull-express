import { Request, Response, NextFunction } from 'express';
import { createTask, deleteTask, getTaskById, listTasks, updateTask } from './task.service';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await createTask(req.user!.userId, req.body);
    return res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listTasks(req.user!.userId, req.query as any);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const task = await getTaskById(id, req.user!.userId, req.user!.role);
    return res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const task = await updateTask(id, req.user!.userId, req.user!.role, req.body);
    return res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await deleteTask(id, req.user!.userId, req.user!.role);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}