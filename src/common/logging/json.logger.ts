import { Injectable, LoggerService } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';

/**
 * Structured JSON logger. Drop-in replacement for Nest's `ConsoleLogger`:
 * every existing `new Logger(context)` call site keeps working, but output
 * becomes one JSON object per line (`level`, `timestamp`, `context`,
 * `message`, plus `requestId` when inside a request and `trace` on errors).
 */
@Injectable()
export class JsonLogger implements LoggerService {
  log(message: unknown, context?: string): void {
    this.write('log', message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write('error', message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write('verbose', message, context);
  }

  fatal(message: unknown, context?: string): void {
    this.write('fatal', message, context);
  }

  private write(
    level: LogLevel,
    message: unknown,
    context?: string,
    trace?: string,
  ): void {
    const requestId = RequestContextService.getRequestId();
    const line = JSON.stringify({
      level,
      timestamp: new Date().toISOString(),
      ...(context ? { context } : {}),
      message: this.toMessage(message),
      ...(requestId ? { requestId } : {}),
      ...(trace ? { trace } : {}),
    });

    if (level === 'error' || level === 'fatal') {
      process.stderr.write(`${line}\n`);
    } else {
      process.stdout.write(`${line}\n`);
    }
  }

  private toMessage(message: unknown): unknown {
    if (message instanceof Error) {
      return message.message;
    }
    return message;
  }
}
