import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['slug'], { unique: true })
export class Publisher extends BaseEntity {
  @Column()
  name: string;
  
  @Column()
  slug: string;

  @Column({ nullable: true })
  description: string;
}
