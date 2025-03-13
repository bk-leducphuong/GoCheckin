import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data) => ({
        status: statusCode,
        message: this.getSuccessMessage(statusCode),
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }

  private getSuccessMessage(status: number): string {
    switch (status) {
      case HttpStatus.CREATED:
        return 'Resource created successfully';
      case HttpStatus.NO_CONTENT:
        return 'Resource deleted successfully';
      default:
        return 'Request processed successfully';
    }
  }
}
