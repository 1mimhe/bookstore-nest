import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "jsonwebtoken";
import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as jwt from 'jsonwebtoken';
import { SessionData } from "express-session";
import { AuthMessages } from "src/common/enums/error.messages";

@Injectable()
export class TokenService {
  private accessSecretKey: string;
  private refreshSecretKey: string;
  
  constructor(
    config: ConfigService,
  ) {
    this.accessSecretKey = config.getOrThrow<string>('JWT_ACCESS_SECRET_KEY');
    this.refreshSecretKey = config.getOrThrow<string>('JWT_REFRESH_SECRET_KEY');
  }
  
  private generateRefreshToken(payload: JwtPayload, expiresIn = 1_296_000 /* 15days */) {
    expiresIn = Math.min(1_296_000, expiresIn);
    const refreshSecretKey = this.refreshSecretKey
    return jwt.sign(payload, refreshSecretKey, { expiresIn });
  }

  private generateAccessToken(payload: JwtPayload, expiresIn = 1200 /* 20min */) {
    expiresIn = Math.min(1200, expiresIn);
    const accessSecretKey = this.accessSecretKey
    return jwt.sign(payload, accessSecretKey, { expiresIn });
  }

  verifyToken(token: string, type: 'access' | 'refresh') {
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException(`Invalid ${type} token format.`);
    }

    try {
      const secretKey = type === 'access' ? this.accessSecretKey : this.refreshSecretKey;
      return jwt.verify(token, secretKey) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(`${type} token has expired`);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(`Invalid ${type} token.`);
      }
      throw new UnauthorizedException(`${type} token verification failed.`);
    }
  }

  refreshTokens(oldRefreshToken: string, session: SessionData) {
    console.log(session);
        
    if (!(session.userId && oldRefreshToken)) {
      throw new ForbiddenException(AuthMessages.AccessDenied);
    }

    const sessionRefreshToken = session.refreshToken;
    if (!(sessionRefreshToken) || (oldRefreshToken !== sessionRefreshToken)) {
      throw new UnauthorizedException(AuthMessages.InvalidRefreshToken);
    }

    const expirationTime = session.cookie.expires
      ? new Date(session.cookie.expires).getTime() - Date.now()
      : 0;
   
    const { sub, username, roles } = this.verifyToken(oldRefreshToken, 'refresh');
    const payload = {
      sub,
      username,
      roles
    };
    const newRefreshToken = this.generateRefreshToken(payload, Math.trunc(expirationTime / 1000));
    const newAccessToken = this.generateAccessToken(payload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expirationTime
    };
  }
}