import type { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { buildTestApp } from './helpers/test-app'

describe('Listings (e2e)', () => {
  let app: INestApplication
  let jwtToken: string

  beforeAll(async () => {
    app = await buildTestApp()

    const jwtService = app.get(JwtService)
    jwtToken = jwtService.sign({ sub: 'user-uuid-001', email: 'test@example.com', role: 'user' })
  })

  afterAll(async () => { await app.close() })

  describe('POST /api/v1/listings', () => {
    it('returns 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/listings')
        .send({ title: 'test' })
        .expect(401)
    })

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ title: 'test' })
        .expect(400)

      expect(res.body.statusCode).toBe(400)
    })

    it('returns 400 for extra (non-whitelisted) fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          categoryId: 'cat-1',
          title: 'Test',
          description: 'Desc',
          price: 100,
          currency: 'ARS',
          condition: 'used',
          city: 'CABA',
          province: 'Buenos Aires',
          hackField: 'injection',
        })
        .expect(400)
    })
  })

  describe('GET /api/v1/listings', () => {
    it('returns 200 with pagination envelope without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/listings')
        .expect(200)

      expect(res.body).toHaveProperty('data')
    })

    it('returns 400 for invalid limit param', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/listings?limit=999')
        .expect(400)
    })
  })

  describe('GET /api/v1/listings/mine', () => {
    it('returns 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/listings/mine')
        .expect(401)
    })
  })

  describe('POST /api/v1/listings/:id/images/upload-url', () => {
    it('returns 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/listings/listing-001/images/upload-url')
        .expect(401)
    })
  })
})
