import { randomUUID } from "crypto";
import { ErrorCodes } from "src/core/domain/constants/error-codes.constants";
import { BusinessException } from "src/core/domain/exceptions/business.exception";
import type { UploadSessionState } from "src/core/domain/upload-session";
import { Video, VideoStatus } from "src/core/domain/video.domain";
import { InitUploadDto } from "src/boundary/dtos/init-upload.dto";
import type { ICachePort } from "src/boundary/ports/cache.port";
import type { ILoggerPort } from "src/boundary/ports/logger.port";
import type { IStoragePort } from "src/boundary/ports/storage.port";
import type { IUserRepositoryPort } from "src/boundary/ports/user-repository.port";
import type { IVideoRepositoryPort } from "src/boundary/ports/video-repository.port";
import { uploadSessionCacheKey } from "src/boundary/upload-cache-key";

const UPLOAD_TTL_SECONDS = 60 * 60 * 24;

export class InitUploadUsecase {
  constructor(
    private readonly storagePort: IStoragePort,
    private readonly videoRepository: IVideoRepositoryPort,
    private readonly userRepository: IUserRepositoryPort,
    private readonly cachePort: ICachePort,
    private readonly logger: ILoggerPort,
  ) {}

  async execute(
    dto: InitUploadDto,
    userId: string,
    userEmail: string,
  ): Promise<{ videoId: string; uploadId: string }> {
    this.logger.log("Iniciando upload multipart", { userId });

    await this.userRepository.ensureExists(userId, userEmail);

    const videoId = randomUUID();
    const s3Key = `temp/videos/${userId}/${videoId}/${dto.nomeArquivo}`;

    const uploadId = await this.storagePort.initMultipartUpload(s3Key, dto.contentType).catch((error: unknown) => {
      this.logger.error("Falha ao iniciar multipart no S3", error);
      throw new BusinessException("Falha ao iniciar upload", ErrorCodes.STORAGE_INIT_FAILED);
    });

    const video = new Video(videoId, userId, dto.nomeArquivo, dto.tamanhoArquivo, VideoStatus.PENDING, s3Key);

    await this.videoRepository.save(video).catch((error: unknown) => {
      this.logger.error("Falha ao persistir vídeo", error);
      throw new BusinessException("Falha ao registrar vídeo", ErrorCodes.VIDEO_SAVE_FAILED);
    });

    const cacheKey = uploadSessionCacheKey(userId, videoId);
    const session: UploadSessionState = {
      uploadId,
      totalChunks: dto.totalChunks,
      chunksRecebidos: [],
      nomeArquivo: dto.nomeArquivo,
      s3Key,
    };

    await this.cachePort.setJson(cacheKey, session, UPLOAD_TTL_SECONDS).catch((error: unknown) => {
      this.logger.error("Falha ao gravar sessão no Redis", error);
      throw new BusinessException("Falha ao registrar sessão de upload", ErrorCodes.CACHE_SET_FAILED);
    });

    return { videoId, uploadId };
  }
}
