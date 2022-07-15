import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { EMAIL_HAS_BEEN_LOCKED, EMAIL_IS_EXIST, EMAIL_OR_PASSWORD_IS_INCORRECT, EMAIL_OR_PASSWORD_IS_NOT_MATCH } from '../src/modules/auth/auth.service';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { TransformInterceptor } from '../src/common/interceptors/transformer-interceptor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../src/modules/auth/auth.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Connection } from 'mongoose';
import * as supertest from 'supertest';

describe('AuthController (e2e)', () => {
  let app: NestExpressApplication;
  let testDb = `test-${Date.now()}`;
  let email = 'admin@gmail.com';
  let password = '12345678';
  let wrongEmail = 'fake@gmail.com';
  let wrongPassword = 'abcdef';

  const apiClient = () => {
    return supertest(app.getHttpServer());
  };

  const registerUser = () => {
    return apiClient()
      .post('/auth/register')
      .send({
        email,
        password,
        confirmPassword: password,
      })
  }

  const loginWrongPassword = () => {
    return apiClient()
      .post('/auth/login')
      .send({
        email,
        password: wrongPassword,
      })
  }

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => {
            const username = configService.get('MONGO_USERNAME');
            const password = configService.get('MONGO_PASSWORD');
            const port = configService.get('MONGO_PORT');
            const isDocker = configService.get('IS_DOCKER');

            return {
              uri: `mongodb://${username}:${password}@${isDocker === 'true' ? 'mongodb' : 'localhost'}:${port}`,
              // uri: `mongodb://localhost`,
              dbName: testDb,
            };
          },
          inject: [ConfigService],
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();

    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.listen(3334);
  });

  afterEach(async () => {
    await (app.get(getConnectionToken()) as Connection).db.dropDatabase();
    await app.close();
  });

  it('should be success when register an user', async () => {
    const result = await registerUser();
    expect(result.status).toBe(201);
  });

  it('should be register failed if exist email', async () => {
    const registerOnce = await registerUser();
    const registerTwice = await registerUser();
    expect(registerOnce.status).toBe(201);
    expect(registerTwice.status).toBe(400);
    expect(registerTwice.body.message).toBe(EMAIL_IS_EXIST);
  });

  it('should be failed when register if wrong password', async () => {
    const result = await apiClient().post('/auth/register').send({
      email,
      password,
      confirmPassword: wrongPassword,
    });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe(EMAIL_OR_PASSWORD_IS_NOT_MATCH);
  });

  it('should be success login account', async () => {
    await registerUser();
    const result = await apiClient().post('/auth/login').send({
      email,
      password,
    });

    expect(result.status).toBe(201);
    expect(result.body.token).not.toBeNull();
  });

  it('should be failed when login if wrong password or wrong email', async () => {
    await registerUser();
    const result = await loginWrongPassword();
    expect(result.status).toBe(401);
    expect(result.body.message).toBe(EMAIL_OR_PASSWORD_IS_INCORRECT);

    const result2 = await apiClient()
      .post('/auth/login')
      .send({
        email: wrongEmail,
        password,
      })
    expect(result2.status).toBe(401);
    expect(result2.body.message).toBe(EMAIL_OR_PASSWORD_IS_INCORRECT);
  })

  it('should be failed when login if user locked', async () => {
    await registerUser();

    for (let i = 0; i < 3; i++) {
      const result = await loginWrongPassword();
      expect(result.status).toBe(401);
      expect(result.body.message).toBe(EMAIL_OR_PASSWORD_IS_INCORRECT);
    }

    const result = await loginWrongPassword();
    expect(result.status).toBe(401);
    expect(result.body.message).toBe(EMAIL_HAS_BEEN_LOCKED);
  })
});
