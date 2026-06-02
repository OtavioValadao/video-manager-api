import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/infra/auth/auth.module";
import { CACHE_PORT } from "src/boundary/ports/cache.port";
import { LOGGER_PORT } from "src/boundary/ports/logger.port";
import { QUEUE_PORT } from "src/boundary/ports/queue.port";
import { STORAGE_PORT } from "src/boundary/ports/storage.port";
import { USER_REPOSITORY_PORT } from "src/boundary/ports/user-repository.port";
import { VIDEO_REPOSITORY_PORT } from "src/boundary/ports/video-repository.port";
import type { ICachePort } from "src/boundary/ports/cache.port";
import type { ILoggerPort } from "src/boundary/ports/logger.port";
import type { IQueuePort } from "src/boundary/ports/queue.port";
import type { IStoragePort } from "src/boundary/ports/storage.port";
import type { IUserRepositoryPort } from "src/boundary/ports/user-repository.port";
import type { IVideoRepositoryPort } from "src/boundary/ports/video-repository.port";
import { ChunkUploadUsecase } from "src/boundary/usecases/chunk-upload.usecase";
import { CompleteUploadUsecase } from "src/boundary/usecases/complete-upload.usecase";
import { GetDownloadUrlUsecase } from "src/boundary/usecases/get-download-url.usecase";
import { GetVideoStatusUsecase } from "src/boundary/usecases/get-video-status.usecase";
import { InitUploadUsecase } from "src/boundary/usecases/init-upload.usecase";
import { RedisAdapter } from "src/infra/cache/redis.adapter";
import { UploadController } from "src/infra/entrypoint/upload.controller";
import { NestLoggerAdapter } from "src/infra/logger/nest-logger.adapter";
import { SqsAdapter } from "src/infra/messaging/sqs.adapter";
import { UserOrmEntity } from "src/infra/persistence/user.orm-entity";
import { UserRepository } from "src/infra/persistence/user.repository";
import { VideoOrmEntity } from "src/infra/persistence/video.orm-entity";
import { VideoRepository } from "src/infra/persistence/video.repository";
import { S3Adapter } from "src/infra/storage/s3.adapter";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([VideoOrmEntity, UserOrmEntity])],
  controllers: [UploadController],
  providers: [
    { provide: LOGGER_PORT, useClass: NestLoggerAdapter },
    { provide: STORAGE_PORT, useClass: S3Adapter },
    { provide: CACHE_PORT, useClass: RedisAdapter },
    { provide: QUEUE_PORT, useClass: SqsAdapter },
    VideoRepository,
    UserRepository,
    { provide: VIDEO_REPOSITORY_PORT, useExisting: VideoRepository },
    { provide: USER_REPOSITORY_PORT, useExisting: UserRepository },
    {
      provide: InitUploadUsecase,
      useFactory: (
        storage: IStoragePort,
        videos: IVideoRepositoryPort,
        users: IUserRepositoryPort,
        cache: ICachePort,
        logger: ILoggerPort,
      ) => new InitUploadUsecase(storage, videos, users, cache, logger),
      inject: [STORAGE_PORT, VIDEO_REPOSITORY_PORT, USER_REPOSITORY_PORT, CACHE_PORT, LOGGER_PORT],
    },
    {
      provide: ChunkUploadUsecase,
      useFactory: (
        storage: IStoragePort,
        videos: IVideoRepositoryPort,
        cache: ICachePort,
        logger: ILoggerPort,
      ) => new ChunkUploadUsecase(storage, videos, cache, logger),
      inject: [STORAGE_PORT, VIDEO_REPOSITORY_PORT, CACHE_PORT, LOGGER_PORT],
    },
    {
      provide: CompleteUploadUsecase,
      useFactory: (
        storage: IStoragePort,
        videos: IVideoRepositoryPort,
        cache: ICachePort,
        queue: IQueuePort,
        logger: ILoggerPort,
      ) => new CompleteUploadUsecase(storage, videos, cache, queue, logger),
      inject: [STORAGE_PORT, VIDEO_REPOSITORY_PORT, CACHE_PORT, QUEUE_PORT, LOGGER_PORT],
    },
    {
      provide: GetVideoStatusUsecase,
      useFactory: (videos: IVideoRepositoryPort, logger: ILoggerPort) =>
        new GetVideoStatusUsecase(videos, logger),
      inject: [VIDEO_REPOSITORY_PORT, LOGGER_PORT],
    },
    {
      provide: GetDownloadUrlUsecase,
      useFactory: (videos: IVideoRepositoryPort, storage: IStoragePort, logger: ILoggerPort) =>
        new GetDownloadUrlUsecase(videos, storage, logger),
      inject: [VIDEO_REPOSITORY_PORT, STORAGE_PORT, LOGGER_PORT],
    },
  ],
})
export class VideoUploadModule {}
