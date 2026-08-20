const path = require('path');
const request = require('supertest');
const { PostgreSqlContainer } = require('@testcontainers/postgresql');

jest.setTimeout(120_000); // image pull + container startup can be slow on first run

let container;
let app;
let pool;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('booksdb')
    .withUsername('appuser')
    .withPassword('supersecret')
    // seed the real schema/data via the same init script postgres runs in docker-compose
    .withCopyFilesToContainer([
      { source: path.resolve(__dirname, '../../../db/init.sql'), target: '/docker-entrypoint-initdb.d/init.sql' },
    ])
    .start();

  // app/db.js reads these at require-time, so set them before requiring the app
  process.env.PGHOST = container.getHost();
  process.env.PGPORT = String(container.getMappedPort(5432));
  process.env.PGUSER = container.getUsername();
  process.env.PGPASSWORD = container.getPassword();
  process.env.PGDATABASE = container.getDatabase();

  app = require('../../src/app');
  pool = require('../../src/db');
});

afterAll(async () => {
  await pool.end();
  await container.stop();
});

describe('Books API', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/books returns the seeded books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });

  it('GET /api/books/:id returns a single book', async () => {
    const res = await request(app).get('/api/books/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title');
  });

  it('GET /api/books/:id returns 404 for a missing book', async () => {
    const res = await request(app).get('/api/books/999999');
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/books creates a book', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ title: 'Dune', author: 'Herbert' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('rejects invalid payloads with 400', async () => {
    const res = await request(app).post('/api/books').send({});
    expect(res.statusCode).toBe(400);
  });
});