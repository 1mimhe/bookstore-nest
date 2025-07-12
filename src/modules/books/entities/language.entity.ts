import { BaseEntity, Column, Entity, Unique } from "typeorm";

@Entity()
@Unique(['name'])
export class Language extends BaseEntity {
  @Column()
  name: string;
}