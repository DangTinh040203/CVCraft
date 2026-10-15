import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Request, type Response } from 'express';

import { Env } from '@/libs/configs/env.config';
import { Prisma } from '@/libs/databases/prisma/generated/client';

export interface ApiErrorResponse {
  statusCode: number; // HTTP Status Code (e.g., 400, 404, 500)
  timestamp: string; // ISO 8601 Date String
  path: string; // The API endpoint where the error occurred
  message: string | string[] | object; // Error details (string or array of strings)
  error?: string; // Error Type (e.g., "Bad Request", "Not Found") - Optional
  requestId?: string; // Correlation ID for tracing this request across logs
}

interface ParsedException {
  statusCode: HttpStatus;
  message: string | string[] | object;
  error?: string;
}

/** Prisma errors the client caused, rather than server faults. */
const PRISMA_ERRORS: Record<string, ParsedException> = {
  // Unique constraint failed
  P2002: {
    statusCode: HttpStatus.CONFLICT,
    message: 'This record already exists',
    error: 'Conflict',
  },
  // Record to update/delete not found (e.g. deleted meanwhile)
  P2025: {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Record not found',
    error: 'Not Found',
  },
};

/**
 * The single place request errors are logged: every 5xx with its stack (as
 * error), client errors as one warn line. Services that throw shouldn't log
 * the same error again. The request id is added to each line by the logger.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProduction: boolean;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.isProduction =
      this.configService.get<string>(Env.NODE_ENV) === 'production';
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const parsed = this.parseException(exception);
    this.log(exception, parsed, request);

    response
      .status(parsed.statusCode)
      .json(this.createErrorResponse(parsed, request));
  }

  private parseException(exception: unknown): ParsedException {
    if (exception instanceof HttpException) {
      return this.parseHttpException(exception);
    }
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      PRISMA_ERRORS[exception.code]
    ) {
      return PRISMA_ERRORS[exception.code];
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    };
  }

  private log(exception: unknown, parsed: ParsedException, request: Request) {
    const route = `${request.method} ${request.originalUrl}`;
    if (parsed.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const message =
        exception instanceof Error ? exception.message : String(exception);
      // A wrapped error (`{ cause }`) keeps the original failure in the log.
      // `cause` isn't in the ES2021 Error type the backend targets
      const { cause: original } = (exception ?? {}) as { cause?: unknown };
      const cause =
        original instanceof Error
          ? `\nCaused by: ${original.stack ?? original.message}`
          : '';
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `${route} → ${parsed.statusCode}: ${message}`,
        `${stack ?? ''}${cause}`,
      );
    } else if (parsed.statusCode !== HttpStatus.UNAUTHORIZED) {
      // 401s are routine (expired sessions) and would drown the rest
      this.logger.warn(
        `${route} → ${parsed.statusCode}: ${JSON.stringify(parsed.message)}`,
      );
    }
  }

  private createErrorResponse(
    parsed: ParsedException,
    request: Request,
  ): ApiErrorResponse {
    let { message, error } = parsed;

    // In production, a 500's details (internals, SQL) stay in the logs
    if (
      parsed.statusCode === HttpStatus.INTERNAL_SERVER_ERROR &&
      this.isProduction
    ) {
      message = 'Internal server error';
      error = undefined;
    }

    const payload: ApiErrorResponse = {
      statusCode: parsed.statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };
    if (error) payload.error = error;
    if (request.requestId) payload.requestId = request.requestId;
    return payload;
  }

  /**
   * Extracts message and status from a NestJS HttpException.
   */
  private parseHttpException(exception: HttpException): ParsedException {
    const statusCode = exception.getStatus();
    const responseBody = exception.getResponse();

    // If the response body is an object (common with class-validator)
    if (this.isObjectResponse(responseBody)) {
      const { message, error } = responseBody;
      return {
        statusCode,
        message: message || exception.message,
        error: error as string | undefined,
      };
    }

    // If the response body is just a string
    return {
      statusCode,
      message: responseBody || exception.message,
    };
  }

  /**
   * Type Guard: Checks if the response is an object.
   */
  private isObjectResponse(
    response: unknown,
  ): response is { message?: string | string[] | object; error?: unknown } {
    return (
      typeof response === 'object' &&
      response !== null &&
      !Array.isArray(response)
    );
  }
}
