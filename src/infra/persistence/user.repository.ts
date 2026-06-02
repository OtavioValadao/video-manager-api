import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IUserRepositoryPort } from "src/boundary/ports/user-repository.port";
import { UserOrmEntity } from "./user.orm-entity";

@Injectable()
export class UserRepository implements IUserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async ensureExists(userId: string, email: string): Promise<void> {
    const exists = await this.repo.exist({ where: { id: userId } });
    if (exists) {
      return;
    }
    await this.repo.insert({
      id: userId,
      email,
      createdAt: new Date(),
    });
  }
}
