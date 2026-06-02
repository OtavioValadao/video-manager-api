import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { VideoStatus } from "../../core/domain/video.domain";

@Entity("videos")
export class VideoOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ name: "user_id", type: "uuid" })
  userId: string;

  @Column({ name: "nome_arquivo", type: "varchar", length: 512 })
  nomeArquivo: string;

  @Column({
    name: "tamanho_arquivo",
    type: "bigint",
    transformer: {
      to: (v: number) => v,
      from: (v: string | number) => (typeof v === "string" ? Number(v) : v),
    },
  })
  tamanhoArquivo: number;

  @Column({ type: "varchar", length: 32 })
  status: VideoStatus;

  @Column({ name: "video_path", type: "varchar", length: 2048 })
  videoPath: string;

  @Column({ name: "zip_path", type: "varchar", length: 2048, nullable: true })
  zipPath: string | null;

  @Column({ name: "error_message", type: "varchar", length: 2048, nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
