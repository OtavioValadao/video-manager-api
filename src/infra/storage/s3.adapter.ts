import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { CompletedPart, IStoragePort } from "src/boundary/ports/storage.port";

@Injectable()
export class S3Adapter implements IStoragePort {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const region = this.config.getOrThrow<string>("AWS_REGION");
    this.bucket = this.config.getOrThrow<string>("AWS_BUCKET_NAME");
    this.client = new S3Client({ region });
  }

  async initMultipartUpload(key: string, contentType: string): Promise<string> {
    const out = await this.client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
    );
    if (!out.UploadId) {
      throw new Error("S3 não retornou UploadId");
    }
    return out.UploadId;
  }

  async uploadPart(
    key: string,
    uploadId: string,
    partNumber: number,
    body: Buffer,
  ): Promise<string> {
    const out = await this.client.send(
      new UploadPartCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: body,
      }),
    );
    if (!out.ETag) {
      throw new Error("S3 não retornou ETag");
    }
    return out.ETag;
  }

  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: CompletedPart[],
  ): Promise<void> {
    const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber);
    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: sorted.map((p) => ({
            PartNumber: p.partNumber,
            ETag: p.eTag,
          })),
        },
      }),
    );
  }

  async getPresignedDownloadUrl(key: string, expiresSeconds: number): Promise<string> {
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, cmd, { expiresIn: expiresSeconds });
  }
}
