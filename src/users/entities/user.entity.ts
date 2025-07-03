import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

export enum Genders {
  Male = 'male',
  Female = 'female',
  Others = 'others'
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
    enum: Genders
  })
  gender: string;

  @Column()
  profilePhoto: string;

  @Column()
  dateOfBirth: string

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}