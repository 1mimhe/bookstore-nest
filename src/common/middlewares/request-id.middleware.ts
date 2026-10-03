import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { HeaderNames } from '../enums/header.names';
import { RequestContextService } from '../logging/request-context.service';

/**
 * Assigns (or echoes) a correlation id per request. Clients may send
 * `x-request-id`; otherwise a UUID v4 is generated. The id is exposed on the
 * response, attached to the request, and published to the
 * `RequestContextService` store so `JsonLogger` lines carry it.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incoming = req.headers[HeaderNames.RequestId];
    const requestId =
      (Array.isArray(incoming) ? incoming[0] : incoming)?.trim() || uuidv4();

    req.requestId = requestId;
    res.setHeader(HeaderNames.RequestId, requestId);

    RequestContextService.run({ requestId }, () => next());
  }
}
