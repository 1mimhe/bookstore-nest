import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Contact } from './contact.entity';
import { Role } from './role.entity';

export enum Genders {
  Male = 'male',
  Female = 'female',
  Others = 'others',
}

@Entity()
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
