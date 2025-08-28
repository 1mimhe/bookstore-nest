import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class BookFilterDto {
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  @IsPositive()
  page = 1;

  @Transform(({ value }) => Number(value))
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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
    return value;
  })
  decades?: string[]; // e.g., ["1900s", "1380s", "800s"]
}