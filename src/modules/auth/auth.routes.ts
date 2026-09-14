import { Router } from 'express';
import { login, logout, refresh, register } from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema } from './auth.schema';

export const authRouter = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created, returns access token (refresh token set as httpOnly cookie)
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 */
authRouter.post('/register', validate(registerSchema), register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authenticated, returns access token (refresh token set as httpOnly cookie)
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
authRouter.post('/login', validate(loginSchema), login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new access token
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Refresh token issued at login/register (httpOnly cookie)
 *     responses:
 *       200:
 *         description: New access token issued (refresh token cookie rotated)
 *       401:
 *         description: Refresh token missing, invalid, expired, or not recognized
 */
authRouter.post('/refresh', refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out and invalidate the refresh token
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: false
 *         schema:
 *           type: string
 *         description: Refresh token cookie to invalidate, if present
 *     responses:
 *       200:
 *         description: Logged out successfully (refresh token cookie cleared)
 */
authRouter.post('/logout', logout);
