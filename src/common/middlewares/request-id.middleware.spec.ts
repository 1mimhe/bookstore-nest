import { Request, Response } from 'express';
import { RequestIdMiddleware } from './request-id.middleware';
import { RequestContextService } from '../logging/request-context.service';

describe('RequestIdMiddleware', () => {
  const middleware = new RequestIdMiddleware();

  const run = (incoming?: string | string[]) => {
    const req = { headers: incoming ? { 'x-request-id': incoming } : {} } as Request;
    const setHeader = jest.fn();
    const res = { setHeader } as unknown as Response;
    let seen: string | undefined;
    const next = jest.fn(() => {
      seen = RequestContextService.getRequestId();
    });
    middleware.use(req, res, next);
    return { req, setHeader, next, seen };
  };

  it('should echo an incoming request id', () => {
    const { req, setHeader, next, seen } = run('client-id-1');

    expect(req.requestId).toBe('client-id-1');
    expect(setHeader).toHaveBeenCalledWith('x-request-id', 'client-id-1');
    expect(next).toHaveBeenCalled();
    expect(seen).toBe('client-id-1');
  });

  it('should generate a UUID when none is provided', () => {
    const { req, setHeader, seen } = run();

    expect(req.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(setHeader).toHaveBeenCalledWith('x-request-id', req.requestId);
    expect(seen).toBe(req.requestId);
  });
});
