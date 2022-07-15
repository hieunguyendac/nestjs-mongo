import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

export interface Response<T> {
  statusCode: number;
  data?: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      catchError((error) => {
        if (
          error.name === 'QueryFailedError' ||
          error.name === 'EntityColumnNotFound'
        ) {
          throw new BadRequestException(error.message);
        } else {
          throw error;
        }
      }),
    );
  }
}
