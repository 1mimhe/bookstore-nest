import { JwtPayload as JwtP  } from "jsonwebtoken";

export interface JwtPayload extends JwtP {
  username: string
}