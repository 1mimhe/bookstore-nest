import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Title } from './title.entity';

@Entity('title_features')
export class Feature extends BaseEntity {
  @Column('text')
  feature: string;

  @Column('uuid')
  titleId: string;
  @ManyToOne(() => Title, (title) => title.features)
  @JoinColumn()
  title: Title;
}