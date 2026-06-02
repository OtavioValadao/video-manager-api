import { ErrorCodes } from "../domain/constants/error-codes.constants";
import { BusinessException } from "../domain/exceptions/business.exception";
import type { UploadSessionState } from "../domain/upload-session";
import { Video } from "../domain/video.domain";

/**
 * Regras de domínio para upload multipart (sem dependências de framework ou infra).
 */
export class UploadService {
  assertVideoOwnedBy(video: Video | null, userId: string): Video {
    if (!video || video.userId !== userId) {
      throw new BusinessException("Vídeo não encontrado", ErrorCodes.VIDEO_NOT_FOUND);
    }
    return video;
  }

  assertUploadIdsMatch(session: UploadSessionState, uploadId: string): void {
    if (session.uploadId !== uploadId) {
      throw new BusinessException("Sessão de upload inválida", ErrorCodes.UPLOAD_SESSION_MISMATCH);
    }
  }

  assertPartInRange(partNumber: number, totalChunks: number): void {
    if (partNumber < 1 || partNumber > totalChunks) {
      throw new BusinessException("Número da parte inválido", ErrorCodes.UPLOAD_INVALID_PART);
    }
  }

  assertAllPartsReceived(session: UploadSessionState): void {
    const uniqueParts = new Set(session.chunksRecebidos.map((c) => c.partNumber));
    if (uniqueParts.size !== session.totalChunks) {
      throw new BusinessException(
        "Upload incompleto: faltam partes",
        ErrorCodes.UPLOAD_INCOMPLETE,
      );
    }
  }
}
