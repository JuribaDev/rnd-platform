import { User } from '../../domain/entities/user.entity';

export interface ITokenProvider {
  generate(user: User): string;
  verify(token: string): any;
}
