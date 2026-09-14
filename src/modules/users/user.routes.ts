import { Router } from 'express';
import { changeMyPassword, getAllUsers, getMyProfile, updateMyProfile } from './user.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate, validateQuery } from '../../middleware/validate';
import { changePasswordSchema, listUsersSchema, updateProfileSchema } from './user.schema';
import { authorize } from '../../middleware/authorize';

export const userRouter = Router();

userRouter.use(authenticate);

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The current user's profile
 *       401:
 *         description: Missing, invalid, or expired access token
 *       404:
 *         description: User not found
 */
userRouter.get('/profile', getMyProfile);

/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated, returns the updated user
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing, invalid, or expired access token
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already in use
 */
userRouter.put('/profile', validate(updateProfileSchema), updateMyProfile);

/**
 * @openapi
 * /api/users/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Change the authenticated user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully (existing refresh tokens revoked)
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing/invalid/expired access token, or old password is incorrect
 *       404:
 *         description: User not found
 */
userRouter.post('/change-password', validate(changePasswordSchema), changeMyPassword);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Paginated list of users
 *       400:
 *         description: Validation error in query parameters
 *       401:
 *         description: Missing, invalid, or expired access token
 *       403:
 *         description: Authenticated user is not an admin
 */
userRouter.get('/', authorize('admin'), validateQuery(listUsersSchema), getAllUsers);