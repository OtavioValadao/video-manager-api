export class InternalException extends Error {
  constructor(
    public readonly message: string,
    public readonly originalError?: unknown,
  ) {
    super(message)
  }
}
