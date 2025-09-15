import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class ReorderRootTagsDto {
  @IsNotEmpty()
  @IsUUID()
  tagId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  order: number;
}