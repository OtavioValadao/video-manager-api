import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import type { IQueuePort, VideoUploadQueueMessage } from "src/boundary/ports/queue.port";

@Injectable()
export class SqsAdapter implements IQueuePort {
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor(private readonly config: ConfigService) {
    const region = this.config.getOrThrow<string>("AWS_REGION");
    this.queueUrl = this.config.getOrThrow<string>("AWS_SQS_VIDEO_UPLOAD_URL");
    this.client = new SQSClient({ region });
  }

  async publishVideoUpload(message: VideoUploadQueueMessage): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      }),
    );
  }
}
