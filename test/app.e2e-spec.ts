import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

describe('App root route (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    process.env.DATABASE_URL ??=
      'postgresql://postgres:postgres@localhost:5432/postgres';
    process.env.JWT_ACCESS_TTL_SECONDS ??= '900';
    process.env.JWT_REFRESH_TTL_SECONDS ??= '604800';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule(
      {},
    ).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) returns 404 after starter cleanup', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  it('/health (GET) still returns 404 without starter placeholders', () => {
    return request(app.getHttpServer()).get('/health').expect(404);
  });

  afterEach(async () => {
    await app?.close();
  });
});
