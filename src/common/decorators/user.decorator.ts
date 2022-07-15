import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export class UserJwtDto {
  _id: string;
  email: string;
}

export const UserReq = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException();
    }
    return request.user;
  },
);
