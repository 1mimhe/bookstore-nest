import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class BlogFilterDto {
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
  @IsUUID()
  titleId?: string;

  @IsOptional()
  @IsUUID()
  authorID?: string;

  @IsOptional()
  @IsUUID()
  publisherId?: string;
}