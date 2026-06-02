import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ChunkUploadDto } from "src/boundary/dtos/chunk-upload.dto";
import { CompleteUploadDto } from "src/boundary/dtos/complete-upload.dto";
import { InitUploadDto } from "src/boundary/dtos/init-upload.dto";
import { ChunkUploadUsecase } from "src/boundary/usecases/chunk-upload.usecase";
import { CompleteUploadUsecase } from "src/boundary/usecases/complete-upload.usecase";
import { GetDownloadUrlUsecase } from "src/boundary/usecases/get-download-url.usecase";
import { GetVideoStatusUsecase } from "src/boundary/usecases/get-video-status.usecase";
import { InitUploadUsecase } from "src/boundary/usecases/init-upload.usecase";
import type { AuthenticatedUser } from "src/infra/auth/authenticated-user";
import { CognitoAuthGuard } from "src/infra/auth/cognito-auth.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";

@UseGuards(CognitoAuthGuard)
@Controller("video")
export class UploadController {
  constructor(
    private readonly initUpload: InitUploadUsecase,
    private readonly chunkUpload: ChunkUploadUsecase,
    private readonly completeUpload: CompleteUploadUsecase,
    private readonly getVideoStatus: GetVideoStatusUsecase,
    private readonly getDownloadUrl: GetDownloadUrlUsecase,
  ) {}

  @Post("upload/init")
  init(@Body() body: InitUploadDto, @CurrentUser() user: AuthenticatedUser) {
    return this.initUpload.execute(body, user.userId, user.email);
  }

  @Post("upload/chunk")
  @UseInterceptors(
    FileInterceptor("chunk", {
      limits: { fileSize: 512 * 1024 * 1024 },
    }),
  )
  chunk(
    @Body() body: ChunkUploadDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException("Campo de arquivo 'chunk' é obrigatório");
    }
    return this.chunkUpload.execute(body, user.userId, file.buffer);
  }

  @Post("upload/complete")
  @HttpCode(HttpStatus.ACCEPTED)
  complete(@Body() body: CompleteUploadDto, @CurrentUser() user: AuthenticatedUser) {
    return this.completeUpload.execute(body, user.userId);
  }

  @Get("status")
  status(@CurrentUser() user: AuthenticatedUser) {
    return this.getVideoStatus.execute(user.userId);
  }

  @Get(":id/download")
  download(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.getDownloadUrl.execute(id, user.userId);
  }
}
