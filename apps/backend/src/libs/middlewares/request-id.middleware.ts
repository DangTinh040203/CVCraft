import { randomUUID } from 'node:crypto';

import { Injectable, type NestMiddleware } from '@nestjs/common';
import { type NextFunction, type Request, type Response } from 'express';

import {
  REQUEST_ID_HEADER,
  RequestContext,
} from '@/libs/context/request-context';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const incoming = request.headers[REQUEST_ID_HEADER];
    const requestId =
      (Array.isArray(incoming) ? incoming[0] : incoming) || randomUUID();

    Object.assign(request, { requestId });
    response.setHeader(REQUEST_ID_HEADER, requestId);

    RequestContext.run({ requestId }, () => next());
  }
}
