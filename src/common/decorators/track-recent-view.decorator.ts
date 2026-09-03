import { SetMetadata } from '@nestjs/common';
import { RecentViewTypes } from '../types/recent-view.type';

export const TRACK_RECENT_VIEW_KEY = 'track_recent_view';
export const TrackRecentView = (type: RecentViewTypes) =>
  SetMetadata(TRACK_RECENT_VIEW_KEY, type);
