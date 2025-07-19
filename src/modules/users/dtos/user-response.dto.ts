import { Genders } from '../entities/user.entity';
import { Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  username: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName?: string;
  
  @Expose()
  gender?: Genders;
  
  @Transform(({ obj }) => obj.contact?.phoneNumber)
  @Expose()
  phoneNumber?: string;
  
  @Transform(({ obj }) => obj.contact?.email)
  @Expose()
  email?: string;
}
