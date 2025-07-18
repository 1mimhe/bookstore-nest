import { Body, Controller, Post } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dtos/create-tag.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @ApiOperation({
    summary: 'Create a new tag',
    description: `Create a new tag for books and articles,... categorization.\n
      **Tag types:\n
      - thematic_category => e.g. Fiction Literature, Self Development,
      Psychology, Philosophy, Short Story, Drama Literature, History, Politics\n
      - story_type => e.g. Romance, Philosophical, Historical, Fantasy, Mystery,
      Crime, Science Fiction, Psychological, Horror Stories\n
      - featured_books => e.g. 1001 Novels, NY Times Bestsellers, Best Self-Development,
      Le Monde's 100 Books, Guardian Best, etc.\n
      - literature_award => e.g. Nobel Literature, Man Booker, Pulitzer Fiction, Goncourt Prize, etc.\n
      - nation_literature => e.g. Iranian, American, French, Japanese, Russian, German, English, Canadian Literature\n
      - system_tags => e.g. Festival Sales, Recommended Books, Bestsellers, New Releases, Signed Editions, etc.\n
    `
  })
  @Post()
  async createTag(@Body() body: CreateTagDto) {
    return this.tagsService.create(body);
  }
}
