import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    refreshToken: string;
    lastAccessed: Date;
    destroy(callback?: (err: any) => void): void;
  }
}