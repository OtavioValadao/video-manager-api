import { Type } from "class-transformer";
import { IsInt, IsPositive, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";

export class InitUploadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  nomeArquivo: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalChunks: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  tamanhoArquivo: number;

  @IsString()
  @MinLength(3)
  @MaxLength(256)
  @Matches(/^[\w-]+\/[\w.+-]+$/, { message: "contentType inválido" })
  contentType: string;
}
