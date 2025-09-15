import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Tag } from './tag.entity';

@Entity('root_tags')
export class RootTag extends BaseEntity {
  @Column()
  tagId: string;
  @ManyToOne(() => Tag, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tagId' })
  tag: Tag;

  @Column()
  order: number;

  @Column({ nullable: true })
  topic?: string;
}