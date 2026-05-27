import { Injectable, Logger } from "@nestjs/common";
import { ILoggerPort } from "src/boundary/ports/logger.port";

@Injectable()
export class NestLoggerAdapter implements ILoggerPort {
    private readonly logger = new Logger(NestLoggerAdapter.name);

    log(message: string, context?: unknown): void {
        this.logger.log(message, ...(context === undefined ? [] : [context]));
    }

    error(message: string, error?: unknown): void {
        this.logger.error(message, ...(error === undefined ? [] : [error]));
    }

    warn(message: string, context?: unknown): void {
        this.logger.warn(message, ...(context === undefined ? [] : [context]));
    }
}
