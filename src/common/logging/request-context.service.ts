import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId: string;
}

/**
 * Correlates log lines with the HTTP request that produced them. The
 * `RequestIdMiddleware` opens the store per request; `JsonLogger` reads it
 * back so every line inside a request carries the same `requestId`.
 */
export class RequestContextService {
  private static readonly storage = new AsyncLocalStorage<RequestContext>();

  static run(context: RequestContext, callback: () => void): void {
    RequestContextService.storage.run(context, callback);
  }

  static getRequestId(): string | undefined {
    return RequestContextService.storage.getStore()?.requestId;
  }
}
