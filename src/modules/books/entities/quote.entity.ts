import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Title } from './title.entity';

@Entity('title_quotes')
export class Quote extends BaseEntity {
  @Column('text')
  quote: string;

  @Column('uuid')
  titleId: string;
  @ManyToOne(() => Title, (title) => title.quotes)
  @JoinColumn()
  title: Title;
}