import { Controller, Get, Inject } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { DRIZZLE_TOKEN } from './database/database.module';
import { REDIS_TOKEN } from './redis/redis.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type Redis from 'ioredis';
import { sql } from 'drizzle-orm';

@Controller()
export class AppController {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase,
    @Inject(REDIS_TOKEN) private readonly redis: Redis,
  ) {}

  @Public()
  @Get('health')
  health(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('diag')
  async diag(): Promise<object> {
    const result: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      redis: this.redis.status,
    };
    try {
      await this.db.execute(sql`SELECT 1`);
      result['db'] = 'ok';
    } catch (err: unknown) {
      result['db'] = 'error';
      result['dbError'] = (err as Error).message;
    }
    return result;
  }
}
