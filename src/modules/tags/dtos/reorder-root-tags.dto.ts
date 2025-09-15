import { ArrayNotEmpty, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

class ReorderRootTagsItemDto {
  @IsNotEmpty()
  @IsUUID()
  tagId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  order: number;
}

export class ReorderRootTagsDto {
  @ArrayNotEmpty()
  newRootTagsOrders: ReorderRootTagsItemDto[];
}