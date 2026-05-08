import { Global, Module, ValidationPipe, type INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from '../../src/auth/auth.module'
import { WalletModule } from '../../src/wallet/wallet.module'
import { ListingsModule } from '../../src/listings/listings.module'
import { DRIZZLE_TOKEN } from '../../src/database/database.module'
import { REDIS_TOKEN } from '../../src/redis/redis.module'
import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard'
import { RolesGuard } from '../../src/common/guards/roles.guard'
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter'
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor'
import { StorageService } from '../../src/storage/storage.service'
import { ConfigService } from '../../src/config/config.service'

// Module-level singletons written before each test app build and read by the
// useFactory calls inside MockGlobalModule. This avoids importing real infra
// modules (which trigger real pg / ioredis / S3 connections).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _redis: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _config: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _storage: any

@Global()
@Module({
  providers: [
    { provide: DRIZZLE_TOKEN, useFactory: () => { console.log('[MockGlobalModule] DRIZZLE factory, _db.select=', typeof _db?.select); return _db } },
    { provide: REDIS_TOKEN, useFactory: () => _redis },
    { provide: ConfigService, useFactory: () => _config },
    { provide: StorageService, useFactory: () => _storage },
  ],
  exports: [DRIZZLE_TOKEN, REDIS_TOKEN, ConfigService, StorageService],
})
class MockGlobalModule {}

export function makeRedisMock() {
  const store = new Map<string, string>()
  return {
    get: jest.fn((k: string) => Promise.resolve(store.get(k) ?? null)),
    set: jest.fn((k: string, v: string) => { store.set(k, v); return Promise.resolve('OK') }),
    setex: jest.fn((k: string, _ttl: number, v: string) => { store.set(k, v); return Promise.resolve('OK') }),
    del: jest.fn((k: string) => { store.delete(k); return Promise.resolve(1) }),
    keys: jest.fn(() => Promise.resolve([])),
    pipeline: jest.fn(() => ({ setex: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) })),
    multi: jest.fn(() => ({
      incr: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    })),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeDbMock(): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {}
  ;['select', 'insert', 'update', 'delete'].forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain)
  })
  ;['from', 'where', 'limit', 'orderBy', 'returning', 'values', 'set', 'onConflictDoUpdate'].forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain)
  })
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve([]).then(resolve)
  chain.catch = () => chain
  chain.transaction = jest.fn((cb: (tx: unknown) => unknown) => cb(chain))
  return chain
}

export async function buildTestApp(): Promise<INestApplication> {
  _db = makeDbMock()
  _redis = makeRedisMock()
  _config = {
    get: jest.fn().mockResolvedValue(null),
    getNumber: jest.fn().mockResolvedValue(30),
    getBoolean: jest.fn().mockResolvedValue(false),
    getPublicConfigs: jest.fn().mockResolvedValue({}),
    onModuleInit: jest.fn(),
  }
  _storage = {
    getPresignedPut: jest.fn().mockResolvedValue({ uploadUrl: 'https://r2.example.com/put', key: 'k', expiresIn: 300 }),
    getPublicUrl: jest.fn().mockReturnValue('https://cdn.example.com/test.jpg'),
    deleteObject: jest.fn().mockResolvedValue(undefined),
  }

  const moduleRef = await Test.createTestingModule({
    imports: [MockGlobalModule, AuthModule, WalletModule, ListingsModule],
    providers: [
      { provide: APP_GUARD, useClass: JwtAuthGuard },
      { provide: APP_GUARD, useClass: RolesGuard },
    ],
  }).compile()

  const dbFromContainer = moduleRef.get(DRIZZLE_TOKEN, { strict: false })
  console.log('[buildTestApp] DRIZZLE_TOKEN from container:', typeof dbFromContainer?.select)

  const app = moduleRef.createNestApplication()
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  await app.init()
  return app
}
