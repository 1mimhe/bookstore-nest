import { IsNotEmpty, IsString } from "class-validator";

export class CreateLanguageDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}