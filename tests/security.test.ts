import request from 'supertest';
import { app } from '../src/app';
import { bearer, createAdmin, registerUser } from './helpers/auth';

describe('Security / access control', () => {
  it('rejects a request without a token with 401', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('rejects a request with an invalid/garbage token with 401', async () => {
    const res = await request(app).get('/api/tasks').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it("prevents user A from GET/PUT/DELETE on user B's task", async () => {
    const userA = await registerUser();
    const userB = await registerUser();

    const created = await request(app)
      .post('/api/tasks')
      .set(bearer(userA.accessToken))
      .send({ title: "A's task" });
    const taskId = created.body.id;

    const getRes = await request(app).get(`/api/tasks/${taskId}`).set(bearer(userB.accessToken));
    expect(getRes.status).toBe(403);

    const putRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(bearer(userB.accessToken))
      .send({ title: 'Hacked' });
    expect(putRes.status).toBe(403);

    const delRes = await request(app).delete(`/api/tasks/${taskId}`).set(bearer(userB.accessToken));
    expect(delRes.status).toBe(403);
  });

  it('denies GET /api/users to a non-admin user with 403', async () => {
    const user = await registerUser();

    const res = await request(app).get('/api/users').set(bearer(user.accessToken));

    expect(res.status).toBe(403);
  });

  it('allows GET /api/users to an admin with 200', async () => {
    const admin = await createAdmin();

    const res = await request(app).get('/api/users').set(bearer(admin.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual(expect.any(Array));
    expect(res.body.pagination).toBeDefined();
  });
});
