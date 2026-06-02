export const QUEUE_PORT = Symbol("QUEUE_PORT");

export interface VideoUploadQueueMessage {
  videoId: string;
  userId: string;
  s3Key: string;
  nomeArquivo: string;
  tamanhoArquivo: number;
  sentAt: string;
}

export interface IQueuePort {
  publishVideoUpload(message: VideoUploadQueueMessage): Promise<void>;
}
