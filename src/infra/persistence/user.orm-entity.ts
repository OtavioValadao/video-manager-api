import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity("users")
export class UserOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 320 })
  email: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
