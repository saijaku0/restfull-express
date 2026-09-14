import bcrypt from 'bcryptjs';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';
import { extractCookie, uniqueEmail } from './helpers/auth';

describe('Auth', () => {
  describe('POST /api/auth/register', () => {
    it('returns 201 with an access token and a user without a password', async () => {
      const email = uniqueEmail();
      const res = await request(app).post('/api/auth/register').send({
        email,
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      });

      expect(res.status).toBe(201);
      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.user).toMatchObject({
        email,
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'user',
      });
      expect(res.body.user).not.toHaveProperty('password');
      expect(extractCookie(res, 'refreshToken')).toMatch(/^refreshToken=.+/);
    });

    it('returns 409 for a duplicate email', async () => {
      const email = uniqueEmail();
      const payload = { email, password: 'password123', firstName: 'A', lastName: 'B' };

      await request(app).post('/api/auth/register').send(payload);
      const res = await request(app).post('/api/auth/register').send(payload);

      expect(res.status).toBe(409);
    });

    it('returns 400 for an invalid body (short password, bad email)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'not-an-email',
        password: '123',
        firstName: 'A',
        lastName: 'B',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 200 with an access token on success', async () => {
      const email = uniqueEmail();
      const password = 'password123';

      await prisma.user.create({
        data: {
          email,
          password: await bcrypt.hash(password, 10),
          firstName: 'A',
          lastName: 'B',
        },
      });

      const res = await request(app).post('/api/auth/login').send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.user.email).toBe(email);
    });

    it('returns 401 for a wrong password', async () => {
      const email = uniqueEmail();
      await request(app)
        .post('/api/auth/register')
        .send({ email, password: 'password123', firstName: 'A', lastName: 'B' });

      const res = await request(app).post('/api/auth/login').send({ email, password: 'wrong-password' });

      expect(res.status).toBe(401);
    });

    it('returns 401 for a nonexistent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: uniqueEmail(), password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns a new access token', async () => {
      const email = uniqueEmail();
      const password = 'password123';
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ email, password, firstName: 'A', lastName: 'B' });
      const cookie = extractCookie(registerRes, 'refreshToken');

      const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toEqual(expect.any(String));
    });

    it('rejects the old refresh token after logout', async () => {
      const email = uniqueEmail();
      const password = 'password123';
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ email, password, firstName: 'A', lastName: 'B' });
      const cookie = extractCookie(registerRes, 'refreshToken');

      const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookie);
      expect(logoutRes.status).toBe(200);

      const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
      expect(res.status).toBe(401);
    });
  });
});
