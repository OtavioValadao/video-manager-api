import { ErrorCodes } from "src/core/domain/constants/error-codes.constants";
import { BusinessException } from "src/core/domain/exceptions/business.exception";
import type { UploadSessionState } from "src/core/domain/upload-session";
import { VideoStatus } from "src/core/domain/video.domain";
import { UploadService } from "src/core/services/upload.service";
import { CompleteUploadDto } from "src/boundary/dtos/complete-upload.dto";
import type { ICachePort } from "src/boundary/ports/cache.port";
import type { ILoggerPort } from "src/boundary/ports/logger.port";
import type { IQueuePort } from "src/boundary/ports/queue.port";
import type { IStoragePort } from "src/boundary/ports/storage.port";
import type { IVideoRepositoryPort } from "src/boundary/ports/video-repository.port";
import { uploadSessionCacheKey } from "src/boundary/upload-cache-key";

export class CompleteUploadUsecase {
  private readonly uploadDomain: UploadService = new UploadService();

  constructor(
    private readonly storagePort: IStoragePort,
    private readonly videoRepository: IVideoRepositoryPort,
    private readonly cachePort: ICachePort,
    private readonly queuePort: IQueuePort,
    private readonly logger: ILoggerPort,
  ) {}

  async execute(dto: CompleteUploadDto, userId: string): Promise<{ videoId: string; status: VideoStatus }> {
    const video = this.uploadDomain.assertVideoOwnedBy(
      await this.videoRepository.findById(dto.videoId),
      userId,
    );

    const key = uploadSessionCacheKey(userId, dto.videoId);
    const session = await this.cachePort.getJson<UploadSessionState>(key);
    if (!session) {
      throw new BusinessException("Sessão de upload não encontrada", ErrorCodes.UPLOAD_NOT_FOUND);
    }

    this.uploadDomain.assertUploadIdsMatch(session, dto.uploadId);
    this.uploadDomain.assertAllPartsReceived(session);

    await this.storagePort
      .completeMultipartUpload(session.s3Key, dto.uploadId, session.chunksRecebidos)
      .catch((error: unknown) => {
        this.logger.error("Falha ao finalizar multipart no S3", error);
        throw new BusinessException("Falha ao finalizar upload", ErrorCodes.STORAGE_COMPLETE_FAILED);
      });

    const message = {
      videoId: video.id,
      userId: video.userId,
      s3Key: session.s3Key,
      nomeArquivo: session.nomeArquivo,
      tamanhoArquivo: video.tamanhoArquivo,
      sentAt: new Date().toISOString(),
    };

    await this.queuePort.publishVideoUpload(message).catch((error: unknown) => {
      this.logger.error("Falha ao publicar na fila SQS", error);
      throw new BusinessException("Falha ao enfileirar processamento", ErrorCodes.QUEUE_PUBLISH_FAILED);
    });

    await this.cachePort.delete(key).catch((error: unknown) => {
      this.logger.warn("Não foi possível remover sessão do Redis", error);
    });

    return { videoId: video.id, status: VideoStatus.PENDING };
  }
}
