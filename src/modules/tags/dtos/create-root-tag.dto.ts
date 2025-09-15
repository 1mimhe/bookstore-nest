import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRootTagDto {
  @IsNotEmpty()
  @IsUUID()
  tagId: string;
  
  @IsOptional()
  @IsString()
  topic: string;
}