import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IVideoRepositoryPort } from "src/boundary/ports/video-repository.port";
import { Video, VideoStatus } from "src/core/domain/video.domain";
import { VideoOrmEntity } from "./video.orm-entity";

@Injectable()
export class VideoRepository implements IVideoRepositoryPort {
  constructor(
    @InjectRepository(VideoOrmEntity)
    private readonly repo: Repository<VideoOrmEntity>,
  ) {}

  async save(video: Video): Promise<void> {
    const row = this.toRow(video);
    await this.repo.save(row);
  }

  async findById(id: string): Promise<Video | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<Video[]> {
    const rows = await this.repo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  private toRow(video: Video): VideoOrmEntity {
    const e = new VideoOrmEntity();
    e.id = video.id;
    e.userId = video.userId;
    e.nomeArquivo = video.nomeArquivo;
    e.tamanhoArquivo = video.tamanhoArquivo;
    e.status = video.status;
    e.videoPath = video.videoPath;
    e.zipPath = video.zipPath ?? null;
    e.errorMessage = video.errorMessage ?? null;
    e.createdAt = video.createdAt;
    e.updatedAt = video.updatedAt;
    return e;
  }

  private toDomain(row: VideoOrmEntity): Video {
    return new Video(
      row.id,
      row.userId,
      row.nomeArquivo,
      row.tamanhoArquivo,
      row.status as VideoStatus,
      row.videoPath,
      {
        zipPath: row.zipPath ?? undefined,
        errorMessage: row.errorMessage ?? undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    );
  }
}
