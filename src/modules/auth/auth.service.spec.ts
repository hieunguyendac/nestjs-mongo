import { createMock } from '@golevelup/ts-jest';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { Connection, Model, Query } from 'mongoose';
import { TransformInterceptor } from '../../common/interceptors/transformer-interceptor';
import { User } from '../../schemas/user.schema';
import { AuthModule } from './auth.module';
import {
  AuthService,
  EMAIL_HAS_BEEN_LOCKED,
  EMAIL_IS_EXIST,
  EMAIL_OR_PASSWORD_IS_INCORRECT,
  EMAIL_OR_PASSWORD_IS_NOT_MATCH,
} from './auth.service';

describe('AuthService', () => {
  let app: NestExpressApplication;
  let testDb = `test-${Date.now()}`;
  let email = 'admin@gmail.com';
  let password = '12345678';
  let wrongEmail = 'fake@gmail.com';
  let wrongPassword = 'abcdef';

  let mockUserModel: Model<User>;
  let mockService: AuthService;

  const registerUser = () => {
    return mockService.register({
      email,
      password,
      confirmPassword: password,
    });
  };

  const loginWrongPassword = () => {
    return mockService.login(email, wrongPassword);
  };

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
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();

    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.listen(3333);

    mockUserModel = moduleRef.get<Model<User>>(getModelToken(User.name));
    mockService = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await (app.get(getConnectionToken()) as Connection).db.dropDatabase();
    await app.close();
  });

  it('should be defined', () => {
    expect(mockService).toBeDefined();
  });

  it('should register an user successfully', async () => {
    // jest.spyOn(mockUserModel, 'findOne').mockReturnValueOnce(
    //   createMock<Query<User, User>>({
    //     exec: jest.fn().mockResolvedValueOnce({ email }),
    //   }),
    // );

    jest.spyOn(mockUserModel, 'create').mockImplementationOnce(() =>
      Promise.resolve({
        email,
        password,
        confirmPassword: password,
      }),
    );

    const result = await registerUser();

    expect(result._id).not.toBeNull();
  });

  it('should be register failed if exist email', async () => {
    const registerOnce = await registerUser();
    expect(registerOnce._id).not.toBeNull();

    try {
      await registerUser();
    } catch (error) {
      expect(error.message).toBe(EMAIL_IS_EXIST);
    }
  });

  it('should be register failed if wrong password', async () => {
    try {
      await mockService.register({
        email,
        password,
        confirmPassword: wrongPassword,
      });
    } catch (error) {
      expect(error.message).toBe(EMAIL_OR_PASSWORD_IS_NOT_MATCH);
    }
  });

  it('should login successfully', async () => {
    // jest.spyOn(mockUserModel, 'findOne').mockReturnValueOnce(
    //   createMock<Query<User, User>>({
    //     exec: jest.fn().mockResolvedValueOnce({ email }),
    //   }),
    // );

    await registerUser();
    const result = await mockService.login(email, password);

    expect(result.token).not.toBeNull();
  });

  it('should be login failed if wrong password or wrong email', async () => {
    await registerUser();

    try {
      await loginWrongPassword();
    } catch (error) {
      expect(error.message).toBe(EMAIL_OR_PASSWORD_IS_INCORRECT);
    }

    try {
      await mockService.login(wrongEmail, password);
    } catch (error) {
      expect(error.message).toBe(EMAIL_OR_PASSWORD_IS_INCORRECT);
    }
  });

  it('should login failed if user locked', async () => {
    const user = await registerUser();

    for (let i = 0; i < 3; i++) {
      try {
        await loginWrongPassword();

        if (i == 0) {
          jest.spyOn(mockUserModel, 'findOneAndUpdate').mockReturnValueOnce(
            createMock<Query<User, User>>({
              exec: jest.fn().mockResolvedValueOnce({
                _id: user._id,
                failedLoginAttempts: 1,
                failedLoginTime: new Date(),
              }),
            }),
          );
        } else if (i < 3) {
          jest.spyOn(mockUserModel, 'findOneAndUpdate').mockReturnValueOnce(
            createMock<Query<User, User>>({
              exec: jest.fn().mockResolvedValueOnce({
                _id: user._id,
                failedLoginAttempts: user.failedLoginAttempts + 1,
              }),
            }),
          );
        }

        const diffTime =
          (Date.now() - user.failedLoginTime.getTime()) / (1000 * 60);
        if (diffTime < 5) {
          jest.spyOn(mockUserModel, 'findOneAndUpdate').mockReturnValueOnce(
            createMock<Query<User, User>>({
              exec: jest.fn().mockResolvedValueOnce({
                _id: user._id,
                locked: true,
              }),
            }),
          );
        }
      } catch (error) {
        expect(error.message).toBe(EMAIL_OR_PASSWORD_IS_INCORRECT);
      }
    }

    try {
      await loginWrongPassword();
    } catch (error) {
      expect(error.message).toBe(EMAIL_HAS_BEEN_LOCKED);
    }
  });
});
