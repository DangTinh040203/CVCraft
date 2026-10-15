import {
  type ArgumentsHost,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';

import { Prisma } from '@/libs/databases/prisma/generated/client';
import { GlobalExceptionFilter } from '@/libs/filters/http-exception.filter';

function setup(nodeEnv = 'development') {
  const config = { get: () => nodeEnv } as unknown as ConfigService;
  const filter = new GlobalExceptionFilter(config);
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({
        method: 'POST',
        url: '/api/v1/resumes/parse',
        originalUrl: '/api/v1/resumes/parse',
        requestId: 'req-1',
      }),
    }),
  } as unknown as ArgumentsHost;
  const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  return { filter, host, status, json, error, warn };
}

describe('GlobalExceptionFilter', () => {
  afterEach(() => jest.restoreAllMocks());

  it('logs a 5xx HttpException once, with its cause', () => {
    const { filter, host, status, error } = setup();
    const cause = new Error('Unexpected token < in JSON');

    filter.catch(
      new InternalServerErrorException('Failed to parse LLM response', {
        cause,
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(500);
    expect(error).toHaveBeenCalledTimes(1);
    const [message, trace] = error.mock.calls[0] as [string, string];
    expect(message).toBe(
      'POST /api/v1/resumes/parse → 500: Failed to parse LLM response',
    );
    expect(trace).toContain('Caused by: Error: Unexpected token < in JSON');
  });

  it('hides a 500s details in production but still logs them', () => {
    const { filter, host, json, error } = setup('production');

    filter.catch(new Error('connection refused at 10.0.0.5'), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        requestId: 'req-1',
      }),
    );
    expect(error.mock.calls[0]?.[0]).toContain('connection refused');
  });

  it.each([
    ['P2025', 404],
    ['P2002', 409],
  ])('maps Prisma %s to %i', (code, expected) => {
    const { filter, host, status, error } = setup();

    filter.catch(
      new Prisma.PrismaClientKnownRequestError('db error', {
        code,
        clientVersion: 'test',
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(expected);
    expect(error).not.toHaveBeenCalled();
  });

  it('logs client errors as warn, and 401s not at all', () => {
    const { filter, host, warn, error } = setup();

    filter.catch(new BadRequestException(['title must be a string']), host);
    filter.catch(new UnauthorizedException(), host);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('→ 400');
    expect(error).not.toHaveBeenCalled();
  });
});
