import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { catchError, lastValueFrom } from 'rxjs';
import { MetricsInterceptor } from './metrics.interceptor';
import { MetricsService } from './metrics.service';

describe('MetricsInterceptor', () => {
  let metrics: { record: jest.Mock };
  let interceptor: MetricsInterceptor;

  const contextFor = (controller: string, handler: string, method = 'GET') =>
    ({
      getClass: () => ({ name: controller }),
      getHandler: () => ({ name: handler }),
      switchToHttp: () => ({
        getRequest: () => ({ method }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    metrics = { record: jest.fn() };
    interceptor = new MetricsInterceptor(metrics as unknown as MetricsService);
  });

  it('should record method, route, status and latency on success', async () => {
    const handler = { handle: () => of({ ok: true }) } as CallHandler;

    await lastValueFrom(
      interceptor.intercept(contextFor('OrdersController', 'getAllOrders'), handler),
    );

    expect(metrics.record).toHaveBeenCalledWith(
      'GET',
      'OrdersController.getAllOrders',
      200,
      expect.any(Number),
    );
  });

  it('should record the exception status on errors', async () => {
    const failure = {
      getStatus: () => 400,
      message: 'Bad input',
    };
    const handler = { handle: () => throwError(() => failure) } as CallHandler;

    await expect(
      lastValueFrom(
        interceptor
          .intercept(contextFor('OrdersController', 'submitOrder', 'POST'), handler)
          .pipe(catchError(error => { throw error; })),
      ),
    ).rejects.toBe(failure);

    expect(metrics.record).toHaveBeenCalledWith(
      'POST',
      'OrdersController.submitOrder',
      400,
      expect.any(Number),
    );
  });

  it('should not record scrapes of the metrics endpoint itself', async () => {
    const handler = { handle: () => of('metrics') } as CallHandler;

    await lastValueFrom(
      interceptor.intercept(contextFor('MetricsController', 'scrape'), handler),
    );

    expect(metrics.record).not.toHaveBeenCalled();
  });
});
