export interface UploadChunkReceipt {
  partNumber: number;
  eTag: string;
}

export interface UploadSessionState {
  uploadId: string;
  totalChunks: number;
  chunksRecebidos: UploadChunkReceipt[];
  nomeArquivo: string;
  s3Key: string;
}
