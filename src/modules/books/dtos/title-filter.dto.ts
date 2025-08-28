import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class TitleFilterDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  page = 10;

  @IsOptional()
  @IsInt()
  @IsPositive()
  limit = 10;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
    return value;
  })
  tags?: string[];
}