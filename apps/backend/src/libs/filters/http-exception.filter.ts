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

export interface ApiErrorResponse {
  statusCode: number; // HTTP Status Code (e.g., 400, 404, 500)
  timestamp: string; // ISO 8601 Date String
  path: string; // The API endpoint where the error occurred
  message: string | string[] | object; // Error details (string or array of strings)
  error?: string; // Error Type (e.g., "Bad Request", "Not Found") - Optional
  requestId?: string; // Correlation ID for tracing this request across logs
}

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

  /**
   * Entry point: Called by NestJS whenever an exception is thrown.
   * @param exception The exception object
   * @param host The arguments host (contains request/response contexts)
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Normalize and create the error response
    const errorResponse = this.createErrorResponse(exception, request);

    // Send the JSON response to the client
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Constructs the standard ApiErrorResponse payload.
   */
  private createErrorResponse(
    exception: unknown,
    request: Request,
  ): ApiErrorResponse {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] | object = 'Internal Server Error';
    let error: string | undefined = undefined;

    // 1. Handle standard HTTP Exceptions (e.g., NotFoundException, BadRequestException)
    if (exception instanceof HttpException) {
      const httpExceptionResponse = this.parseHttpException(exception);
      statusCode = httpExceptionResponse.statusCode;
      message = httpExceptionResponse.message;
      error = httpExceptionResponse.error;
    }
    // 2. Handle Unknown/System Exceptions (e.g., Database errors, TypeErrors)
    else {
      this.handleUnknownException(exception);
    }

    // --- SECURITY: Mask internal errors in Production ---
    // In production, we should not leak stack traces or internal logic details for 500 errors.
    const isProduction = this.isProduction;
    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR && isProduction) {
      message = 'Internal server error';
      error = undefined;
    }

    const payload: ApiErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    if (error) {
      payload.error = error;
    }

    if (request.requestId) {
      payload.requestId = request.requestId;
    }

    return payload;
  }

  /**
   * Extracts message and status from a NestJS HttpException.
   */
  private parseHttpException(exception: HttpException): {
    statusCode: number;
    message: string | string[] | object;
    error?: string;
  } {
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
   * Logs critical system errors (500) to the console.
   * Includes the stack trace for debugging purposes.
   */
  private handleUnknownException(exception: unknown): void {
    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);
    const errorStack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(`Critical Error: ${errorMessage}`, errorStack);
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
