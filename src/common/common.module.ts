import { Global, Module } from '@nestjs/common';
import { CookieService } from './services/cookie.service';
import { RecentViewsInterceptor } from './interceptors/recent-views.interceptor';

@Global()
@Module({
  providers: [CookieService, RecentViewsInterceptor],
  exports: [CookieService, RecentViewsInterceptor],
})
export class CommonModule {}
