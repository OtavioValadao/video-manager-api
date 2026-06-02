/** Claims relevantes do access token emitido pelo User Pool Cognito. */
export type CognitoAccessTokenPayload = {
  sub: string;
  token_use: string;
  client_id: string;
  username?: string;
};
