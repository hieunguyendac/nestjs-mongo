import { createMock } from '@golevelup/ts-jest';
import { ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { Connection, Model, Query } from 'mongoose';
import { TransformInterceptor } from '../../common/interceptors/transformer-interceptor';
import { User, UserDocument } from '../../schemas/user.schema';
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
  let password = '123456';
  let wrongEmail = 'fake@gmail.com';
  let wrongPassword = 'abcdef';
  let hashPassword = '$2a$10$6iTOGKD.UqLaf2lx5ynsFOGJ6GU5WCUIzZ/wYPINHoYAbbYGowfam';

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

  const createUser = (email: string, hashPassword: string) => {
    const user = new User();
    user.email = email;
    user.password = hashPassword;

    return user;
  }

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET_KEY,
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          }
        },
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
    // await (app.get(getConnectionToken()) as Connection).db.dropDatabase();
    await app.close();
  });

  it('should be defined', () => {
    expect(mockService).toBeDefined();
  });

  // it('should be success when register an user', async () => {
  //   jest.spyOn(mockUserModel, 'findOne')
  //     .mockResolvedValue(null);

  //   // jest.spyOn(mockUserModel, 'save')
  //   //   .mockResolvedValue(new User());

  //   const result = await mockService.register({
  //     email,
  //     password,
  //     confirmPassword: password
  //   });
    
  // });

  it('should login successfully', async () => {
    const user = createUser(email, hashPassword);
    jest.spyOn(mockUserModel, 'findOne')
      .mockResolvedValue(user as UserDocument);

    jest.spyOn(mockUserModel, 'findByIdAndUpdate')
      .mockResolvedValue(user);

    // try {
    const result = await mockService.login(email, wrongPassword);
    expect(result).not.toBeNull();
    // } catch(e) {
    //   expect(e.message).toBe(EMAIL_OR_PASSWORD_IS_INCORRECT);
    // }
  });

  // it('should be register failed if exist email', async () => {
  //   ;
  //   jest.spyOn(mockUserModel, 'findOne')
  //     .mockResolvedValue(null);

  //   // jest.spyOn(mockUserModel, 'findByIdAndUpdate')
  //   //   .mockResolvedValue(user);

  //   const result = await mockService.register({
  //     email,
  //     password,
  //     confirmPassword: password
  //   });
  //   expect(result).not.toBeNull();
  // });
});
