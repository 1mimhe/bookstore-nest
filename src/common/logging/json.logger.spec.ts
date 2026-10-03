import { JsonLogger } from './json.logger';
import { RequestContextService } from './request-context.service';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should emit one JSON line per call with level, timestamp and context', () => {
    logger.log('hello', 'Ctx');

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const line = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
    expect(line).toMatchObject({ level: 'log', message: 'hello', context: 'Ctx' });
    expect(typeof line.timestamp).toBe('string');
  });

  it('should include the request id when inside a request context', () => {
    RequestContextService.run({ requestId: 'req-123' }, () => {
      logger.warn('slow', 'Ctx');
    });

    const line = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
    expect(line.requestId).toBe('req-123');
  });

  it('should omit request id outside a request context', () => {
    logger.log('boot');

    const line = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
    expect(line).not.toHaveProperty('requestId');
  });

  it('should write errors to stderr with trace', () => {
    logger.error('boom', 'stack-trace', 'Ctx');

    expect(stderrSpy).toHaveBeenCalledTimes(1);
    expect(stdoutSpy).not.toHaveBeenCalled();
    const line = JSON.parse(stderrSpy.mock.calls[0][0] as string);
    expect(line).toMatchObject({
      level: 'error',
      message: 'boom',
      trace: 'stack-trace',
    });
  });
});
