import { IsNotEmpty, IsString } from "class-validator";

export class CreateLanguageDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  persianName: string;

  @IsNotEmpty()
  @IsString()
  englishName: string;
}