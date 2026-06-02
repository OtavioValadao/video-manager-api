import { ErrorCodes } from "src/core/domain/constants/error-codes.constants";
import { BusinessException } from "src/core/domain/exceptions/business.exception";
import { VideoStatus } from "src/core/domain/video.domain";
import { UploadService } from "src/core/services/upload.service";
import type { ILoggerPort } from "src/boundary/ports/logger.port";
import type { IStoragePort } from "src/boundary/ports/storage.port";
import type { IVideoRepositoryPort } from "src/boundary/ports/video-repository.port";

const PRESIGN_TTL_SECONDS = 60 * 60;

export class GetDownloadUrlUsecase {
  private readonly uploadDomain: UploadService = new UploadService();

  constructor(
    private readonly videoRepository: IVideoRepositoryPort,
    private readonly storagePort: IStoragePort,
    private readonly logger: ILoggerPort,
  ) {}

  async execute(videoId: string, userId: string): Promise<{ presignedUrl: string }> {
    this.logger.log("Gerando URL de download", { userId, videoId });
    const video = this.uploadDomain.assertVideoOwnedBy(
      await this.videoRepository.findById(videoId),
      userId,
    );

    const objectKey =
      video.status === VideoStatus.DONE && video.zipPath ? video.zipPath : video.videoPath;

    const presignedUrl = await this.storagePort
      .getPresignedDownloadUrl(objectKey, PRESIGN_TTL_SECONDS)
      .catch((error: unknown) => {
        this.logger.error("Falha ao gerar presigned URL", error);
        throw new BusinessException("Falha ao gerar link de download", ErrorCodes.STORAGE_PRESIGN_FAILED);
      });

    return { presignedUrl };
  }
}
