import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserJwtDto } from '../../../common/decorators/user.decorator';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  async validate(payload: any) {
    const result: UserJwtDto = {
      _id: payload._id,
      email: payload.email,
    };
    return result;
  }
}
