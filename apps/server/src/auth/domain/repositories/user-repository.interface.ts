import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  updateLastLogin(userId: string): Promise<void>;
}
