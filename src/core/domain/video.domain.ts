export enum VideoStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DONE = "DONE",
  ERROR = "ERROR",
}

export class Video {
  id: string;
  userId: string;
  nomeArquivo: string;
  tamanhoArquivo: number;
  status: VideoStatus;
  videoPath: string;
  zipPath?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    nomeArquivo: string,
    tamanhoArquivo: number,
    status: VideoStatus,
    videoPath: string,
    options?: {
      zipPath?: string;
      errorMessage?: string;
      createdAt?: Date;
      updatedAt?: Date;
    },
  ) {
    const now = new Date();
    this.id = id;
    this.userId = userId;
    this.nomeArquivo = nomeArquivo;
    this.tamanhoArquivo = tamanhoArquivo;
    this.status = status;
    this.videoPath = videoPath;
    this.zipPath = options?.zipPath;
    this.errorMessage = options?.errorMessage;
    this.createdAt = options?.createdAt ?? now;
    this.updatedAt = options?.updatedAt ?? now;
  }

  iniciarProcessamento(): void {
    this.status = VideoStatus.PROCESSING;
    this.updatedAt = new Date();
  }

  finalizar(zipPath: string): void {
    this.status = VideoStatus.DONE;
    this.zipPath = zipPath;
    this.updatedAt = new Date();
  }

  falhar(errorMessage: string): void {
    this.status = VideoStatus.ERROR;
    this.errorMessage = errorMessage;
    this.updatedAt = new Date();
  }
}
