import { Expose } from 'class-transformer';
import { RecentView, RecentViewTypes } from 'src/common/types/recent-view.type';

export class RecentViewDto implements RecentView {
  @Expose()
  type: RecentViewTypes;

  @Expose()
  title: string;

  @Expose()
  slug: string;

  @Expose()
  picUrl: string;
}