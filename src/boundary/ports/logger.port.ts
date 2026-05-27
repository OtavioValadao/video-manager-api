/** Token Nest para injetar `ILoggerPort` (use com `@Inject(LOGGER_PORT)`). */
export const LOGGER_PORT = Symbol("LOGGER_PORT");

export interface ILoggerPort {
    log(message: string, context?: unknown): void;
    error(message: string, error?: unknown): void;
    warn(message: string, context?: unknown): void;
}
