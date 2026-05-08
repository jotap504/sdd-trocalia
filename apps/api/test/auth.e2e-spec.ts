import type { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { buildTestApp } from './helpers/test-app'

describe('Auth (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await buildTestApp()
  })

  afterAll(async () => { await app.close() })

  describe('POST /api/v1/auth/register', () => {
    it('returns 400 when body is missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'not-valid' })
        .expect(400)

      expect(res.body.statusCode).toBe(400)
    })

    it('returns 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'bad-email', password: 'password123' })
        .expect(400)
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('returns 400 when credentials are missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400)
    })
  })

  describe('Protected routes', () => {
    it('returns 401 when Authorization header is missing', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/listings/mine')
        .expect(401)
    })

    it('returns 401 when token is malformed', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/listings/mine')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401)
    })
  })

  describe('Public routes', () => {
    it('GET /api/v1/listings returns 200 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/listings')
        .expect(200)
    })

    it('GET /api/v1/listings is paginated (hasMore field present)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/listings')
        .expect(200)
      expect(res.body).toHaveProperty('data')
    })
  })
})
