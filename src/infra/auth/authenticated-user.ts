/** Usuário extraído do access token Cognito após validação JWKS. */
export type AuthenticatedUser = {
  userId: string;
  email: string;
};
