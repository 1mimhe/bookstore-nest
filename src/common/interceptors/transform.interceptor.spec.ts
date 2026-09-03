import { TransformInterceptor } from './transform.interceptor';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { BYPASS_TRANSFORM_KEY } from '../decorators/bypass-transform.decorator';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    interceptor = new TransformInterceptor(reflector);
  });

  it('should bypass transformation when @BypassTransform is set', (done) => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const handler: CallHandler = {
      handle: () => of({ status: 'ok' }),
    };

    interceptor.intercept(context, handler).subscribe((res) => {
      expect(res).toEqual({ status: 'ok' });
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        BYPASS_TRANSFORM_KEY,
        expect.any(Array),
      );
      done();
    });
  });

  it('should wrap response into standardized envelope', (done) => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const handler: CallHandler = {
      handle: () => of({ message: 'hello' }),
    };

    interceptor.intercept(context, handler).subscribe((res: any) => {
      expect(res.success).toBe(true);
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({ message: 'hello' });
      expect(res.timestamp).toBeDefined();
      done();
    });
  });

  it('should preserve existing envelope if already wrapped', (done) => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const existingEnvelope = {
      success: true,
      statusCode: 200,
      data: { id: 1 },
      meta: {},
    };

    const handler: CallHandler = {
      handle: () => of(existingEnvelope),
    };

    interceptor.intercept(context, handler).subscribe((res: any) => {
      expect(res).toEqual(existingEnvelope);
      done();
    });
  });
});
