import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GlobalExceptionFilter } from "src/infra/entrypoint/global-exception.filter";
import { HealthController } from "src/infra/entrypoint/health.controller";
import { RequestLoggingInterceptor } from "src/infra/entrypoint/request-logging.interceptor";
import { VideoUploadModule } from "src/video-upload.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres" as const,
        url: config.getOrThrow<string>("DATABASE_URL"),
        synchronize: config.get<string>("DB_SYNCHRONIZE") === "true",
        autoLoadEntities: true,
      }),
    }),
    VideoUploadModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
  ],
})
export class AppModule {}
