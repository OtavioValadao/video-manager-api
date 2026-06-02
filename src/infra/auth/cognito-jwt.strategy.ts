import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { AuthenticatedUser } from "./authenticated-user";
import type { CognitoAccessTokenPayload } from "./cognito-access-token.payload";

@Injectable()
export class CognitoJwtStrategy extends PassportStrategy(Strategy, "cognito-jwt") {
  private readonly expectedClientId: string;

  constructor(config: ConfigService) {
    const region = config.getOrThrow<string>("COGNITO_REGION");
    const userPoolId = config.getOrThrow<string>("COGNITO_USER_POOL_ID");
    const clientId = config.getOrThrow<string>("COGNITO_CLIENT_ID");
    const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 15,
        jwksUri: `${issuer}/.well-known/jwks.json`,
      }),
      algorithms: ["RS256"],
      issuer,
      ignoreExpiration: false,
    });

    this.expectedClientId = clientId;
  }

  validate(payload: CognitoAccessTokenPayload): AuthenticatedUser {
    if (payload.token_use !== "access") {
      throw new UnauthorizedException("Token inválido");
    }
    if (payload.client_id !== this.expectedClientId) {
      throw new UnauthorizedException("Client inválido");
    }

    const { sub, username } = payload;
    const email =
      username && username.includes("@") ? username : `user-${sub}@cognito.local`;

    return { userId: sub, email };
  }
}
