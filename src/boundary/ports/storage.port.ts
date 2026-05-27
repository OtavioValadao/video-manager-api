export interface IStoragePort {
    initMultipartUpload(key: string, contentType: string): Promise<string>;
}