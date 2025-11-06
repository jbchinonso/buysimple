import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';

type ErrorResponse = {
  status: 'error' | 'fail';
  message?: string;
  error: string;
  stack?: string;
};

type HttpErrorResponse = {
  statusCode: number;
  message?: string;
  response?: { code: string };
  error: string;
  stack?: string;
};

/**
 * Catches and handles exceptions thrown during request processing.
 */
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly config: ConfigService,
  ) {}

  /**
   * Catches exceptions thrown during request processing and handles them
   * appropriately to ensure a consistent error response format.
   *
   * - For `HttpException` instances, it uses `handleHttpResponseErr` to format the response.
   * - Logs the exception details in non-production environments.
   * - Handles specific exceptions like `CastError`, `MongoServerSelectionError`, and `MongoServerError`
   *   using corresponding methods.
   * - For unknown exceptions, responds with a generic error message and status.
   *
   * @param exception The exception object captured during request processing.
   * @param host The arguments host containing details about the current request.
   */
  catch(exception: any, host: ArgumentsHost): void {
    const isDev = this.config.get('NODE_ENV') !== 'production';

    const ctx = host.switchToHttp();

    const { httpAdapter } = this.httpAdapterHost;

    if (exception instanceof HttpException) {
      const res = this.handleHttpResponseErr(exception);
      return httpAdapter.reply(ctx.getResponse(), res, exception.getStatus());
    }

    const { name: exceptionName } = exception;

    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.log({ exception, exceptionName }); //Use app logger
    }

    switch (exceptionName) {
      case 'CastError':
        this.handleCastErrorDB(exception);
        break;
      case 'MongoServerSelectionError':
        this.handleCastErrorDB(exception);
        break;
      case 'MongoServerError':
        this.handleMongoServerError(exception, httpAdapter, ctx);
        break;

      default: {
        const res = {
          status: 'error',
          message: 'Service Unavailable. Kindly contact support.',
          error: isDev ? exception : 'Internal Server Error',
          stack: isDev ? exception.stack : undefined,
        };
        httpAdapter.reply(
          ctx.getResponse(),
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  private handleHttpResponseErr(exception: HttpException): ErrorResponse {
    const { error } = exception.getResponse() as HttpErrorResponse;
    let { message } = exception.getResponse() as HttpErrorResponse;
    //   path: httpAdapter.getRequestUrl(ctx.getRequest())

    if (Array.isArray(message)) {
      message = message.join(':');
    }

    return {
      status: 'fail',
      message,
      error,
      stack:
        this.config.get('NODE_ENV') !== 'production'
          ? exception.stack
          : undefined,
    };
  }

  /**
   * hanles cast error
   * @param err
   */
  private handleCastErrorDB = (err: any) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    throw new BadRequestException(message); //Check if it okay to throw twice
  };

  /**
   * handles mongo server error
   * @param exception
   * @param httpAdapter
   * @param ctx
   */
  private handleMongoServerError = (exception: any, httpAdapter, ctx) => {
    const { keyValue } = exception;

    let message = '';
    for (const value in keyValue) {
      message += `duplicate ${value} code ${keyValue[value]}`;
    }
    // throw new BadRequestException(message);
    const res = {
      status: 'fail',
      message,
      error: exception.errorResponse,
      stack:
        this.config.get('NODE_ENV') !== 'production'
          ? exception.stack
          : undefined,
    };

    httpAdapter.reply(ctx.getResponse(), res, HttpStatus.BAD_REQUEST);
  };
}
