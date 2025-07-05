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

  firstName: string;

  lastName: string;

  @Column({
    type: 'enum',
    enum: Genders,
  })
  gender: string;

  @Column()
  profilePhoto: string;

  @Column()
  dateOfBirth: string;

  @Column()
  status: string;

  @OneToOne(() => Contact, (contact) => contact.user)
  contact: Contact;

  @OneToMany(() => Role, (role) => role.user)
  roles: Role[];
}
