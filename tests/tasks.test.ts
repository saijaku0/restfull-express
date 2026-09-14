import request from 'supertest';
import { app } from '../src/app';
import { bearer, registerUser, RegisteredUser } from './helpers/auth';

describe('Tasks (authenticated)', () => {
  let owner: RegisteredUser;

  beforeEach(async () => {
    owner = await registerUser();
  });

  it('creates a task with 201 and the correct userId', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set(bearer(owner.accessToken))
      .send({ title: 'Write tests', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(owner.user.id);
    expect(res.body.title).toBe('Write tests');
    expect(res.body.priority).toBe('high');
    expect(res.body.status).toBe('pending');
  });

  it('lists tasks with a pagination shape, returning only the caller\'s own tasks', async () => {
    await request(app).post('/api/tasks').set(bearer(owner.accessToken)).send({ title: 'Mine' });

    const other = await registerUser();
    await request(app).post('/api/tasks').set(bearer(other.accessToken)).send({ title: 'Not mine' });

    const res = await request(app).get('/api/tasks').set(bearer(owner.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].title).toBe('Mine');
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });

  it('filters by status and priority', async () => {
    const low = await request(app)
      .post('/api/tasks')
      .set(bearer(owner.accessToken))
      .send({ title: 'Low priority', priority: 'low' });
    const high = await request(app)
      .post('/api/tasks')
      .set(bearer(owner.accessToken))
      .send({ title: 'High priority', priority: 'high' });

    await request(app)
      .put(`/api/tasks/${high.body.id}`)
      .set(bearer(owner.accessToken))
      .send({ status: 'completed' });

    const byPriority = await request(app).get('/api/tasks?priority=high').set(bearer(owner.accessToken));
    expect(byPriority.status).toBe(200);
    expect(byPriority.body.items).toHaveLength(1);
    expect(byPriority.body.items[0].id).toBe(high.body.id);

    const byStatus = await request(app).get('/api/tasks?status=completed').set(bearer(owner.accessToken));
    expect(byStatus.status).toBe(200);
    expect(byStatus.body.items).toHaveLength(1);
    expect(byStatus.body.items[0].id).toBe(high.body.id);

    const stillPending = await request(app).get('/api/tasks?status=pending').set(bearer(owner.accessToken));
    expect(stillPending.body.items).toHaveLength(1);
    expect(stillPending.body.items[0].id).toBe(low.body.id);
  });

  it('gets one own task with 200', async () => {
    const created = await request(app).post('/api/tasks').set(bearer(owner.accessToken)).send({ title: 'Solo' });

    const res = await request(app).get(`/api/tasks/${created.body.id}`).set(bearer(owner.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it('updates own task with 200', async () => {
    const created = await request(app).post('/api/tasks').set(bearer(owner.accessToken)).send({ title: 'Old title' });

    const res = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .set(bearer(owner.accessToken))
      .send({ title: 'New title', status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New title');
    expect(res.body.status).toBe('in_progress');
  });

  it('deletes own task with 204, then a subsequent get returns 404', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set(bearer(owner.accessToken))
      .send({ title: 'To delete' });

    const del = await request(app).delete(`/api/tasks/${created.body.id}`).set(bearer(owner.accessToken));
    expect(del.status).toBe(204);
    expect(del.body).toEqual({});

    const res = await request(app).get(`/api/tasks/${created.body.id}`).set(bearer(owner.accessToken));
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid create body', async () => {
    const res = await request(app).post('/api/tasks').set(bearer(owner.accessToken)).send({ title: '' });

    expect(res.status).toBe(400);
  });
});
