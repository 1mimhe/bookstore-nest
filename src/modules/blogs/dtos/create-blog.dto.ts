import { Transform } from 'class-transformer';
import { IsString, IsUUID, IsArray, IsNotEmpty, IsOptional, IsAlphanumeric, ArrayMinSize, IsBoolean } from 'class-validator';
import { makeUnique } from 'src/common/utilities/make-unique';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsOptional()
  @IsString()
  otherSubject?: string;

  @Transform(({ obj, value }) => {
    if (value) return makeUnique(value);    
    if (obj.otherSubject && obj.otherSubject.trim()) {
      return makeUnique(obj.otherSubject);
    }
    if (obj.subject && obj.subject.trim()) {
      return makeUnique(obj.subject);
    }
    return undefined;
  })
  @IsOptional()
  @IsString()
  slug?: string;
  
  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  picUrl?: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsUUID()
  titleId?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsUUID()
  publisherId?: string;

  @IsOptional()
  @ArrayMinSize(1)
  @IsArray()
  @IsAlphanumeric(undefined, { each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}