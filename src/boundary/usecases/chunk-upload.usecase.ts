import { ErrorCodes } from "src/core/domain/constants/error-codes.constants";
import { BusinessException } from "src/core/domain/exceptions/business.exception";
import type { UploadSessionState } from "src/core/domain/upload-session";
import { UploadService } from "src/core/services/upload.service";
import { ChunkUploadDto } from "src/boundary/dtos/chunk-upload.dto";
import type { ICachePort } from "src/boundary/ports/cache.port";
import type { ILoggerPort } from "src/boundary/ports/logger.port";
import type { IStoragePort } from "src/boundary/ports/storage.port";
import type { IVideoRepositoryPort } from "src/boundary/ports/video-repository.port";
import { uploadSessionCacheKey } from "src/boundary/upload-cache-key";

const UPLOAD_TTL_SECONDS = 60 * 60 * 24;

export class ChunkUploadUsecase {
  private readonly uploadDomain: UploadService = new UploadService();

  constructor(
    private readonly storagePort: IStoragePort,
    private readonly videoRepository: IVideoRepositoryPort,
    private readonly cachePort: ICachePort,
    private readonly logger: ILoggerPort,
  ) {}

  async execute(
    dto: ChunkUploadDto,
    userId: string,
    chunk: Buffer,
  ): Promise<{ partNumber: number; eTag: string }> {
    this.uploadDomain.assertVideoOwnedBy(await this.videoRepository.findById(dto.videoId), userId);
    const key = uploadSessionCacheKey(userId, dto.videoId);
    const session = await this.cachePort.getJson<UploadSessionState>(key);
    if (!session) {
      throw new BusinessException("Sessão de upload não encontrada", ErrorCodes.UPLOAD_NOT_FOUND);
    }

    this.uploadDomain.assertUploadIdsMatch(session, dto.uploadId);
    this.uploadDomain.assertPartInRange(dto.partNumber, session.totalChunks);

    const eTag = await this.storagePort
      .uploadPart(session.s3Key, dto.uploadId, dto.partNumber, chunk)
      .catch((error: unknown) => {
        this.logger.error("Falha ao enviar parte ao S3", error);
        throw new BusinessException("Falha ao enviar chunk", ErrorCodes.UPLOAD_CHUNK_FAILED);
      });

    const chunksRecebidos = [...session.chunksRecebidos];
    const idx = chunksRecebidos.findIndex((c) => c.partNumber === dto.partNumber);
    const entry = { partNumber: dto.partNumber, eTag };
    if (idx >= 0) {
      chunksRecebidos[idx] = entry;
    } else {
      chunksRecebidos.push(entry);
    }

    const next: UploadSessionState = { ...session, chunksRecebidos };
    await this.cachePort.setJson(key, next, UPLOAD_TTL_SECONDS).catch((error: unknown) => {
      this.logger.error("Falha ao atualizar sessão no Redis", error);
      throw new BusinessException("Falha ao atualizar sessão de upload", ErrorCodes.CACHE_SET_FAILED);
    });

    return { partNumber: dto.partNumber, eTag };
  }
}
