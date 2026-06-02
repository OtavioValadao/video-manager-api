import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { CognitoAuthGuard } from "./cognito-auth.guard";
import { CognitoJwtStrategy } from "./cognito-jwt.strategy";

@Module({
  imports: [PassportModule.register({ defaultStrategy: "cognito-jwt" })],
  providers: [CognitoJwtStrategy, CognitoAuthGuard],
  exports: [PassportModule, CognitoAuthGuard],
})
export class AuthModule {}
