import { Router } from 'express';
import { create, getOne, list, remove, update } from './task.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { validateQuery } from '../../middleware/validate';
import { createTaskSchema, listTasksSchema, updateTaskSchema } from './task.schema';

export const taskRouter = Router();

taskRouter.use(authenticate);

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing, invalid, or expired access token
 */
taskRouter.post('/', validate(createTaskSchema), create);

/**
 * @openapi
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List the authenticated user's tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *         description: Filter by task status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by task priority
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated list of the user's tasks
 *       400:
 *         description: Validation error in query parameters
 *       401:
 *         description: Missing, invalid, or expired access token
 */
taskRouter.get('/', validateQuery(listTasksSchema), list);

/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a task by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task id
 *     responses:
 *       200:
 *         description: The requested task
 *       401:
 *         description: Missing, invalid, or expired access token
 *       403:
 *         description: Task belongs to another user (non-admin)
 *       404:
 *         description: Task not found
 */
taskRouter.get('/:id', getOne);

/**
 * @openapi
 * /api/tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Update a task by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing, invalid, or expired access token
 *       403:
 *         description: Task belongs to another user (non-admin)
 *       404:
 *         description: Task not found
 */
taskRouter.put('/:id', validate(updateTaskSchema), update);

/**
 * @openapi
 * /api/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task id
 *     responses:
 *       204:
 *         description: Task deleted
 *       401:
 *         description: Missing, invalid, or expired access token
 *       403:
 *         description: Task belongs to another user (non-admin)
 *       404:
 *         description: Task not found
 */
taskRouter.delete('/:id', remove);