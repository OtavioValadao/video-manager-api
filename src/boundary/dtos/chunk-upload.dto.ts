import { Type } from "class-transformer";
import { IsInt, IsString, IsUUID, MaxLength, Min, MinLength } from "class-validator";

export class ChunkUploadDto {
  @IsUUID()
  videoId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  uploadId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  partNumber: number;
}
