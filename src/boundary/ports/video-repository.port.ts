import { Video } from "../../core/domain/video.domain";

export const VIDEO_REPOSITORY_PORT = Symbol("VIDEO_REPOSITORY_PORT");

export interface IVideoRepositoryPort {
  save(video: Video): Promise<void>;
  findById(id: string): Promise<Video | null>;
  findByUserId(userId: string): Promise<Video[]>;
}
