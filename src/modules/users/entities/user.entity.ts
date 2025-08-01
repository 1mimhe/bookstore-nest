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
import { Publisher } from 'src/modules/publishers/publisher.entity';
import { Address } from './address.entity';

export enum Genders {
  Male = 'male',
  Female = 'female',
  Others = 'others',
}

@Entity('users')
@Index(['username'], { unique: true })
export class User extends BaseEntity {
  @Column()
  username: string;

  @Column()
  @Exclude()
  hashedPassword: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({
    type: 'enum',
    enum: Genders,
    nullable: true
  })
  gender?: Genders;

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

  @OneToOne(() => Publisher, (publisher) => publisher.user)
  publisher?: Publisher;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];
}
