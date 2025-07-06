import { Genders } from '../entities/user.entity';
import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  username: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName?: string;
  
  @Expose()
  gender?: Genders;
  
  @Expose()
  phoneNumber?: string;
  
  @Expose()
  email?: string;
}
