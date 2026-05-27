import { Video } from "src/core/domain/video/video.domain";

export interface IVideoRepositoryPort {
    save(video: Video): Promise<void>;
    findById(id: string): Promise<Video | null>;
    findByUserId(userId: string): Promise<Video[]>;
}