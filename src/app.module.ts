import { Module } from "@nestjs/common";
import { LOGGER_PORT } from "./boundary/ports/logger.port";
import { NestLoggerAdapter } from "./infra/logger/nest-logger.adapter";

@Module({
  imports: [],
  controllers: [],
  providers: [{ provide: LOGGER_PORT, useClass: NestLoggerAdapter }],
  exports: [LOGGER_PORT],
})
export class AppModule {}
