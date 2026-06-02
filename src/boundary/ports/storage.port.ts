export const STORAGE_PORT = Symbol("STORAGE_PORT");

export interface CompletedPart {
  partNumber: number;
  eTag: string;
}

export interface IStoragePort {
  initMultipartUpload(key: string, contentType: string): Promise<string>;
  uploadPart(key: string, uploadId: string, partNumber: number, body: Buffer): Promise<string>;
  completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: CompletedPart[],
  ): Promise<void>;
  getPresignedDownloadUrl(key: string, expiresSeconds: number): Promise<string>;
}
