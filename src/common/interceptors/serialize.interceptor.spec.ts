import { SerializeInterceptor } from './serialize.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { Expose } from 'class-transformer';

class TestDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  secret: string;
}

describe('SerializeInterceptor', () => {
  let interceptor: SerializeInterceptor<TestDto>;

  beforeEach(() => {
    interceptor = new SerializeInterceptor(TestDto);
  });

  it('should exclude extraneous properties for single object', (done) => {
    const context = {} as ExecutionContext;
    const handler: CallHandler = {
      handle: () => of({ id: '1', name: 'Book', secret: 'hidden' }),
    };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('name', 'Book');
      expect(result).not.toHaveProperty('secret');
      done();
    });
  });

  it('should serialize array of objects', (done) => {
    const context = {} as ExecutionContext;
    const handler: CallHandler = {
      handle: () => of([
        { id: '1', name: 'A', secret: '1' },
        { id: '2', name: 'B', secret: '2' },
      ]),
    };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('secret');
      expect(result[1]).not.toHaveProperty('secret');
      done();
    });
  });

  it('should pass through null or undefined', (done) => {
    const context = {} as ExecutionContext;
    const handler: CallHandler = {
      handle: () => of(null),
    };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
  });
});
