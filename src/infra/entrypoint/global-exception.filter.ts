import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";
import { BusinessException } from "src/core/domain/exceptions/business.exception";
import { InternalException } from "src/core/domain/exceptions/internal.exception";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof BusinessException) {
      response.status(HttpStatus.BAD_REQUEST).json({
        code: exception.code,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof InternalException) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: "INTERNAL_ERROR",
        message: "Erro interno",
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json(body);
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: "INTERNAL_ERROR",
      message: "Erro interno",
    });
  }
}
