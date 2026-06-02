import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CompleteUploadDto {
  @IsUUID()
  videoId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  uploadId: string;
}
