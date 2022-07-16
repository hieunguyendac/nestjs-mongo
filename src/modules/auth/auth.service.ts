import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcryptjs from 'bcryptjs';
import { Model } from 'mongoose';
import { UserJwtDto } from '../../common/decorators/user.decorator';
import { hashPassword } from '../../common/util/function-util';
import { User, UserDocument } from '../../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';

export const EMAIL_OR_PASSWORD_IS_INCORRECT =
  'EMAIL_OR_PASSWORD_IS_INCORRECT';
export const EMAIL_HAS_BEEN_LOCKED =
  'EMAIL_HAS_BEEN_LOCKED';
export const EMAIL_OR_PASSWORD_IS_NOT_MATCH =
  'EMAIL_OR_PASSWORD_IS_INCORRECT';
export const EMAIL_IS_EXIST =
  'EMAIL_IS_EXIST';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) { }

  public async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException(EMAIL_OR_PASSWORD_IS_INCORRECT);
    }

    if (user.locked) {
      throw new UnauthorizedException(EMAIL_HAS_BEEN_LOCKED);
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (isMatch) {
      await this.userModel.findByIdAndUpdate(user._id, {
        failedLoginAttempts: 0,
        failedLoginTime: null
      });
      return this.encode(user);
    }

    if (!user.failedLoginAttempts) {
      await this.userModel.findByIdAndUpdate(user._id, {
        failedLoginAttempts: 1,
        failedLoginTime: new Date()
      });
      throw new UnauthorizedException(EMAIL_OR_PASSWORD_IS_INCORRECT);
    }

    if (user.failedLoginAttempts < 3) {
      await this.userModel.findByIdAndUpdate(user._id, {
        failedLoginAttempts: user.failedLoginAttempts + 1,
      });
      throw new UnauthorizedException(EMAIL_OR_PASSWORD_IS_INCORRECT);
    }

    const diffTime = (Date.now() - user.failedLoginTime.getTime()) / (1000 * 60);
    if (diffTime < 5) {
      await this.userModel.findByIdAndUpdate(user._id, {
        locked: true
      });
      throw new UnauthorizedException(EMAIL_HAS_BEEN_LOCKED);
    }

    await this.userModel.findByIdAndUpdate(user._id, {
      failedLoginAttempts: 1,
      failedLoginTime: new Date()
    });
    throw new UnauthorizedException(EMAIL_OR_PASSWORD_IS_INCORRECT);
  }

  public async register(registerDto: RegisterDto) {
    if (registerDto.password != registerDto.confirmPassword) {
      throw new BadRequestException(EMAIL_OR_PASSWORD_IS_NOT_MATCH);
    }

    const existUser = await this.userModel.findOne({ email: registerDto.email });
    if (existUser) {
      throw new BadRequestException(EMAIL_IS_EXIST);
    }

    const password = await hashPassword(registerDto.password);

    return await new this.userModel({
      ...registerDto,
      password,
      createdAt: new Date(),
    }).save();
  }

  private encode(user: UserDocument) {
    const token = this.generateToken(user);

    return {
      token,
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private generateToken(user: UserDocument) {
    const payload: UserJwtDto = {
      _id: user._id,
      email: user.email,
    };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  public decode(token: string) {
    try {
      const jwt = token.replace('Bearer ', '');
      return this.jwtService.decode(jwt, { json: true }) as UserJwtDto;
    } catch (e) {
      return null;
    }
  }
}
