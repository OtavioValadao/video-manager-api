import { randomUUID } from "crypto";
import { ErrorCodes } from "src/core/domain/constants/error-codes.constants";
import { BusinessException } from "src/core/domain/exceptions/business.exception";
import { VideoStatus } from "src/core/domain/video/video-status.domain";
import { Video } from "src/core/domain/video/video.domain";
import { InitUploadResponseDto } from "../dtos/init-upload-response.dto";
import { InitUploadDto } from "../dtos/init-upload.dto";
import { ICachePort } from "../ports/cache.port";
import { ILoggerPort } from "../ports/logger.port";
import { IStoragePort } from "../ports/storage.port";
import { IVideoRepositoryPort } from "../ports/video-repository.port";


export class InitUploadUsecase {

    constructor(
        private readonly storagePort: IStoragePort,
        private readonly videoRepository: IVideoRepositoryPort,
        private readonly cachePort: ICachePort,
        private readonly logger: ILoggerPort,
    ) { }

    async execute(dto: InitUploadDto): Promise<InitUploadResponseDto> {
        this.logger.log("Iniciando upload", { userId: dto.userId });

        // 1 — gera o videoId
        const videoId = randomUUID()

        // 2 — monta o path no S3
        const s3Key = `temp/videos/${dto.userId}/${videoId}/${dto.nomeArquivo}`

        // 3 — inicia multipart no S3 (exceção: interceptor captura e loga)
        const uploadId = await this.storagePort
            .initMultipartUpload(s3Key, dto.contentType)
            .catch((error: unknown) => {
                this.logger.error("Falha no storage", error);
                throw new BusinessException(
                    "Falha ao iniciar upload",
                    ErrorCodes.STORAGE_INIT_FAILED,
                );
            })

        // 4 — cria a entidade Video
        const video = new Video(
            videoId,
            dto.userId,
            dto.nomeArquivo,
            dto.tamanhoArquivo,
            VideoStatus.PENDING,
            s3Key,
        )

        // 5 — salva no PostgreSQL
        await this.videoRepository.save(video)

        // 6 — salva no Redis
        const cacheKey = `upload:${dto.userId}:${videoId}`
        await this.cachePort.set(
            cacheKey,
            {
                uploadId,
                totalChunks: dto.totalChunks,
                chunksRecebidos: [],
                nomeArquivo: dto.nomeArquivo,
                s3Key,
            },
            60 * 60 * 24, // TTL 24h
        )

        // 7 — retorna para o front
        return { videoId, uploadId }

    }

}
