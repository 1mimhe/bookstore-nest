import { SerializeInterceptor } from './serialize.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { Expose } from 'class-transformer';

class TestDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  secret?: string;
}

describe('SerializeInterceptor', () => {
  let interceptor: SerializeInterceptor<TestDto>;

  beforeEach(() => {
    interceptor = new SerializeInterceptor(TestDto);
  });

  it('should exclude extraneous properties for single object', async () => {
    const context = {} as ExecutionContext;
    const handler: CallHandler = {
      handle: () => of({ id: '1', name: 'Book', secret: 'hidden' }),
    };

    const result = await firstValueFrom(interceptor.intercept(context, handler));
    expect(result.id).toBe('1');
    expect(result.name).toBe('Book');
    expect(result.secret).toBeUndefined();
  });

  it('should serialize array of objects', async () => {
    const context = {} as ExecutionContext;
    const handler: CallHandler = {
      handle: () => of([
        { id: '1', name: 'A', secret: '1' },
        { id: '2', name: 'B', secret: '2' },
      ]),
    };

    const result = await firstValueFrom(interceptor.intercept(context, handler));
    expect(result).toHaveLength(2);
    expect(result[0].secret).toBeUndefined();
    expect(result[1].secret).toBeUndefined();
  });

  it('should pass through null or undefined', async () => {
    const context = {} as ExecutionContext;
    const handler: CallHandler = {
      handle: () => of(null),
    };

    const result = await firstValueFrom(interceptor.intercept(context, handler));
    expect(result).toBeNull();
  });
});
