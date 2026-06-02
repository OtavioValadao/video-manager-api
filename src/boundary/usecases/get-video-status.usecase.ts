import type { ILoggerPort } from "src/boundary/ports/logger.port";
import type { IVideoRepositoryPort } from "src/boundary/ports/video-repository.port";

/** Formato alinhado ao `video-manager-web` (`videoFetchStatus`). */
export interface VideoListItemDto {
  id: string;
  nomeArquivo: string;
  status: string;
  dataEnvio: string;
}

export class GetVideoStatusUsecase {
  constructor(
    private readonly videoRepository: IVideoRepositoryPort,
    private readonly logger: ILoggerPort,
  ) {}

  async execute(userId: string): Promise<{ items: VideoListItemDto[] }> {
    this.logger.log("Listando status de vídeos", { userId });
    const videos = await this.videoRepository.findByUserId(userId);
    return {
      items: videos.map((v) => ({
        id: v.id,
        nomeArquivo: v.nomeArquivo,
        status: v.status,
        dataEnvio: v.createdAt.toISOString(),
      })),
    };
  }
}
