import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Contact } from './contact.entity';
import { Role } from './role.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

export enum Genders {
  Male = 'male',
  Female = 'female',
  Others = 'others',
}

@Entity()
@Index(['username'], { unique: true })
export class User extends BaseEntity {
  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false })
  @Exclude()
  hashedPassword: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({
    type: 'enum',
    enum: Genders,
    nullable: true
  })
  gender?: string;

  @Column({ nullable: true })
  profilePhoto?: string;

  @Column({ nullable: true })
  dateOfBirth?: string;

  @Column({ nullable: true })
  status?: string;

  @OneToOne(() => Contact, (contact) => contact.user, { cascade: true })
  contact: Contact;

  @OneToMany(() => Role, (role) => role.user, { cascade: true })
  roles: Role[];
}
