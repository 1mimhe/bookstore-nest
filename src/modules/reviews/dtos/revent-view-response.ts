import { Expose } from 'class-transformer';
import { RecentView, RecentViewTypes } from 'src/common/types/recent-view.type';

export class RecentlyViewedCookieDto implements RecentView {
  @Expose()
  type: RecentViewTypes;

  @Expose()
  slug: string;
}