import { ArrayMinSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class UuidArrayDto {
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsArray()
  @IsUUID('all', { each: true })
  ids: string[];
}